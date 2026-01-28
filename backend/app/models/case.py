"""
Case model for patient submissions.
"""
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.sessions.db import Base


class Case(Base):
    """Patient case model."""
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    catalog_number = Column(String(20), unique=True, nullable=False, index=True)  # Privacy: LS4A7B9C2D
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sub_user_id = Column(Integer, ForeignKey("sub_users.id", ondelete="CASCADE"), nullable=True, index=True)
    practitioner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    status = Column(String(20), nullable=False, default="draft")  # draft/submitted/reviewed/finalized
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", foreign_keys=[user_id], backref="cases_as_owner")
    sub_user = relationship("SubUser", backref="cases")
    practitioner = relationship("User", foreign_keys=[practitioner_id], backref="cases_as_practitioner")

    def __repr__(self) -> str:
        return f"<Case(id={self.id}, catalog={self.catalog_number}, status='{self.status}')>"
