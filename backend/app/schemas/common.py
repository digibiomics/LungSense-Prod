"""
Common schemas used across the application.
"""
from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel

from  app.constants.enums import ResponseStatus


class APIResponse(BaseModel):
    """Standard API response format."""
    status: ResponseStatus
    message: str
    data: Optional[Dict[str, Any]] = None
    id: Optional[str] = None
    code: Optional[int] = None
    details: Optional[Dict[str, Any]] = None


class PaginatedResponse(BaseModel):
    """Paginated response wrapper."""
    items: list
    total: int
    page: int
    per_page: int
    total_pages: Optional[int] = None