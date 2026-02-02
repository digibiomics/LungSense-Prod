"""
Practitioner routes for case management and reviews.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_

from app.utils.auth import AuthenticatedUser, get_current_user
from app.sessions.db import create_local_session
from app.constants.enums import ResponseStatus
from app.schemas.common import APIResponse
from app.schemas.case import CaseDetailResponse, CaseListResponse
from app.schemas.practitioner import CaseReviewRequest, CaseReviewResponse
from app.models.case import Case
from app.models.case_review import CaseReview
from app.models.case_symptom import CaseSymptom
from app.models.case_file import CaseFile
from app.models.user import User
from app.models.sub_user import SubUser
from app.models.symptom import SymptomsMaster
from app.utils.s3_utils import generate_presigned_url

router = APIRouter()


@router.get("/practitioner/cases", response_model=APIResponse)
async def get_practitioner_cases(
    status: Optional[str] = None,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Get cases assigned to current practitioner."""
    
    print(f"Current user ID: {current_user.user_id}, Role: {current_user.role}")
    
    # Verify user is practitioner
    user = db.query(User).filter(User.id == current_user.user_id).first()
    if not user or user.role != "practitioner":
        raise HTTPException(status_code=403, detail="Access denied")
    
    print(f"Querying cases for practitioner_id: {current_user.user_id}")
    
    # Build query
    query = db.query(Case).options(
        joinedload(Case.owner),
        joinedload(Case.sub_user),
        joinedload(Case.reviews)
    ).filter(Case.practitioner_id == current_user.user_id)
    
    if status:
        query = query.filter(Case.status == status)
    
    cases = query.order_by(Case.created_at.desc()).all()
    print(f"Found {len(cases)} cases")
    
    # Format response
    case_list = []
    for case in cases:
        patient_name = case.sub_user.full_name if case.sub_user else case.owner.full_name
        patient_email = case.sub_user.email if case.sub_user else case.owner.email
        
        # Get latest review
        latest_review = None
        if case.reviews:
            latest_review = max(case.reviews, key=lambda r: r.created_at)
        
        case_data = CaseListResponse(
            id=case.id,
            patient_name=patient_name,
            catalog_number=case.catalog_number,
            status=case.status,
            created_at=case.created_at.isoformat(),
            last_review_date=latest_review.created_at.isoformat() if latest_review else None,
            primary_diagnosis=latest_review.primary_diagnosis if latest_review else None
        )
        case_list.append(case_data.dict())
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=f"Found {len(case_list)} cases",
        data={"cases": case_list}
    )


@router.get("/practitioner/cases/{case_id}", response_model=APIResponse)
async def get_case_details(
    case_id: int,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Get detailed case information for review."""
    
    # Verify user is practitioner
    user = db.query(User).filter(User.id == current_user.user_id).first()
    if not user or user.role != "practitioner":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get case with all related data
    case = db.query(Case).options(
        joinedload(Case.owner),
        joinedload(Case.sub_user),
        joinedload(Case.reviews)
    ).filter(
        and_(Case.id == case_id, Case.practitioner_id == current_user.user_id)
    ).first()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Get symptoms
    symptoms = db.query(CaseSymptom, SymptomsMaster).join(
        SymptomsMaster, CaseSymptom.symptom_id == SymptomsMaster.id
    ).filter(CaseSymptom.case_id == case_id).all()
    
    # Get files with presigned URLs
    files = db.query(CaseFile).filter(CaseFile.case_id == case_id).all()
    file_data = []
    for file in files:
        presigned_url = generate_presigned_url(file.s3_key)
        file_data.append({
            "id": file.id,
            "modality": file.modality,
            "file_type": file.file_type,
            "file_size": file.file_size,
            "presigned_url": presigned_url,
            "uploaded_at": file.created_at.isoformat()
        })
    
    # Format patient info with complete details
    if case.sub_user:
        patient_info = {
            "name": case.sub_user.full_name,
            "email": case.sub_user.email,
            "age": case.sub_user.age,
            "sex": case.sub_user.sex,
            "ethnicity": case.sub_user.ethnicity,
            "country": case.sub_user.country,
            "province": case.sub_user.province,
            "respiratory_history": case.sub_user.respiratory_history
        }
    else:
        patient_info = {
            "name": case.owner.full_name,
            "email": case.owner.email,
            "age": case.owner.age,
            "sex": case.owner.sex,
            "ethnicity": case.owner.ethnicity,
            "country": case.owner.country,
            "province": case.owner.province,
            "respiratory_history": case.owner.respiratory_history
        }
    
    # Format symptoms
    symptom_data = []
    for case_symptom, symptom in symptoms:
        symptom_data.append({
            "name": symptom.name,
            "severity": case_symptom.severity,
            "duration_days": case_symptom.duration_days
        })
    
    # Format reviews
    review_data = []
    for review in case.reviews:
        review_data.append({
            "id": review.id,
            "primary_diagnosis": review.primary_diagnosis,
            "differential_diagnoses": review.differential_diagnoses,
            "severity": review.severity,
            "confidence_score": review.confidence_score,
            "clinical_notes": review.clinical_notes,
            "is_final": review.is_final,
            "created_at": review.created_at.isoformat()
        })
    
    case_detail = CaseDetailResponse(
        id=case.id,
        status=case.status,
        created_at=case.created_at.isoformat(),
        patient_id=case.user_id if not case.sub_user else None,
        sub_user_id=case.sub_user_id,
        patient=patient_info,
        symptoms=symptom_data,
        files=file_data,
        reviews=review_data
    )
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Case details retrieved",
        data=case_detail.dict()
    )


@router.post("/practitioner/cases/{case_id}/review", response_model=APIResponse)
async def submit_case_review(
    case_id: int,
    review_data: CaseReviewRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Submit practitioner review for a case."""
    
    # Verify user is practitioner
    user = db.query(User).filter(User.id == current_user.user_id).first()
    if not user or user.role != "practitioner":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify case exists and is assigned to practitioner
    case = db.query(Case).filter(
        and_(Case.id == case_id, Case.practitioner_id == current_user.user_id)
    ).first()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Check if a draft review already exists for this case by this practitioner
    existing_review = db.query(CaseReview).filter(
        and_(
            CaseReview.case_id == case_id,
            CaseReview.practitioner_id == current_user.user_id,
            CaseReview.is_final == False
        )
    ).first()
    
    if existing_review:
        # Update existing draft review
        existing_review.primary_diagnosis = review_data.primary_diagnosis
        existing_review.differential_diagnoses = review_data.differential_diagnoses
        existing_review.severity = review_data.severity
        existing_review.confidence_score = review_data.confidence_score
        existing_review.clinical_notes = review_data.clinical_notes
        existing_review.is_final = review_data.is_final
        review = existing_review
    else:
        # Create new review
        review = CaseReview(
            case_id=case_id,
            practitioner_id=current_user.user_id,
            primary_diagnosis=review_data.primary_diagnosis,
            differential_diagnoses=review_data.differential_diagnoses,
            severity=review_data.severity,
            confidence_score=review_data.confidence_score,
            clinical_notes=review_data.clinical_notes,
            is_final=review_data.is_final
        )
        db.add(review)
    
    # Update case status
    if review_data.is_final:
        case.status = "reviewed"
    
    db.commit()
    db.refresh(review)
    
    response_data = CaseReviewResponse(
        id=review.id,
        case_id=review.case_id,
        primary_diagnosis=review.primary_diagnosis,
        severity=review.severity,
        is_final=review.is_final,
        created_at=review.created_at.isoformat()
    )
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Review submitted successfully",
        data=response_data.dict(),
        id=str(review.id)
    )


@router.get("/practitioner/dashboard/stats", response_model=APIResponse)
async def get_practitioner_stats(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Get practitioner dashboard statistics."""
    
    # Verify user is practitioner
    user = db.query(User).filter(User.id == current_user.user_id).first()
    if not user or user.role != "practitioner":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get case counts
    total_cases = db.query(Case).filter(Case.practitioner_id == current_user.user_id).count()
    pending_cases = db.query(Case).filter(
        and_(Case.practitioner_id == current_user.user_id, Case.status == "submitted")
    ).count()
    reviewed_cases = db.query(Case).filter(
        and_(Case.practitioner_id == current_user.user_id, Case.status == "reviewed")
    ).count()
    
    stats = {
        "total_cases": total_cases,
        "pending_review": pending_cases,
        "reviewed_cases": reviewed_cases,
        "completion_rate": round((reviewed_cases / total_cases * 100) if total_cases > 0 else 0, 1)
    }
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Dashboard stats retrieved",
        data=stats
    )