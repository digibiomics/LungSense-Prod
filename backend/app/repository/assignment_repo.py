"""
Assignment service layer for practitioner-sub-user assignments.
"""
from __future__ import annotations

from typing import List

from sqlalchemy.orm import Session

from app.utils.exception_handler import raise_conflict, raise_not_found
from app.models.practitioner_assignment import PractitionerAssignment
from app.schemas.assignment import (
    AssignmentCreateRequest,
    AssignmentResponse,
    AssignmentUpdateRequest
)


class AssignmentRepository:
    """Service for practitioner assignment operations."""

    @staticmethod
    def create_assignment(
        db: Session,
        practitioner_user_id: int,
        sub_user_id: int,
        notes: str = None
    ) -> PractitionerAssignment:
        """Create a new practitioner assignment."""
        # Check if assignment already exists and is active
        existing = db.query(PractitionerAssignment).filter(
            PractitionerAssignment.practitioner_user_id == practitioner_user_id,
            PractitionerAssignment.sub_user_id == sub_user_id,
            PractitionerAssignment.is_active == 1,
            PractitionerAssignment.deleted_at.is_(None)
        ).first()

        if existing:
            raise_conflict("Assignment already exists")

        assignment = PractitionerAssignment(
            practitioner_user_id=practitioner_user_id,
            sub_user_id=sub_user_id,
            notes=notes,
            is_active=1
        )

        db.add(assignment)
        db.commit()
        db.refresh(assignment)
        return assignment

    @staticmethod
    def get_assignment_by_id(db: Session, assignment_id: int) -> PractitionerAssignment:
        """Get assignment by ID."""
        assignment = db.query(PractitionerAssignment).filter(
            PractitionerAssignment.id == assignment_id,
            PractitionerAssignment.deleted_at.is_(None)
        ).first()

        if not assignment:
            raise_not_found("Assignment not found")
        return assignment

    @staticmethod
    def get_assignments_by_practitioner(
        db: Session, practitioner_user_id: int
    ) -> List[PractitionerAssignment]:
        """Get all assignments for a practitioner."""
        return db.query(PractitionerAssignment).filter(
            PractitionerAssignment.practitioner_user_id == practitioner_user_id,
            PractitionerAssignment.deleted_at.is_(None)
        ).all()

    @staticmethod
    def get_assignments_by_sub_user(
        db: Session, sub_user_id: int
    ) -> List[PractitionerAssignment]:
        """Get all assignments for a sub-user."""
        return db.query(PractitionerAssignment).filter(
            PractitionerAssignment.sub_user_id == sub_user_id,
            PractitionerAssignment.deleted_at.is_(None)
        ).all()

    @staticmethod
    def update_assignment(
        db: Session,
        assignment_id: int,
        request: AssignmentUpdateRequest
    ) -> PractitionerAssignment:
        """Update assignment information."""
        assignment = AssignmentRepository.get_assignment_by_id(db, assignment_id)

        update_data = request.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(assignment, field):
                setattr(assignment, field, value)

        db.commit()
        db.refresh(assignment)
        return assignment

    @staticmethod
    def delete_assignment(db: Session, assignment_id: int) -> None:
        """Soft delete an assignment."""
        assignment = AssignmentRepository.get_assignment_by_id(db, assignment_id)
        assignment.soft_delete()
        db.commit()

    @staticmethod
    def to_response(assignment: PractitionerAssignment) -> AssignmentResponse:
        """Convert PractitionerAssignment model to AssignmentResponse schema."""
        return AssignmentResponse(
            id=assignment.id,
            practitioner_user_id=assignment.practitioner_user_id,
            sub_user_id=assignment.sub_user_id,
            notes=assignment.notes,
            is_active=bool(assignment.is_active),
            created_at=assignment.created_at.isoformat() if assignment.created_at else None,
            updated_at=assignment.updated_at.isoformat() if assignment.updated_at else None
        )