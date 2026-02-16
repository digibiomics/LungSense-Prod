from __future__ import annotations

from pydantic import BaseModel
from typing import Optional


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user_id: int
    role: str
    profile_completed: bool = False


class GoogleAuthResponse(BaseModel):
    """Response after Google OAuth callback."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    profile_completed: bool
    email: str
    first_name: str
    last_name: str
    profile_picture_url: Optional[str] = None
