"""
seed_candidates.py
------------------
Registers 6 demo candidates with distinct skill profiles, builds real PDF
resumes using reportlab, uploads them to S3, updates candidate profiles, and
applies each candidate to relevant jobs — giving the ranking page a meaningful
spread of scores to demonstrate.

Run from the backend directory:
    python seed_candidates.py

Jobs being targeted (from DB):
  2  Full Stack Developer     [python, javascript, react, node.js, postgresql, aws, docker]
  3  Senior Backend Engineer  [java, spring boot, postgresql, kafka, aws]
  4  Frontend Developer       [react, typescript, redux, css]
  5  Data Scientist           [python, pandas, machine learning, sql]
  6  DevOps Engineer          [docker, kubernetes, terraform, aws, ci/cd]
  8  Machine Learning Engineer[pytorch, nlp, python, distributed systems]
"""

import io
import sys
from datetime import date

# ── reportlab ──────────────────────────────────────────────────────────────
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER

# ── app imports ────────────────────────────────────────────────────────────
from database_config import SessionLocal
from models.models import User, Candidate, Application, Job, Resume
from controller.auth_controller import register_user, _hash
from controller.resume_controller import _upload_to_s3, _parse_skills
import os, uuid
from dotenv import load_dotenv
load_dotenv()

S3_BUCKET = os.getenv("S3_BUCKET")


# ══════════════════════════════════════════════════════════════════════════
#  Candidate profiles — designed to produce a spread across jobs
# ══════════════════════════════════════════════════════════════════════════
CANDIDATES = [
    {
        # ── Rank 1 target for Full Stack Developer ──────────────────────
        "name": "Priya Sharma",
        "email": "priya.sharma@demo.com",
        "password": "demo1234",
        "role_title": "Full Stack Developer",
        "experience_years": 4,
        "education": "B.S. Computer Science — IIT Delhi, 2020",
        "location": "Bangalore, India",
        "salary_exp": 1800000,
        "skills": ["python", "javascript", "react", "node.js", "postgresql", "aws", "docker", "typescript", "git"],
        "linkedin": "linkedin.com/in/priyasharma",
        "github": "github.com/priyasharma",
        "summary": (
            "Full stack developer with 4 years building scalable web applications. "
            "Proficient in Python/Node.js backends and React frontends, with hands-on AWS and Docker deployment experience."
        ),
        "experience": [
            {
                "title": "Full Stack Developer",
                "company": "TechCorp Pvt Ltd",
                "duration": "Jun 2021 – Present",
                "bullets": [
                    "Built REST APIs with Python/FastAPI serving 50K daily requests",
                    "Led React frontend migration reducing page load by 40%",
                    "Managed PostgreSQL schemas and AWS RDS deployments",
                    "Containerised 8 microservices using Docker and docker-compose",
                ],
            },
            {
                "title": "Junior Developer",
                "company": "StartupXYZ",
                "duration": "Jul 2020 – May 2021",
                "bullets": [
                    "Developed Node.js REST APIs integrated with PostgreSQL",
                    "Built responsive UIs with React and JavaScript",
                ],
            },
        ],
        "projects": [
            {
                "name": "E-commerce Platform",
                "tech": "React, Node.js, PostgreSQL, AWS S3",
                "desc": "Full stack marketplace with cart, payments and seller dashboard.",
            },
            {
                "name": "Real-time Chat App",
                "tech": "React, Node.js, WebSockets, Docker",
                "desc": "Scalable chat with rooms and message persistence.",
            },
        ],
        "apply_to_jobs": [2, 4],   # Full Stack Dev + Frontend Dev
    },
    {
        # ── Strong match for Data Scientist + ML Engineer ───────────────
        "name": "Rohan Mehta",
        "email": "rohan.mehta@demo.com",
        "password": "demo1234",
        "role_title": "Data Scientist",
        "experience_years": 5,
        "education": "M.S. Data Science — IISc Bangalore, 2019",
        "location": "Hyderabad, India",
        "salary_exp": 2200000,
        "skills": ["python", "machine learning", "pytorch", "sql", "nlp", "pandas", "aws", "docker", "distributed systems"],
        "linkedin": "linkedin.com/in/rohanmehta",
        "github": "github.com/rohanmehta",
        "summary": (
            "Data Scientist with 5 years in ML modelling and NLP. "
            "Experienced with PyTorch, distributed training, and deploying models to AWS at scale."
        ),
        "experience": [
            {
                "title": "Senior Data Scientist",
                "company": "Analytics Hub",
                "duration": "Mar 2020 – Present",
                "bullets": [
                    "Trained NLP classification models achieving 94% accuracy with PyTorch",
                    "Built distributed training pipelines on AWS SageMaker",
                    "Maintained ML feature store backed by SQL and pandas pipelines",
                    "Deployed real-time inference APIs serving 1M+ daily predictions",
                ],
            },
            {
                "title": "Data Analyst",
                "company": "DataWorks India",
                "duration": "Aug 2019 – Feb 2020",
                "bullets": [
                    "Automated SQL-based reporting dashboards",
                    "Developed Python scripts for ETL pipeline automation",
                ],
            },
        ],
        "projects": [
            {
                "name": "Sentiment Analysis Engine",
                "tech": "PyTorch, NLP, Python, AWS Lambda",
                "desc": "Multilingual sentiment classifier for social media streams.",
            },
            {
                "name": "Recommendation System",
                "tech": "Python, pandas, SQL, distributed systems",
                "desc": "Collaborative filtering engine for e-commerce product recommendations.",
            },
        ],
        "apply_to_jobs": [5, 8],   # Data Scientist + ML Engineer
    },
    {
        # ── Moderate match for Full Stack Dev — missing some skills ─────
        "name": "Aisha Khan",
        "email": "aisha.khan@demo.com",
        "password": "demo1234",
        "role_title": "Frontend Developer",
        "experience_years": 2,
        "education": "B.E. Information Technology — Mumbai University, 2022",
        "location": "Mumbai, India",
        "salary_exp": 900000,
        "skills": ["javascript", "react", "typescript", "css", "git", "figma"],
        "linkedin": "linkedin.com/in/aishakhan",
        "github": "github.com/aishakhan",
        "summary": (
            "Frontend developer with 2 years building pixel-perfect React applications. "
            "Strong in TypeScript, CSS architecture and Figma handoffs."
        ),
        "experience": [
            {
                "title": "Frontend Developer",
                "company": "WebAgency Co",
                "duration": "Sep 2022 – Present",
                "bullets": [
                    "Developed 12 client websites using React and TypeScript",
                    "Implemented design systems in collaboration with Figma designs",
                    "Improved Core Web Vitals scores by 35% across key products",
                ],
            },
        ],
        "projects": [
            {
                "name": "Portfolio Builder App",
                "tech": "React, TypeScript, CSS Modules",
                "desc": "Drag-and-drop portfolio generator with live preview.",
            },
        ],
        "apply_to_jobs": [4, 2],   # Frontend Dev (strong) + Full Stack (partial)
    },
    {
        # ── Strong DevOps — perfect for job 6 ──────────────────────────
        "name": "Vikram Nair",
        "email": "vikram.nair@demo.com",
        "password": "demo1234",
        "role_title": "DevOps Engineer",
        "experience_years": 6,
        "education": "B.Tech Computer Science — NIT Trichy, 2018",
        "location": "Pune, India",
        "salary_exp": 2500000,
        "skills": ["docker", "kubernetes", "terraform", "aws", "ci/cd", "linux", "python", "git"],
        "linkedin": "linkedin.com/in/vikramnair",
        "github": "github.com/vikramnair",
        "summary": (
            "DevOps Engineer with 6 years automating cloud infrastructure. "
            "Deep expertise in Kubernetes orchestration, Terraform IaC, and AWS. "
            "Built CI/CD pipelines reducing deployment time by 70%."
        ),
        "experience": [
            {
                "title": "Senior DevOps Engineer",
                "company": "CloudBuilders",
                "duration": "Jan 2020 – Present",
                "bullets": [
                    "Orchestrated 50-node Kubernetes clusters on AWS EKS",
                    "Authored Terraform modules for full VPC/ECS infrastructure",
                    "Implemented GitHub Actions CI/CD pipelines across 30 repositories",
                    "Reduced cloud spend 25% through spot instance strategy",
                ],
            },
            {
                "title": "Systems Engineer",
                "company": "InfraOps Ltd",
                "duration": "Jul 2018 – Dec 2019",
                "bullets": [
                    "Managed on-premise Linux servers and Docker deployments",
                    "Set up AWS EC2 and S3 infrastructure for legacy migration",
                ],
            },
        ],
        "projects": [
            {
                "name": "GitOps Pipeline Framework",
                "tech": "Kubernetes, Terraform, AWS, CI/CD, Docker",
                "desc": "Zero-downtime blue-green deployments using ArgoCD and Terraform.",
            },
        ],
        "apply_to_jobs": [6, 2],   # DevOps (perfect) + Full Stack (partial)
    },
    {
        # ── Backend specialist — Java stack, good for job 3 ─────────────
        "name": "Siddharth Rao",
        "email": "siddharth.rao@demo.com",
        "password": "demo1234",
        "role_title": "Backend Engineer",
        "experience_years": 3,
        "education": "B.Tech Computer Science — VIT Vellore, 2021",
        "location": "Chennai, India",
        "salary_exp": 1400000,
        "skills": ["java", "spring boot", "postgresql", "aws", "kafka", "docker", "git", "sql"],
        "linkedin": "linkedin.com/in/siddharthrao",
        "github": "github.com/siddharthrao",
        "summary": (
            "Backend Engineer with 3 years building high-throughput Java microservices. "
            "Experienced with Spring Boot, Kafka event streaming, and PostgreSQL at scale."
        ),
        "experience": [
            {
                "title": "Backend Engineer",
                "company": "FinTech Solutions",
                "duration": "Aug 2021 – Present",
                "bullets": [
                    "Built Spring Boot microservices processing 100K transactions/day",
                    "Designed Kafka event-driven architecture for real-time notifications",
                    "Optimised PostgreSQL queries reducing p99 latency by 60%",
                    "Deployed services to AWS ECS with blue-green deployments",
                ],
            },
        ],
        "projects": [
            {
                "name": "Payment Gateway",
                "tech": "Java, Spring Boot, Kafka, PostgreSQL, AWS",
                "desc": "Fault-tolerant payment processing microservice with idempotency guarantees.",
            },
        ],
        "apply_to_jobs": [3, 2],   # Senior Backend (perfect) + Full Stack (partial)
    },
    {
        # ── Career changer / weak profile — low scores across the board ─
        "name": "Meera Patel",
        "email": "meera.patel@demo.com",
        "password": "demo1234",
        "role_title": "Junior Developer",
        "experience_years": 1,
        "education": "B.Sc. Information Systems — Gujarat University, 2023",
        "location": "Ahmedabad, India",
        "salary_exp": 600000,
        "skills": ["python", "sql", "git"],
        "linkedin": "linkedin.com/in/meerapatel",
        "github": "github.com/meerapatel",
        "summary": (
            "Recent graduate with 1 year of internship experience in Python scripting and SQL reporting. "
            "Eager to grow in a software engineering role."
        ),
        "experience": [
            {
                "title": "Software Intern",
                "company": "IT Services Co",
                "duration": "Jun 2023 – May 2024",
                "bullets": [
                    "Wrote Python scripts to automate monthly SQL reports",
                    "Assisted in debugging REST API integrations",
                ],
            },
        ],
        "projects": [
            {
                "name": "Student Result Tracker",
                "tech": "Python, SQL, CSV",
                "desc": "Simple CLI tool for managing student exam results.",
            },
        ],
        "apply_to_jobs": [5, 2],   # Data Scientist (partial) + Full Stack (weak)
    },
]


# ══════════════════════════════════════════════════════════════════════════
#  PDF builder
# ══════════════════════════════════════════════════════════════════════════

def build_resume_pdf(candidate: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=1.5*cm, bottomMargin=1.5*cm,
    )

    styles = getSampleStyleSheet()
    name_style   = ParagraphStyle("Name",   fontSize=18, fontName="Helvetica-Bold",  spaceAfter=2,  alignment=TA_CENTER)
    title_style  = ParagraphStyle("Title",  fontSize=11, fontName="Helvetica",       spaceAfter=2,  textColor=colors.HexColor("#4F46E5"), alignment=TA_CENTER)
    contact_style= ParagraphStyle("Contact",fontSize=8,  fontName="Helvetica",       spaceAfter=6,  textColor=colors.HexColor("#64748B"), alignment=TA_CENTER)
    section_style= ParagraphStyle("Section",fontSize=10, fontName="Helvetica-Bold",  spaceBefore=10,spaceAfter=3, textColor=colors.HexColor("#1E293B"))
    body_style   = ParagraphStyle("Body",   fontSize=9,  fontName="Helvetica",       spaceAfter=2,  leading=13)
    bullet_style = ParagraphStyle("Bullet", fontSize=9,  fontName="Helvetica",       spaceAfter=2,  leading=13, leftIndent=12)
    job_style    = ParagraphStyle("Job",    fontSize=9,  fontName="Helvetica-Bold",  spaceAfter=1)
    meta_style   = ParagraphStyle("Meta",   fontSize=8,  fontName="Helvetica",       spaceAfter=2,  textColor=colors.HexColor("#64748B"), italic=True)

    story = []

    # ── Header ────────────────────────────────────────────────────────────
    story.append(Paragraph(candidate["name"], name_style))
    story.append(Paragraph(candidate["role_title"], title_style))
    story.append(Paragraph(
        f"{candidate['location']}  •  {candidate['email']}  •  {candidate['linkedin']}  •  {candidate['github']}",
        contact_style
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceAfter=6))

    # ── Summary ───────────────────────────────────────────────────────────
    story.append(Paragraph("PROFESSIONAL SUMMARY", section_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceAfter=4))
    story.append(Paragraph(candidate["summary"], body_style))

    # ── Skills ────────────────────────────────────────────────────────────
    story.append(Paragraph("TECHNICAL SKILLS", section_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceAfter=4))
    skills_text = "  •  ".join(s.title() for s in candidate["skills"])
    story.append(Paragraph(skills_text, body_style))

    # ── Experience ────────────────────────────────────────────────────────
    story.append(Paragraph("WORK EXPERIENCE", section_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceAfter=4))
    for exp in candidate["experience"]:
        story.append(Paragraph(f"{exp['title']} — {exp['company']}", job_style))
        story.append(Paragraph(exp["duration"], meta_style))
        for b in exp["bullets"]:
            story.append(Paragraph(f"• {b}", bullet_style))
        story.append(Spacer(1, 4))

    # ── Projects ──────────────────────────────────────────────────────────
    story.append(Paragraph("PROJECTS", section_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceAfter=4))
    for proj in candidate["projects"]:
        story.append(Paragraph(f"{proj['name']}", job_style))
        story.append(Paragraph(f"Tech: {proj['tech']}", meta_style))
        story.append(Paragraph(proj["desc"], bullet_style))
        story.append(Spacer(1, 4))

    # ── Education ─────────────────────────────────────────────────────────
    story.append(Paragraph("EDUCATION", section_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceAfter=4))
    story.append(Paragraph(candidate["education"], body_style))

    doc.build(story)
    return buf.getvalue()


# ══════════════════════════════════════════════════════════════════════════
#  Main seeding logic
# ══════════════════════════════════════════════════════════════════════════

def seed():
    db = SessionLocal()

    # Pre-load jobs once
    all_jobs = {j.id: j for j in db.query(Job).all()}

    for cdata in CANDIDATES:
        print(f"\n{'='*60}")
        print(f"  Processing: {cdata['name']} ({cdata['email']})")
        print(f"{'='*60}")

        # ── 1. Register or fetch user ─────────────────────────────────
        existing_user = db.query(User).filter(User.email == cdata["email"].lower()).first()
        if existing_user:
            print(f"  ⚠  User already exists — reusing (id={existing_user.id})")
            user = existing_user
        else:
            user = User(
                name=cdata["name"],
                email=cdata["email"].lower(),
                password=_hash(cdata["password"]),
                role="candidate",
            )
            db.add(user)
            db.flush()
            print(f"  ✅ Registered user id={user.id}")

        # ── 2. Create or fetch candidate profile ──────────────────────
        candidate = db.query(Candidate).filter(Candidate.user_id == user.id).first()
        if not candidate:
            candidate = Candidate(
                user_id=user.id,
                name=cdata["name"],
                email=cdata["email"].lower(),
                status="Applied",
            )
            db.add(candidate)
            db.flush()
            print(f"  ✅ Created candidate profile id={candidate.id}")
        else:
            print(f"  ⚠  Candidate profile exists — updating (id={candidate.id})")

        # ── 3. Update candidate profile fields ────────────────────────
        candidate.role       = cdata["role_title"]
        candidate.experience = cdata["experience_years"]
        candidate.education  = cdata["education"]
        candidate.location   = cdata["location"]
        candidate.salary_exp = cdata["salary_exp"]
        candidate.skills     = cdata["skills"]
        candidate.phone      = "+91-9000000000"
        candidate.linkedin   = cdata["linkedin"]
        candidate.github     = cdata["github"]
        db.flush()
        print(f"  ✅ Profile updated — skills: {cdata['skills']}")

        # ── 4. Build PDF resume ────────────────────────────────────────
        print(f"  📄 Building PDF resume...")
        pdf_bytes = build_resume_pdf(cdata)
        print(f"  ✅ PDF built ({len(pdf_bytes):,} bytes)")

        # ── 5. Upload to S3 ───────────────────────────────────────────
        s3_key = f"resumes/candidate_{candidate.id}/{uuid.uuid4().hex}.pdf"
        try:
            s3_url = _upload_to_s3(pdf_bytes, s3_key, "application/pdf")
            print(f"  ✅ Uploaded to S3: {s3_key}")
        except Exception as e:
            print(f"  ❌ S3 upload failed: {e}")
            print(f"  ℹ  Using placeholder URL instead")
            s3_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{s3_key}"

        # ── 6. Save resume record ─────────────────────────────────────
        # Remove old resume records to avoid duplicates on re-run
        db.query(Resume).filter(Resume.candidate_id == candidate.id).delete()
        db.flush()

        resume_record = Resume(
            candidate_id=candidate.id,
            filename=f"{cdata['name'].replace(' ', '_')}_Resume.pdf",
            file_path=s3_url,
            parsed_skills=cdata["skills"],
            parsed_profile={
                "full_name": cdata["name"],
                "headline": cdata["role_title"],
                "summary": cdata["summary"],
                "contact": {"email": cdata["email"], "phone": "+91-9000000000", "location": cdata["location"]},
                "links": {"linkedin": cdata["linkedin"], "github": cdata["github"]},
                "skills": cdata["skills"],
                "education": [{"degree": cdata["education"], "institution": ""}],
                "experience": cdata["experience"],
                "projects": cdata["projects"],
            },
            raw_text=" ".join([
                cdata["name"], cdata["role_title"], cdata["summary"],
                cdata["education"], cdata["location"],
                " ".join(cdata["skills"]),
                " ".join(e["title"] + " " + e["company"] for e in cdata["experience"]),
            ])[:5000],
        )
        db.add(resume_record)
        candidate.resume_path = s3_url
        db.flush()
        print(f"  ✅ Resume record saved")

        # ── 7. Apply to jobs ──────────────────────────────────────────
        for job_id in cdata["apply_to_jobs"]:
            job = all_jobs.get(job_id)
            if not job:
                print(f"  ⚠  Job id={job_id} not found — skipping")
                continue

            # Skip if already applied
            existing_app = db.query(Application).filter(
                Application.candidate_id == candidate.id,
                Application.job_id == job_id,
            ).first()
            if existing_app:
                print(f"  ⚠  Already applied to '{job.title}' (job {job_id}) — skipping")
                continue

            # Compute skill match
            c_skills = set(s.lower() for s in (candidate.skills or []))
            j_skills = set(s.lower() for s in (job.skills or []))
            matched  = sorted(c_skills & j_skills)
            missing  = sorted(j_skills - c_skills)
            score    = round((len(matched) / len(j_skills) * 100) if j_skills else 0.0, 1)

            app = Application(
                candidate_id=candidate.id,
                job_id=job_id,
                status="Applied",
                score=score,
                matched_skills=matched,
                missing_skills=missing,
                date=str(date.today()),
            )
            db.add(app)
            job.applicants = (job.applicants or 0) + 1
            db.flush()
            print(f"  ✅ Applied to '{job.title}' (job {job_id}) — score={score}%  matched={matched}")

    db.commit()
    db.close()
    print(f"\n{'='*60}")
    print("  🎉 Seeding complete!")
    print(f"{'='*60}")
    print("\nCandidate login credentials:")
    print("  Email                         Password    Target jobs")
    print("  ─────────────────────────────────────────────────────────────────")
    for c in CANDIDATES:
        jobs_str = ", ".join(f"#{j}" for j in c["apply_to_jobs"])
        print(f"  {c['email']:<32} {c['password']}  Jobs {jobs_str}")
    print("\nAll passwords: demo1234")


if __name__ == "__main__":
    seed()
