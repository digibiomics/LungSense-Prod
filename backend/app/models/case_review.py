"""
Case review model for practitioner diagnosis.
"""
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.sessions.db import Base


class CaseReview(Base):
    """Practitioner case review and diagnosis."""
    __tablename__ = "case_reviews"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    practitioner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    primary_diagnosis = Column(Text, nullable=True)
    differential_diagnoses = Column(Text, nullable=True)
    
    severity = Column(Text, nullable=True)  # mild/moderate/severe
    confidence_score = Column(Float, nullable=True)
    
    clinical_notes = Column(Text, nullable=True)
    
    is_final = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    case = relationship("Case", backref="reviews")
    practitioner = relationship("User", backref="reviews")

    def __repr__(self) -> str:
        return f"<CaseReview(id={self.id}, case_id={self.case_id}, is_final={self.is_final})>"
