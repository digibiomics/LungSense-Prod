"""
Sub-user management routes with RBAC.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.utils.auth import (
    AuthenticatedUser,
    get_current_user,
    require_admin_role,
    require_ownership_or_admin,
    require_patient_role
)
from app.sessions.db import create_local_session
from app.constants.enums import ResponseStatus
from app.utils.exception_handler import raise_bad_request, raise_forbidden
from app.schemas.common import APIResponse
from app.schemas.sub_user import SubUserCreateRequest, SubUserDashboardUpdateRequest, SubUserResponse, SubUserUpdateRequest
from app.repository.sub_user_repo import SubUserRepository

router = APIRouter()


@router.post("/patient/{owner_id}/sub-user", response_model=APIResponse)
async def create_sub_user(
    owner_id: int,
    request: SubUserCreateRequest,
    current_user: AuthenticatedUser = Depends(require_patient_role()),
    db: Session = Depends(create_local_session)
):
    """Create a sub-user under a patient account (patient only)."""
    # Only the patient can create sub-users for themselves
    if current_user.user_id != owner_id:
        raise_forbidden("Access denied")
    
    try:
        sub_user = SubUserRepository.create_sub_user(db, owner_id, request)
        response_data = SubUserRepository.to_response(sub_user)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="Sub-user created successfully",
            data=response_data.dict(),
            id=str(sub_user.id)
        )
    except Exception as e:
        raise_bad_request(str(e))


@router.post("/admin/sub-user", response_model=APIResponse)
async def create_sub_user_admin(
    request: SubUserCreateRequest,
    owner_id: int = Query(..., description="Owner user ID"),
    current_user: AuthenticatedUser = Depends(require_admin_role()),
    db: Session = Depends(create_local_session)
):
    """Create a sub-user via admin (admin only)."""
    try:
        sub_user = SubUserRepository.create_sub_user(db, owner_id, request)
        response_data = SubUserRepository.to_response(sub_user)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="Sub-user created successfully",
            data=response_data.dict(),
            id=str(sub_user.id)
        )
    except Exception as e:
        raise_bad_request(str(e))


@router.get("/patient/{owner_id}/sub-users", response_model=APIResponse)
async def list_sub_users(
    owner_id: int,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """List sub-users for a patient (owner or admin only)."""
    # Patient can view their own sub-users, admins can view anyone's
    if current_user.user_id != owner_id and not current_user.is_admin:
        raise_forbidden("Access denied")
    
    sub_users = SubUserRepository.get_sub_users_by_owner(db, owner_id)
    sub_user_responses = [SubUserRepository.to_response(sub_user) for sub_user in sub_users]
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Sub-users retrieved successfully",
        data={"sub_users": [r.dict() for r in sub_user_responses], "total": len(sub_user_responses)}
    )


@router.get("/patient/sub-user/{sub_user_id}", response_model=APIResponse)
async def get_sub_user(
    sub_user_id: int,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Get sub-user by ID (owner or assigned practitioner or admin)."""
    sub_user = SubUserRepository.get_sub_user_by_id(db, sub_user_id)
    
    # Check permissions: owner, assigned practitioner, or admin
    if not SubUserRepository.can_access_sub_user(db, current_user, sub_user):
        raise_forbidden("Access denied")
    
    response_data = SubUserRepository.to_response(sub_user)
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Sub-user retrieved successfully",
        data=response_data.dict()
    )


@router.put("/patient/sub-user/{sub_user_id}", response_model=APIResponse)
async def update_sub_user(
    sub_user_id: int,
    request: SubUserUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Update sub-user (owner or admin only)."""
    sub_user = SubUserRepository.get_sub_user_by_id(db, sub_user_id)
    
    # Only owner or admin can update
    if current_user.user_id != sub_user.owner_user_id and not current_user.is_admin:
        raise_forbidden("Access denied")
    
    try:
        updated_sub_user = SubUserRepository.update_sub_user(db, sub_user_id, request)
        response_data = SubUserRepository.to_response(updated_sub_user)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="Sub-user updated successfully",
            data=response_data.dict()
        )
    except Exception as e:
        raise_bad_request(str(e))


@router.put("/patient/sub-user/{sub_user_id}/dashboard", response_model=APIResponse)
async def update_sub_user_dashboard(
    sub_user_id: int,
    request: SubUserDashboardUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Update sub-user demographics from patient dashboard (age, sex, ethnicity only)."""
    sub_user = SubUserRepository.get_sub_user_by_id(db, sub_user_id)
    
    # Only owner or admin can update
    if current_user.user_id != sub_user.owner_user_id and not current_user.is_admin:
        raise_forbidden("Access denied")
    
    try:
        updated_sub_user = SubUserRepository.update_sub_user_dashboard(
            db, sub_user_id, request.age, request.sex, request.ethnicity
        )
        response_data = SubUserRepository.to_response(updated_sub_user)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="Sub-user demographics updated successfully",
            data=response_data.dict()
        )
    except Exception as e:
        raise_bad_request(str(e))


@router.delete("/patient/sub-user/{sub_user_id}", response_model=APIResponse)
async def delete_sub_user(
    sub_user_id: int,
    hard: bool = Query(False, description="Perform hard delete"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Delete sub-user (owner or admin only)."""
    sub_user = SubUserRepository.get_sub_user_by_id(db, sub_user_id)
    
    # Only owner or admin can delete
    if current_user.user_id != sub_user.owner_user_id and not current_user.is_admin:
        raise_forbidden("Access denied")
    
    # Hard delete only for super admin
    if hard and not current_user.is_super_admin:
        raise_forbidden("Hard delete requires super admin privileges")
    
    if hard:
        SubUserRepository.hard_delete_sub_user(db, sub_user_id)
        message = "Sub-user permanently deleted"
    else:
        SubUserRepository.soft_delete_sub_user(db, sub_user_id)
        message = "Sub-user deleted successfully"
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message=message
    )
