from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.auth.auth_request import LoginRequest, SignupRequest
from app.schemas.auth.auth_response import TokenResponse
from app.daos.practitioners import create_practitioner, get_practitioner_by_user, list_practitioners, get_practitioner_by_id
from app.daos.users import authenticate_user
from app.utils.auth import create_access_token
from app.sessions.db import create_local_session

router = APIRouter(prefix="/api/practitioners", tags=["practitioners"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(create_local_session)):
    # check existing email
    existing = get_practitioner_by_user(db, payload.email) if False else None
    # create user + profile
    try:
        profile = create_practitioner(db, email=payload.email, password=payload.password, practitioner_id=f"PR-{payload.email}", first_name=payload.first_name, last_name=payload.last_name)
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
    return list_practitioners(db, skip=skip, limit=limit)


@router.get("/{practitioner_id}")
def get_by_practitioner_id(practitioner_id: str, db: Session = Depends(create_local_session)):
    p = get_practitioner_by_id(db, practitioner_id)
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    return p
