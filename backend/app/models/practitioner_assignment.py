"""
Practitioner assignment model for patient-practitioner relationships.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.sessions.db import Base


class PractitionerAssignment(Base):
    """Practitioner assignment model for linking practitioners to sub-users."""
    __tablename__ = "practitioner_assignments"

    id = Column(Integer, primary_key=True, index=True)
    practitioner_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    sub_user_id = Column(
        Integer,
        ForeignKey("sub_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Optional notes about the assignment
    notes = Column(String(500), nullable=True)
    
    # Assignment status
    is_active = Column(Integer, default=1, nullable=False)  # 1=active, 0=inactive
    
    # Soft delete
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Audit timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    practitioner = relationship("User", backref="practitioner_assignments")
    sub_user = relationship("SubUser", backref="practitioner_assignments")
    
    def __repr__(self) -> str:
        return (
            f"<PractitionerAssignment("
            f"practitioner_id={self.practitioner_user_id}, "
            f"sub_user_id={self.sub_user_id}, "
            f"active={bool(self.is_active)})>"
        )
    
    def activate(self) -> None:
        """Activate the assignment."""
        self.is_active = 1
    
    def deactivate(self) -> None:
        """Deactivate the assignment."""
        self.is_active = 0
    
    def soft_delete(self) -> None:
        """Mark assignment as soft deleted."""
        self.deleted_at = datetime.now()
    
    def restore(self) -> None:
        """Restore a soft deleted assignment."""
        self.deleted_at = None
    
    @property
    def is_deleted(self) -> bool:
        """Check if assignment is soft deleted."""
        return self.deleted_at is not None
