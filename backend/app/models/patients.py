from __future__ import annotations

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.sessions.db import Base


class PatientProfile(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    country = Column(String(100), nullable=True)
    province = Column(String(100), nullable=True)
    ethnicity = Column(String(100), nullable=True)

    user = relationship("User", backref="patient_profile")

    def __repr__(self) -> str:  # pragma: no cover - trivial
        return f"<Patient user={self.user_id}>"
