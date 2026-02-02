"""
Data Admin Dashboard schemas for comprehensive ML training data management.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class DashboardSummary(BaseModel):
    """Top-level dashboard summary for training readiness."""
    total_cases: int
    ml_ready_cases: int
    training_readiness_percentage: float
    label_status: Dict[str, int]
    modality_breakdown: Dict[str, int]


class DatasetRow(BaseModel):
    """Single row in the dataset explorer table."""
    # Identification
    catalog_number: str
    model_types: List[str]
    files_present: bool
    file_count: int
    
    # Clinical Context (Anonymized)
    practitioner_id: Optional[int]
    symptoms: List[str]
    primary_diagnosis: Optional[str]
    differential_diagnoses: Optional[str]
    severity: Optional[str]
    confidence_score: Optional[float]
    
    # Review Metadata
    review_status: str
    training_ready: bool
    review_date: Optional[str]
    notes_present: bool
    
    # ML Utility Flags
    label_complete: bool
    eligible_for_training: bool
    exclusion_reason: Optional[str]
    
    # Metadata
    created_at: str
    case_status: str


class PaginationInfo(BaseModel):
    """Pagination information for dataset explorer."""
    page: int
    limit: int
    total_count: int
    total_pages: int


class DatasetExplorerResponse(BaseModel):
    """Dataset explorer table response."""
    rows: List[DatasetRow]
    pagination: PaginationInfo
    filters_applied: Dict[str, Any]


class DiagnosisDistribution(BaseModel):
    """Diagnosis distribution for insights."""
    diagnosis: str
    count: int


class SeverityDistribution(BaseModel):
    """Severity distribution for insights."""
    severity: str
    count: int


class ConfidenceHistogram(BaseModel):
    """Confidence score histogram bin."""
    bin: str
    count: int


class PractitionerPerformance(BaseModel):
    """Practitioner performance metrics."""
    practitioner_id: int
    practitioner_name: str
    cases_reviewed: int
    avg_confidence: float


class DataQualityFlags(BaseModel):
    """Data quality flags for missing information."""
    missing_confidence: int
    missing_differential_dx: int
    missing_severity: int


class LabelInsights(BaseModel):
    """Label distribution and bias insights."""
    diagnosis_distribution: List[DiagnosisDistribution]
    severity_distribution: List[SeverityDistribution]
    confidence_histogram: List[ConfidenceHistogram]
    practitioner_performance: List[PractitionerPerformance]
    data_quality_flags: DataQualityFlags


class FileMetadata(BaseModel):
    """File metadata for export."""
    modality: str
    file_type: str
    s3_bucket: str
    s3_key: str
    file_size: Optional[int]
    duration_seconds: Optional[float]


class TrainingSample(BaseModel):
    """Single training sample for export."""
    catalog_number: str
    diagnosis: str
    differential_diagnoses: Optional[str]
    severity: Optional[str]
    confidence_score: Optional[float]
    clinical_notes: Optional[str]
    files: Optional[List[FileMetadata]]


class DatasetMetadata(BaseModel):
    """Dataset export metadata."""
    name: str
    created_at: str
    created_by: str
    filters: Dict[str, Any]
    total_samples: int


class TrainingBatchExport(BaseModel):
    """Training batch export response."""
    dataset_metadata: DatasetMetadata
    samples: List[TrainingSample]


# Filter schemas
class DatasetFilters(BaseModel):
    """Available filters for dataset explorer."""
    model_type: Optional[str] = None
    diagnosis: Optional[str] = None
    severity: Optional[str] = None
    confidence_min: Optional[float] = None
    training_ready_only: bool = False
    practitioner_id: Optional[int] = None


class ExportFilters(BaseModel):
    """Filters for training batch export."""
    model_type: Optional[str] = None
    diagnosis_filter: Optional[str] = None
    confidence_min: Optional[float] = None
    export_format: str = "json"
    include_files: bool = True