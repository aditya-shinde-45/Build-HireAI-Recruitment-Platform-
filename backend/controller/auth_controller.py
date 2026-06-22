import bcrypt
import secrets
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import User, Candidate, PasswordResetToken
from core.jwt import create_access_token
from email_service import send_password_reset_email

VALID_ROLES = {"candidate", "recruiter", "admin"}


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify(password: str, hashed: str) -> bool:
    # Support both bcrypt hashed and plain text passwords
    if hashed.startswith("$2b$") or hashed.startswith("$2a$"):
        return bcrypt.checkpw(password.encode(), hashed.encode())
    return password == hashed  # pragma: no cover — only for legacy seeds


def _token_response(user: User) -> dict:
    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role},
    }


def register_user(db: Session, name: str, email: str, password: str, role: str):
    if role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")
    if db.query(User).filter(User.email == email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user = User(name=name, email=email.lower(), password=_hash(password), role=role)
    db.add(user)
    db.flush()

    if role == "candidate":
        db.add(Candidate(user_id=user.id, name=name, email=email.lower(), status="Applied"))

    db.commit()
    db.refresh(user)
    return _token_response(user)


def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user or not _verify(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return _token_response(user)


def get_me(user: User) -> dict:
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}


def forgot_password(db: Session, email: str):
    user = db.query(User).filter(User.email == email.lower()).first()
    # Always return success to avoid email enumeration
    if not user:
        return {"detail": "If that email exists, a reset link has been sent."}

    # Invalidate old tokens
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == "false",
    ).update({"used": "true"})

    token = secrets.token_urlsafe(48)
    expires = datetime.utcnow() + timedelta(minutes=30)
    db.add(PasswordResetToken(user_id=user.id, token=token, expires_at=expires))
    db.commit()

    try:
        send_password_reset_email(user.email, user.name, token)
    except Exception as e:
        print(f"[Email] Failed to send reset email: {e}")

    return {"detail": "If that email exists, a reset link has been sent."}


def reset_password(db: Session, token: str, new_password: str):
    record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.used == "false",
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    if record.expires_at < datetime.utcnow():
        record.used = "true"
        db.commit()
        raise HTTPException(status_code=400, detail="Reset token has expired.")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user = db.query(User).filter(User.id == record.user_id).first()
    user.password = _hash(new_password)
    record.used = "true"
    db.commit()
    return {"detail": "Password reset successfully. You can now log in."}
