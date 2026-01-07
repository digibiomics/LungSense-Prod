from __future__ import annotations

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.sessions.db import Base


class PractitionerProfile(Base):
    __tablename__ = "practitioners"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    practitioner_id = Column(String(100), nullable=False, unique=True)
    institution = Column(String(255), nullable=True)
    institution_location = Column(String(255), nullable=True)

    user = relationship("User", backref="practitioner_profile")

    def __repr__(self) -> str:  # pragma: no cover - trivial
        return f"<Practitioner {self.practitioner_id} user={self.user_id}>"
