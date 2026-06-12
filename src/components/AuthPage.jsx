import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { OtpInput } from './OtpInput';

// Maps Firebase/backend error codes to friendly messages
function friendlyError(err) {
  const msg = err?.message || '';
  if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
    return 'Invalid email or password. Please try again.';
  }
  if (msg.includes('auth/email-already-in-use')) {
    return 'This email is already registered. Try signing in instead.';
  }
  if (msg.includes('auth/weak-password')) {
    return 'Password is too weak. Use at least 6 characters.';
  }
  if (msg.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('auth/too-many-requests')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }
  if (msg.includes('auth/popup-closed-by-user')) {
    return 'Google sign-in was cancelled. Please try again.';
  }
  if (msg.includes('auth/network-request-failed')) {
    return 'Network error. Please check your connection and try again.';
  }
  return msg || 'Something went wrong. Please try again.';
}

export function AuthPage() {
  const [mode, setMode] = useState('login'); // login, register, forgot, otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { loginWithGoogle, loginWithEmail, registerWithEmail, forgotPassword, verifyOtp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else if (mode === 'register') {
        await registerWithEmail(name, email, password);
        setMode('otp');
      } else if (mode === 'forgot') {
        await forgotPassword(email);
        setSuccess('Password reset email sent! Check your inbox.');
        setMode('login');
      }
    } catch (err) {
      setError(friendlyError(err));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setSuccess('');
    try {
      await loginWithGoogle();
      // onAuthStateChanged in AuthContext will handle the redirect automatically
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  const handleOtp = async (code) => {
    setError('');
    setLoading(true);
    try {
      await verifyOtp(email, code);
      // Firebase onAuthStateChanged will automatically update auth state and re-render the app
    } catch(err) {
      setError(friendlyError(err));
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 50, padding: '20px' }}>
      
      {/* Container Box */}
      <div className="auth-container glass" style={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '1000px', 
        height: '600px',
        borderRadius: '24px', 
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(0,229,255,0.1)',
        position: 'relative',
        animation: 'scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both'
      }}>
        
        {/* LEFT PANEL - Marketing / Aurora */}
        <div style={{ 
          flex: 1.2, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          padding: '50px', 
          color: 'white', 
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(7, 20, 40, 0.4), rgba(6, 182, 212, 0.1))',
          borderRight: '1px solid rgba(255,255,255,0.05)'
        }}>
          {/* Subtle aurora blob inside left panel */}
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '150%', height: '150%', background: 'radial-gradient(circle at top left, rgba(79, 70, 229, 0.15), transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px rgba(0,229,255,0.4))' }}>🧠</div>
              <h1 className="font-orbitron" style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, color: 'var(--glow-primary)', textShadow: '0 0 20px rgba(0,229,255,0.5)' }}>
                NeuroBuddy<span style={{ color: 'var(--glow-second)' }}>AI</span>
              </h1>
            </div>
            
            <h2 className="font-syne" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '16px', lineHeight: 1.2 }}>
              Your Personalized <br/>AI Coaching Platform
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', marginBottom: '40px' }}>
              Master any subject with real-time feedback, personalized study plans, and interactive quizzes.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="feature-card" style={{ animationDelay: '0.2s' }}>
                <span style={{ fontSize: '1.5rem' }}>🎯</span> 
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-bright)' }}>AI Quizzes</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Test your knowledge instantly</p>
                </div>
              </div>
              <div className="feature-card" style={{ animationDelay: '0.3s' }}>
                <span style={{ fontSize: '1.5rem' }}>🧠</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-bright)' }}>Mind Maps</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visualize complex concepts</p>
                </div>
              </div>
              <div className="feature-card" style={{ animationDelay: '0.4s' }}>
                <span style={{ fontSize: '1.5rem' }}>📈</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-bright)' }}>Smart Progress</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Track and improve daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Form */}
        <div style={{ 
          flex: 1, 
          background: 'rgba(7, 20, 40, 0.8)', 
          backdropFilter: 'blur(30px)',
          padding: '50px 40px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          position: 'relative'
        }}>
          
          <div className="auth-form-enter">
            <h2 className="font-syne" style={{ marginBottom: '8px', fontSize: '2rem', color: 'var(--text-bright)', fontWeight: 700 }}>
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'otp' && 'Verify Email'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'Outfit', fontSize: '0.95rem', marginBottom: '32px' }}>
              {mode === 'login' && 'Enter your details to access your account.'}
              {mode === 'register' && 'Start your learning journey today.'}
              {mode === 'forgot' && "We'll send you a link to reset your password."}
              {mode === 'otp' && 'Check your inbox for the verification code.'}
            </p>
            
            {/* Error message */}
            {error && (
              <div style={{ 
                color: '#ff6b35', marginBottom: '24px', animation: 'shake 0.5s', 
                padding: '12px 16px', background: 'rgba(255, 107, 53, 0.1)', 
                borderRadius: '10px', border: '1px solid rgba(255, 107, 53, 0.3)',
                display: 'flex', alignItems: 'center', gap: '10px',
                fontSize: '0.9rem', fontFamily: 'Outfit'
              }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span> {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div style={{ 
                color: 'var(--glow-second)', marginBottom: '24px', 
                padding: '12px 16px', background: 'rgba(0, 255, 157, 0.07)', 
                borderRadius: '10px', border: '1px solid rgba(0, 255, 157, 0.3)',
                display: 'flex', alignItems: 'center', gap: '10px',
                fontSize: '0.9rem', fontFamily: 'Outfit'
              }}>
                <span style={{ fontSize: '1.2rem' }}>✅</span> {success}
              </div>
            )}

            {mode !== 'otp' ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {mode === 'register' && (
                  <div className="input-group">
                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="input-ocean" />
                  </div>
                )}
                
                <div className="input-group">
                  <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="input-ocean" />
                </div>
                
                {mode !== 'forgot' && (
                  <div className="input-group">
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        className="input-ocean" 
                        style={{ paddingRight: '40px' }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ 
                          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                          background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem',
                          padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title={showPassword ? "Hide Password" : "Show Password"}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {mode === 'register' && password.length > 0 && (
                      <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.1)', marginTop: '8px', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${Math.min(100, password.length * 10)}%`,
                          background: password.length > 8 ? 'var(--glow-second)' : password.length > 5 ? 'var(--glow-yellow)' : 'var(--glow-warm)',
                          transition: 'all 0.3s',
                          boxShadow: password.length > 8 ? '0 0 8px var(--glow-second)' : 'none'
                        }} />
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '14px', fontSize: '1rem', marginTop: '16px', width: '100%' }}>
                  {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : mode === 'register' ? 'Sign Up' : 'Send Reset Link')}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-bright)', marginBottom: '24px', fontFamily: 'Outfit', fontSize: '1rem' }}>
                  Enter the 6-digit code sent to<br/><span style={{color: 'var(--glow-primary)', fontWeight: 600}}>{email}</span>
                </p>
                <OtpInput length={6} onComplete={handleOtp} />
                {loading && <p style={{ color: 'var(--glow-second)', marginTop: '16px', fontFamily: 'Outfit', animation: 'pulse 1.5s infinite' }}>Verifying code...</p>}
                
                <button onClick={() => setMode('register')} className="btn btn-ghost" style={{ padding: '10px 20px', marginTop: '30px' }}>
                  Back to Register
                </button>
              </div>
            )}

            {mode !== 'otp' && (
              <>
                <div style={{ margin: '24px 0', textAlign: 'center', color: 'var(--text-muted)', position: 'relative', fontFamily: 'Outfit' }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)', zIndex: 1 }}></div>
                  <span style={{ background: 'rgba(7,20,40,1)', padding: '0 15px', position: 'relative', zIndex: 2, fontSize: '0.85rem' }}>OR CONTINUE WITH</span>
                </div>
                
                <button onClick={handleGoogle} className="btn" style={{ 
                  width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', 
                  fontSize: '0.95rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: 20 }} />
                  Google
                </button>

                <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', textAlign: 'center', fontFamily: 'Outfit' }}>
                  {mode === 'login' ? (
                    <>
                      <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onClick={(e) => { e.preventDefault(); setError(''); setSuccess(''); setMode('forgot'); }} onMouseEnter={e=>e.target.style.color='white'} onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>Forgot Password?</a>
                      <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        Don't have an account? <a href="#" style={{ color: 'var(--glow-primary)', textDecoration: 'none', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); setError(''); setSuccess(''); setMode('register'); }}>Sign up</a>
                      </p>
                    </>
                  ) : mode === 'register' ? (
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                      Already have an account? <a href="#" style={{ color: 'var(--glow-primary)', textDecoration: 'none', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); setError(''); setSuccess(''); setMode('login'); }}>Sign in</a>
                    </p>
                  ) : (
                    <a href="#" style={{ color: 'var(--glow-primary)', textDecoration: 'none', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); setError(''); setSuccess(''); setMode('login'); }}>Back to Sign in</a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .feature-card {
          padding: 16px 20px;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          gap: 16px;
          animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateX(-30px);
          transition: all 0.3s;
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(0,229,255,0.3);
          transform: translateX(10px) !important;
        }
        .input-group {
          position: relative;
        }
        .auth-form-enter {
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 0.2s;
        }
        @keyframes slideInLeft {
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (max-width: 768px) {
          .auth-container {
            flex-direction: column;
            height: auto !important;
            overflow-y: auto;
          }
          .feature-card {
            display: none; /* Hide features on mobile to save space */
          }
        }
      `}</style>
    </div>
  );
}
