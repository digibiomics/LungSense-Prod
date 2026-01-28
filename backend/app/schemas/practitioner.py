"""
Practitioner-specific schemas for case reviews and management.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CaseReviewRequest(BaseModel):
    """Schema for practitioner case review submission."""
    primary_diagnosis: Optional[str] = Field(None, description="Primary diagnosis")
    differential_diagnoses: Optional[str] = Field(None, description="Alternative diagnoses")
    severity: Optional[str] = Field(None, description="Severity level (mild/moderate/severe)")
    confidence_score: Optional[float] = Field(None, ge=0, le=1, description="Confidence score 0-1")
    clinical_notes: Optional[str] = Field(None, description="Clinical notes and observations")
    is_final: bool = Field(False, description="Whether this is the final review")


class CaseReviewResponse(BaseModel):
    """Schema for case review response."""
    id: int
    case_id: int
    primary_diagnosis: Optional[str]
    severity: Optional[str]
    is_final: bool
    created_at: str


class CaseListResponse(BaseModel):
    """Schema for case list in practitioner dashboard."""
    id: int
    patient_name: str
    patient_email: str
    status: str
    created_at: str
    last_review_date: Optional[str]
    primary_diagnosis: Optional[str]


class CaseDetailResponse(BaseModel):
    """Schema for detailed case information."""
    id: int
    status: str
    created_at: str
    patient: Dict[str, Any]
    symptoms: List[Dict[str, Any]]
    files: List[Dict[str, Any]]
    reviews: List[Dict[str, Any]]