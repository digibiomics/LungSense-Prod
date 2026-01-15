from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union

import bcrypt
from jose import JWTError, jwt
from pydantic import BaseModel

from app.constants.enums import UserRole  # enum source ✔
from app.config.base import settings  # DB + JWT settings source of truth ✔


class TokenData(BaseModel):
    """Data extracted from JWT token."""
    user_id: int
    email: str
    role: UserRole
    exp: datetime


def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(password.encode(), salt).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password hash."""
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create JWT access token."""
    payload = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=30)
    )

    payload.update({"exp": expire.timestamp()})

    return jwt.encode(
        payload,
        settings.SECRET_KEY,  # use SECRET_KEY ✔
        algorithm="HS256"  # standard algorithm ✔
    )


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token."""
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)

    payload.update({"exp": expire.timestamp()})

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )


def verify_token(token: str) -> Optional[TokenData]:
    """Decode and verify JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = payload.get("user_id")
        email = payload.get("email")
        role = payload.get("role")
        exp_ts = payload.get("exp")

        if not user_id or not email or not role or not exp_ts:
            return None

        exp = datetime.fromtimestamp(exp_ts, tz=timezone.utc)

        if datetime.now(timezone.utc) >= exp:
            return None  # expired

        return TokenData(
            user_id=user_id,
            email=email,
            role=UserRole(role),  # convert string → enum ✔
            exp=exp
        )

    except (JWTError, ValueError):
        return None


def is_token_expired(exp: Union[datetime, str]) -> bool:
    """Check expiration."""
    if isinstance(exp, str):
        exp = datetime.fromisoformat(exp)

    return datetime.now(timezone.utc) >= exp
