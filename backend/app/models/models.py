from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    job_descriptions = relationship("JobDescription", back_populates="user", cascade="all, delete-orphan")
    analysis_reports = relationship("AnalysisReport", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    raw_text = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    parsed_data = relationship("ParsedResume", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    analysis_reports = relationship("AnalysisReport", back_populates="resume", cascade="all, delete-orphan")


class ParsedResume(Base):
    __tablename__ = "parsed_resumes"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    skills_json = Column(Text, nullable=True)          # JSON string list of skills
    education_json = Column(Text, nullable=True)       # JSON string list/dict
    experience_json = Column(Text, nullable=True)      # JSON string list/dict
    projects_json = Column(Text, nullable=True)        # JSON string list/dict
    certifications_json = Column(Text, nullable=True)  # JSON string list/dict
    skill_evidence_json = Column(Text, nullable=True)
    extraction_confidence = Column(Float, nullable=True)

    resume = relationship("Resume", back_populates="parsed_data")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False, default="Software Engineer Role")
    raw_text = Column(Text, nullable=False)
    required_skills_json = Column(Text, nullable=True) # JSON string list of skills
    preferred_skills_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="job_descriptions")
    analysis_reports = relationship("AnalysisReport", back_populates="jd", cascade="all, delete-orphan")


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    jd_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    
    ats_score = Column(Float, nullable=False)
    readiness_score = Column(Float, nullable=False)
    
    matched_skills_json = Column(Text, nullable=False)    # JSON string list
    missing_skills_json = Column(Text, nullable=False)    # JSON string list
    recommendations_json = Column(Text, nullable=False)   # JSON string dict/list
    resume_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="analysis_reports")
    resume = relationship("Resume", back_populates="analysis_reports")
    jd = relationship("JobDescription", back_populates="analysis_reports")

# Additive career-intelligence tables. Existing tables and records remain intact.
class JobApplication(Base):
    __tablename__ = "job_applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    company = Column(String(180), nullable=False)
    role_title = Column(String(180), nullable=False)
    job_url = Column(String(1000), nullable=True)
    status = Column(String(40), nullable=False, default="applied")
    applied_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    notes = Column(Text, nullable=True)

class LearningGoal(Base):
    __tablename__ = "learning_goals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    skill = Column(String(120), nullable=False)
    goal = Column(String(500), nullable=False)
    status = Column(String(30), nullable=False, default="planned")
    target_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role_title = Column(String(180), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    self_rating = Column(Integer, nullable=True)
    feedback_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class ProgressSnapshot(Base):
    __tablename__ = "progress_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    compatibility_score = Column(Float, nullable=True)
    skills_count = Column(Integer, nullable=False, default=0)
    projects_count = Column(Integer, nullable=False, default=0)
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
