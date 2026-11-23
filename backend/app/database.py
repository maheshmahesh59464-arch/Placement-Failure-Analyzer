import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./placement.db")
engine_options = {"pool_pre_ping": True}
if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def ensure_additive_migrations():
    """Small safe additive migration for legacy SQLite/PostgreSQL installations.

    New tables are created by metadata.create_all; these nullable columns are
    added to the existing parsed_resumes table without rewriting user records.
    Use Alembic for future production migrations.
    """
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    if "parsed_resumes" in tables:
        columns = {c["name"] for c in inspector.get_columns("parsed_resumes")}
    else:
        columns = set()
    with engine.begin() as conn:
        if "parsed_resumes" in tables:
            if "skill_evidence_json" not in columns:
                conn.execute(text("ALTER TABLE parsed_resumes ADD COLUMN skill_evidence_json TEXT"))
            if "extraction_confidence" not in columns:
                conn.execute(text("ALTER TABLE parsed_resumes ADD COLUMN extraction_confidence FLOAT"))
        if "job_descriptions" in tables:
            jd_columns = {c["name"] for c in inspector.get_columns("job_descriptions")}
            if "preferred_skills_json" not in jd_columns:
                conn.execute(text("ALTER TABLE job_descriptions ADD COLUMN preferred_skills_json TEXT"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
