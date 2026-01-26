"""
Symptoms routes.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.sessions.db import create_local_session
from app.constants.enums import ResponseStatus
from app.schemas.common import APIResponse
from app.models.symptom import SymptomsMaster

router = APIRouter()


@router.get("/symptoms", response_model=APIResponse)
async def get_symptoms(db: Session = Depends(create_local_session)):
    """Get all symptoms from master list."""
    symptoms = db.query(SymptomsMaster).all()
    
    symptoms_data = [
        {"id": s.id, "name": s.name}
        for s in symptoms
    ]
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Symptoms retrieved successfully",
        data={"symptoms": symptoms_data}
    )
