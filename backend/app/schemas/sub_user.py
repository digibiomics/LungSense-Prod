"""
Sub-user schemas for requests and responses.
"""
from __future__ import annotations

import re
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, validator

from  app.constants.enums import Ethnicity, RespiratoryHistory, Sex


class SubUserBase(BaseModel):
    """Base sub-user schema."""
    email: EmailStr = Field(..., description="Sub-user email address")
    first_name: str = Field(..., min_length=2, max_length=50, description="First name")
    last_name: str = Field(..., min_length=2, max_length=50, description="Last name")
    age: int = Field(..., gt=0, description="Age")
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


class SubUserCreateRequest(SubUserBase):
    """Sub-user creation request schema."""
    pass


class SubUserUpdateRequest(BaseModel):
    """Sub-user update request schema."""
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    age: Optional[int] = Field(None, gt=0)
    sex: Optional[Sex]
    ethnicity: Optional[Ethnicity]
    country: Optional[str] = Field(None, min_length=2, max_length=2)
    province: Optional[str]
    respiratory_history: Optional[List[RespiratoryHistory]]


class SubUserResponse(BaseModel):
    """Sub-user response schema."""
    id: int
    owner_user_id: int
    email: str
    first_name: str
    last_name: str
    age: int
    sex: str
    ethnicity: str
    country: str
    province: str
    respiratory_history: Optional[List[str]]
    created_at: str
    updated_at: Optional[str]
    
    class Config:
        from_attributes = True