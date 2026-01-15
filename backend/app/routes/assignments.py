"""
Practitioner assignment routes.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.utils.auth import (
    AuthenticatedUser,
    require_admin_role,
    require_practitioner_role
)
 
from app.sessions.db import create_local_session
from app.constants.enums import ResponseStatus
from app.utils.exception_handler import raise_bad_request, raise_forbidden
from app.schemas.assignment import (
    AssignmentCreateRequest,
    AssignmentResponse,
    AssignmentUpdateRequest
)
from app.schemas.common import APIResponse
from app.repository.assignment_repo import AssignmentRepository

router = APIRouter()


@router.post("/practitioner/assign/patient/{sub_user_id}", response_model=APIResponse)
async def assign_practitioner_to_patient(
    sub_user_id: int,
    request: AssignmentCreateRequest,
    current_user: AuthenticatedUser = Depends(require_practitioner_role()),
    db: Session = Depends(create_local_session)
):
    """Assign a practitioner to a sub-user (practitioner or admin only)."""
    try:
        assignment = AssignmentRepository.create_assignment(
            db,
            practitioner_user_id=current_user.user_id,
            sub_user_id=sub_user_id,
            notes=request.notes
        )
        
        response_data = AssignmentRepository.to_response(assignment)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="Practitioner assigned successfully",
            data=response_data.dict(),
            id=str(assignment.id)
        )
    except Exception as e:
        raise_bad_request(str(e))


@router.get("/practitioner/assignments", response_model=APIResponse)
async def list_practitioner_assignments(
    current_user: AuthenticatedUser = Depends(require_practitioner_role()),
    db: Session = Depends(create_local_session)
):
    """List assignments for current practitioner."""
    assignments = AssignmentRepository.get_assignments_by_practitioner(
        db, current_user.user_id
    )
    
    assignment_responses = [
        AssignmentRepository.to_response(assignment) for assignment in assignments
    ]
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Assignments retrieved successfully",
        data={"assignments": [r.dict() for r in assignment_responses]}
    )


@router.put("/practitioner/assignment/{assignment_id}", response_model=APIResponse)
async def update_assignment(
    assignment_id: int,
    request: AssignmentUpdateRequest,
    current_user: AuthenticatedUser = Depends(require_practitioner_role()),
    db: Session = Depends(create_local_session)
):
    """Update assignment (practitioner or admin only)."""
    assignment = AssignmentRepository.get_assignment_by_id(db, assignment_id)
    
    # Check ownership
    if assignment.practitioner_user_id != current_user.user_id and not current_user.is_admin:
        raise_forbidden("Access denied")
    
    try:
        updated_assignment = AssignmentRepository.update_assignment(
            db, assignment_id, request
        )
        response_data = AssignmentRepository.to_response(updated_assignment)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="Assignment updated successfully",
            data=response_data.dict()
        )
    except Exception as e:
        raise_bad_request(str(e))


@router.delete("/practitioner/assignment/{assignment_id}", response_model=APIResponse)
async def delete_assignment(
    assignment_id: int,
    current_user: AuthenticatedUser = Depends(require_practitioner_role()),
    db: Session = Depends(create_local_session)
):
    """Delete assignment (practitioner or admin only)."""
    assignment = AssignmentRepository.get_assignment_by_id(db, assignment_id)
    
    # Check ownership
    if assignment.practitioner_user_id != current_user.user_id and not current_user.is_admin:
        raise_forbidden("Access denied")
    
    AssignmentRepository.delete_assignment(db, assignment_id)
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Assignment deleted successfully"
    )
