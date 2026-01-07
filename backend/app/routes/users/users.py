from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.users.users_request import CreateUserRequest
from app.schemas.users.users_response import UserResponse
from app.daos.users import create_user, get_user_by_email
from app.sessions.db import create_local_session

users_router = APIRouter(prefix="/users", tags=["users"])


@users_router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_endpoint(payload: CreateUserRequest, db: Session = Depends(create_local_session)):
    # check duplicate
    existing = get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=409, detail="User with email already exists")

    user = create_user(db, email=payload.email, password=payload.password, first_name=payload.first_name, last_name=payload.last_name)
    return user
