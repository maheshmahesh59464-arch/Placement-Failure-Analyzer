from pathlib import Path
from uuid import uuid4
import json
import os

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import MAX_RESUME_SIZE_BYTES, UPLOAD_DIR, ENABLE_OCR
from app.database import get_db
from app.models.models import User, Resume, ParsedResume
from app.auth.security import get_current_user
from app.services.resume_parser import extract_text_with_ocr_fallback, parse_resume_data

router = APIRouter(prefix="/resume", tags=["Resume"])
CHUNK_SIZE = 1024 * 1024


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Safely upload and parse a PDF resume while retaining the existing response shape."""
    original_name = Path(file.filename or "resume.pdf").name
    if Path(original_name).suffix.lower() != ".pdf":
        raise HTTPException(status_code=400, detail="Only PDF resume files are accepted")

    upload_root = Path(UPLOAD_DIR).resolve()
    upload_root.mkdir(parents=True, exist_ok=True)
    # Never use a client-provided filename as a filesystem path.
    stored_path = upload_root / f"user_{current_user.id}_{uuid4().hex}.pdf"
    total = 0
    header = b""

    try:
        with stored_path.open("wb") as destination:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_RESUME_SIZE_BYTES:
                    raise HTTPException(status_code=413, detail=f"Resume exceeds the {MAX_RESUME_SIZE_BYTES // (1024 * 1024)} MB upload limit")
                if len(header) < 1024:
                    header += chunk[: 1024 - len(header)]
                destination.write(chunk)

        if total == 0 or b"%PDF-" not in header:
            raise HTTPException(status_code=400, detail="Uploaded file is not a valid PDF")

        extraction = extract_text_with_ocr_fallback(str(stored_path), enable_ocr=ENABLE_OCR)
        raw_text = extraction["text"]
        if not raw_text or not raw_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text was found. Enable optional OCR dependencies and ENABLE_OCR=true for scanned PDFs.",
            )

        parsed_info = parse_resume_data(raw_text)
        new_resume = Resume(
            user_id=current_user.id,
            filename=original_name[:255],
            file_path=str(stored_path),
            raw_text=raw_text,
        )
        db.add(new_resume)
        db.flush()

        parsed_record = ParsedResume(
            resume_id=new_resume.id,
            name=parsed_info.get("name"),
            email=parsed_info.get("email"),
            phone=parsed_info.get("phone"),
            skills_json=json.dumps(parsed_info.get("skills", [])),
            education_json=json.dumps(parsed_info.get("education", [])),
            experience_json=json.dumps(parsed_info.get("experience", [])),
            projects_json=json.dumps(parsed_info.get("projects", [])),
            certifications_json=json.dumps(parsed_info.get("certifications", [])),
            skill_evidence_json=json.dumps(parsed_info.get("skill_evidence", [])),
            extraction_confidence=parsed_info.get("extraction_confidence"),
        )
        db.add(parsed_record)
        db.commit()
        db.refresh(new_resume)
        return {
            "message": "Resume Uploaded & Parsed Successfully",
            "resume_id": new_resume.id,
            "filename": new_resume.filename,
            "parsed_info": parsed_info,
            "extraction_method": extraction["method"],
            "ocr_used": extraction["ocr_used"],
        }
    except HTTPException:
        db.rollback()
        stored_path.unlink(missing_ok=True)
        raise
    except Exception:
        db.rollback()
        stored_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Resume processing failed. Please try another PDF.")
    finally:
        await file.close()


@router.get("/latest")
def get_latest_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )
    if not resume:
        return {"resume": None}
    parsed = db.query(ParsedResume).filter(ParsedResume.resume_id == resume.id).first()
    parsed_info = None
    if parsed:
        parsed_info = {
            "name": parsed.name,
            "email": parsed.email,
            "phone": parsed.phone,
            "skills": json.loads(parsed.skills_json) if parsed.skills_json else [],
            "education": json.loads(parsed.education_json) if parsed.education_json else [],
            "experience": json.loads(parsed.experience_json) if parsed.experience_json else [],
            "projects": json.loads(parsed.projects_json) if parsed.projects_json else [],
            "certifications": json.loads(parsed.certifications_json) if parsed.certifications_json else [],
            "skill_evidence": json.loads(parsed.skill_evidence_json) if getattr(parsed, "skill_evidence_json", None) else [],
            "extraction_confidence": getattr(parsed, "extraction_confidence", None),
        }
    return {"resume": {
        "id": resume.id,
        "filename": resume.filename,
        "uploaded_at": resume.uploaded_at,
        "parsed_info": parsed_info,
    }}
