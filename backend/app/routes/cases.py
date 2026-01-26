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
    """Create case with symptoms and files (at least one file required)."""
    
    # Validate files
    if xray:
        validate_xray_file(xray)
    if cough_audio:
        validate_audio_file(cough_audio, "Cough audio")
    if breath_audio:
        validate_audio_file(breath_audio, "Breath audio")
    
    # Validate at least one file
    if not xray and not cough_audio and not breath_audio:
        raise_bad_request("At least one file (X-ray, Cough audio, or Chest audio) is required")
    
    # Parse symptoms
    try:
        symptoms_data = json.loads(symptoms)
    except:
        raise_bad_request("Invalid symptoms format")
    
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
    
    # Upload files
    uploaded_files = []
    
    if xray:
        file_id = str(uuid.uuid4())
        file_ext = xray.filename.split(".")[-1]
        s3_key = f"xray/{case.id}/{file_id}.{file_ext}"
        
        file_content = await xray.read()
        validate_file_size(file_content, MAX_XRAY_SIZE, "X-ray")
        if upload_file_to_s3(file_content, s3_key, xray.content_type):
            case_file = CaseFile(
                case_id=case.id,
                modality="xray",
                file_type=file_ext,
                s3_bucket=AWS_S3_BUCKET,
                s3_key=s3_key,
                file_size=len(file_content),
                uploaded_by="patient"
            )
            db.add(case_file)
            uploaded_files.append("xray")
    
    if cough_audio:
        file_id = str(uuid.uuid4())
        file_ext = cough_audio.filename.split(".")[-1]
        s3_key = f"audio/{case.id}/{file_id}.{file_ext}"
        
        file_content = await cough_audio.read()
        validate_file_size(file_content, MAX_AUDIO_SIZE, "Cough audio")
        if upload_file_to_s3(file_content, s3_key, cough_audio.content_type):
            case_file = CaseFile(
                case_id=case.id,
                modality="cough_audio",
                file_type=file_ext,
                s3_bucket=AWS_S3_BUCKET,
                s3_key=s3_key,
                file_size=len(file_content),
                uploaded_by="patient"
            )
            db.add(case_file)
            uploaded_files.append("cough_audio")
    
    if breath_audio:
        file_id = str(uuid.uuid4())
        file_ext = breath_audio.filename.split(".")[-1]
        s3_key = f"chestSounds/{case.id}/{file_id}.{file_ext}"
        
        file_content = await breath_audio.read()
        validate_file_size(file_content, MAX_AUDIO_SIZE, "Breath audio")
        if upload_file_to_s3(file_content, s3_key, breath_audio.content_type):
            case_file = CaseFile(
                case_id=case.id,
                modality="breath_audio",
                file_type=file_ext,
                s3_bucket=AWS_S3_BUCKET,
                s3_key=s3_key,
                file_size=len(file_content),
                uploaded_by="patient"
            )
            db.add(case_file)
            uploaded_files.append("breath_audio")
    
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
        message=f"Case created successfully with {len(uploaded_files)} file(s)",
        data=response_data.dict(),
        id=str(case.id)
    )
