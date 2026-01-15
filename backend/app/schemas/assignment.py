"""
Practitioner assignment schemas.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class AssignmentCreateRequest(BaseModel):
    """Assignment creation request schema."""
    sub_user_id: int = Field(..., description="Sub-user ID to assign")
    notes: Optional[str] = Field(None, max_length=500, description="Optional assignment notes")


class AssignmentUpdateRequest(BaseModel):
    """Assignment update request schema."""
    notes: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = Field(None, description="Assignment active status")


class AssignmentResponse(BaseModel):
    """Assignment response schema."""
    id: int
    practitioner_user_id: int
    sub_user_id: int
    notes: Optional[str]
    is_active: bool
    created_at: str
    updated_at: Optional[str]
    
    class Config:
        from_attributes = True


class AssignmentListResponse(BaseModel):
    """Assignment list response schema."""
    assignments: list[AssignmentResponse]
    total: int
