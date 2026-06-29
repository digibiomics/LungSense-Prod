from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str | None = None
    last_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
