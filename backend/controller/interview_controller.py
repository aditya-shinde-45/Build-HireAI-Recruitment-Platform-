from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from models.models import Interview, Application, Candidate, Job
from email_service import send_interview_schedule_email


def schedule_interview(db: Session, recruiter_id: int, data: dict) -> Interview:
    app = db.query(Application).filter(Application.id == data["application_id"]).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    interview = Interview(
        application_id=app.id,
        candidate_id=app.candidate_id,
        job_id=app.job_id,
        recruiter_id=recruiter_id,
        scheduled_at=data["scheduled_at"],
        location=data.get("location", "Video Call"),
        notes=data.get("notes"),
        meet_link=data.get("meet_link"),
        status="Scheduled",
    )
    app.status = "Interview"
    app.candidate.status = "Interview"

    db.add(interview)
    db.commit()
    db.refresh(interview)

    # Send interview schedule email
    try:
        send_interview_schedule_email(
            to=app.candidate.email,
            name=app.candidate.name,
            job_title=app.job.title,
            company=app.job.company,
            scheduled_at=interview.scheduled_at,
            location=interview.location or "Video Call",
            meet_link=interview.meet_link,
            notes=interview.notes,
        )
    except Exception as e:
        print(f"[Email] Failed to send interview email: {e}")

    return interview


def get_interviews_by_candidate(db: Session, candidate_id: int):
    return db.query(Interview).filter(Interview.candidate_id == candidate_id)\
        .order_by(Interview.scheduled_at).all()


def get_interviews_by_recruiter(db: Session, recruiter_id: int):
    return db.query(Interview).filter(Interview.recruiter_id == recruiter_id)\
        .order_by(Interview.scheduled_at).all()


def get_interviews_by_job(db: Session, job_id: int):
    return db.query(Interview).filter(Interview.job_id == job_id)\
        .order_by(Interview.scheduled_at).all()


def update_interview(db: Session, interview_id: int, recruiter_id: int, data: dict):
    iv = db.query(Interview).filter(Interview.id == interview_id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Interview not found.")
    if iv.recruiter_id != recruiter_id:
        raise HTTPException(status_code=403, detail="Not your interview.")
    for k, v in data.items():
        setattr(iv, k, v)
    db.commit()
    db.refresh(iv)
    return iv


def cancel_interview(db: Session, interview_id: int, recruiter_id: int):
    iv = db.query(Interview).filter(Interview.id == interview_id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Interview not found.")
    if iv.recruiter_id != recruiter_id:
        raise HTTPException(status_code=403, detail="Not your interview.")
    iv.status = "Cancelled"
    db.commit()
    return {"detail": "Interview cancelled."}
