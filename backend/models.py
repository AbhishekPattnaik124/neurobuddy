from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

class OTP(BaseModel):
    code: str
    expires_at: datetime

class UserProfile(BaseModel):
    firebase_uid: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    education_level: str = "General"
    created_at: datetime
    last_seen: datetime
    otp: Optional[OTP] = None

class QuizScoreIn(BaseModel):
    topic: str
    score: int
    total: int
    pct: float
    education_level: str

class StudySession(BaseModel):
    tool: str
    topic: str
    duration_seconds: int

class OtpRequest(BaseModel):
    email: EmailStr
    name: str
    
class OtpVerifyRequest(BaseModel):
    email: EmailStr
    code: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    education_level: Optional[str] = None
    
class ActivityLog(BaseModel):
    action: str
    metadata: Dict[str, Any] = {}
