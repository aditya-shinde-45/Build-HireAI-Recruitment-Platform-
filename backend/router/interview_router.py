from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from database_config import get_db
from controller import interview_controller
from controller.candidate_controller import get_candidate_by_user
from core.dependencies import require_role
from models.models import User

router = APIRouter(prefix="/interviews", tags=["Interviews"])


class ScheduleRequest(BaseModel):
    application_id: int
    scheduled_at: datetime
    location: Optional[str] = "Video Call"
    meet_link: Optional[str] = None
    notes: Optional[str] = None


class InterviewUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    location: Optional[str] = None
    meet_link: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


@router.post("/", summary="Schedule an interview (recruiter only)")
def schedule(
    body: ScheduleRequest,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return interview_controller.schedule_interview(db, current_user.id, body.model_dump())


@router.get("/mine", summary="Get my upcoming interviews (candidate only)")
def my_interviews(
    current_user: User = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    candidate = get_candidate_by_user(db, current_user.id)
    return interview_controller.get_interviews_by_candidate(db, candidate.id)


@router.get("/scheduled", summary="Get all interviews scheduled by the recruiter")
def recruiter_interviews(
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return interview_controller.get_interviews_by_recruiter(db, current_user.id)


@router.get("/job/{job_id}", summary="Get all interviews for a job (recruiter/admin only)")
def job_interviews(
    job_id: int,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return interview_controller.get_interviews_by_job(db, job_id)


@router.put("/{interview_id}", summary="Update interview details (recruiter only)")
def update(
    interview_id: int,
    body: InterviewUpdate,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return interview_controller.update_interview(
        db, interview_id, current_user.id, body.model_dump(exclude_none=True)
    )


@router.delete("/{interview_id}", summary="Cancel an interview (recruiter only)")
def cancel(
    interview_id: int,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return interview_controller.cancel_interview(db, interview_id, current_user.id)
