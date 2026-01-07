from __future__ import annotations

from pydantic import BaseModel, EmailStr
from typing import Optional


class PatientSignupRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    country: Optional[str] = None
    province: Optional[str] = None
    ethnicity: Optional[str] = None


class PatientResponse(BaseModel):
    id: int
    user_id: int
    country: Optional[str] = None
    province: Optional[str] = None
    ethnicity: Optional[str] = None

    class Config:
        from_attributes = True
