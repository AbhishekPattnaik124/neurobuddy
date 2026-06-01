import os
import resend

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

def send_otp_email(to_email: str, otp_code: str, name: str):
    if not RESEND_API_KEY:
        print(f"WARNING: RESEND_API_KEY not set. Would have sent OTP {otp_code} to {to_email}")
        return True
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center; padding: 40px 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">StudyBuddy AI</h2>
        <p style="color: #666; font-size: 16px;">Hi {name},</p>
        <p style="color: #666; font-size: 16px;">Your verification code is:</p>
        <div style="margin: 30px 0;">
            <h1 style="letter-spacing: 10px; color: #4F46E5; font-size: 40px; margin: 0; padding: 10px 20px; background: #f5f7ff; display: inline-block; border-radius: 8px;">{otp_code}</h1>
        </div>
        <p style="color: #999; font-size: 14px;">This code expires in 10 minutes.</p>
    </div>
    """
    
    params = {
        "from": "StudyBuddy AI <onboarding@resend.dev>",
        "to": [to_email],
        "subject": "Your StudyBuddy Verification Code",
        "html": html_content,
    }
    
    try:
        email_response = resend.Emails.send(params)
        return email_response
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_progress_report(to_email: str, name: str, topic: str, score: int, total: int):
    if not RESEND_API_KEY:
        print(f"WARNING: RESEND_API_KEY not set. Would have sent report to {to_email}")
        return True
    
    percentage = int((score / total) * 100) if total > 0 else 0
    color = "#10b981" if percentage >= 80 else "#f59e0b" if percentage >= 50 else "#ef4444"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center; padding: 40px 20px; border: 1px solid #eee; border-radius: 10px; background: #ffffff;">
        <h2 style="color: #333; margin-bottom: 5px;">StudyBuddy AI</h2>
        <p style="color: #666; font-size: 14px; margin-top: 0; text-transform: uppercase; letter-spacing: 1px;">Progress Report</p>
        
        <div style="margin: 40px 0; padding: 30px; background: #f8fafc; border-radius: 12px; border-top: 4px solid {color};">
            <h3 style="color: #1e293b; margin-top: 0; font-size: 20px;">{topic}</h3>
            <p style="color: #64748b; font-size: 16px;">You just completed a quiz session!</p>
            
            <div style="margin: 20px 0;">
                <span style="font-size: 48px; font-weight: bold; color: {color};">{score}</span>
                <span style="font-size: 24px; color: #94a3b8;">/ {total}</span>
            </div>
            
            <p style="color: #475569; font-size: 18px; font-weight: bold;">Score: {percentage}%</p>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">Keep up the great work, {name or 'Student'}!</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">This is an automated message from your StudyBuddy AI.</p>
    </div>
    """
    
    params = {
        "from": "StudyBuddy AI <onboarding@resend.dev>",
        "to": [to_email],
        "subject": f"Quiz Results: {topic} - {percentage}%",
        "html": html_content,
    }
    
    try:
        email_response = resend.Emails.send(params)
        return email_response
    except Exception as e:
        print(f"Failed to send progress report: {e}")
        return False

