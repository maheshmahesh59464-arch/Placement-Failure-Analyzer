import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.security import get_current_user
from app.models.models import User, Resume, ParsedResume, JobDescription, AnalysisReport, JobApplication, LearningGoal, InterviewSession, ProgressSnapshot

router = APIRouter(prefix="/career", tags=["Career Intelligence"])

class ApplicationIn(BaseModel):
    company: str = Field(min_length=1, max_length=180)
    role_title: str = Field(min_length=1, max_length=180)
    job_url: str | None = Field(default=None, max_length=1000)
    status: str = "applied"
    notes: str | None = None

class ApplicationUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None

class GoalIn(BaseModel):
    skill: str = Field(min_length=1, max_length=120)
    goal: str = Field(min_length=1, max_length=500)
    target_date: datetime | None = None

class GoalUpdate(BaseModel):
    status: str

class InterviewStart(BaseModel):
    role_title: str = Field(min_length=1, max_length=180)
    topic: str = "technical"

class InterviewAnswer(BaseModel):
    answer: str = Field(min_length=5, max_length=12000)
    self_rating: int | None = Field(default=None, ge=1, le=5)

STATUSES = {"saved", "applied", "assessment", "interview", "rejected", "offered", "withdrawn"}

@router.get("/roadmap")
def get_roadmap(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = db.query(AnalysisReport).filter_by(user_id=user.id).order_by(AnalysisReport.created_at.desc()).first()
    if not report:
        return {"roadmap": [], "message": "Run a resume-to-job analysis to generate a personalized skill-gap roadmap."}
    recommendations = json.loads(report.recommendations_json or "{}")
    roadmap = recommendations.get("roadmap", [])
    return {"roadmap": roadmap, "analysis_id": report.id, "generated_at": report.created_at}

@router.get("/progress")
def get_progress(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    reports = db.query(AnalysisReport).filter_by(user_id=user.id).order_by(AnalysisReport.created_at.asc()).all()
    resume = db.query(Resume).filter_by(user_id=user.id).order_by(Resume.uploaded_at.desc()).first()
    parsed = db.query(ParsedResume).filter_by(resume_id=resume.id).first() if resume else None
    skills = json.loads(parsed.skills_json or "[]") if parsed else []
    projects = json.loads(parsed.projects_json or "[]") if parsed else []
    return {"analysis_count": len(reports), "latest_compatibility": reports[-1].ats_score if reports else None,
            "compatibility_history": [{"date": r.created_at.isoformat(), "score": r.ats_score} for r in reports],
            "skills_count": len(skills), "projects_count": len(projects),
            "readiness_score": None, "readiness_note": "Practical readiness requires assessments; it is not inferred from a resume."}

@router.get("/analytics/overview")
def analytics_overview(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    apps = db.query(JobApplication).filter_by(user_id=user.id).all()
    counts = {s: sum(1 for a in apps if a.status == s) for s in sorted(STATUSES)}
    rejected = [a for a in apps if a.status == "rejected"]
    # Explainable keyword grouping of user-entered rejection notes. This is a
    # descriptive aid, not an inference about why an employer rejected someone.
    reason_terms = {
        "technical_skills": ("technical", "coding", "skill", "assessment", "test"),
        "experience": ("experience", "years", "senior", "industry"),
        "communication": ("communication", "communication", "speaking", "explain"),
        "role_fit": ("fit", "role", "requirement", "domain"),
        "unknown": (),
    }
    reason_counts = {key: 0 for key in reason_terms}
    notes_with_reasons = 0
    for application in rejected:
        note = (application.notes or "").lower()
        if not note.strip():
            reason_counts["unknown"] += 1
            continue
        matches = [key for key, terms in reason_terms.items() if key != "unknown" and any(t in note for t in terms)]
        if matches:
            notes_with_reasons += 1
            for key in matches:
                reason_counts[key] += 1
        else:
            reason_counts["unknown"] += 1
    decided = counts["rejected"] + counts["offered"]
    return {"applications_total": len(apps), "applications_by_status": counts,
            "interviews_total": counts.get("interview", 0), "offers_total": counts.get("offered", 0),
            "rejections_total": counts.get("rejected", 0),
            "offer_rate_among_decided_percent": round(counts["offered"] / decided * 100, 1) if decided else None,
            "rejection_insights": {"note_based_category_counts": reason_counts,
                "rejections_with_categorized_notes": notes_with_reasons,
                "disclaimer": "Categories are keyword summaries of notes you entered, not verified employer feedback. Multiple categories may apply."}}

@router.get("/applications")
def list_applications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = db.query(JobApplication).filter_by(user_id=user.id).order_by(JobApplication.updated_at.desc()).all()
    return {"applications": [{"id": a.id, "company": a.company, "role_title": a.role_title, "job_url": a.job_url,
        "status": a.status, "notes": a.notes, "applied_at": a.applied_at, "updated_at": a.updated_at} for a in items]}

@router.post("/applications", status_code=201)
def create_application(data: ApplicationIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if data.status not in STATUSES: raise HTTPException(422, "Invalid application status")
    item = JobApplication(user_id=user.id, **data.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    return {"id": item.id, "company": item.company, "role_title": item.role_title, "status": item.status}

@router.patch("/applications/{application_id}")
def update_application(application_id: int, data: ApplicationUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(JobApplication).filter_by(id=application_id, user_id=user.id).first()
    if not item: raise HTTPException(404, "Application not found")
    values = data.model_dump(exclude_unset=True)
    if "status" in values and values["status"] not in STATUSES: raise HTTPException(422, "Invalid application status")
    for key, value in values.items(): setattr(item, key, value)
    db.commit(); db.refresh(item)
    return {"id": item.id, "status": item.status, "notes": item.notes}

@router.delete("/applications/{application_id}")
def delete_application(application_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(JobApplication).filter_by(id=application_id, user_id=user.id).first()
    if not item: raise HTTPException(404, "Application not found")
    db.delete(item); db.commit(); return {"deleted": True}

@router.get("/goals")
def list_goals(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    goals = db.query(LearningGoal).filter_by(user_id=user.id).order_by(LearningGoal.created_at.desc()).all()
    return {"goals": [{"id": g.id, "skill": g.skill, "goal": g.goal, "status": g.status, "target_date": g.target_date} for g in goals]}

@router.post("/goals", status_code=201)
def create_goal(data: GoalIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    goal = LearningGoal(user_id=user.id, **data.model_dump())
    db.add(goal); db.commit(); db.refresh(goal)
    return {"id": goal.id, "skill": goal.skill, "goal": goal.goal, "status": goal.status}

@router.patch("/goals/{goal_id}")
def update_goal(goal_id: int, data: GoalUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if data.status not in {"planned", "in_progress", "completed", "paused"}: raise HTTPException(422, "Invalid goal status")
    goal = db.query(LearningGoal).filter_by(id=goal_id, user_id=user.id).first()
    if not goal: raise HTTPException(404, "Learning goal not found")
    goal.status = data.status; db.commit(); return {"id": goal.id, "status": goal.status}

QUESTIONS = {
 "technical": ["Explain a technical project you built, the architecture you chose, and one difficult bug you solved.", "How would you design a REST API for a small task-management application?", "Describe how you would test and debug a slow database query."],
 "behavioral": ["Tell me about a time you had to learn something difficult quickly.", "Describe a mistake you made in a project and how you handled it.", "How do you respond when you receive critical feedback?"]
}

@router.post("/interviews/start", status_code=201)
def start_interview(data: InterviewStart, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    topic = data.topic if data.topic in QUESTIONS else "technical"
    existing = db.query(InterviewSession).filter_by(user_id=user.id).count()
    question = QUESTIONS[topic][existing % len(QUESTIONS[topic])]
    session = InterviewSession(user_id=user.id, role_title=data.role_title, question=question)
    db.add(session); db.commit(); db.refresh(session)
    return {"session_id": session.id, "role_title": session.role_title, "question": session.question,
            "note": "Practice prompt; feedback is rubric-based and not a hiring assessment."}

@router.post("/interviews/{session_id}/answer")
def answer_interview(session_id: int, data: InterviewAnswer, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    session = db.query(InterviewSession).filter_by(id=session_id, user_id=user.id).first()
    if not session: raise HTTPException(404, "Interview session not found")
    session.answer = data.answer; session.self_rating = data.self_rating
    words = len(data.answer.split())
    signals = {"specific_example": any(x in data.answer.lower() for x in ["for example", "built", "implemented", "when i"]),
               "explains_action": any(x in data.answer.lower() for x in ["because", "therefore", "i decided", "i used"]),
               "mentions_result": any(x in data.answer.lower() for x in ["result", "improved", "reduced", "increased", "learned"])}
    feedback = {"answer_length_words": words, "rubric_signals": signals,
                "suggestions": [label for label, ok in [("Add a concrete example.", not signals["specific_example"]),
                    ("Explain your reasoning and personal contribution.", not signals["explains_action"]),
                    ("Describe the outcome and what you learned.", not signals["mentions_result"])] if ok],
                "disclaimer": "Automated writing prompts only; this is not an objective measure of interview ability."}
    session.feedback_json = json.dumps(feedback); db.commit()
    return {"session_id": session.id, "feedback": feedback}
