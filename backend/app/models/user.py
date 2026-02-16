"""
User model for authentication and role management.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.sessions.db import Base
from app.constants.enums import UserRole


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users
    role = Column(String(20), nullable=False, default=UserRole.PATIENT)
    
    # OAuth fields
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    profile_picture_url = Column(String(500), nullable=True)
    profile_completed = Column(Boolean, default=False, nullable=False)
    
    # Soft delete
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Audit timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Patient-specific fields (nullable for non-patients)
    age = Column(Integer, nullable=True)
    sex = Column(String(1), nullable=True)  # F, M, O
    ethnicity = Column(String(3), nullable=True)  # AFR, ASN, CAU, etc.
    country = Column(String(100), nullable=True)  # Full country name
    province = Column(String(100), nullable=True)  # Full province/state name
    
    # Practitioner-specific fields (nullable for non-practitioners)
    practitioner_id = Column(String(20), unique=True, nullable=True)
    institution = Column(String(100), nullable=True)
    institution_location_country = Column(String(100), nullable=True)
    institution_location_province = Column(String(100), nullable=True)
    
    # Respiratory history (JSON array of RespiratoryHistory enum values)
    respiratory_history = Column(Text, nullable=True)  # JSON string
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
    
    @property
    def is_active(self) -> bool:
        """Check if user is active (not soft deleted)."""
        return self.deleted_at is None
    
    @property
    def full_name(self) -> str:
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_patient(self) -> bool:
        """Check if user is a patient."""
        return self.role == UserRole.PATIENT
    
    @property
    def is_practitioner(self) -> bool:
        """Check if user is a practitioner."""
        return self.role == UserRole.PRACTITIONER
    
    @property
    def is_admin(self) -> bool:
        """Check if user is an admin."""
        return self.role in [UserRole.DATA_ADMIN, UserRole.SUPER_ADMIN]
    
    @property
    def is_super_admin(self) -> bool:
        """Check if user is a super admin."""
        return self.role == UserRole.SUPER_ADMIN
    
    def soft_delete(self) -> None:
        """Mark user as soft deleted."""
        self.deleted_at = datetime.now()
    
    def restore(self) -> None:
        """Restore a soft deleted user."""
        self.deleted_at = None