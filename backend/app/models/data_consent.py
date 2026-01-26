"""
Data consent model.
"""
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer
from sqlalchemy.sql import func
from app.sessions.db import Base


class DataConsent(Base):
    """User data consent for training."""
    __tablename__ = "data_consent"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sub_user_id = Column(Integer, ForeignKey("sub_users.id", ondelete="CASCADE"), nullable=True)
    
    consent_for_training = Column(Boolean, nullable=False, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<DataConsent(user_id={self.user_id}, consent={self.consent_for_training})>"
