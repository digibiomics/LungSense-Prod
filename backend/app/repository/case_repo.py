"""
Case repository for case management.
"""
import os
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.case import Case
from app.models.user import User
from app.constants.enums import UserRole


class CaseRepository:
    """Repository for case operations."""

    @staticmethod
    def get_available_practitioner(db: Session, institution: Optional[str] = None) -> Optional[User]:
        """Get practitioner by institution match, or fall back to default practitioner."""
        if institution:
            practitioner = (
                db.query(User)
                .filter(
                    User.role == UserRole.PRACTITIONER,
                    User.deleted_at.is_(None),
                    User.institution == institution
                )
                .first()
            )
            if practitioner:
                return practitioner

        # Fallback: default practitioner for Gmail/individual/no-institution users
        default_email = os.getenv("DEFAULT_PRACTITIONER_EMAIL")
        if default_email:
            return db.query(User).filter(
                User.email == default_email,
                User.deleted_at.is_(None)
            ).first()
        return None
    
    @staticmethod
    def create_case(
        db: Session,
        user_id: int,
        sub_user_id: Optional[int],
        practitioner_id: Optional[int]
    ) -> Case:
        """Create a new case with catalog number."""
        from app.utils.privacy_minimal import generate_patient_catalog
        
        catalog_number = generate_patient_catalog(user_id, sub_user_id)
        
        case = Case(
            catalog_number=catalog_number,
            user_id=user_id,
            sub_user_id=sub_user_id,
            practitioner_id=practitioner_id,
            status="submitted"
        )
        db.add(case)
        db.commit()
        db.refresh(case)
        return case
