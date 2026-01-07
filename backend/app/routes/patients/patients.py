from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.auth.auth_request import LoginRequest
from app.schemas.auth.auth_response import TokenResponse
from app.schemas.patients import PatientSignupRequest, PatientResponse
from app.daos.patients import create_patient, get_patient_by_id, list_patients
from app.daos.users import authenticate_user
from app.utils.auth import create_access_token
from app.sessions.db import create_local_session

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: PatientSignupRequest, db: Session = Depends(create_local_session)):
    try:
        profile = create_patient(
            db,
            email=payload.email,
            password=payload.password,
            first_name=payload.first_name,
            last_name=payload.last_name,
            country=payload.country,
            province=payload.province,
            ethnicity=payload.ethnicity,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    token = create_access_token(subject=str(profile.user_id))
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(create_local_session)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)


@router.get("/", response_model=list)
def list_all(skip: int = 0, limit: int = 100, db: Session = Depends(create_local_session)):
    return list_patients(db, skip=skip, limit=limit)


@router.get("/{patient_id}", response_model=PatientResponse)
def get_by_patient_id(patient_id: int, db: Session = Depends(create_local_session)):
    p = get_patient_by_id(db, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    return p
