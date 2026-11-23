import pdfplumber
import re
from typing import Dict, Any, List

# Broad tech skill database for NLP matching & taxonomy
TECH_SKILLS_TAXONOMY = {
    # Languages
    "python": "Python", "javascript": "JavaScript", "typescript": "TypeScript", "java": "Java",
    "c++": "C++", "c#": "C#", "c": "C", "html": "HTML", "css": "CSS", "sql": "SQL",
    "r": "R", "go": "Go", "golang": "Go", "rust": "Rust", "ruby": "Ruby", "php": "PHP",
    "swift": "Swift", "kotlin": "Kotlin", "dart": "Dart", "scala": "Scala",

    # Frontend Frameworks & Libraries
    "react": "React", "reactjs": "React", "react.js": "React", "vue": "Vue.js", "vuejs": "Vue.js",
    "angular": "Angular", "angularjs": "Angular", "next.js": "Next.js", "nextjs": "Next.js",
    "redux": "Redux", "tailwind": "Tailwind CSS", "tailwindcss": "Tailwind CSS",
    "bootstrap": "Bootstrap", "jquery": "jQuery", "sass": "SASS", "less": "LESS",

    # Backend Frameworks
    "fastapi": "FastAPI", "django": "Django", "flask": "Flask", "express": "Express.js",
    "expressjs": "Express.js", "node.js": "Node.js", "nodejs": "Node.js", "spring": "Spring Boot",
    "spring boot": "Spring Boot", "springboot": "Spring Boot", "asp.net": "ASP.NET",
    "laravel": "Laravel", "nest.js": "NestJS", "nestjs": "NestJS",

    # Databases
    "mysql": "MySQL", "postgresql": "PostgreSQL", "postgres": "PostgreSQL",
    "mongodb": "MongoDB", "sqlite": "SQLite", "redis": "Redis", "oracle": "Oracle DB",
    "elasticsearch": "Elasticsearch", "cassandra": "Cassandra", "dynamodb": "DynamoDB",
    "firebase": "Firebase", "supabase": "Supabase",

    # Cloud & DevOps
    "aws": "AWS", "amazon web services": "AWS", "azure": "Azure", "gcp": "Google Cloud",
    "google cloud": "Google Cloud", "docker": "Docker", "kubernetes": "Kubernetes",
    "k8s": "Kubernetes", "jenkins": "Jenkins", "git": "Git", "github": "GitHub",
    "gitlab": "GitLab", "ci/cd": "CI/CD", "terraform": "Terraform", "ansible": "Ansible",
    "linux": "Linux", "nginx": "Nginx",

    # AI, ML & Data Science
    "machine learning": "Machine Learning", "deep learning": "Deep Learning",
    "tensorflow": "TensorFlow", "pytorch": "PyTorch", "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn", "pandas": "Pandas", "numpy": "NumPy", "opencv": "OpenCV",
    "nlp": "NLP", "natural language processing": "Natural Language Processing",
    "power bi": "Power BI", "tableau": "Tableau", "data analysis": "Data Analysis",

    # General Concepts & Testing
    "rest api": "REST API", "graphql": "GraphQL", "microservices": "Microservices",
    "agile": "Agile", "scrum": "Scrum", "unit testing": "Unit Testing", "jest": "Jest",
    "selenium": "Selenium", "cypress": "Cypress", "oops": "OOP", "object oriented programming": "OOP",
    "data structures": "Data Structures", "algorithms": "Algorithms"
}


def extract_text_from_pdf(pdf_path: str) -> str:
    """Step 4: PDF Parsing - Extract clean text from all pages"""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
    return text.strip()


def extract_email(text: str) -> str:
    match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    return match.group(0) if match else ""


def extract_phone(text: str) -> str:
    match = re.search(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}', text)
    return match.group(0) if match else ""


def extract_name(text: str) -> str:
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        # First non-empty line that doesn't look like an email or URL
        for line in lines[:5]:
            if not re.search(r'@|http|www|\.com', line, re.IGNORECASE) and len(line) < 50:
                return line
    return ""


def extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    found_skills = set()
    
    for key, canonical_name in TECH_SKILLS_TAXONOMY.items():
        # Match as whole word / token
        pattern = r'(?<![a-zA-Z0-9#+.-])' + re.escape(key) + r'(?![a-zA-Z0-9#+.-])'
        if re.search(pattern, text_lower):
            found_skills.add(canonical_name)

    return sorted(list(found_skills))


def extract_education(text: str) -> List[str]:
    degrees = []
    degree_patterns = [
        r'B\.?Tech(?:nolgy)?', r'B\.?E\.?', r'M\.?Tech', r'M\.?E\.?', r'B\.?S\.?', r'M\.?S\.?',
        r'B\.?Sc', r'M\.?Sc', r'BCA', r'MCA', r'Ph\.?D', r'Bachelor of [A-Za-z ]+', r'Master of [A-Za-z ]+'
    ]
    for pattern in degree_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for m in matches:
            if m not in degrees:
                degrees.append(m)
    
    # Check for CGPA / GPA
    gpa_match = re.search(r'(?:CGPA|GPA|Percentage)[\s:]*([0-9\.]+%?)', text, re.IGNORECASE)
    if gpa_match:
        degrees.append(f"Grade/CGPA: {gpa_match.group(1)}")
        
    return degrees


def extract_experience(text: str) -> List[str]:
    experiences = []
    exp_keywords = ["Intern", "Internship", "Developer", "Engineer", "Assistant", "Consultant", "Analyst", "Lead"]
    lines = text.split('\n')
    for line in lines:
        for kw in exp_keywords:
            if kw.lower() in line.lower() and len(line.strip()) < 100:
                if line.strip() not in experiences:
                    experiences.append(line.strip())
    return experiences[:5]  # Top 5 matched lines


def extract_projects(text: str) -> List[str]:
    projects = []
    in_project_section = False
    lines = text.split('\n')
    for line in lines:
        if re.search(r'projects|key projects|academic projects', line, re.IGNORECASE):
            in_project_section = True
            continue
        if in_project_section:
            if re.search(r'education|skills|certifications|experience|achievements', line, re.IGNORECASE) and len(line.strip()) < 30:
                in_project_section = False
                continue
            if line.strip() and len(line.strip()) > 5:
                projects.append(line.strip())
                if len(projects) >= 6:
                    break
    return projects


def extract_certifications(text: str) -> List[str]:
    certs = []
    cert_keywords = ["Certified", "Certification", "Coursera", "Udemy", "AWS Certified", "NPTEL", "HackerRank"]
    lines = text.split('\n')
    for line in lines:
        for kw in cert_keywords:
            if kw.lower() in line.lower() and len(line.strip()) < 120:
                if line.strip() not in certs:
                    certs.append(line.strip())
    return certs


def extract_skill_evidence(text: str) -> List[Dict[str, Any]]:
    evidence = []
    for alias, canonical in TECH_SKILLS_TAXONOMY.items():
        pattern = r"(?<![a-zA-Z0-9#+.-])" + re.escape(alias) + r"(?![a-zA-Z0-9#+.-])"
        match = re.search(pattern, text, re.IGNORECASE)
        if match and not any(item["skill"] == canonical for item in evidence):
            left = max(0, match.start() - 90)
            right = min(len(text), match.end() + 90)
            evidence.append({"skill": canonical, "matched_text": match.group(0),
                             "context": re.sub(r"\s+", " ", text[left:right]).strip(),
                             "source": "resume_text"})
    return sorted(evidence, key=lambda item: item["skill"].lower())


def parse_resume_data(text: str) -> Dict[str, Any]:
    """Extract structured resume signals; absent sections remain empty, never fabricated."""
    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)
    education = extract_education(text)
    experience = extract_experience(text)
    projects = extract_projects(text)
    certifications = extract_certifications(text)
    evidence = extract_skill_evidence(text)
    signals = sum(bool(x) for x in [name, email, phone, skills, education, experience, projects, certifications])
    return {
        "name": name, "email": email, "phone": phone, "skills": skills,
        "education": education, "experience": experience, "projects": projects,
        "certifications": certifications, "skill_evidence": evidence,
        "extraction_confidence": round(signals / 8, 2),
        "extraction_notes": ([] if text.strip() else ["No extractable text found"]),
    }


def extract_text_with_ocr_fallback(pdf_path: str, enable_ocr: bool = False) -> Dict[str, Any]:
    """Extract PDF text; optionally use pytesseract + pdf2image if explicitly enabled."""
    text = extract_text_from_pdf(pdf_path)
    if text.strip():
        return {"text": text, "method": "pdfplumber", "ocr_used": False}
    if not enable_ocr:
        return {"text": "", "method": "none", "ocr_used": False}
    try:
        from pdf2image import convert_from_path
        import pytesseract
        pages = convert_from_path(pdf_path, first_page=1, last_page=10)
        text = "\n".join(pytesseract.image_to_string(page) for page in pages)
        return {"text": text.strip(), "method": "tesseract", "ocr_used": True}
    except Exception:
        return {"text": "", "method": "ocr_unavailable", "ocr_used": False}
