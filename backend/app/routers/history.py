from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.models.models import User, AnalysisReport
from app.auth.security import get_current_user

router = APIRouter(
    prefix="/history",
    tags=["Analysis History"]
)

@router.get("/")
def get_user_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Step 15: Analysis History
    Fetch all historical analysis runs performed by the user to monitor improvement over time.
    """
    reports = db.query(AnalysisReport).filter(
        AnalysisReport.user_id == current_user.id
    ).order_by(AnalysisReport.created_at.desc()).all()

    formatted_history = []
    for r in reports:
        formatted_history.append({
            "id": r.id,
            "resume_id": r.resume_id,
            "resume_filename": r.resume.filename if r.resume else "Resume.pdf",
            "jd_id": r.jd_id,
            "jd_title": r.jd.title if r.jd else "Position",
            "ats_score": r.ats_score,
            "readiness_score": r.readiness_score,
            "readiness_note": "Legacy resume-signal proxy only; not a practical ability assessment.",
            "matched_skills": json.loads(r.matched_skills_json),
            "missing_skills": json.loads(r.missing_skills_json),
            "recommendations": json.loads(r.recommendations_json),
            "summary": r.resume_summary,
            "created_at": r.created_at
        })

    return {
        "count": len(formatted_history),
        "history": formatted_history
    }
