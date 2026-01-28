"""
Admin routes for system administration and data management.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func

from app.utils.auth import AuthenticatedUser, get_current_user
from app.sessions.db import create_local_session
from app.constants.enums import ResponseStatus, UserRole
from app.schemas.common import APIResponse
from app.models.user import User
from app.models.case import Case
from app.models.case_file import CaseFile
from app.models.case_review import CaseReview

router = APIRouter()


def require_admin_role(allowed_roles: List[UserRole]):
    """Decorator to check admin roles."""
    def check_role(current_user: AuthenticatedUser = Depends(get_current_user)):
        user_role = UserRole(current_user.role) if isinstance(current_user.role, str) else current_user.role
        if user_role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient privileges")
        return current_user
    return check_role


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
        stats = {
            "total_cases": total_cases,
            "total_files": total_files,
            "reviewed_cases": db.query(Case).filter(Case.status == "reviewed").count(),
            "training_ready_cases": db.query(Case).join(CaseReview).filter(
                and_(Case.status == "reviewed", CaseReview.is_final == True)
            ).count(),
            "file_types": db.query(CaseFile.modality, func.count(CaseFile.id)).group_by(CaseFile.modality).all(),
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


@router.get("/admin/training-data", response_model=APIResponse)
async def get_training_data_export(
    format: str = Query("json", description="Export format: json, csv"),
    anonymize: bool = Query(True, description="Anonymize patient data"),
    current_user: AuthenticatedUser = Depends(require_admin_role([UserRole.DATA_ADMIN, UserRole.SUPER_ADMIN])),
    db: Session = Depends(create_local_session)
):
    """Export training data for ML models (Data Admin access)."""
    
    # Get reviewed cases with files and diagnoses
    cases = db.query(Case).options(
        joinedload(Case.files),
        joinedload(Case.reviews)
    ).filter(Case.status == "reviewed").all()
    
    training_data = []
    for case in cases:
        # Get final review
        final_review = next((r for r in case.reviews if r.is_final), None)
        if not final_review:
            continue
            
        case_data = {
            "case_id": case.catalog_number if anonymize else case.id,
            "diagnosis": final_review.primary_diagnosis,
            "severity": final_review.severity,
            "confidence_score": final_review.confidence_score,
            "files": []
        }
        
        # Add file information
        for file in case.files:
            case_data["files"].append({
                "modality": file.modality,
                "file_type": file.file_type,
                "file_size": file.file_size,
                "s3_key": file.s3_key if not anonymize else None
            })
        
        training_data.append(case_data)
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=f"Training data export ready ({len(training_data)} cases)",
        data={
            "format": format,
            "anonymized": anonymize,
            "total_cases": len(training_data),
            "data": training_data[:100] if format == "json" else f"CSV export with {len(training_data)} records"
        }
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