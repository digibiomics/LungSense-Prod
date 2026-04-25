"""
Case routes for patient case submission.
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError

from app.utils.auth import AuthenticatedUser, get_current_user
from app.sessions.db import create_local_session
from app.constants.enums import ResponseStatus
from app.schemas.common import APIResponse
from app.schemas.case import CaseResponse
from app.utils.exception_handler import raise_bad_request
from app.repository.case_repo import CaseRepository
from app.models.case_symptom import CaseSymptom
from app.models.case_file import CaseFile
from app.utils.s3_utils import AWS_S3_BUCKET, AWS_REGION, s3_client
import json

router = APIRouter()


class PresignRequest(BaseModel):
    file_type: str  # "xray", "cough_audio", "breath_audio"
    content_type: str
    file_extension: str


class CaseSubmission(BaseModel):
    profile_type: str
    profile_id: int
    symptoms: List[dict]
    xray_key: Optional[str] = None
    cough_audio_key: Optional[str] = None
    breath_audio_key: Optional[str] = None
    other_symptom_text: Optional[str] = None


@router.post("/cases/presign", response_model=APIResponse)
async def get_presigned_url(
    request: PresignRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Generate presigned URL for direct S3 upload."""
    try:
        # Generate unique filename: userId_uuid.extension
        file_uuid = str(uuid.uuid4())
        filename = f"{current_user.user_id}_{file_uuid}{request.file_extension}"
        
        # Map file types to S3 folders
        folder_mapping = {
            "xray": "raw/X-ray",
            "cough_audio": "raw/Cough-sounds", 
            "breath_audio": "raw/Chest-sounds"
        }
        
        folder = folder_mapping.get(request.file_type, "raw/other")
        s3_key = f"{folder}/{current_user.user_id}/{filename}"
        
        # Generate presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': AWS_S3_BUCKET,
                'Key': s3_key,
                'ContentType': request.content_type,
                'ContentDisposition': 'inline'
            },
            ExpiresIn=3600  # 1 hour
        )
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="Presigned URL generated",
            data={
                "presigned_url": presigned_url,
                "s3_key": s3_key
            }
        )
        
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate presigned URL: {str(e)}")


@router.post("/cases", response_model=APIResponse)
async def create_case(
    case_data: CaseSubmission,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Create case with S3 keys (files already uploaded)."""
    
    # Validate symptom IDs exist
    from app.models.symptom import SymptomsMaster
    symptom_ids = [s["symptom_id"] for s in case_data.symptoms]
    existing_symptoms = db.query(SymptomsMaster.id).filter(SymptomsMaster.id.in_(symptom_ids)).all()
    existing_ids = [s.id for s in existing_symptoms]
    
    invalid_ids = [sid for sid in symptom_ids if sid not in existing_ids]
    if invalid_ids:
        raise_bad_request(f"Invalid symptom IDs: {invalid_ids}")
    
    # Determine user_id and sub_user_id
    user_id = current_user.user_id
    sub_user_id = case_data.profile_id if case_data.profile_type == "sub_user" else None
    
    # Auto-assign practitioner
    practitioner = CaseRepository.get_available_practitioner(db)
    practitioner_id = practitioner.id if practitioner else None
    
    # Create case
    case = CaseRepository.create_case(db, user_id, sub_user_id, practitioner_id)
    
    # Add symptoms
    for symptom_data in case_data.symptoms:
        # Check if this is the "Other" symptom (ID 18) and add custom text
        custom_text = None
        if symptom_data["symptom_id"] == 18 and case_data.other_symptom_text:
            custom_text = case_data.other_symptom_text
            
        case_symptom = CaseSymptom(
            case_id=case.id,
            symptom_id=symptom_data["symptom_id"],
            severity=symptom_data["severity"],
            duration_days=symptom_data["duration_days"],
            custom_text=custom_text
        )
        db.add(case_symptom)
    
    # Add file records for uploaded S3 keys
    file_mappings = [
        (case_data.xray_key, "xray"),
        (case_data.cough_audio_key, "cough_audio"),
        (case_data.breath_audio_key, "breath_audio")
    ]
    
    for s3_key, modality in file_mappings:
        if s3_key:
            # Extract file extension from S3 key
            file_extension = s3_key.split('.')[-1] if '.' in s3_key else 'unknown'
            
            case_file = CaseFile(
                case_id=case.id,
                modality=modality,
                s3_key=s3_key,
                s3_bucket=AWS_S3_BUCKET,
                file_type=file_extension,
                file_size=0,  # Unknown since uploaded directly to S3
                uploaded_by="patient"
            )
            db.add(case_file)
    
    db.commit()
    db.refresh(case)
    
    response_data = {
        "id": case.id,
        "user_id": case.user_id,
        "sub_user_id": case.sub_user_id,
        "practitioner_id": case.practitioner_id,
        "status": case.status,
        "catalog_number": case.catalog_number,  # Include catalog_number
        "created_at": case.created_at.isoformat()
    }
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Case created successfully",
        data=response_data
    )