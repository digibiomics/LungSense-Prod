"""
Case symptom model.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.sessions.db import Base


class CaseSymptom(Base):
    """Case symptoms with severity and duration."""
    __tablename__ = "case_symptoms"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    symptom_id = Column(Integer, ForeignKey("symptoms_master.id"), nullable=False)
    
    severity = Column(Integer, nullable=False)  # 1-5
    duration_days = Column(Integer, nullable=False)
    custom_text = Column(Text, nullable=True)  # For "Other" symptom descriptions
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    case = relationship("Case", backref="symptoms")
    symptom = relationship("SymptomsMaster")

    def __repr__(self) -> str:
        return f"<CaseSymptom(case_id={self.case_id}, symptom_id={self.symptom_id}, severity={self.severity})>"
