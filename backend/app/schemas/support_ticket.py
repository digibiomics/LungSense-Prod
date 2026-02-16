from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from enum import Enum

class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class SupportTicketCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10)
    category: str
    email: EmailStr
    priority: TicketPriority = TicketPriority.MEDIUM

class SupportTicketResponse(BaseModel):
    id: int
    user_id: Optional[int]
    title: str
    description: str
    category: str
    priority: TicketPriority
    status: TicketStatus
    email: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
