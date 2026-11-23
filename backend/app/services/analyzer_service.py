import json
from typing import Dict, Any, List

# Course & Project recommendations knowledge map
SKILL_LEARNING_DATABASE = {
    "React": {
        "course": "React - The Complete Guide (Udemy / Meta React Specialization)",
        "project": "Build a Real-Time E-Commerce Dashboard with React & Tailwind CSS",
        "cert": "Meta Front-End Developer Professional Certificate"
    },
    "Node.js": {
        "course": "Node.js Developer Course by Andrew Mead (Udemy / freeCodeCamp)",
        "project": "Build a Scalable Microservices Backend for a Payment Gateway",
        "cert": "OpenJS Node.js Application Developer (JSNAD)"
    },
    "Python": {
        "course": "Python for Everybody Specialization (University of Michigan / Coursera)",
        "project": "Build an Automated Web Scraping & Data Processing Pipeline",
        "cert": "PCPP1 – Certified Professional in Python Programming"
    },
    "FastAPI": {
        "course": "FastAPI Full Stack Web Development Guide (Official FastAPI Docs / YouTube)",
        "project": "Develop a High-Performance RESTful Microservice with Async Asyncpg & JWT Auth",
        "cert": "FastAPI Web Application Security Specialist"
    },
    "Docker": {
        "course": "Docker & Kubernetes: The Practical Guide (Udemy)",
        "project": "Containerize a Multi-Container Full-Stack App with Docker Compose & Nginx",
        "cert": "Docker Certified Associate (DCA)"
    },
    "Kubernetes": {
        "course": "Kubernetes Mastery by Bret Fisher (Udemy / CNCF Documentation)",
        "project": "Deploy and Autoscale a Node.js Application Cluster on Minikube",
        "cert": "Certified Kubernetes Application Developer (CKAD)"
    },
    "AWS": {
        "course": "AWS Certified Cloud Practitioner & Developer Associate (Stephane Maarek)",
        "project": "Deploy a Serverless Event-Driven API using AWS Lambda, S3, DynamoDB & API Gateway",
        "cert": "AWS Certified Developer – Associate"
    },
    "SQL": {
        "course": "The Complete SQL Bootcamp (Udemy / Stanford Online)",
        "project": "Design a Complex Relational Database with Stored Procedures & Indexing",
        "cert": "Oracle Database SQL Certified Associate"
    },
    "PostgreSQL": {
        "course": "Mastering PostgreSQL Administration & Query Tuning",
        "project": "Build a High-Availability Database Schema with Partitioning & Full-Text Search",
        "cert": "PostgreSQL Certified Associate"
    },
    "MongoDB": {
        "course": "MongoDB University - M001: MongoDB Basics & Data Modeling",
        "project": "Build a NoSQL Document Store for a Social Media Feed Engine",
        "cert": "MongoDB Certified Developer Associate"
    },
    "Machine Learning": {
        "course": "Machine Learning Specialization by Andrew Ng (DeepLearning.AI / Coursera)",
        "project": "Build an End-to-End Customer Churn Prediction Model with Scikit-Learn & Streamlit",
        "cert": "TensorFlow Developer Certificate"
    },
    "TypeScript": {
        "course": "Understanding TypeScript (Udemy / Executable Docs)",
        "project": "Refactor a Large JavaScript Front-End Codebase to Strict TypeScript",
        "cert": "TypeScript Professional Specialist"
    },
    "Git": {
        "course": "Git & GitHub Complete Masterclass (freeCodeCamp)",
        "project": "Implement GitOps Branching Strategy & Automated Pull Request Workflows",
        "cert": "GitHub Actions Certified"
    }
}


def perform_skill_gap_analysis(resume_skills: List[str], jd_skills: List[str]) -> Dict[str, List[str]]:
    """Step 9 & 10: Resume & JD Comparison and Skill Gap Analysis"""
    resume_set = set([s.lower() for s in resume_skills])
    
    matched = []
    missing = []

    for skill in jd_skills:
        if skill.lower() in resume_set:
            matched.append(skill)
        else:
            missing.append(skill)

    return {
        "matched_skills": sorted(matched),
        "missing_skills": sorted(missing)
    }


def calculate_ats_score(
    matched_skills: List[str],
    jd_skills: List[str],
    resume_parsed: Dict[str, Any]
) -> float:
    """Step 11: ATS Score Calculation (0.0 to 100.0)"""
    if not jd_skills:
        return 75.0

    # Skill Match Ratio (45%)
    skill_coverage = len(matched_skills) / len(jd_skills)
    skill_score = skill_coverage * 45.0

    # Keyword / Skill Diversity (25%)
    total_resume_skills = len(resume_parsed.get("skills", []))
    diversity_score = min(total_resume_skills / 8.0, 1.0) * 25.0

    # Education presence (15%)
    edu_count = len(resume_parsed.get("education", []))
    education_score = 15.0 if edu_count > 0 else 5.0

    # Projects / Certifications presence (15%)
    proj_count = len(resume_parsed.get("projects", []))
    cert_count = len(resume_parsed.get("certifications", []))
    proj_score = min((proj_count * 5.0) + (cert_count * 5.0), 15.0)

    total_ats = round(skill_score + diversity_score + education_score + proj_score, 1)
    return min(total_ats, 100.0)


def calculate_placement_readiness_score(
    ats_score: float,
    resume_parsed: Dict[str, Any]
) -> float:
    """Step 12: Placement Readiness Score Calculation (0.0 to 100.0)"""
    skills_count = len(resume_parsed.get("skills", []))
    projects_count = len(resume_parsed.get("projects", []))
    certs_count = len(resume_parsed.get("certifications", []))

    # Base starts with ATS score (50% weight)
    readiness = ats_score * 0.50

    # Technical Breadth (20% weight)
    tech_breadth = min(skills_count / 10.0, 1.0) * 20.0

    # Hands-on Project Depth (20% weight)
    project_depth = min(projects_count / 3.0, 1.0) * 20.0

    # Certifications & Extra Achievements (10% weight)
    cert_depth = min(certs_count / 2.0, 1.0) * 10.0

    total_readiness = round(readiness + tech_breadth + project_depth + cert_depth, 1)
    return min(total_readiness, 100.0)


def generate_ai_recommendations(missing_skills: List[str], readiness_score: float) -> Dict[str, Any]:
    """Step 13: AI Recommendations Generator"""
    courses = []
    projects = []
    certifications = []
    key_focus_areas = []

    for skill in missing_skills:
        info = SKILL_LEARNING_DATABASE.get(skill, {
            "course": f"Complete {skill} Mastery & Fundamentals (Coursera / YouTube)",
            "project": f"Build a Production-Ready Application implementing {skill}",
            "cert": f"{skill} Certified Associate / Practitioner"
        })
        courses.append({"skill": skill, "title": info["course"]})
        projects.append({"skill": skill, "title": info["project"]})
        certifications.append({"skill": skill, "title": info["cert"]})
        key_focus_areas.append(skill)

    # General readiness advice
    if readiness_score >= 80:
        readiness_status = "High Placement Readiness - Excellent Match!"
        action_advice = "Focus on Mock Technical Interviews, System Design practice, and behavioral prep."
    elif readiness_score >= 60:
        readiness_status = "Moderate Placement Readiness - Needs Targeted Skill Upgrade."
        action_advice = "Focus on bridging critical missing skills via targeted portfolio projects before applying."
    else:
        readiness_status = "Low Placement Readiness - Fundamental Skill Building Required."
        action_advice = "Complete core technology certifications and build 2+ full-stack projects highlighting JD skills."

    return {
        "readiness_status": readiness_status,
        "action_advice": action_advice,
        "key_focus_areas": key_focus_areas[:5],
        "recommended_courses": courses,
        "recommended_projects": projects,
        "recommended_certifications": certifications
    }


def analyze_placement_suitability(
    resume_parsed: Dict[str, Any],
    jd_parsed: Dict[str, Any]
) -> Dict[str, Any]:
    """Complete Pipeline: Compare, Gap Analysis, ATS, Readiness, AI Recommendations"""
    resume_skills = resume_parsed.get("skills", [])
    jd_skills = jd_parsed.get("required_skills", [])

    # Step 9 & 10: Skill Gap Analysis
    gap_result = perform_skill_gap_analysis(resume_skills, jd_skills)
    matched_skills = gap_result["matched_skills"]
    missing_skills = gap_result["missing_skills"]

    # Step 11: ATS Score
    ats_score = calculate_ats_score(matched_skills, jd_skills, resume_parsed)

    # Step 12: Placement Readiness Score
    readiness_score = calculate_placement_readiness_score(ats_score, resume_parsed)

    # Step 13: AI Recommendations
    recommendations = generate_ai_recommendations(missing_skills, readiness_score)

    summary = (
        f"Candidate {resume_parsed.get('name', 'Applicant')} matched {len(matched_skills)} of {len(jd_skills)} "
        f"required skills for '{jd_parsed.get('title', 'Role')}'. Missing skills: {', '.join(missing_skills[:4]) if missing_skills else 'None'}."
    )

    return {
        "ats_score": ats_score,
        "readiness_score": readiness_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommendations": recommendations,
        "resume_summary": summary
    }
