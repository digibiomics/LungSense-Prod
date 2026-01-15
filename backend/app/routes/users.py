"""
User management routes with RBAC.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.utils.auth import (
    AuthenticatedUser,
    get_current_user,
    require_admin_role,
    require_ownership_or_admin,
    require_super_admin_role
)
from app.sessions.db import create_local_session
from app.constants.enums import ResponseStatus, UserRole
from app.utils.exception_handler import raise_bad_request, raise_forbidden
from app.constants.jwt_utils import create_access_token
from app.schemas.auth.auth_request import LoginRequest
from app.schemas.auth.auth_response import  TokenResponse
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.user import (
    AdminUserCreateRequest,
    PatientSignupRequest,
    PractitionerSignupRequest,
    UserListResponse,
    UserResponse,
    UserUpdateRequest
)
from app.repository.user_repo import UserRepository

import requests

router = APIRouter()


@router.get("/user/{user_id}", response_model=APIResponse)
async def get_user(
    user_id: int,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Get user by ID (RBAC protected)."""
    # Patients can only view themselves, admins can view anyone
    if current_user.user_id != user_id and not current_user.is_admin:
        raise_forbidden("Access denied")
    
    user = UserRepository.get_user_by_id(db, user_id)
    response_data = UserRepository.to_response(user)
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="User retrieved successfully",
        data=response_data.dict()
    )


@router.get("/users", response_model=APIResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    role: Optional[str] = Query(None),
    current_user: AuthenticatedUser = Depends(require_admin_role()),
    db: Session = Depends(create_local_session)
):
    """List users (admin only)."""
    skip = (page - 1) * per_page
    users = UserRepository.get_users(db, skip=skip, limit=per_page, role_filter=role)
    total = UserRepository.count_users(db, role_filter=role)
    
    user_responses = [UserRepository.to_response(user) for user in users]
    
    response_data = UserListResponse(
        users=user_responses,
        total=total,
        page=page,
        per_page=per_page
    )
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Users retrieved successfully",
        data=response_data.dict()
    )


@router.put("/user/{user_id}", response_model=APIResponse)
async def update_user(
    user_id: int,
    request: UserUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Update user (RBAC protected)."""
    # Users can update themselves, admins can update anyone
    if current_user.user_id != user_id and not current_user.is_admin:
        raise_forbidden("Access denied")
    
    try:
        user = UserRepository.update_user(db, user_id, request)
        response_data = UserRepository.to_response(user)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="User updated successfully",
            data=response_data.dict()
        )
    except Exception as e:
        raise_bad_request(str(e))


@router.delete("/user/{user_id}", response_model=APIResponse)
async def delete_user(
    user_id: int,
    hard: bool = Query(False, description="Perform hard delete"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Delete user (soft delete by default, hard delete for super admin)."""
    # Users can delete themselves, admins can delete anyone
    if current_user.user_id != user_id and not current_user.is_admin:
        raise_forbidden("Access denied")
    
    # Hard delete only allowed for super admin
    if hard and not current_user.is_super_admin:
        raise_forbidden("Hard delete requires super admin privileges")
    
    if hard:
        UserRepository.hard_delete_user(db, user_id)
        message = "User permanently deleted"
    else:
        UserRepository.soft_delete_user(db, user_id)
        message = "User deleted successfully"
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=message
    )


@router.post("/admin/data-admin", response_model=APIResponse)
async def create_data_admin(
    request: AdminUserCreateRequest,
    current_user: AuthenticatedUser = Depends(require_super_admin_role()),
    db: Session = Depends(create_local_session)
):
    """Create a data admin user (super admin only)."""
    if request.role != UserRole.DATA_ADMIN:
        raise_bad_request("This endpoint is for creating data admins only")
    
    try:
        user = UserRepository.create_admin_user(db, request, current_user.user_id)
        response_data = UserRepository.to_response(user)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="Data admin created successfully",
            data=response_data.dict(),
            id=str(user.id)
        )
    except Exception as e:
        raise_bad_request(str(e))


@router.post("/admin/super-admin", response_model=APIResponse)
async def create_super_admin(
    request: AdminUserCreateRequest,
    current_user: AuthenticatedUser = Depends(require_super_admin_role()),
    db: Session = Depends(create_local_session)
):
    """Create a super admin user (super admin only)."""
    if request.role != UserRole.SUPER_ADMIN:
        raise_bad_request("This endpoint is for creating super admins only")
    
    try:
        user = UserRepository.create_admin_user(db, request, current_user.user_id)
        response_data = UserRepository.to_response(user)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="Super admin created successfully",
            data=response_data.dict(),
            id=str(user.id)
        )
    except Exception as e:
        raise_bad_request(str(e))


@router.post("/admin/practitioner", response_model=APIResponse)
async def create_practitioner_admin(
    request: AdminUserCreateRequest,
    current_user: AuthenticatedUser = Depends(require_super_admin_role()),
    db: Session = Depends(create_local_session)
):
    """Create a practitioner user via admin (super admin only)."""
    if request.role != UserRole.PRACTITIONER:
        raise_bad_request("This endpoint is for creating practitioners only")
    
    try:
        # Convert admin request to practitioner request (minimal fields)
        from app.schemas.user import PractitionerSignupRequest
        
        practitioner_request = PractitionerSignupRequest(
            email=request.email,
            first_name=request.first_name,
            last_name=request.last_name,
            password=request.password,
            practitioner_id=f"ADMIN_{request.email.split('@')[0]}",  # Auto-generate
            institution="Admin Created",
            institution_location_country="US",
            institution_location_province="US-CA"
        )
        
        user = UserRepository.create_practitioner(db, practitioner_request)
        response_data = UserRepository.to_response(user)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="Practitioner created successfully",
            data=response_data.dict(),
            id=str(user.id)
        )
    except Exception as e:
        raise_bad_request(str(e))


@router.post("/patient", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup_patient(
    request: PatientSignupRequest,
    db: Session = Depends(create_local_session)
):
    """Patient signup - creates account and returns JWT token."""
    try:
        user = UserRepository.create_patient(db, request)
        token = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
        
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user_id=user.id,
            role=user.role
        )
    except Exception as e:
        raise_bad_request(str(e))


@router.post("/practitioner", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup_practitioner(
    request: PractitionerSignupRequest,
    db: Session = Depends(create_local_session)
):
    """Practitioner signup - creates account and returns JWT token."""
    try:
        user = UserRepository.create_practitioner(db, request)
        token = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
        
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user_id=user.id,
            role=user.role
        )
    except Exception as e:
        raise_bad_request(str(e))


@router.post("/auth/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(create_local_session)
):
    """Login for all user types - verifies credentials and returns JWT."""
    try:
        user = UserRepository.authenticate_user(db, request.email, request.password)
        token = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
        
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user_id=user.id,
            role=user.role
        )
    except Exception as e:
        raise_bad_request(str(e))

@router.get("/locations/provinces/{country_code}")
def get_provinces(country_code: str):
    url = "https://download.geonames.org/export/dump/admin1CodesASCII.txt"
    res = requests.get(url)
    res.raise_for_status()

    provinces = []
    for line in res.text.split("\n"):
        if line.startswith(country_code.upper() + "."):
            parts = line.split("\t")
            provinces.append({
                "code": parts[0].replace(".", "-"),
                "name": parts[1],
            })

    return provinces