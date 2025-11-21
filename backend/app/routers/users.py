# app/routers/users.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User as UserModel
from app.schemas.auth import UserRead, UserUpdate
from app.crud.user import (
    get_all_users,
    get_users_by_role,
    get_user_by_id,
    update_user,
    soft_delete_user,
    hard_delete_user,
    restore_user,
)
from app.routers.auth import get_current_user  # dependency that returns the authenticated UserModel

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserRead])
async def list_users(
    include_inactive: bool = Query(False, description="Include soft-deleted users"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """
    Get all users (patients + practitioners).
    """
    users = await get_all_users(db, include_inactive=include_inactive)
    return users


@router.get("/patients", response_model=List[UserRead])
async def list_patients(
    include_inactive: bool = Query(False, description="Include soft-deleted patients"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Get all patients."""
    users = await get_users_by_role(db, role="patient", include_inactive=include_inactive)
    return users


@router.get("/practitioners", response_model=List[UserRead])
async def list_practitioners(
    include_inactive: bool = Query(False, description="Include soft-deleted practitioners"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Get all practitioners."""
    users = await get_users_by_role(db, role="practitioner", include_inactive=include_inactive)
    return users


@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int = Path(..., ge=1, description="User ID"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Get user by id."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserRead)
async def patch_user(
    user_id: int = Path(..., ge=1, description="User ID"),
    patch: UserUpdate = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """
    Partial update for a user.
    Authorization note: this endpoint currently requires authentication.
    Consider adding role/admin checks so only the owner or admins can modify.
    """
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    updated = await update_user(db, user, patch)
    return updated


@router.delete("/{user_id}", response_model=UserRead)
async def delete_user_soft(
    user_id: int = Path(..., ge=1, description="User ID"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Soft delete (sets is_active=False)."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    updated = await soft_delete_user(db, user)
    return updated


@router.delete("/{user_id}/hard", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_hard(
    user_id: int = Path(..., ge=1, description="User ID"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """
    Hard delete — permanent removal. Use carefully (admin-only recommended).
    Returns 204 No Content on success.
    """
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await hard_delete_user(db, user)
    return None


@router.post("/{user_id}/restore", response_model=UserRead)
async def restore_user_endpoint(
    user_id: int = Path(..., ge=1, description="User ID"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Restore a soft-deleted user."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    restored = await restore_user(db, user)
    return restored
