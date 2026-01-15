"""
Sub-user service layer for business logic.
"""
from __future__ import annotations

import json
from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.utils.exception_handler import raise_conflict, raise_not_found
from app.models.practitioner_assignment import PractitionerAssignment
from app.models.sub_user import SubUser
from app.models.user import User
from app.schemas.sub_user import SubUserCreateRequest, SubUserResponse, SubUserUpdateRequest


class SubUserRepository:
    """Service for sub-user operations."""
    
    @staticmethod
    def create_sub_user(
        db: Session, 
        owner_user_id: int, 
        request: SubUserCreateRequest
    ) -> SubUser:
        """Create a new sub-user under a main patient account."""
        # Check if email already exists
        existing = db.query(SubUser).filter(
            or_(SubUser.email == request.email, SubUser.deleted_at.is_not(None))
        ).first()
        
        if existing:
            if existing.deleted_at:
                # Reactivate soft-deleted sub-user
                existing.restore()
                existing.owner_user_id = owner_user_id
                existing.first_name = request.first_name
                existing.last_name = request.last_name
                existing.age = request.age
                existing.sex = request.sex
                existing.ethnicity = request.ethnicity
                existing.country = request.country
                existing.province = request.province
                existing.respiratory_history = (
                    json.dumps([h.value for h in request.respiratory_history])
                    if request.respiratory_history else None
                )
                db.commit()
                db.refresh(existing)
                return existing
            else:
                raise_conflict("Email already registered")
        
        # Create new sub-user
        sub_user = SubUser(
            owner_user_id=owner_user_id,
            email=request.email,
            first_name=request.first_name,
            last_name=request.last_name,
            age=request.age,
            sex=request.sex,
            ethnicity=request.ethnicity,
            country=request.country,
            province=request.province,
            respiratory_history=json.dumps([h.value for h in request.respiratory_history])
            if request.respiratory_history else None
        )
        
        db.add(sub_user)
        db.commit()
        db.refresh(sub_user)
        return sub_user
    
    @staticmethod
    def get_sub_user_by_id(db: Session, sub_user_id: int) -> SubUser:
        """Get sub-user by ID."""
        sub_user = db.query(SubUser).filter(
            SubUser.id == sub_user_id,
            SubUser.deleted_at.is_(None)
        ).first()
        
        if not sub_user:
            raise_not_found("Sub-user not found")
        return sub_user
    
    @staticmethod
    def get_sub_users_by_owner(
        db: Session, 
        owner_user_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> List[SubUser]:
        """Get all active sub-users for an owner."""
        return db.query(SubUser).filter(
            SubUser.owner_user_id == owner_user_id,
            SubUser.deleted_at.is_(None)
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_sub_user(
        db: Session, 
        sub_user_id: int, 
        request: SubUserUpdateRequest
    ) -> SubUser:
        """Update sub-user information."""
        sub_user = SubUserRepository.get_sub_user_by_id(db, sub_user_id)
        
        # Update basic fields
        update_data = request.dict(exclude_unset=True)
        
        # Handle respiratory history serialization
        if 'respiratory_history' in update_data:
            history = update_data['respiratory_history']
            update_data['respiratory_history'] = (
                json.dumps([h.value for h in history]) if history else None
            )
        
        for field, value in update_data.items():
            if hasattr(sub_user, field):
                setattr(sub_user, field, value)
        
        db.commit()
        db.refresh(sub_user)
        return sub_user
    
    @staticmethod
    def soft_delete_sub_user(db: Session, sub_user_id: int) -> SubUser:
        """Soft delete a sub-user."""
        sub_user = SubUserRepository.get_sub_user_by_id(db, sub_user_id)
        sub_user.soft_delete()
        db.commit()
        return sub_user
    
    @staticmethod
    def hard_delete_sub_user(db: Session, sub_user_id: int) -> None:
        """Hard delete a sub-user (permanent deletion)."""
        sub_user = db.query(SubUser).filter(SubUser.id == sub_user_id).first()
        if sub_user:
            db.delete(sub_user)
            db.commit()
    
    @staticmethod
    def count_sub_users_by_owner(db: Session, owner_user_id: int) -> int:
        """Count active sub-users for an owner."""
        return db.query(SubUser).filter(
            SubUser.owner_user_id == owner_user_id,
            SubUser.deleted_at.is_(None)
        ).count()
    
    @staticmethod
    def can_access_sub_user(db: Session, current_user, sub_user: SubUser) -> bool:
        """Check if current user can access the sub-user."""
        # Owner can access
        if current_user.user_id == sub_user.owner_user_id:
            return True
        
        # Admins can access
        if current_user.is_admin:
            return True
        
        # Assigned practitioners can access
        if current_user.is_practitioner:
            assignment = db.query(PractitionerAssignment).filter(
                PractitionerAssignment.practitioner_user_id == current_user.user_id,
                PractitionerAssignment.sub_user_id == sub_user.id,
                PractitionerAssignment.is_active == 1,
                PractitionerAssignment.deleted_at.is_(None)
            ).first()
            if assignment:
                return True
        
        return False

    @staticmethod
    def to_response(sub_user: SubUser) -> SubUserResponse:
        """Convert SubUser model to SubUserResponse schema."""
        # Parse respiratory history
        respiratory_history = None
        if sub_user.respiratory_history:
            try:
                respiratory_history = json.loads(sub_user.respiratory_history)
            except (json.JSONDecodeError, TypeError):
                respiratory_history = None
        
        return SubUserResponse(
            id=sub_user.id,
            owner_user_id=sub_user.owner_user_id,
            email=sub_user.email,
            first_name=sub_user.first_name,
            last_name=sub_user.last_name,
            age=sub_user.age,
            sex=sub_user.sex,
            ethnicity=sub_user.ethnicity,
            country=sub_user.country,
            province=sub_user.province,
            respiratory_history=respiratory_history,
            created_at=sub_user.created_at.isoformat() if sub_user.created_at else None,
            updated_at=sub_user.updated_at.isoformat() if sub_user.updated_at else None
        )
