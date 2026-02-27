"""
Admin routes for system administration and data management.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, case, distinct
from datetime import datetime

from app.utils.auth import AuthenticatedUser, get_current_user
from app.sessions.db import create_local_session
from app.constants.enums import ResponseStatus, UserRole
from app.schemas.common import APIResponse
from app.models.user import User
from app.models.case import Case
from app.models.case_file import CaseFile
from app.models.case_review import CaseReview
from app.models.case_symptom import CaseSymptom
from app.models.symptom import SymptomsMaster

router = APIRouter()


def require_admin_role(allowed_roles: List[UserRole]):
    """Decorator to check admin roles."""
    def check_role(current_user: AuthenticatedUser = Depends(get_current_user)):
        user_role_str = current_user.role if isinstance(current_user.role, str) else current_user.role.value
        allowed_role_strs = [role.value if hasattr(role, 'value') else role for role in allowed_roles]
        if user_role_str not in allowed_role_strs:
            raise HTTPException(status_code=403, detail="Insufficient privileges")
        return current_user
    return check_role


# 1️ TOP SUMMARY PANEL
@router.get("/admin/dashboard/summary", response_model=APIResponse)
async def get_dashboard_summary(
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.DATA_ADMIN, UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Get top-level dashboard summary for training readiness."""
    
    # Total cases
    total_cases = db.query(Case).count()
    
    # ML-ready cases (final reviews with files)
    ml_ready_cases = db.query(Case).join(CaseReview).join(CaseFile).filter(
        and_(CaseReview.is_final == True, CaseReview.primary_diagnosis.isnot(None))
    ).count()
    
    # Draft vs Final labels
    draft_labels = db.query(CaseReview).filter(CaseReview.is_final == False).count()
    final_labels = db.query(CaseReview).filter(CaseReview.is_final == True).count()
    
    # Cases per modality
    modality_stats = db.query(
        CaseFile.modality,
        func.count(distinct(CaseFile.case_id)).label('case_count')
    ).group_by(CaseFile.modality).all()
    
    modality_counts = {stat.modality: stat.case_count for stat in modality_stats}
    
    # Multi-modal cases (cases with multiple file types)
    multi_modal = db.query(Case.id).join(CaseFile).group_by(Case.id).having(
        func.count(distinct(CaseFile.modality)) > 1
    ).count()
    
    summary = {
        "total_cases": total_cases,
        "ml_ready_cases": ml_ready_cases,
        "training_readiness_percentage": round((ml_ready_cases / total_cases * 100) if total_cases > 0 else 0, 1),
        "label_status": {
            "draft": draft_labels,
            "final": final_labels
        },
        "modality_breakdown": {
            "cough_audio": modality_counts.get("cough_audio", 0),
            "breath_audio": modality_counts.get("breath_audio", 0),
            "xray": modality_counts.get("xray", 0),
            "multi_modal": multi_modal
        }
    }
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Dashboard summary retrieved",
        data=summary
    )


# 3️ DATASET EXPLORER TABLE
@router.get("/admin/dashboard/dataset", response_model=APIResponse)
async def get_dataset_explorer(
    model_type: Optional[str] = Query(None, description="Filter by model: cough_audio, breath_audio, xray, multi_modal"),
    diagnosis: Optional[str] = Query(None, description="Filter by primary diagnosis"),
    severity: Optional[str] = Query(None, description="Filter by severity: mild, moderate, severe"),
    confidence_min: Optional[float] = Query(None, description="Minimum confidence score"),
    training_ready_only: bool = Query(False, description="Show only training-ready samples"),
    practitioner_id: Optional[int] = Query(None, description="Filter by practitioner"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.DATA_ADMIN, UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Get dataset explorer table with comprehensive filtering."""
    
    # Base query with all necessary joins - use aliases to avoid duplicate table names
    query = db.query(Case).options(
        joinedload(Case.files),
        joinedload(Case.reviews).joinedload(CaseReview.practitioner),
        joinedload(Case.symptoms).joinedload(CaseSymptom.symptom)
    )
    
    # Track which joins we've already made to avoid duplicates
    joins_made = set()
    
    # Apply filters
    if model_type:
        if model_type == "multi_modal":
            # Cases with multiple modalities
            multi_modal_cases = db.query(Case.id).join(CaseFile).group_by(Case.id).having(
                func.count(distinct(CaseFile.modality)) > 1
            ).subquery()
            query = query.filter(Case.id.in_(multi_modal_cases))
        else:
            # Cases with specific modality
            if 'case_file' not in joins_made:
                query = query.join(CaseFile)
                joins_made.add('case_file')
            query = query.filter(CaseFile.modality == model_type)
    
    if training_ready_only:
        if 'case_review' not in joins_made:
            query = query.join(CaseReview)
            joins_made.add('case_review')
        query = query.filter(
            and_(CaseReview.is_final == True, CaseReview.primary_diagnosis.isnot(None))
        )
    
    if diagnosis:
        if 'case_review' not in joins_made:
            query = query.join(CaseReview)
            joins_made.add('case_review')
        query = query.filter(CaseReview.primary_diagnosis.ilike(f"%{diagnosis}%"))
    
    if severity:
        if 'case_review' not in joins_made:
            query = query.join(CaseReview)
            joins_made.add('case_review')
        query = query.filter(CaseReview.severity == severity)
    
    if confidence_min is not None:
        if 'case_review' not in joins_made:
            query = query.join(CaseReview)
            joins_made.add('case_review')
        query = query.filter(CaseReview.confidence_score >= confidence_min)
    
    if practitioner_id:
        if 'case_review' not in joins_made:
            query = query.join(CaseReview)
            joins_made.add('case_review')
        query = query.filter(CaseReview.practitioner_id == practitioner_id)
    
    # Get total count
    total_count = query.distinct().count()
    
    # Apply pagination
    cases = query.distinct().offset((page - 1) * limit).limit(limit).all()
    
    # Format response data
    dataset_rows = []
    for case in cases:
        # Get final review
        final_review = next((r for r in case.reviews if r.is_final), None)
        
        # Get file information
        files_present = len(case.files) > 0
        file_types = list(set([f.modality for f in case.files]))
        
        # Get symptoms
        symptoms = [cs.symptom.name for cs in case.symptoms if cs.symptom]
        
        # Determine training eligibility
        training_eligible = (
            final_review is not None and
            final_review.primary_diagnosis is not None and
            files_present and
            final_review.confidence_score is not None
        )
        
        exclusion_reason = None
        if not training_eligible:
            if not final_review:
                exclusion_reason = "No final review"
            elif not final_review.primary_diagnosis:
                exclusion_reason = "Missing diagnosis"
            elif not files_present:
                exclusion_reason = "No files"
            elif final_review.confidence_score is None:
                exclusion_reason = "Missing confidence"
        
        # Get practitioner info
        practitioner_name = None
        practitioner_institution = None
        full_name = None
        
        if final_review and final_review.practitioner:
            practitioner_name = f"{final_review.practitioner.first_name} {final_review.practitioner.last_name}"
            practitioner_institution = final_review.practitioner.institution
            full_name = practitioner_name
        
        # Get respiratory history from case user/sub_user
        respiratory_history = []
        if case.user_id:
            user = db.query(User).filter(User.id == case.user_id).first()
            if user and user.respiratory_history:
                respiratory_history = user.respiratory_history
        elif case.sub_user_id:
            # Handle sub_user respiratory history if needed
            pass
        
        row = {
            # Identification
            "catalog_number": case.catalog_number,
            "model_types": file_types,
            
            # Clinical Context (Anonymized)
            "practitioner_id": final_review.practitioner_id if final_review else None,
            "practitioner_name": practitioner_name,
            "practitioner_institution": practitioner_institution,
            "full_name": full_name,
            "symptoms": symptoms,
            "clinical_notes": final_review.clinical_notes if final_review else None,
            "primary_diagnosis": final_review.primary_diagnosis if final_review else None,
            "differential_diagnoses": final_review.differential_diagnoses if final_review else None,
            "respiratory_history": respiratory_history,
            "severity": final_review.severity if final_review else None,
            "confidence_score": final_review.confidence_score if final_review else None,
            
            # Review Metadata
            "review_status": "final" if final_review and final_review.is_final else "draft",
            "training_ready": training_eligible,
            "review_date": final_review.created_at.isoformat() if final_review else None,
            "exclusion_reason": exclusion_reason,
            
            # Metadata
            "created_at": case.created_at.isoformat()
        }
        
        dataset_rows.append(row)
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=f"Dataset explorer data retrieved ({len(dataset_rows)} rows)",
        data={
            "rows": dataset_rows,
            "pagination": {
                "page": page,
                "limit": limit,
                "total_count": total_count,
                "total_pages": (total_count + limit - 1) // limit
            },
            "filters_applied": {
                "model_type": model_type,
                "diagnosis": diagnosis,
                "severity": severity,
                "confidence_min": confidence_min,
                "training_ready_only": training_ready_only,
                "practitioner_id": practitioner_id
            }
        }
    )


#  LABEL DISTRIBUTION & INSIGHTS
@router.get("/admin/dashboard/insights", response_model=APIResponse)
async def get_label_insights(
    model_type: Optional[str] = Query(None, description="Filter by model type"),
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.DATA_ADMIN, UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Get label distribution and bias insights for ML training."""
    
    base_query = db.query(Case).join(CaseReview).filter(CaseReview.is_final == True)
    
    if model_type and model_type != "multi_modal":
        base_query = base_query.join(CaseFile).filter(CaseFile.modality == model_type)
    elif model_type == "multi_modal":
        multi_modal_cases = db.query(Case.id).join(CaseFile).group_by(Case.id).having(
            func.count(distinct(CaseFile.modality)) > 1
        ).subquery()
        base_query = base_query.filter(Case.id.in_(multi_modal_cases))
    
    # Diagnosis distribution
    diagnosis_dist = base_query.with_entities(
        CaseReview.primary_diagnosis,
        func.count(CaseReview.id).label('count')
    ).group_by(CaseReview.primary_diagnosis).order_by(func.count(CaseReview.id).desc()).all()
    
    # Severity distribution
    severity_dist = base_query.with_entities(
        CaseReview.severity,
        func.count(CaseReview.id).label('count')
    ).group_by(CaseReview.severity).all()
    
    # Confidence score histogram (binned)
    confidence_bins = base_query.with_entities(
        case(
            (CaseReview.confidence_score < 0.3, 'Low (0-0.3)'),
            (CaseReview.confidence_score < 0.7, 'Medium (0.3-0.7)'),
            (CaseReview.confidence_score >= 0.7, 'High (0.7-1.0)'),
            else_='Unknown'
        ).label('confidence_bin'),
        func.count(CaseReview.id).label('count')
    ).group_by('confidence_bin').all()
    
    # Practitioner contribution
    practitioner_stats = base_query.join(User, CaseReview.practitioner_id == User.id).with_entities(
        User.id,
        func.concat(User.first_name, ' ', User.last_name).label('practitioner_name'),
        func.count(CaseReview.id).label('cases_reviewed'),
        func.avg(CaseReview.confidence_score).label('avg_confidence')
    ).group_by(User.id, User.first_name, User.last_name).all()
    
    insights = {
        "diagnosis_distribution": [
            {"diagnosis": d.primary_diagnosis or "Unknown", "count": d.count}
            for d in diagnosis_dist
        ],
        "severity_distribution": [
            {"severity": s.severity or "Unknown", "count": s.count}
            for s in severity_dist
        ],
        "confidence_histogram": [
            {"bin": c.confidence_bin, "count": c.count}
            for c in confidence_bins
        ],
        "practitioner_performance": [
            {
                "practitioner_id": p.id,
                "practitioner_name": p.practitioner_name,
                "cases_reviewed": p.cases_reviewed,
                "avg_confidence": round(float(p.avg_confidence), 2) if p.avg_confidence else 0
            }
            for p in practitioner_stats
        ],
        "data_quality_flags": {
            "missing_confidence": base_query.filter(CaseReview.confidence_score.is_(None)).count(),
            "missing_differential_dx": base_query.filter(CaseReview.differential_diagnoses.is_(None)).count(),
            "missing_severity": base_query.filter(CaseReview.severity.is_(None)).count()
        }
    }
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Label insights retrieved",
        data=insights
    )


# 7️⃣ EXPORT & TRAINING BATCH BUILDER
@router.post("/admin/dashboard/export", response_model=APIResponse)
async def export_training_batch(
    model_type: Optional[str] = None,
    diagnosis_filter: Optional[str] = None,
    confidence_min: Optional[float] = None,
    export_format: str = "json",
    include_files: bool = True,
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.DATA_ADMIN, UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Export filtered training batch with dataset versioning."""
    
    # Build query with filters
    query = db.query(Case).join(CaseReview).filter(
        and_(CaseReview.is_final == True, CaseReview.primary_diagnosis.isnot(None))
    )
    
    if model_type and model_type != "multi_modal":
        query = query.join(CaseFile).filter(CaseFile.modality == model_type)
    
    if diagnosis_filter:
        query = query.filter(CaseReview.primary_diagnosis.ilike(f"%{diagnosis_filter}%"))
    
    if confidence_min is not None:
        query = query.filter(CaseReview.confidence_score >= confidence_min)
    
    cases = query.options(
        joinedload(Case.files),
        joinedload(Case.reviews)
    ).all()
    
    # Generate dataset version tag
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dataset_name = f"{model_type or 'mixed'}_{timestamp}"
    
    export_data = {
        "dataset_metadata": {
            "name": dataset_name,
            "created_at": datetime.now().isoformat(),
            "created_by": current_user.email,
            "filters": {
                "model_type": model_type,
                "diagnosis_filter": diagnosis_filter,
                "confidence_min": confidence_min
            },
            "total_samples": len(cases)
        },
        "samples": []
    }
    
    for case in cases:
        final_review = next((r for r in case.reviews if r.is_final), None)
        
        sample = {
            "catalog_number": case.catalog_number,
            "diagnosis": final_review.primary_diagnosis,
            "differential_diagnoses": final_review.differential_diagnoses,
            "severity": final_review.severity,
            "confidence_score": final_review.confidence_score,
            "clinical_notes": final_review.clinical_notes if final_review.clinical_notes else None
        }
        
        if include_files:
            sample["files"] = [
                {
                    "modality": f.modality,
                    "file_type": f.file_type,
                    "s3_bucket": f.s3_bucket,
                    "s3_key": f.s3_key,
                    "file_size": f.file_size,
                    "duration_seconds": f.duration_seconds
                }
                for f in case.files
            ]
        
        export_data["samples"].append(sample)
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=f"Training batch exported: {dataset_name}",
        data=export_data
    )


# EXISTING ADMIN FUNCTIONALITY (PRESERVED)
@router.get("/admin/dashboard/stats", response_model=APIResponse)
async def get_admin_dashboard_stats(
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.SUPER_ADMIN, UserRole.DATA_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Get admin dashboard statistics."""
    
    # Basic stats for both admin types
    total_users = db.query(User).count()
    total_cases = db.query(Case).count()
    total_files = db.query(CaseFile).count()
    total_reviews = db.query(CaseReview).count()
    
    # Role-specific stats
    user_role = UserRole(current_user.role) if isinstance(current_user.role, str) else current_user.role
    
    if user_role == UserRole.DATA_ADMIN:
        # Data admin focuses on training data metrics
        file_type_results = db.query(CaseFile.modality, func.count(CaseFile.id)).group_by(CaseFile.modality).all()
        file_types = [(row.modality, row[1]) for row in file_type_results]
        
        stats = {
            "total_cases": total_cases,
            "total_files": total_files,
            "reviewed_cases": db.query(Case).filter(Case.status == "reviewed").count(),
            "training_ready_cases": db.query(Case).join(CaseReview).filter(
                and_(Case.status == "reviewed", CaseReview.is_final == True)
            ).count(),
            "file_types": file_types,
            "data_quality_score": 85.5  # Placeholder for ML data quality metrics
        }
    else:
        # Super admin gets full system stats
        stats = {
            "total_users": total_users,
            "total_cases": total_cases,
            "total_files": total_files,
            "total_reviews": total_reviews,
            "patients": db.query(User).filter(User.role == UserRole.PATIENT).count(),
            "practitioners": db.query(User).filter(User.role == UserRole.PRACTITIONER).count(),
            "pending_cases": db.query(Case).filter(Case.status == "submitted").count(),
            "system_health": "Operational"
        }
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Dashboard stats retrieved",
        data=stats
    )


@router.get("/admin/users", response_model=APIResponse)
async def get_all_users(
    role: Optional[str] = Query(None),
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Get all users (Super Admin only)."""
    
    query = db.query(User).filter(User.deleted_at.is_(None))
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.order_by(User.created_at.desc()).all()
    
    user_data = []
    for user in users:
        user_data.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "created_at": user.created_at.isoformat(),
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "is_active": user.deleted_at is None
        })
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=f"Found {len(user_data)} users",
        data={"users": user_data}
    )


from pydantic import BaseModel

class AdminSignupRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str

@router.post("/admin/signup", response_model=APIResponse)
async def admin_signup(
    request: AdminSignupRequest,
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Create new admin user (Super Admin only)."""
    
    # Validate role
    if request.role not in ["super_admin", "data_admin"]:
        raise HTTPException(status_code=400, detail="Invalid admin role")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create admin user
    import bcrypt
    
    def hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Split full name
    name_parts = request.full_name.split(' ', 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""
    
    admin_user = User(
        email=request.email,
        hashed_password=hash_password(request.password),
        first_name=first_name,
        last_name=last_name,
        role=request.role,
        age=30,  # Default values
        sex="O",
        ethnicity="UND"
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=f"Admin user created successfully",
        data={
            "user_id": admin_user.id,
            "email": admin_user.email,
            "role": admin_user.role
        },
        id=str(admin_user.id)
    )


@router.post("/admin/users/{user_id}/toggle-status", response_model=APIResponse)
async def toggle_user_status(
    user_id: int,
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Toggle user active/inactive status (Super Admin only)."""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Toggle status
    if user.deleted_at:
        user.deleted_at = None
        status = "activated"
    else:
        user.deleted_at = func.now()
        status = "deactivated"
    
    db.commit()
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=f"User {status} successfully",
        data={"user_id": user_id, "status": status}
    )


# ========== SUPER ADMIN DASHBOARD APIs ==========

@router.get("/admin/super/stats", response_model=APIResponse)
async def get_super_admin_stats(
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Get system health overview stats."""
    from app.models.sub_user import SubUser
    
    total_users = db.query(User).filter(User.deleted_at.is_(None)).count()
    total_sub_users = db.query(SubUser).filter(SubUser.deleted_at.is_(None)).count()
    total_practitioners = db.query(User).filter(
        and_(User.role == UserRole.PRACTITIONER, User.deleted_at.is_(None))
    ).count()
    
    active_cases = db.query(Case).filter(Case.status.in_(["submitted", "reviewed"])).count()
    unassigned_cases = db.query(Case).filter(
        and_(Case.status == "submitted", Case.practitioner_id.is_(None))
    ).count()
    
    # Count cases by status
    draft_cases = db.query(Case).filter(Case.status == "draft").count()
    submitted_cases = db.query(Case).filter(Case.status == "submitted").count()
    reviewed_cases = db.query(Case).filter(Case.status == "reviewed").count()
    
    # Final cases (with final reviews)
    final_cases = db.query(Case).join(CaseReview).filter(CaseReview.is_final == True).distinct().count()
    
    # File upload success rate (cases with files / total cases)
    total_cases = db.query(Case).count()
    cases_with_files = db.query(Case).join(CaseFile).distinct().count()
    file_upload_success_rate = round((cases_with_files / total_cases * 100) if total_cases > 0 else 0, 1)
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="System stats retrieved",
        data={
            "total_users": total_users,
            "total_sub_users": total_sub_users,
            "total_practitioners": total_practitioners,
            "active_cases": active_cases,
            "unassigned_cases": unassigned_cases,
            "draft_cases": draft_cases,
            "submitted_cases": submitted_cases,
            "reviewed_cases": reviewed_cases,
            "final_cases": final_cases,
            "file_upload_success_rate": file_upload_success_rate
        }
    )


@router.get("/admin/super/cases", response_model=APIResponse)
async def get_cases_for_assignment(
    status: Optional[str] = Query(None),
    assigned: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Get cases for assignment management."""
    from datetime import datetime, timezone
    
    query = db.query(Case).options(joinedload(Case.practitioner))
    
    if status and status != "all":
        query = query.filter(Case.status == status)
    
    if assigned == "assigned":
        query = query.filter(Case.practitioner_id.isnot(None))
    elif assigned == "unassigned":
        query = query.filter(Case.practitioner_id.is_(None))
    
    total_count = query.count()
    cases = query.order_by(Case.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    case_rows = []
    for case in cases:
        # Calculate SLA timer (hours since creation)
        sla_hours = int((datetime.now(timezone.utc) - case.created_at).total_seconds() / 3600)
        
        case_rows.append({
            "id": case.id,
            "catalog_number": case.catalog_number,
            "status": case.status,
            "practitioner_id": case.practitioner_id,
            "practitioner_db_id": case.practitioner_id,  # Database ID for assignment
            "practitioner_name": case.practitioner.full_name if case.practitioner else None,
            "auto_assigned": case.practitioner_id is not None,  # Simplified
            "created_at": case.created_at.isoformat(),
            "sla_hours": sla_hours,
            "priority": "urgent" if sla_hours > 48 else "normal"
        })
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=f"Retrieved {len(case_rows)} cases",
        data={
            "cases": case_rows,
            "pagination": {
                "page": page,
                "limit": limit,
                "total_count": total_count
            }
        }
    )


class AssignCaseRequest(BaseModel):
    practitioner_id: int

@router.post("/admin/super/cases/{case_id}/assign", response_model=APIResponse)
async def assign_case_to_practitioner(
    case_id: int,
    request: AssignCaseRequest,
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Manually assign case to practitioner."""
    
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    practitioner = db.query(User).filter(
        and_(User.id == request.practitioner_id, User.role == UserRole.PRACTITIONER)
    ).first()
    if not practitioner:
        raise HTTPException(status_code=404, detail="Practitioner not found")
    
    case.practitioner_id = request.practitioner_id
    case.status = "submitted" if case.status == "draft" else case.status
    db.commit()
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Case assigned successfully",
        data={"case_id": case_id, "practitioner_id": request.practitioner_id}
    )


@router.get("/admin/super/practitioners", response_model=APIResponse)
async def get_practitioners_management(
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Get practitioners with performance metrics."""
    from datetime import datetime, timezone
    
    practitioners = db.query(User).filter(
        User.role == UserRole.PRACTITIONER
    ).all()
    
    practitioner_rows = []
    for p in practitioners:
        # Active cases assigned to this practitioner
        active_cases = db.query(Case).filter(
            and_(Case.practitioner_id == p.id, Case.status.in_(["submitted", "reviewed"]))
        ).count()
        
        # Pending review cases (assigned but no review yet)
        pending_review = db.query(Case).filter(
            and_(
                Case.practitioner_id == p.id,
                Case.status == "submitted",
                ~Case.id.in_(db.query(CaseReview.case_id).filter(CaseReview.practitioner_id == p.id))
            )
        ).count()
        
        # Draft vs Final reviews
        draft_count = db.query(CaseReview).filter(
            and_(CaseReview.practitioner_id == p.id, CaseReview.is_final == False)
        ).count()
        
        final_count = db.query(CaseReview).filter(
            and_(CaseReview.practitioner_id == p.id, CaseReview.is_final == True)
        ).count()
        
        # Calculate average review time (case assignment to first review)
        avg_review_time = None
        reviewed_cases = db.query(
            Case.id,
            Case.created_at,
            func.min(CaseReview.created_at).label('first_review_at')
        ).join(CaseReview, Case.id == CaseReview.case_id).filter(
            CaseReview.practitioner_id == p.id
        ).group_by(Case.id, Case.created_at).all()
        
        if reviewed_cases:
            total_hours = 0
            for case in reviewed_cases:
                time_diff = (case.first_review_at - case.created_at).total_seconds() / 3600
                total_hours += time_diff
            avg_review_time = round(total_hours / len(reviewed_cases), 1)
        
        practitioner_rows.append({
            "id": p.id,
            "full_name": p.full_name,
            "practitioner_id": p.practitioner_id,
            "institution": p.institution,
            "active_cases": active_cases,
            "pending_review": pending_review,
            "avg_review_time": avg_review_time,
            "draft_count": draft_count,
            "final_count": final_count,
            "is_active": p.deleted_at is None
        })
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=f"Retrieved {len(practitioner_rows)} practitioners",
        data={"practitioners": practitioner_rows}
    )


@router.post("/admin/super/practitioners/{practitioner_id}/toggle", response_model=APIResponse)
async def toggle_practitioner_status(
    practitioner_id: int,
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Toggle practitioner active/inactive status."""
    
    practitioner = db.query(User).filter(
        and_(User.id == practitioner_id, User.role == UserRole.PRACTITIONER)
    ).first()
    
    if not practitioner:
        raise HTTPException(status_code=404, detail="Practitioner not found")
    
    if practitioner.deleted_at:
        practitioner.deleted_at = None
        status = "activated"
    else:
        practitioner.deleted_at = func.now()
        status = "deactivated"
    
    db.commit()
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=f"Practitioner {status} successfully",
        data={"practitioner_id": practitioner_id, "status": status}
    )


@router.get("/admin/super/users", response_model=APIResponse)
async def get_all_users_management(
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Get all users and sub-users for management."""
    from app.models.sub_user import SubUser
    
    users = db.query(User).order_by(User.created_at.desc()).all()
    
    user_rows = []
    for u in users:
        user_rows.append({
            "id": u.id,
            "type": "user",
            "full_name": u.full_name,
            "role": u.role,
            "owner_id": None,
            "owner_name": None,
            "is_active": u.deleted_at is None
        })
        
        # Add sub-users for this user
        sub_users = db.query(SubUser).filter(SubUser.owner_user_id == u.id).all()
        for su in sub_users:
            user_rows.append({
                "id": su.id,
                "type": "sub_user",
                "full_name": su.full_name,
                "role": "sub_user",
                "owner_id": u.id,
                "owner_name": u.full_name,
                "is_active": su.deleted_at is None
            })
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=f"Retrieved {len(user_rows)} users and sub-users",
        data={"users": user_rows}
    )


@router.post("/admin/super/users/{user_id}/toggle", response_model=APIResponse)
async def toggle_user_status_super(
    user_id: int,
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Toggle user active/inactive status."""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.deleted_at:
        user.deleted_at = None
        status = "activated"
    else:
        user.deleted_at = func.now()
        status = "deactivated"
    
    db.commit()
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=f"User {status} successfully",
        data={"user_id": user_id, "status": status}
    )


@router.post("/admin/super/sub-users/{sub_user_id}/toggle", response_model=APIResponse)
async def toggle_sub_user_status(
    sub_user_id: int,
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Toggle sub-user active/inactive status."""
    from app.models.sub_user import SubUser
    
    sub_user = db.query(SubUser).filter(SubUser.id == sub_user_id).first()
    if not sub_user:
        raise HTTPException(status_code=404, detail="Sub-user not found")
    
    if sub_user.deleted_at:
        sub_user.deleted_at = None
        status = "activated"
    else:
        sub_user.deleted_at = func.now()
        status = "deactivated"
    
    db.commit()
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=f"Sub-user {status} successfully",
        data={"sub_user_id": sub_user_id, "status": status}
    )