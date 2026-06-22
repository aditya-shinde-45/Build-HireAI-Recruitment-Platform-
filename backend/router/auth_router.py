from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from database_config import get_db
from controller.auth_controller import register_user, login_user, get_me, forgot_password, reset_password
from core.dependencies import get_current_user
from models.models import User

router = APIRouter(prefix="/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/register", summary="Register a new user and receive a JWT token")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(db, body.name, body.email, body.password, body.role)


@router.post("/login", summary="Login and receive a JWT token")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    return login_user(db, body.email, body.password)


@router.get("/me", summary="Get current authenticated user info")
def me(current_user: User = Depends(get_current_user)):
    return get_me(current_user)


@router.post("/forgot-password", summary="Request a password reset link via email")
def forgot_pw(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    return forgot_password(db, body.email)


@router.post("/reset-password", summary="Reset password using the token received via email")
def reset_pw(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    return reset_password(db, body.token, body.new_password)
