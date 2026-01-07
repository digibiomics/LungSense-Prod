from __future__ import annotations

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, func, Boolean

from app.sessions.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="patient")
    is_active = Column(Boolean, nullable=False, default=True)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now())

    def __repr__(self) -> str:  # pragma: no cover - trivial
        return f"<User {self.email} role={self.role}>"
