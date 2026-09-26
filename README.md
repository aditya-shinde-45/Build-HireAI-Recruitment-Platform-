# HireAI — AI-Powered Recruitment Platform

A full-stack recruitment platform with AI-driven resume parsing, ATS scoring, skill matching, and end-to-end hiring pipeline management.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│   React 18 + TypeScript + Vite + Tailwind CSS               │
│   Deployed on: Vercel                                       │
│   Port: 5173 (local)                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (JSON)
                       │ VITE_API_URL
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│   FastAPI + Python 3.11 + SQLAlchemy                        │
│   Deployed on: Render                                       │
│   Port: 8000 (local)                                        │
└──────┬──────────────────────────┬───────────────────────────┘
       │                          │
       ▼                          ▼
┌─────────────┐          ┌────────────────┐
│  PostgreSQL  │          │   AWS Services │
│  (Render DB) │          │  ─ S3 (resume  │
│              │          │    storage)    │
│  Tables:     │          │  ─ Bedrock     │
│  users       │          │    (ATS AI     │
│  candidates  │          │    scoring)    │
│  jobs        │          └────────────────┘
│  resumes     │
│  applications│
│  interviews  │
└─────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts |
| Backend | FastAPI, Python 3.11, SQLAlchemy, Uvicorn |
| Database | PostgreSQL |
| Auth | JWT (python-jose), bcrypt |
| File Storage | AWS S3 |
| AI / ATS | AWS Bedrock (Llama 3) |
| Email | Gmail SMTP |
| Deploy (BE) | Render |
| Deploy (FE) | Vercel |

---

## User Roles & Workflow

```
CANDIDATE                          RECRUITER
─────────                          ─────────
Register / Login                   Register / Login
       │                                  │
Upload Resume (S3 + AI parse)      Post Jobs
       │                                  │
Complete Profile                   View Candidate Rankings
       │                                  │
Browse & Apply to Jobs             Move Candidates through Pipeline
       │                           (Applied → Screening → Interview → Offer → Hired)
Track Applications                        │
       │                           Schedule Interviews (email sent)
View Interview Schedule                   │
       │                           View Analytics Dashboard
ATS Resume Analyzer
(Bedrock AI scoring)
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+ and pnpm
- PostgreSQL database (local or cloud)
- AWS account (S3 bucket + Bedrock access)
- Gmail account (for email notifications)

---

## Environment Variables

### Backend — `backend/.env`

```env
# Database
DATABASE_LINK=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=your_strong_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AWS
AWS_ACCESS_KEY_ID=<your_aws_access_key>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
AWS_REGION=us-east-1
S3_BUCKET_NAME=hireai-resumes-prod-2024

# Email (Gmail SMTP)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=your_gmail@gmail.com
FRONTEND_URL=http://localhost:5173

# File Upload
UPLOAD_DIR=/tmp/uploads
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail".

> **AWS Bedrock:** Ensure your IAM user has `bedrock:InvokeModel` permission and Llama 3 model access is enabled in your AWS region.

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:8000
```

For production, set `VITE_API_URL` to your Render backend URL.

---

## Local Setup & Run

### 1. Clone the repository

```bash
git clone <repo-url>
cd Build-HireAI-Recruitment-Platform-
```

### 2. Backend Setup

```bash
cd backend

# Create conda environment
conda create -n hireai python=3.11 -y
conda activate hireai

# Install dependencies
pip install -r requirements.txt

# Create .env file (see Environment Variables section above)
cp .env.example .env            # or create manually

# Start the server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`  
API docs (Swagger): `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start dev server
pnpm dev
```

Frontend runs at: `http://localhost:5173`

---

## Database

Tables are **auto-created on startup** via SQLAlchemy. No manual migration needed for a fresh database.

To seed demo users for testing:

```bash
cd backend
python seed_demo_users.py
python seed_candidates.py   # optional: seed sample candidates
```

### Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Candidate | aditya.shinde@test.com | TestPassword123! |
| Recruiter | john.recruiter@test.com | RecruiterPass123! |

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/auth/me` | Yes | Get current user |
| GET | `/jobs/` | No | List active jobs |
| POST | `/jobs/` | Recruiter | Create job posting |
| GET | `/candidates` | Recruiter | List all candidates |
| GET | `/candidates/me` | Candidate | Get own profile |
| PUT | `/candidates/me` | Candidate | Update own profile |
| POST | `/applications/` | Candidate | Apply to a job |
| GET | `/applications/mine` | Candidate | My applications |
| GET | `/applications/job/{id}` | Recruiter | Applications for a job |
| PUT | `/applications/{id}/status` | Recruiter | Move pipeline stage |
| POST | `/resumes/upload` | Candidate | Upload & parse resume |
| POST | `/resumes/ats-check` | Candidate | AI ATS score check |
| POST | `/interviews` | Recruiter | Schedule interview |
| GET | `/interviews/mine` | Candidate | My interviews |
| GET | `/analytics/stats` | Recruiter | Platform stats |

---

## Deployment

### Backend (Render)

The `backend/render.yaml` is pre-configured. Connect your GitHub repo to Render and set these environment variables in the Render dashboard:

- `DATABASE_LINK`
- `JWT_SECRET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `FRONTEND_URL` (your Vercel URL)

### Frontend (Vercel)

1. Import the repo into Vercel
2. Set root directory to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-render-backend.onrender.com`
4. Deploy

---

## Key Features

- **Resume Parsing** — Extracts skills, experience, education from PDF/DOCX via AWS Bedrock
- **ATS Scoring** — AI-powered resume vs job description scoring with breakdown
- **Skill Matching** — Auto-calculates match score when candidate applies to a job
- **Kanban Pipeline** — Drag-and-drop candidate pipeline (Applied → Hired)
- **Interview Scheduling** — Schedule with Google Meet link + automated email notifications
- **Email Notifications** — Interview scheduled, offer extended, rejection emails via Gmail SMTP
- **Analytics Dashboard** — Hiring funnel, stats, and candidate ranking for recruiters
- **Password Reset** — Token-based reset flow with email link (30-min expiry)

---

## Project Structure

```
├── backend/
│   ├── controller/       # Business logic
│   ├── router/           # FastAPI route definitions
│   ├── models/           # SQLAlchemy ORM models
│   ├── core/             # JWT auth, dependencies
│   ├── server.py         # App entry point
│   ├── database_config.py
│   ├── email_service.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # UI components
│   │   │   ├── api.ts        # All API calls
│   │   │   └── App.tsx       # Router + auth state
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```
