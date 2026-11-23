from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
from app.database import get_db
from app.models.models import User, Resume, ParsedResume, JobDescription, AnalysisReport, ProgressSnapshot
from app.auth.security import get_current_user
from app.schemas.schemas import AnalysisRequest
from app.services.intelligence_service import analyze_intelligently
from app.services.jd_parser import parse_job_description
from app.services.analyzer_service import calculate_placement_readiness_score

router = APIRouter(prefix="/analysis", tags=["Analysis"])

def _decode(value, default):
    try: return json.loads(value) if value else default
    except (TypeError, ValueError): return default

def _report_payload(report, include_details=False):
    recommendations = _decode(report.recommendations_json, {})
    metadata = recommendations.pop("_analysis_metadata", {}) if isinstance(recommendations, dict) else {}
    result = {"report_id": report.id, "resume_id": report.resume_id, "jd_id": report.jd_id,
        "ats_score": report.ats_score, "readiness_score": report.readiness_score,
        "readiness_note": "Legacy resume-signal index only; it does not measure practical ability or hiring readiness.",
        "matched_skills": _decode(report.matched_skills_json, []),
        "missing_skills": _decode(report.missing_skills_json, []), "recommendations": recommendations,
        "resume_summary": report.resume_summary, "jd_title": report.jd.title if report.jd else "Role",
        "created_at": report.created_at, **metadata}
    if include_details and report.resume:
        result["resume_filename"] = report.resume.filename
    return result

@router.post("/run")
def run_analysis(req: AnalysisRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter_by(id=req.resume_id, user_id=current_user.id).first()
    if not resume: raise HTTPException(status_code=404, detail="Resume not found")
    parsed = db.query(ParsedResume).filter_by(resume_id=resume.id).first()
    if not parsed: raise HTTPException(status_code=400, detail="Resume has not been parsed yet")
    jd = db.query(JobDescription).filter_by(id=req.jd_id, user_id=current_user.id).first()
    if not jd: raise HTTPException(status_code=404, detail="Job description not found")
    resume_data = {"name": parsed.name, "email": parsed.email,
        "skills": _decode(parsed.skills_json, []), "education": _decode(parsed.education_json, []),
        "experience": _decode(parsed.experience_json, []), "projects": _decode(parsed.projects_json, []),
        "certifications": _decode(parsed.certifications_json, []), "raw_text": resume.raw_text or ""}
    parsed_jd = parse_job_description(jd.raw_text)
    jd_data = {"title": jd.title, "required_skills": _decode(jd.required_skills_json, []),
        "preferred_skills": _decode(getattr(jd, "preferred_skills_json", None), parsed_jd.get("preferred_skills", [])),
        "raw_text": jd.raw_text, "experience_required": parsed_jd.get("experience_required", "Not specified"),
        "responsibilities": parsed_jd.get("responsibilities", [])}
    result = analyze_intelligently(resume_data, jd_data)
    # Preserve the legacy non-null DB/API field during the transition. Clearly mark it as
    # a resume-signal proxy, not an assessment of candidate competence.
    legacy_readiness = calculate_placement_readiness_score(result["ats_score"], resume_data)
    recommendations = dict(result["recommendations"])
    recommendations["_analysis_metadata"] = {"evidence": result["evidence"],
        "score_breakdown": result["score_breakdown"], "matching_method": result["matching_method"],
        "scoring_version": result["scoring_version"], "limitations": result["limitations"],
        "readiness_note": "Legacy resume-signal proxy only; practical readiness requires validated assessments."}
    report = AnalysisReport(user_id=current_user.id, resume_id=resume.id, jd_id=jd.id,
        ats_score=result["ats_score"], readiness_score=legacy_readiness,
        matched_skills_json=json.dumps(result["matched_skills"]),
        missing_skills_json=json.dumps(result["missing_skills"]),
        recommendations_json=json.dumps(recommendations), resume_summary=result["resume_summary"])
    db.add(report)
    db.add(ProgressSnapshot(user_id=current_user.id, compatibility_score=result["ats_score"],
        skills_count=len(resume_data["skills"]), projects_count=len(resume_data["projects"])))
    db.commit(); db.refresh(report)
    return _report_payload(report, include_details=True)

@router.get("/latest")
def get_latest_analysis(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(AnalysisReport).filter_by(user_id=current_user.id).order_by(AnalysisReport.created_at.desc()).first()
    return {"report": _report_payload(report) if report else None}
