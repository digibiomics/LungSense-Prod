"""
Symptom master model.
"""
from sqlalchemy import Column, Integer, String, Text
from app.sessions.db import Base


class SymptomsMaster(Base):
    """Master list of symptoms."""
    __tablename__ = "symptoms_master"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, unique=True, nullable=False)

    def __repr__(self) -> str:
        return f"<SymptomsMaster(id={self.id}, name='{self.name}')>"
