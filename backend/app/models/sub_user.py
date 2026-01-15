"""
Sub-user model for patient-managed accounts.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.sessions.db import Base


class SubUser(Base):
    """Sub-user model for accounts managed by main patients."""
    __tablename__ = "sub_users"

    id = Column(Integer, primary_key=True, index=True)
    owner_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    email = Column(String(255), unique=True, index=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    age = Column(Integer, nullable=False)
    sex = Column(String(1), nullable=False)  # F, M, O
    ethnicity = Column(String(3), nullable=False)  # AFR, ASN, CAU, etc.
    country = Column(String(2), nullable=False)  # ISO-3166-1 Alpha-2
    province = Column(String(10), nullable=False)  # ISO-3166-2 format
    
    # Respiratory history (JSON array of RespiratoryHistory enum values)
    respiratory_history = Column(Text, nullable=True)  # JSON string
    
    # Soft delete
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Audit timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", backref="sub_users")
    
    def __repr__(self) -> str:
        return f"<SubUser(id={self.id}, email='{self.email}', owner_id={self.owner_user_id})>"
    
    @property
    def is_active(self) -> bool:
        """Check if sub-user is active (not soft deleted)."""
        return self.deleted_at is None
    
    @property
    def full_name(self) -> str:
        """Get sub-user's full name."""
        return f"{self.first_name} {self.last_name}"
    
    def soft_delete(self) -> None:
        """Mark sub-user as soft deleted."""
        self.deleted_at = datetime.now()
    
    def restore(self) -> None:
        """Restore a soft deleted sub-user."""
        self.deleted_at = None