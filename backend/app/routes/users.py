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
    require_super_admin_role
)
from app.sessions.db import create_local_session
from app.constants.enums import ResponseStatus, UserRole
from app.utils.exception_handler import raise_bad_request, raise_forbidden
from app.schemas.common import APIResponse
from app.schemas.user import (
    AdminUserCreateRequest,
    PatientDashboardUpdateRequest,
    UserListResponse,
    UserResponse,
    UserUpdateRequest
)
from app.repository.user_repo import UserRepository

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


@router.put("/user/{user_id}/dashboard", response_model=APIResponse)
async def update_user_dashboard(
    user_id: int,
    request: PatientDashboardUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Update user demographics from patient dashboard (age, sex, ethnicity, respiratory_history)."""
    # Users can update themselves, admins can update anyone
    if current_user.user_id != user_id and not current_user.is_admin:
        raise_forbidden("Access denied")
    
    try:
        user = UserRepository.update_user_dashboard(
            db, user_id, request.first_name, request.last_name, request.age, request.sex, request.ethnicity, request.respiratory_history
        )
        response_data = UserRepository.to_response(user)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="User demographics updated successfully",
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