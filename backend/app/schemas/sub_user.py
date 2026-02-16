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
    country: str = Field(..., min_length=2, description="Country name")
    province: str = Field(..., description="Province/state name")
    respiratory_history: List[RespiratoryHistory] = Field(
    ..., description="List of respiratory conditions (or NONE)"
)



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
    country: Optional[str] = Field(None, min_length=2)
    province: Optional[str]
    respiratory_history: Optional[List[RespiratoryHistory]]


class SubUserDashboardUpdateRequest(BaseModel):
    """Simplified update request for sub-user dashboard - only age, ethnicity, and sex."""
    age: Optional[int] = Field(None, gt=0)
    sex: Optional[Sex]
    ethnicity: Optional[Ethnicity]


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