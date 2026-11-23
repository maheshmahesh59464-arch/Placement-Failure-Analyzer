from app.services.intelligence_service import analyze_intelligently
from app.services.resume_parser import parse_resume_data
from app.services.jd_parser import parse_job_description


def test_parser_does_not_invent_education_or_projects():
    parsed = parse_resume_data("Asha Rao\nasha@example.com\nPython developer")
    assert parsed["education"] == []
    assert parsed["projects"] == []
    assert parsed["skills"] == ["Python"]
    assert 0 <= parsed["extraction_confidence"] <= 1


def test_job_analysis_explains_matches_and_missing_skills():
    resume = {"name": "Asha", "skills": ["Python", "FastAPI"], "education": ["BSc"],
              "experience": [], "projects": ["Built a Python REST API"], "raw_text": "Python FastAPI REST API"}
    jd = {"title": "Python Developer", "required_skills": ["Python", "Docker"],
          "preferred_skills": ["FastAPI"], "raw_text": "Required Python Docker. Preferred FastAPI."}
    result = analyze_intelligently(resume, jd)
    assert "Python" in result["matched_skills"]
    assert "Docker" in result["missing_skills"]
    assert result["scoring_version"] == "2.0"
    assert result["evidence"]
    assert result["ats_score"] is not None
    assert result["readiness_score"] is None


def test_job_description_extracts_preferred_skills():
    parsed = parse_job_description("Python Developer\nRequirements\nPython\nPreferred Skills\nDocker")
    assert "Python" in parsed["required_skills"]
    assert "Docker" in parsed["preferred_skills"]


def test_semantic_fallback_is_bounded_and_explainable():
    from app.ai.semantic_matcher import similarity, match_requirements
    score, method = similarity("Python API development", "Built a Python API")
    assert 0 <= score <= 1
    assert method in {"sentence-transformers", "token-overlap-fallback"}
    results, overall_method = match_requirements(["Python"], "Python developer with API experience")
    assert len(results) == 1
    assert results[0]["requirement"] == "Python"
    assert overall_method in {"sentence-transformers", "token-overlap-fallback"}

