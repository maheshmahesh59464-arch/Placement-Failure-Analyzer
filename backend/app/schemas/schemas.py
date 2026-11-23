from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ResumeResponse(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime
    parsed_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class JDCreate(BaseModel):
    title: Optional[str] = "Software Engineer Role"
    raw_text: str

class JDResponse(BaseModel):
    id: int
    title: str
    raw_text: str
    required_skills: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class AnalysisRequest(BaseModel):
    resume_id: int
    jd_id: int

class AnalysisReportResponse(BaseModel):
    id: int
    resume_id: int
    jd_id: int
    ats_score: float
    readiness_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    recommendations: Dict[str, Any]
    resume_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
