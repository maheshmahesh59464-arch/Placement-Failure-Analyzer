import re
from typing import Dict, Any, List
from app.services.resume_parser import TECH_SKILLS_TAXONOMY


def _extract(text: str) -> List[str]:
    found = set()
    lower = text.lower()
    for key, canonical in TECH_SKILLS_TAXONOMY.items():
        pattern = r'(?<![a-zA-Z0-9#+.-])' + re.escape(key) + r'(?![a-zA-Z0-9#+.-])'
        if re.search(pattern, lower):
            found.add(canonical)
    return sorted(found)


def extract_jd_skills(text: str) -> List[str]:
    return _extract(text)


def extract_jd_title(text: str) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    title_words = ("developer", "engineer", "architect", "analyst", "scientist", "specialist", "intern")
    for line in lines[:8]:
        if len(line) < 100 and any(word in line.lower() for word in title_words):
            return line
    return lines[0][:100] if lines else "Unspecified role"


def extract_jd_experience_req(text: str) -> str:
    match = re.search(r'(\d+(?:\s*[-to]+\s*\d+|\+?)\s*(?:years?|yrs?)\s*(?:of\s*)?experience)', text, re.I)
    return match.group(1) if match else "Not specified"


def parse_job_description(text: str) -> Dict[str, Any]:
    lines = text.splitlines()
    required_section, preferred_section = [], []
    mode = "general"
    for line in lines:
        clean = line.strip()
        low = clean.lower()
        if re.search(r"preferred|nice.to.have|bonus|desired", low):
            mode = "preferred"
        elif re.search(r"required|must.have|qualifications|requirements", low):
            mode = "required"
        elif re.search(r"responsibilit|what.you.will.do|about.the.role", low):
            mode = "general"
        if clean:
            (preferred_section if mode == "preferred" else required_section).append(clean)
    all_skills = _extract(text)
    preferred = set(_extract("\n".join(preferred_section))) if preferred_section else set()
    required = sorted(set(all_skills) - preferred)
    return {
        "title": extract_jd_title(text), "required_skills": required,
        "preferred_skills": sorted(preferred), "experience_required": extract_jd_experience_req(text),
        "raw_text": text, "responsibilities": [x for x in lines if re.search(r"develop|design|build|maintain|deploy|test|collaborate", x, re.I)][:20],
    }
