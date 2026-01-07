from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

import jwt
from passlib.context import CryptContext

import os
from app.config.base import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# allow SECRET_KEY from settings or env var; fall back to a development default
SECRET_KEY = getattr(settings, "SECRET_KEY", None) or os.environ.get("SECRET_KEY", "devsecret")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expires = datetime.utcnow() + (expires_delta or timedelta(minutes=60))
    payload = {"sub": subject, "exp": expires}
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])