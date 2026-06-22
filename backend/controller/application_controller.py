from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import Application, Job, Candidate, Resume
from datetime import date
from controller.enhanced_matching_controller import calculate_comprehensive_match


def _compute_match(candidate: Candidate, job: Job) -> tuple[float, list, list]:
    c_skills = set(s.lower() for s in (candidate.skills or []))
    j_skills = set(s.lower() for s in (job.skills or []))
    matched = sorted(c_skills & j_skills)
    missing = sorted(j_skills - c_skills)
    score = round((len(matched) / len(j_skills) * 100) if j_skills else 0, 1)
    return score, matched, missing


def apply_to_job(db: Session, candidate_id: int, job_id: int):
    if db.query(Application).filter(
        Application.candidate_id == candidate_id, Application.job_id == job_id
    ).first():
        raise HTTPException(status_code=400, detail="Already applied to this job.")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    score, matched, missing = _compute_match(candidate, job)

    app = Application(
        candidate_id=candidate_id,
        job_id=job_id,
        status="Applied",
        score=score,
        matched_skills=matched,
        missing_skills=missing,
        date=str(date.today()),
    )
    job.applicants = (job.applicants or 0) + 1
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def get_applications_by_candidate(db: Session, candidate_id: int):
    return db.query(Application).filter(Application.candidate_id == candidate_id).all()


def get_applications_by_job(db: Session, job_id: int):
    return db.query(Application).filter(Application.job_id == job_id)\
        .order_by(Application.score.desc()).all()


def _calculate_tie_breaker_score(candidate: Candidate, job: Job, matched_skills: list, comprehensive_match: dict = None) -> float:
    """
    Calculate a tie-breaker score for candidates with the same ATS score.
    Uses multiple factors with weighted importance.
    Returns a score between 0-100 for fine-grained ranking.
    """
    tie_score = 0.0
    
    # Factor 1: Experience relevance (30% weight)
    # More experience is generally better, but diminishing returns after 10 years
    if candidate.experience:
        exp_score = min(candidate.experience / 10.0, 1.0) * 30
        tie_score += exp_score
    
    # Factor 2: Number of matched skills (25% weight)
    # More matched skills = better candidate
    if matched_skills:
        # Normalize by total job skills required
        job_skills_count = len(job.skills or [])
        if job_skills_count > 0:
            skill_match_ratio = len(matched_skills) / job_skills_count
            tie_score += skill_match_ratio * 25
    
    # Factor 3: Education level (15% weight)
    education_scores = {
        "phd": 15, "doctorate": 15, "ph.d": 15,
        "masters": 12, "master": 12, "ms": 12, "mba": 12, "m.s": 12,
        "bachelors": 9, "bachelor": 9, "bs": 9, "ba": 9, "b.s": 9, "b.a": 9,
        "associate": 6, "diploma": 4,
    }
    if candidate.education:
        edu_lower = candidate.education.lower()
        for key, score in education_scores.items():
            if key in edu_lower:
                tie_score += score
                break
        else:
            tie_score += 3  # Some education mentioned
    
    # Factor 4: Salary alignment (15% weight)
    # Candidate's expectation aligns with job budget
    if candidate.salary_exp and job.salary_min and job.salary_max:
        salary_mid = (job.salary_min + job.salary_max) / 2
        salary_range = job.salary_max - job.salary_min
        if salary_range > 0:
            # Perfect match = expectation at midpoint
            deviation = abs(candidate.salary_exp - salary_mid) / salary_range
            alignment_score = max(0, 1.0 - deviation) * 15
            tie_score += alignment_score
        elif job.salary_min <= candidate.salary_exp <= job.salary_max:
            tie_score += 15
    
    # Factor 5: Location match (10% weight)
    if candidate.location and job.location:
        # Exact match or remote
        if candidate.location.lower() == job.location.lower():
            tie_score += 10
        elif "remote" in candidate.location.lower() or "remote" in job.location.lower():
            tie_score += 8
        # Same city/state partial match (simplified check)
        elif any(part.lower() in job.location.lower() for part in candidate.location.split(",") if len(part.strip()) > 2):
            tie_score += 5
    
    # Factor 6: Comprehensive match bonus (5% weight)
    # If comprehensive matching is available, use its overall score as a bonus
    if comprehensive_match and "overall_score" in comprehensive_match:
        comp_score = comprehensive_match["overall_score"]
        tie_score += (comp_score / 100.0) * 5
    
    return round(tie_score, 2)


def get_ranking_by_job(db: Session):
    """Return all jobs with their applicants ranked by ATS score with tie-breaking logic."""
    jobs = db.query(Job).filter(Job.applicants > 0).all()
    result = []
    for job in jobs:
        apps = db.query(Application).filter(Application.job_id == job.id).all()
        
        # Build candidate data with tie-breaker scores
        candidates_data = []
        for a in apps:
            latest_resume = next(
                (resume for resume in sorted(a.candidate.resumes, key=lambda r: r.uploaded_at or r.id, reverse=True)),
                None,
            )
            
            # Get comprehensive match analysis
            comprehensive_match = None
            try:
                comprehensive_match = calculate_comprehensive_match(db, a.candidate_id, job.id)
            except Exception:
                pass  # If comprehensive match fails, continue with basic data
            
            # Calculate tie-breaker score
            tie_breaker = _calculate_tie_breaker_score(
                a.candidate, 
                job, 
                a.matched_skills or [],
                comprehensive_match
            )
            
            candidate_data = {
                "application_id": a.id,
                "candidate_id": a.candidate_id,
                "name": a.candidate.name,
                "email": a.candidate.email,
                "role": a.candidate.role,
                "experience": a.candidate.experience,
                "education": a.candidate.education,
                "location": a.candidate.location,
                "skills": a.candidate.skills or [],
                "ats_score": a.score,
                "tie_breaker_score": tie_breaker,  # New field for debugging
                "matched_skills": a.matched_skills or [],
                "missing_skills": a.missing_skills or [],
                "status": a.status,
                "applied_date": a.date,
                "resume_path": latest_resume.file_path if latest_resume else None,
                "resume_filename": latest_resume.filename if latest_resume else None,
                "resume_profile": latest_resume.parsed_profile if latest_resume else {},
            }
            
            # Add comprehensive match data if available (breakdown only — never used for ranking)
            if comprehensive_match:
                candidate_data["comprehensive_match"] = comprehensive_match
            
            candidates_data.append(candidate_data)
        
        # Sort by ATS score (skill match) as primary.
        # When ATS scores are equal, use tie_breaker_score (experience, education,
        # salary fit, location, comprehensive match bonus) to separate them.
        ranked = sorted(
            candidates_data,
            key=lambda x: (x["ats_score"], x["tie_breaker_score"]),
            reverse=True,
        )
        
        # Assign ranks
        for i, candidate in enumerate(ranked):
            candidate["rank"] = i + 1
        
        result.append({
            "job_id": job.id,
            "job_title": job.title,
            "company": job.company,
            "location": job.location,
            "total_applicants": len(apps),
            "candidates": ranked,
        })
    return result


def update_application_status(db: Session, app_id: int, status: str):
    from email_service import send_selection_email, send_rejection_email
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    app.status = status
    app.candidate.status = status
    db.commit()
    db.refresh(app)

    candidate = app.candidate
    job = app.job
    try:
        if status in ("Offer", "Hired"):
            send_selection_email(candidate.email, candidate.name, job.title, job.company)
        elif status == "Rejected":
            send_rejection_email(candidate.email, candidate.name, job.title, job.company)
    except Exception as e:
        print(f"[Email] Failed to send status email: {e}")

    return app


def get_kanban(db: Session):
    stages = ["Applied", "Screening", "Interview", "Offer", "Hired"]
    result = {}
    for stage in stages:
        apps = db.query(Application).filter(Application.status == stage).all()
        result[stage] = [
            {
                "application_id": a.id,
                "candidate_id": a.candidate_id,
                "name": a.candidate.name,
                "role": a.candidate.role,
                "email": a.candidate.email,
                "experience": a.candidate.experience,
                "education": a.candidate.education,
                "location": a.candidate.location,
                "skills": a.candidate.skills,
                "company": a.job.company,
                "score": a.score,
                "matched_skills": a.matched_skills,
                "missing_skills": a.missing_skills,
                "date": a.date,
                "resume_filename": next(
                    (resume.filename for resume in sorted(a.candidate.resumes, key=lambda r: r.uploaded_at or r.id, reverse=True)),
                    None,
                ),
                "resume_path": next(
                    (resume.file_path for resume in sorted(a.candidate.resumes, key=lambda r: r.uploaded_at or r.id, reverse=True)),
                    None,
                ),
            }
            for a in apps
        ]
    return result
