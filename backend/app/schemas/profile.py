"""
Profile schemas for user and sub-user selection.
"""
from typing import List, Optional
from pydantic import BaseModel


class ProfileResponse(BaseModel):
    """Profile response for selection screen."""
    id: int
    type: str  # "user" or "sub_user"
    first_name: str
    last_name: str
    age: Optional[int]
    sex: Optional[str]
    ethnicity: Optional[str]
    country: Optional[str]
    province: Optional[str]
    is_primary: bool = False
    
    class Config:
        from_attributes = True


class ProfileListResponse(BaseModel):
    """List of profiles."""
    profiles: List[ProfileResponse]
