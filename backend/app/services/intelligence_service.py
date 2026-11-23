"""Explainable compatibility analysis and non-predictive career guidance."""
from app.ai.semantic_matcher import match_requirements
from app.services.resume_parser import TECH_SKILLS_TAXONOMY

SCORING_VERSION = "2.0"
SKILL_ALIASES = {
    "react.js": "react", "reactjs": "react", "node.js": "nodejs", "node": "nodejs",
    "postgres": "postgresql", "k8s": "kubernetes", "sklearn": "scikit-learn",
    "js": "javascript", "ts": "typescript", "ml": "machine learning",
}

def canon(value: str) -> str:
    v = (value or "").strip().lower()
    return SKILL_ALIASES.get(v, v)

def analyze_intelligently(resume: dict, jd: dict) -> dict:
    skills = {canon(s): s for s in (resume.get("skills") or [])}
    required = list(dict.fromkeys(jd.get("required_skills") or []))
    matched, missing = [], []
    evidence = []
    resume_text = "\n".join([
        " ".join(resume.get("skills") or []),
        " ".join(resume.get("education") or []),
        " ".join(resume.get("experience") or []),
        " ".join(resume.get("projects") or []),
        (resume.get("raw_text") or "")[:12000],
    ])
    semantic, matching_method = match_requirements(required, resume_text)
    semantic_by_req = {canon(x["requirement"]): x for x in semantic}
    for skill in required:
        direct = canon(skill) in skills
        sem = semantic_by_req.get(canon(skill), {})
        is_match = direct or bool(sem.get("matched"))
        if is_match:
            matched.append(skill)
            evidence.append({"requirement": skill, "status": "matched",
                             "evidence": "Skill listed in resume" if direct else "Contextual text similarity; verify manually",
                             "similarity": sem.get("similarity", 1.0),
                             "confidence": "high" if direct else "low"})
        else:
            missing.append(skill)
            evidence.append({"requirement": skill, "status": "not_found",
                             "evidence": "No supporting resume evidence found", "similarity": sem.get("similarity", 0),
                             "confidence": "medium"})
    required_score = (len([x for x in evidence if x["status"] == "matched"]) / len(required) * 30) if required else None
    # Missing/unknown data is not awarded points. Scores are compatibility indicators, not ATS vendor scores.
    preferred = jd.get("preferred_skills") or []
    preferred_matched = sum(canon(x) in skills for x in preferred)
    preferred_score = (preferred_matched / len(preferred) * 10) if preferred else None
    exp_present = bool(resume.get("experience"))
    exp_required = (jd.get("experience_required") or "Not specified").lower() not in {"not specified", "", "none"}
    exp_score = (20.0 if exp_present else 0.0) if exp_required else None
    project_count = len([p for p in resume.get("projects", []) if p and p.strip()])
    project_score = min(project_count / 2, 1) * 15
    education_present = bool(resume.get("education"))
    jd_text = (jd.get("raw_text") or "").lower()
    education_required = any(term in jd_text for term in ["bachelor", "master", "degree", "graduate", "b.sc", "b.tech", "mca"])
    education_score = (10.0 if education_present else 0.0) if education_required else None
    responsibilities = jd.get("responsibilities") or []
    if responsibilities:
        responsibility_matches, _ = match_requirements(responsibilities, resume_text)
        responsibility_score = sum(1 for item in responsibility_matches if item["matched"]) / len(responsibility_matches) * 10
    else:
        responsibility_score = None
    evidence_score = min((len(resume.get("skills") or []) + project_count) / 8, 1) * 5
    components = [(required_score, 30), (preferred_score, 10), (exp_score, 20), (project_score, 15),
                  (education_score, 10), (responsibility_score, 10), (evidence_score, 5)]
    available = [(v, w) for v, w in components if v is not None]
    total_weight = sum(w for _, w in available)
    compatibility = round(sum(v for v, _ in available) / total_weight * 100, 1) if total_weight else None
    gaps = missing[:]
    roadmap = []
    for skill in gaps[:8]:
        roadmap.append({"skill": skill, "priority": "high" if skill in (required[:3]) else "medium",
                        "learning_goal": f"Learn {skill} fundamentals and demonstrate them in a small practical exercise.",
                        "project_idea": f"Build a portfolio project that uses {skill} and document your implementation.",
                        "evidence_to_add": f"Add a truthful project or work example demonstrating {skill}."})
    readiness = None  # not inferable from a resume alone
    summary = (f"Found evidence for {len(matched)} of {len(required)} listed required skills. "
               "This is a resume-to-role compatibility estimate, not a hiring probability or official ATS score.")
    return {
        "ats_score": compatibility if compatibility is not None else 0.0,
        "readiness_score": readiness,
        "matched_skills": sorted(matched), "missing_skills": sorted(missing),
        "recommendations": {"readiness_status": "Evidence-based career guidance", "action_advice": "Validate missing skills with practical assessments and improve the weakest evidence areas.",
                            "key_focus_areas": gaps[:5], "recommended_courses": [],
                            "recommended_projects": [{"skill": x["skill"], "title": x["project_idea"]} for x in roadmap],
                            "recommended_certifications": [], "roadmap": roadmap},
        "resume_summary": summary, "evidence": evidence, "score_breakdown": {
            "required_skill_coverage": required_score, "preferred_skill_coverage": preferred_score,
            "experience_evidence": exp_score, "project_evidence": project_score,
            "education_evidence": education_score, "responsibility_alignment": responsibility_score,
            "resume_evidence": evidence_score, "available_weight": total_weight},
        "matching_method": matching_method, "scoring_version": SCORING_VERSION,
        "limitations": ["Resume text cannot prove practical competence.", "A missing keyword does not prove a candidate lacks a skill.",
                        "This score is not an official ATS score or probability of being hired."],
    }
