from datetime import datetime, timedelta, timezone
import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD
from app.database import get_db
from app.models.models import User, Resume, ParsedResume
from app.schemas.schemas import UserRegister, UserLogin, UserResponse, Token
from app.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_admin,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    email = user_in.email.strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email address is already registered")
    try:
        hashed_pwd = hash_password(user_in.password)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    new_user = User(name=user_in.name.strip(), email=email, hashed_password=hashed_pwd, role="user")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.strip().lower()).first()
    if not user or user.role != "user" or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    return {
        "access_token": create_access_token(data={"sub": user.email, "role": "user"}),
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/admin-login")
def admin_login(credentials: UserLogin):
    """Environment-configured administrator login; no default credentials exist."""
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Administrator login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD on the server.",
        )
    import hmac
    if (
        credentials.email.strip().lower() != ADMIN_EMAIL
        or not hmac.compare_digest(credentials.password, ADMIN_PASSWORD)
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid administrator credentials")
    token = create_access_token(
        data={"sub": ADMIN_EMAIL, "role": "admin"},
        expires_delta=timedelta(minutes=60),
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "is_admin": True,
        "user": {
            "id": 0,
            "name": ADMIN_NAME,
            "email": ADMIN_EMAIL,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    }


@router.get("/admin/me")
def get_admin_profile(admin: dict = Depends(get_current_admin)):
    return {"id": 0, "name": ADMIN_NAME, "email": ADMIN_EMAIL, "role": "admin"}


@router.get("/admin/users")
def list_all_users(
    db: Session = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """Admin-only user overview. Credentials are accepted only via Bearer header."""
    users = db.query(User).all()
    result = []
    for user in users:
        latest_resume = (
            db.query(Resume)
            .filter(Resume.user_id == user.id)
            .order_by(Resume.uploaded_at.desc())
            .first()
        )
        parsed_info = None
        if latest_resume:
            parsed = db.query(ParsedResume).filter(ParsedResume.resume_id == latest_resume.id).first()
            if parsed:
                parsed_info = {
                    "name": parsed.name,
                    "email": parsed.email,
                    "phone": parsed.phone,
                    "skills": json.loads(parsed.skills_json) if parsed.skills_json else [],
                    "education": json.loads(parsed.education_json) if parsed.education_json else [],
                    "experience": json.loads(parsed.experience_json) if parsed.experience_json else [],
                }
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "registered_at": user.created_at.isoformat() if user.created_at else None,
            "resume_count": len(user.resumes),
            "latest_resume": latest_resume.filename if latest_resume else None,
            "resume_uploaded_at": latest_resume.uploaded_at.isoformat() if latest_resume and latest_resume.uploaded_at else None,
            "parsed_info": parsed_info,
        })
    return {"total_users": len(result), "users": result}
