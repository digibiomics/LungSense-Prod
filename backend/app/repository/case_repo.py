"""
Case repository for case management.
"""
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.case import Case
from app.models.user import User
from app.constants.enums import UserRole


class CaseRepository:
    """Repository for case operations."""
    
    @staticmethod
    def get_available_practitioner(db: Session) -> Optional[User]:
        """Get practitioner with least assigned cases (round-robin)."""
        practitioner = (
            db.query(User)
            .filter(User.role == UserRole.PRACTITIONER, User.deleted_at.is_(None))
            .outerjoin(Case, User.id == Case.practitioner_id)
            .group_by(User.id)
            .order_by(func.count(Case.id).asc())
            .first()
        )
        return practitioner
    
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
