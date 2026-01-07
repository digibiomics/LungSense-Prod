from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.users import User
from app.utils.auth import hash_password, verify_password


def create_user(db: Session, *, email: str, password: str, role: str = "patient", first_name: str | None = None, last_name: str | None = None) -> User:
    hashed = hash_password(password)
    user = User(email=email, hashed_password=hashed, first_name=first_name, last_name=last_name, role=role)
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email, User.is_deleted == False).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()
