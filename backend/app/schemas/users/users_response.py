from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
