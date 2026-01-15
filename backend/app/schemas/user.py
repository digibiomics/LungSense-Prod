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
    country: str = Field(..., min_length=2, max_length=2, description="ISO-3166-1 Alpha-2 country code")
    province: str = Field(..., description="ISO-3166-2 province/state code")
    respiratory_history: List[RespiratoryHistory] = Field(
        ..., description="List of respiratory conditions (or NONE)"
    )

    
    @validator('country')
    def validate_country(cls, v):
        """Validate country code format."""
        if not re.match(r'^[A-Z]{2}$', v.upper()):
            raise ValueError('Country must be a valid ISO-3166-1 Alpha-2 code')
        return v.upper()
    
    @validator('province')
    def validate_province(cls, v, values):
        """Validate province code format (country-XX)."""
        if 'country' in values and not v.upper().startswith(values['country'] + '-'):
            raise ValueError('Province must match country prefix (e.g., US-CA)')
        if not re.match(r'^[A-Z]{2}-[A-Z0-9]{1,3}$', v.upper()):
            raise ValueError('Province must be in ISO-3166-2 format (e.g., US-CA)')
        return v.upper()


class PractitionerSignupRequest(BaseUserSchema):
    """Practitioner signup request schema."""
    password: str = Field(..., min_length=8, max_length=64, description="Password")
    practitioner_id: str = Field(
        ..., min_length=6, max_length=20,
        description="Unique practitioner identifier (6-20 alphanumeric)"
    )
    institution: str = Field(..., min_length=3, max_length=100, description="Institution name")
    institution_location_country: str = Field(
        ..., min_length=2, max_length=2,
        description="Institution country (ISO-3166-1 Alpha-2)"
    )
    institution_location_province: str = Field(
        ..., description="Institution province (ISO-3166-2 format)"
    )
    
    @validator('practitioner_id')
    def validate_practitioner_id(cls, v):
        """Validate practitioner ID format."""
        if not re.match(r'^[A-Za-z0-9]{6,20}$', v):
            raise ValueError('Practitioner ID must be 6-20 alphanumeric characters')
        return v
    
    @validator('institution_location_country')
    def validate_country(cls, v):
        """Validate country code format."""
        if not re.match(r'^[A-Z]{2}$', v.upper()):
            raise ValueError('Country must be a valid ISO-3166-1 Alpha-2 code')
        return v.upper()
    
    @validator('institution_location_province')
    def validate_province(cls, v, values):
        """Validate province code format."""
        if 'institution_location_country' in values:
            country = values['institution_location_country']
            if not v.upper().startswith(country + '-'):
                raise ValueError('Province must match country prefix')
        if not re.match(r'^[A-Z]{2}-[A-Z0-9]{1,3}$', v.upper()):
            raise ValueError('Province must be in ISO-3166-2 format')
        return v.upper()


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
    country: Optional[str] = Field(None, min_length=2, max_length=2)
    province: Optional[str]
    respiratory_history: Optional[List[RespiratoryHistory]]
    
    # Practitioner fields
    institution: Optional[str] = Field(None, min_length=3, max_length=100)
    institution_location_country: Optional[str] = Field(None, min_length=2, max_length=2)
    institution_location_province: Optional[str]


class UserListResponse(BaseModel):
    """User list response schema."""
    users: List[UserResponse]
    total: int
    page: int
    per_page: int
