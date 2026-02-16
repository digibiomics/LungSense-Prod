from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from app.constants.enums import Ethnicity, RespiratoryHistory, Sex


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleCallbackRequest(BaseModel):
    code: str = Field(..., description="Authorization code from Google")
    role: str = Field(..., description="User role: patient or practitioner")


class SubUserData(BaseModel):
    """Sub-user data for profile completion."""
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    age: int = Field(..., gt=0)
    sex: Sex
    ethnicity: Ethnicity
    country: str = Field(..., min_length=2, description="Country name")
    province: str
    respiratory_history: List[RespiratoryHistory]


class CompleteProfileRequest(BaseModel):
    """Complete profile after Google OAuth (patients/practitioners)."""
    # Demographics
    age: int = Field(..., gt=0)
    sex: Sex
    ethnicity: Ethnicity
    country: str = Field(..., min_length=2, description="Country name")
    province: str
    respiratory_history: List[RespiratoryHistory]
    
    # Practitioner-specific (optional)
    practitioner_id: Optional[str] = Field(None, min_length=6, max_length=20)
    institution: Optional[str] = Field(None, min_length=3, max_length=100)
    institution_location_country: Optional[str] = Field(None, min_length=2, description="Country name")
    institution_location_province: Optional[str] = None
    
    # Sub-users (optional)
    sub_users: Optional[List[SubUserData]] = Field(default=[])


class RefreshTokenRequest(BaseModel):
    refresh_token: str
