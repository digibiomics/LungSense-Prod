"""
Case file model for X-ray and audio files.
"""
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.sessions.db import Base


class CaseFile(Base):
    """Case file metadata (X-ray, audio)."""
    __tablename__ = "case_files"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    
    modality = Column(String(20), nullable=False)  # xray/cough_audio/breath_audio
    file_type = Column(String(10), nullable=False)  # jpg/png/pdf/wav/mp3
    
    s3_bucket = Column(Text, nullable=False)
    s3_key = Column(Text, nullable=False)
    
    file_size = Column(BigInteger, nullable=True)
    duration_seconds = Column(Float, nullable=True)  # NULL for xray
    
    uploaded_by = Column(String(10), nullable=False)  # patient/practitioner
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    case = relationship("Case", backref="files")

    def __repr__(self) -> str:
        return f"<CaseFile(id={self.id}, case_id={self.case_id}, modality='{self.modality}')>"
