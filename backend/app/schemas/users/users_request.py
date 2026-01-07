from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    first_name: str | None = None
    last_name: str | None = None

    class Config:
        from_attributes = True
