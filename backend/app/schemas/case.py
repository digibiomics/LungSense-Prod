"""
Case schemas for requests and responses.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class SymptomInput(BaseModel):
    """Symptom input with severity and duration."""
    symptom_id: int
    severity: int = Field(..., ge=1, le=5, description="Severity 1-5")
    duration_days: int = Field(..., ge=0, description="Duration in days")


class CaseCreateRequest(BaseModel):
    """Case creation request."""
    profile_type: str = Field(..., description="user or sub_user")
    profile_id: int
    symptoms: List[SymptomInput]


class CaseFileResponse(BaseModel):
    """Case file response."""
    id: int
    modality: str
    file_type: str
    file_size: Optional[int]
    duration_seconds: Optional[float]
    created_at: str
    
    class Config:
        from_attributes = True


class CaseResponse(BaseModel):
    """Case response."""
    id: int
    user_id: int
    sub_user_id: Optional[int]
    practitioner_id: Optional[int]
    status: str
    created_at: str
    
    class Config:
        from_attributes = True


class CaseListResponse(BaseModel):
    """Schema for case list in practitioner dashboard."""
    id: int
    patient_name: str
    catalog_number: str
    status: str
    created_at: str
    last_review_date: Optional[str]
    primary_diagnosis: Optional[str]


class CaseDetailResponse(BaseModel):
    """Schema for detailed case information."""
    id: int
    status: str
    created_at: str
    patient_id: Optional[int] = None
    sub_user_id: Optional[int] = None
    patient: dict
    symptoms: List[dict]
    files: List[dict]
    reviews: List[dict]
