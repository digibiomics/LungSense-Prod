"""
Profile routes for user selection.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.utils.auth import AuthenticatedUser, get_current_user
from app.sessions.db import create_local_session
from app.constants.enums import ResponseStatus
from app.schemas.common import APIResponse
from app.schemas.profile import ProfileResponse, ProfileListResponse
from app.repository.user_repo import UserRepository
from app.repository.sub_user_repo import SubUserRepository

router = APIRouter()


@router.get("/profiles", response_model=APIResponse)
async def get_profiles(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Get all profiles (main user + sub-users) for selection."""
    profiles = []
    
    # Add main user profile
    user = UserRepository.get_user_by_id(db, current_user.user_id)
    profiles.append(ProfileResponse(
        id=user.id,
        type="user",
        first_name=user.first_name,
        last_name=user.last_name,
        age=user.age,
        sex=user.sex,
        ethnicity=user.ethnicity,
        country=user.country,
        province=user.province,
        is_primary=True
    ))
    
    # Add sub-users
    sub_users = SubUserRepository.get_sub_users_by_owner(db, current_user.user_id)
    for sub_user in sub_users:
        profiles.append(ProfileResponse(
            id=sub_user.id,
            type="sub_user",
            first_name=sub_user.first_name,
            last_name=sub_user.last_name,
            age=sub_user.age,
            sex=sub_user.sex,
            ethnicity=sub_user.ethnicity,
            country=sub_user.country,
            province=sub_user.province,
            is_primary=False
        ))
    
    response_data = ProfileListResponse(profiles=profiles)
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Profiles retrieved successfully",
        data=response_data.dict()
    )


@router.get("/profile/{profile_type}/{profile_id}", response_model=APIResponse)
async def get_profile_details(
    profile_type: str,
    profile_id: int,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Get specific profile demographics."""
    if profile_type == "user":
        user = UserRepository.get_user_by_id(db, profile_id)
        profile = ProfileResponse(
            id=user.id,
            type="user",
            first_name=user.first_name,
            last_name=user.last_name,
            age=user.age,
            sex=user.sex,
            ethnicity=user.ethnicity,
            country=user.country,
            province=user.province,
            is_primary=True
        )
    else:
        sub_user = SubUserRepository.get_sub_user_by_id(db, profile_id)
        profile = ProfileResponse(
            id=sub_user.id,
            type="sub_user",
            first_name=sub_user.first_name,
            last_name=sub_user.last_name,
            age=sub_user.age,
            sex=sub_user.sex,
            ethnicity=sub_user.ethnicity,
            country=sub_user.country,
            province=sub_user.province,
            is_primary=False
        )
    
    return APIResponse(
        status=ResponseStatus.SUCCESS,
        message="Profile retrieved successfully",
        data=profile.dict()
    )
