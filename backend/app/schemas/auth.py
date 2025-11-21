from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date

# Signup inputs (patient)
class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str = Field(min_length=6)
    practitioner_name: Optional[str] = None
    # frontend sends dd-mm-yyyy; accept string and convert in endpoint
    birthdate: Optional[str] = None
    ethnicity: Optional[str] = None
    sex: Optional[str] = None
    consent: bool = False

# Signup inputs (practitioner)
class PractitionerCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str = Field(min_length=6)
    practitioner_id: str
    institution: Optional[str] = None
    consent: bool = False

# Login request
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    practitioner_id: Optional[str] = None  # optional extra check for practitioners

# Response / user read
class UserRead(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    role: str
    practitioner_name: Optional[str] = None
    practitioner_id: Optional[str] = None
    institution: Optional[str] = None
    birthdate: Optional[date] = None
    ethnicity: Optional[str] = None
    sex: Optional[str] = None
    consent: bool
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    practitioner_id: Optional[str] = None
    institution: Optional[str] = None
    is_active: Optional[bool] = None

# Token response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds until expiry
