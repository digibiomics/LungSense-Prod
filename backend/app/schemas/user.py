"""
User schemas for requests and responses.
"""
from __future__ import annotations

import re
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, validator

from  app.constants.enums import Ethnicity, RespiratoryHistory, Sex, UserRole


class BaseUserSchema(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr = Field(..., description="User email address")
    first_name: str = Field(..., min_length=2, max_length=50, description="First name")
    last_name: str = Field(..., min_length=2, max_length=50, description="Last name")


class PatientSignupRequest(BaseUserSchema):
    """Patient signup request schema."""
    password: str = Field(..., min_length=8, max_length=64, description="Password")
    age: int = Field(..., gt=18, description="Age must be greater than 18")
    sex: Sex = Field(..., description="Sex (F/M/O)")
    ethnicity: Ethnicity = Field(..., description="Ethnicity code")
    country: str = Field(..., min_length=2, description="Country name")
    province: str = Field(..., description="Province/state name")
    respiratory_history: List[RespiratoryHistory] = Field(
        ..., description="List of respiratory conditions (or NONE)"
    )


class PractitionerSignupRequest(BaseUserSchema):
    """Practitioner signup request schema."""
    password: str = Field(..., min_length=8, max_length=64, description="Password")
    practitioner_id: str = Field(
        ..., min_length=6, max_length=20,
        description="Unique practitioner identifier (6-20 alphanumeric)"
    )
    institution: str = Field(..., min_length=3, max_length=100, description="Institution name")
    institution_location_country: str = Field(
        ..., min_length=2,
        description="Institution country name"
    )
    institution_location_province: str = Field(
        ..., description="Institution province/state name"
    )
    
    @validator('practitioner_id')
    def validate_practitioner_id(cls, v):
        """Validate practitioner ID format."""
        if not re.match(r'^[A-Za-z0-9]{6,20}$', v):
            raise ValueError('Practitioner ID must be 6-20 alphanumeric characters')
        return v


class AdminUserCreateRequest(BaseUserSchema):
    """Admin user creation request schema."""
    password: str = Field(..., min_length=8, max_length=64, description="Password")
    role: UserRole = Field(..., description="User role")


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    created_at: str
    updated_at: Optional[str]
    
    # Patient fields (optional)
    age: Optional[int]
    sex: Optional[str]
    ethnicity: Optional[str]
    country: Optional[str]
    province: Optional[str]
    respiratory_history: Optional[List[str]]
    
    # Practitioner fields (optional)
    practitioner_id: Optional[str]
    institution: Optional[str]
    institution_location_country: Optional[str]
    institution_location_province: Optional[str]
    
    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    """User update request schema."""
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    age: Optional[int] = Field(None, gt=18)
    sex: Optional[Sex]
    ethnicity: Optional[Ethnicity]
    country: Optional[str] = Field(None, min_length=2)
    province: Optional[str]
    respiratory_history: Optional[List[RespiratoryHistory]]
    
    # Practitioner fields
    institution: Optional[str] = Field(None, min_length=3, max_length=100)
    institution_location_country: Optional[str] = Field(None, min_length=2)
    institution_location_province: Optional[str]


class PatientDashboardUpdateRequest(BaseModel):
    """Simplified update request for patient dashboard - only age, ethnicity, sex, and respiratory_history."""
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    age: Optional[int] = Field(None, gt=18)
    sex: Optional[Sex]
    ethnicity: Optional[Ethnicity]
    respiratory_history: Optional[List[RespiratoryHistory]]


class UserListResponse(BaseModel):
    """User list response schema."""
    users: List[UserResponse]
    total: int
    page: int
    per_page: int
