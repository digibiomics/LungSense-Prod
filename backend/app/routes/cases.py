"""
Case routes for patient case submission.
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.utils.auth import AuthenticatedUser, get_current_user
from app.sessions.db import create_local_session
from app.constants.enums import ResponseStatus
from app.schemas.common import APIResponse
from app.schemas.case import CaseResponse
from app.utils.exception_handler import raise_bad_request
from app.repository.case_repo import CaseRepository
from app.models.case_symptom import CaseSymptom
from app.models.case_file import CaseFile
from app.utils.s3_utils import upload_file_to_s3, AWS_S3_BUCKET
from app.utils.file_validation import (
    validate_xray_file,
    validate_audio_file,
    validate_file_size,
    MAX_XRAY_SIZE,
    MAX_AUDIO_SIZE
)
import json

router = APIRouter()


@router.post("/cases", response_model=APIResponse)
async def create_case(
    profile_type: str = Form(...),
    profile_id: int = Form(...),
    symptoms: str = Form(...),  # JSON string
    xray: Optional[UploadFile] = File(None),
    cough_audio: Optional[UploadFile] = File(None),
    breath_audio: Optional[UploadFile] = File(None),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Create case with symptoms and files."""
    
    try:
        # Parse symptoms
        symptoms_data = json.loads(symptoms)
    except:
        raise_bad_request("Invalid symptoms format")
    
    # Validate symptom IDs exist
    from app.models.symptom import SymptomsMaster
    symptom_ids = [s["symptom_id"] for s in symptoms_data]
    existing_symptoms = db.query(SymptomsMaster.id).filter(SymptomsMaster.id.in_(symptom_ids)).all()
    existing_ids = [s.id for s in existing_symptoms]
    
    invalid_ids = [sid for sid in symptom_ids if sid not in existing_ids]
    if invalid_ids:
        raise_bad_request(f"Invalid symptom IDs: {invalid_ids}")
    
    # Determine user_id and sub_user_id
    user_id = current_user.user_id
    sub_user_id = profile_id if profile_type == "sub_user" else None
    
    # Auto-assign practitioner
    practitioner = CaseRepository.get_available_practitioner(db)
    practitioner_id = practitioner.id if practitioner else None
    
    # Create case
    case = CaseRepository.create_case(db, user_id, sub_user_id, practitioner_id)
    
    # Add symptoms
    for symptom_data in symptoms_data:
        case_symptom = CaseSymptom(
            case_id=case.id,
            symptom_id=symptom_data["symptom_id"],
            severity=symptom_data["severity"],
            duration_days=symptom_data["duration_days"]
        )
        db.add(case_symptom)
    
    # Process file uploads
    files_to_upload = [
        (xray, "xray"),
        (cough_audio, "cough_audio"),
        (breath_audio, "breath_audio")
    ]
    
    for file, modality in files_to_upload:
        if file and file.filename:
            # Validate file
            if modality == "xray":
                validate_xray_file(file)
            else:
                validate_audio_file(file)
            
            # Read file content
            file_content = await file.read()
            
            # Validate file size
            if modality == "xray":
                validate_file_size(file_content, MAX_XRAY_SIZE, modality)
            else:
                validate_file_size(file_content, MAX_AUDIO_SIZE, modality)
            
            # Generate S3 key with existing folder structure
            file_extension = file.filename.split('.')[-1]
            
            # Map modality to existing S3 folders
            folder_mapping = {
                "xray": "X ray",
                "cough_audio": "Cough sounds", 
                "breath_audio": "Chest sounds"
            }
            
            s3_folder = folder_mapping.get(modality, modality)
            s3_key = f"{s3_folder}/{case.catalog_number}.{file_extension}"
            
            # Upload to S3
            if upload_file_to_s3(file_content, s3_key, file.content_type):
                # Save file record
                case_file = CaseFile(
                    case_id=case.id,
                    modality=modality,
                    s3_key=s3_key,
                    s3_bucket=AWS_S3_BUCKET,
                    file_type=file_extension,
                    file_size=len(file_content),
                    uploaded_by="patient"
                )
                db.add(case_file)
            else:
                raise_bad_request(f"Failed to upload {modality} file")
    
    db.commit()
    db.refresh(case)
    
    response_data = CaseResponse(
        id=case.id,
        user_id=case.user_id,
        sub_user_id=case.sub_user_id,
        practitioner_id=case.practitioner_id,
        status=case.status,
        created_at=case.created_at.isoformat()
    )
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Case created successfully",
        data=response_data.dict(),
        id=str(case.id)
    )
