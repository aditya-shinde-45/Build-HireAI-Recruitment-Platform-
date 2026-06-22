from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy import inspect
from database_config import engine, Base
from router.auth_router import router as auth_router
from router.job_router import router as job_router
from router.candidate_router import router as candidate_router
from router.application_router import router as application_router
from router.resume_router import router as resume_router
from router.interview_router import router as interview_router
from router.analytics_router import router as analytics_router

import models.models  # noqa — ensures all tables are registered with Base

app = FastAPI(
    title="HireAI Recruitment API",
    description="JWT-authenticated recruitment platform — resume upload, skill matching, job posting, application tracking, interview scheduling.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables():
    from sqlalchemy import text
    with engine.connect() as conn:
        # Drop legacy PG enum types that conflict with new String columns
        for enum_name in ["roleenum", "statusenum", "jobstatusenum", "jobtypeenum", "interviewstatusenum"]:
            conn.execute(text(f"DROP TYPE IF EXISTS {enum_name} CASCADE"))
        conn.commit()
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    
    # Add missing columns to resumes table
    if "resumes" in inspector.get_table_names():
        resume_columns = {column["name"] for column in inspector.get_columns("resumes")}
        with engine.begin() as conn:
            if "parsed_profile" not in resume_columns:
                conn.execute(text("ALTER TABLE resumes ADD COLUMN parsed_profile JSON"))
                print("✓ Added parsed_profile column")
            if "structured_data" not in resume_columns:
                conn.execute(text("ALTER TABLE resumes ADD COLUMN structured_data TEXT"))
                print("✓ Added structured_data column")
    
    # Add missing columns to candidates table
    if "candidates" in inspector.get_table_names():
        candidate_columns = {column["name"] for column in inspector.get_columns("candidates")}
        with engine.begin() as conn:
            if "phone" not in candidate_columns:
                conn.execute(text("ALTER TABLE candidates ADD COLUMN phone VARCHAR"))
                print("✓ Added phone column")
            if "linkedin" not in candidate_columns:
                conn.execute(text("ALTER TABLE candidates ADD COLUMN linkedin VARCHAR"))
                print("✓ Added linkedin column")
            if "github" not in candidate_columns:
                conn.execute(text("ALTER TABLE candidates ADD COLUMN github VARCHAR"))
                print("✓ Added github column")

    # Add missing columns to interviews table
    if "interviews" in inspector.get_table_names():
        interview_columns = {column["name"] for column in inspector.get_columns("interviews")}
        with engine.begin() as conn:
            if "meet_link" not in interview_columns:
                conn.execute(text("ALTER TABLE interviews ADD COLUMN meet_link VARCHAR"))
                print("✓ Added meet_link column")


app.include_router(auth_router)
app.include_router(job_router)
app.include_router(candidate_router)
app.include_router(application_router)
app.include_router(resume_router)
app.include_router(interview_router)
app.include_router(analytics_router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "HireAI backend running", "version": "2.0.0"}
