# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.db.session import get_db
from app.schemas.auth import (
    PatientCreate, PractitionerCreate, LoginRequest, Token, UserRead
)
from app.crud.user import (
    get_user_by_email,
    create_patient,
    create_practitioner,
    get_user_by_id,
)
from app.services.security import hash_password, verify_password, create_access_token, decode_token

from datetime import datetime
from typing import Optional
from datetime import date

router = APIRouter(prefix="/auth", tags=["auth"])

def _parse_ddmmyyyy_to_date(s: Optional[str]) -> Optional[date]:
    if not s:
        return None
    try:
        return datetime.strptime(s, "%d-%m-%Y").date()
    except ValueError:
        return None

@router.post("/signup/patient", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def signup_patient(payload: PatientCreate, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(payload.password)

    # convert dd-mm-yyyy string from frontend to date
    birthdate = _parse_ddmmyyyy_to_date(payload.birthdate) if getattr(payload, "birthdate", None) else None
    if payload.birthdate and not birthdate:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid birthdate format. Expected dd-mm-yyyy")

    user = await create_patient(
        db,
        payload,
        hashed,
        birthdate=birthdate,
        ethnicity=payload.ethnicity,
        sex=payload.sex,
        practitioner_name=getattr(payload, "practitioner_name", None),
        consent=getattr(payload, "consent", False),
    )
    return user

@router.post("/signup/practitioner", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def signup_practitioner(payload: PractitionerCreate, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(payload.password)
    user = await create_practitioner(db, payload, hashed, consent=getattr(payload, "consent", False))
    return user

@router.post("/login", response_model=Token)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    # optional extra check for practitioner
    if payload.practitioner_id:
        if user.role != "practitioner" or str(payload.practitioner_id) != str(user.practitioner_id):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid practitioner ID")

    token, expires_in = create_access_token(subject=str(user.id), expires_minutes=60*24)
    return {"access_token": token, "token_type": "bearer", "expires_in": expires_in}

# OAuth2 token endpoint for Swagger UI (password grant)
@router.post("/token", response_model=Token)
async def token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token, expires_in = create_access_token(subject=str(user.id), expires_minutes=60*24)
    return {"access_token": token, "token_type": "bearer", "expires_in": expires_in}

# Swagger-friendly OAuth2 scheme (point to /auth/token)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = await get_user_by_id(db, int(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@router.get("/me", response_model=UserRead)
async def read_me(current_user = Depends(get_current_user)):
    return current_user
