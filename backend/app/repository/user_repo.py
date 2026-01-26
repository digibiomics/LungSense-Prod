"""
User service layer for business logic.
"""
from __future__ import annotations

import json
from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.constants.enums import UserRole
from app.utils.exception_handler import raise_conflict, raise_not_found
from app.constants.jwt_utils import hash_password, verify_password
from app.models.user import User
from app.schemas.user import (
    AdminUserCreateRequest,
    PatientSignupRequest,
    PractitionerSignupRequest,
    UserResponse,
    UserUpdateRequest
)


class UserRepository:
    """Service for user operations."""
    
    @staticmethod
    def create_patient(db: Session, request: PatientSignupRequest) -> User:
        """Create a new patient user."""
        # Check if email already exists
        existing = db.query(User).filter(
            or_(User.email == request.email, User.deleted_at.is_not(None))
        ).first()
        
        if existing:
            if existing.deleted_at:
                # Reactivate soft-deleted user
                existing.restore()
                existing.first_name = request.first_name
                existing.last_name = request.last_name
                existing.hashed_password = hash_password(request.password)
                existing.role = UserRole.PATIENT
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
        
        # Create new user
        user = User(
            email=request.email,
            first_name=request.first_name,
            last_name=request.last_name,
            hashed_password=hash_password(request.password),
            role=UserRole.PATIENT,
            age=request.age,
            sex=request.sex,
            ethnicity=request.ethnicity,
            country=request.country,
            province=request.province,
            respiratory_history=json.dumps([h.value for h in request.respiratory_history])
            if request.respiratory_history else None
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def create_practitioner(db: Session, request: PractitionerSignupRequest) -> User:
        """Create a new practitioner user."""
        # Check if email or practitioner_id already exists
        existing = db.query(User).filter(
            or_(
                User.email == request.email,
                User.practitioner_id == request.practitioner_id,
                User.deleted_at.is_not(None)
            )
        ).first()
        
        if existing:
            if existing.deleted_at:
                # Reactivate soft-deleted user
                existing.restore()
                existing.first_name = request.first_name
                existing.last_name = request.last_name
                existing.hashed_password = hash_password(request.password)
                existing.role = UserRole.PRACTITIONER
                existing.practitioner_id = request.practitioner_id
                existing.institution = request.institution
                existing.institution_location_country = request.institution_location_country
                existing.institution_location_province = request.institution_location_province
                db.commit()
                db.refresh(existing)
                return existing
            else:
                if existing.email == request.email:
                    raise_conflict("Email already registered")
                else:
                    raise_conflict("Practitioner ID already exists")
        
        # Create new user
        user = User(
            email=request.email,
            first_name=request.first_name,
            last_name=request.last_name,
            hashed_password=hash_password(request.password),
            role=UserRole.PRACTITIONER,
            practitioner_id=request.practitioner_id,
            institution=request.institution,
            institution_location_country=request.institution_location_country,
            institution_location_province=request.institution_location_province
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def create_admin_user(
        db: Session, 
        request: AdminUserCreateRequest,
        created_by: int
    ) -> User:
        """Create an admin user (only SUPER_ADMIN can create other admins)."""
        # Check if email already exists
        existing = db.query(User).filter(User.email == request.email).first()
        if existing:
            raise_conflict("Email already registered")
        
        user = User(
            email=request.email,
            first_name=request.first_name,
            last_name=request.last_name,
            hashed_password=hash_password(request.password),
            role=request.role
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = db.query(User).filter(
            User.email == email,
            User.deleted_at.is_(None)
        ).first()
        
        if user and verify_password(password, user.hashed_password):
            return user
        return None
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """Get user by ID."""
        user = db.query(User).filter(
            User.id == user_id,
            User.deleted_at.is_(None)
        ).first()
        
        if not user:
            raise_not_found("User not found")
        return user
    
    @staticmethod
    def get_users(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        role_filter: Optional[str] = None
    ) -> List[User]:
        """Get users with optional filtering."""
        query = db.query(User).filter(User.deleted_at.is_(None))
        
        if role_filter:
            query = query.filter(User.role == role_filter)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def update_user(db: Session, user_id: int, request: UserUpdateRequest) -> User:
        """Update user information."""
        user = UserRepository.get_user_by_id(db, user_id)
        
        # Update basic fields
        update_data = request.dict(exclude_unset=True)
        
        # Handle respiratory history serialization
        if 'respiratory_history' in update_data:
            history = update_data['respiratory_history']
            update_data['respiratory_history'] = (
                json.dumps([h.value for h in history]) if history else None
            )
        
        for field, value in update_data.items():
            if hasattr(user, field):
                setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def update_user_dashboard(db: Session, user_id: int, age: Optional[int], sex: Optional[str], ethnicity: Optional[str]) -> User:
        """Update user demographics for dashboard (age, sex, ethnicity only)."""
        user = UserRepository.get_user_by_id(db, user_id)
        
        # Update only the provided fields
        if age is not None:
            user.age = age
        if sex is not None:
            user.sex = sex
        if ethnicity is not None:
            user.ethnicity = ethnicity
        
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def soft_delete_user(db: Session, user_id: int) -> User:
        """Soft delete a user."""
        user = UserRepository.get_user_by_id(db, user_id)
        user.soft_delete()
        db.commit()
        return user
    
    @staticmethod
    def hard_delete_user(db: Session, user_id: int) -> None:
        """Hard delete a user (permanent deletion)."""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db.delete(user)
            db.commit()
    
    @staticmethod
    def restore_user(db: Session, user_id: int) -> User:
        """Restore a soft-deleted user."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise_not_found("User not found")
        
        user.restore()
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def count_users(db: Session, role_filter: Optional[str] = None) -> int:
        """Count users with optional role filter."""
        query = db.query(User).filter(User.deleted_at.is_(None))
        if role_filter:
            query = query.filter(User.role == role_filter)
        return query.count()
    
    @staticmethod
    def to_response(user: User) -> UserResponse:
        """Convert User model to UserResponse schema."""
        # Parse respiratory history
        respiratory_history = None
        if user.respiratory_history:
            try:
                respiratory_history = json.loads(user.respiratory_history)
            except (json.JSONDecodeError, TypeError):
                respiratory_history = None
        
        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            created_at=user.created_at.isoformat() if user.created_at else None,
            updated_at=user.updated_at.isoformat() if user.updated_at else None,
            age=user.age,
            sex=user.sex,
            ethnicity=user.ethnicity,
            country=user.country,
            province=user.province,
            respiratory_history=respiratory_history,
            practitioner_id=user.practitioner_id,
            institution=user.institution,
            institution_location_country=user.institution_location_country,
            institution_location_province=user.institution_location_province
        )
