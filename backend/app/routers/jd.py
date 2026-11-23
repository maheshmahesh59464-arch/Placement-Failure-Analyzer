from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
import json
import os

from app.database import get_db
from app.models.models import User, JobDescription
from app.auth.security import get_current_user
from app.schemas.schemas import JDCreate
from app.services.jd_parser import parse_job_description, extract_jd_skills

router = APIRouter(
    prefix="/jd",
    tags=["Job Description"]
)

@router.post("/upload")
def upload_jd_text(
    jd_in: JDCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Step 7: Job Description Upload (Text Area)
    Step 8: Job Description Analysis
    """
    if not jd_in.raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty"
        )

    parsed_jd = parse_job_description(jd_in.raw_text)

    new_jd = JobDescription(
        user_id=current_user.id,
        title=jd_in.title or parsed_jd["title"],
        raw_text=jd_in.raw_text,
        required_skills_json=json.dumps(parsed_jd["required_skills"]),
        preferred_skills_json=json.dumps(parsed_jd.get("preferred_skills", []))
    )

    db.add(new_jd)
    db.commit()
    db.refresh(new_jd)

    return {
        "message": "Job Description Analyzed & Saved Successfully",
        "jd_id": new_jd.id,
        "title": new_jd.title,
        "required_skills": parsed_jd["required_skills"],
        "preferred_skills": parsed_jd.get("preferred_skills", []),
        "experience_required": parsed_jd["experience_required"]
    }


@router.get("/latest")
def get_latest_jd(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get latest job description uploaded by user"""
    jd = db.query(JobDescription).filter(JobDescription.user_id == current_user.id).order_by(JobDescription.created_at.desc()).first()
    if not jd:
        return {"jd": None}

    required_skills = json.loads(jd.required_skills_json) if jd.required_skills_json else []
    return {
        "jd": {
            "id": jd.id,
            "title": jd.title,
            "raw_text": jd.raw_text,
            "required_skills": required_skills,
            "preferred_skills": json.loads(jd.preferred_skills_json) if getattr(jd, "preferred_skills_json", None) else [],
            "created_at": jd.created_at
        }
    }
