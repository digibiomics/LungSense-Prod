"""
Unified authentication router with Google OAuth2 and admin login.
"""
from __future__ import annotations

import json
from typing import Optional

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.config.base import settings
from app.constants.enums import ResponseStatus, UserRole
from app.constants.jwt_utils import create_access_token, verify_token
from app.models.user import User
from app.repository.refresh_token_repo import RefreshTokenRepository
from app.repository.user_repo import UserRepository
from app.schemas.auth.auth_request import (
    CompleteProfileRequest,
    GoogleCallbackRequest,
    LoginRequest,
    RefreshTokenRequest
)
from app.schemas.auth.auth_response import GoogleAuthResponse, TokenResponse
from app.schemas.common import APIResponse
from app.sessions.db import create_local_session
from app.utils.auth import get_current_user, AuthenticatedUser
from app.utils.exception_handler import raise_bad_request, raise_unauthorized
from app.utils.google_oauth import exchange_code_for_token, get_google_user_info

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/google/callback", response_model=GoogleAuthResponse)
async def google_callback(
    request: GoogleCallbackRequest,
    db: Session = Depends(create_local_session)
):
    """
    Handle Google OAuth callback.
    - If user exists: return tokens
    - If new user: create user, return tokens with profile_completed=False
    """
    try:
        print(f"Received request: code={request.code[:50]}..., role={request.role}")
        
        # The 'code' field actually contains the JWT credential from @react-oauth/google
        jwt_credential = request.code
        
        # Verify the JWT token and get user info
        from app.utils.google_oauth import verify_google_token
        user_info = verify_google_token(jwt_credential)
        
        if not user_info:
            print("JWT verification failed")
            raise_bad_request("Invalid Google credential")
        
        print(f"User info from JWT: {user_info}")
        
        google_id = user_info.get("sub")  # 'sub' is the user ID in JWT
        email = user_info.get("email")
        first_name = user_info.get("given_name", "")
        last_name = user_info.get("family_name", "")
        picture = user_info.get("picture")
        
        print(f"Extracted: google_id={google_id}, email={email}, first_name={first_name}")
        
        if not google_id or not email:
            print(f"Missing required fields: google_id={google_id}, email={email}")
            raise_bad_request("Invalid user info from Google")
        
        # Check if user exists
        print(f"Checking for existing user with google_id={google_id}")
        user = db.query(User).filter(
            User.google_id == google_id,
            User.deleted_at.is_(None)
        ).first()
        
        if not user:
            print(f"No user found with google_id, checking email={email}")
            # Check by email (in case user signed up with email before)
            user = db.query(User).filter(
                User.email == email,
                User.deleted_at.is_(None)
            ).first()
            
            if user:
                print(f"Found existing user by email, linking Google account")
                # Link Google account to existing user
                user.google_id = google_id
                user.profile_picture_url = picture
            else:
                # Check if deleted user exists
                deleted_user = db.query(User).filter(
                    (User.google_id == google_id) | (User.email == email),
                    User.deleted_at.isnot(None)
                ).first()
                
                if deleted_user:
                    print(f"Found deleted user account for {email}")
                    raise_bad_request("Your account has been deleted. Please contact support if you believe this is an error.")
                
                print(f"Creating new user with role={request.role}")
                # Create new user
                role = UserRole.PATIENT if request.role == "patient" else UserRole.PRACTITIONER
                user = User(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    google_id=google_id,
                    profile_picture_url=picture,
                    role=role,
                    profile_completed=False
                )
                db.add(user)
            
            print("Committing user changes")
            db.commit()
            db.refresh(user)
        else:
            print(f"Found existing user: id={user.id}, profile_completed={user.profile_completed}")
        
        print(f"User ready: id={user.id}, email={user.email}, role={user.role}")
        
        # Generate JWT tokens
        jwt_access_token = create_access_token({
            "user_id": user.id,
            "email": user.email,
            "role": user.role
        })
        
        # Skip refresh token for now - table doesn't exist
        refresh_token = "temp_refresh_token"
        
        print(f"Generated tokens successfully")
        
        response = GoogleAuthResponse(
            access_token=jwt_access_token,
            refresh_token=refresh_token,
            user_id=user.id,
            role=user.role,
            profile_completed=user.profile_completed,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            profile_picture_url=user.profile_picture_url
        )
        
        print(f"Returning response: user_id={response.user_id}, profile_completed={response.profile_completed}")
        return response
        
    except Exception as e:
        print(f"Exception in google_callback: {e}")
        import traceback
        traceback.print_exc()
        raise_bad_request(f"Google authentication failed: {str(e)}")


@router.post("/google/complete-profile", response_model=APIResponse)
async def complete_profile(
    request: CompleteProfileRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """
    Complete user profile after Google OAuth.
    Creates main user profile + optional sub-users atomically.
    """
    try:
        print(f"Complete profile request for user_id={current_user.user_id}")
        print(f"Request: age={request.age}, sex={request.sex}, ethnicity={request.ethnicity}")
        
        user = db.query(User).filter(
            User.id == current_user.user_id,
            User.deleted_at.is_(None)
        ).first()
        
        if not user:
            raise_bad_request("User not found or account has been deleted")
        
        # Allow re-completion if profile is not completed
        # if user.profile_completed:
        #     raise_bad_request("Profile already completed")
        
        # Update main user profile
        user.age = request.age
        user.sex = request.sex.value
        user.ethnicity = request.ethnicity.value
        user.country = request.country
        user.province = request.province
        user.respiratory_history = json.dumps([h.value for h in request.respiratory_history])
        
        # Update practitioner fields if applicable
        if user.role == UserRole.PRACTITIONER:
            if not request.practitioner_id or not request.institution:
                raise_bad_request("Practitioner ID and institution are required")
            
            user.practitioner_id = request.practitioner_id
            user.institution = request.institution
            user.institution_location_country = request.institution_location_country
            user.institution_location_province = request.institution_location_province
        
        user.profile_completed = True
        
        # Delete existing sub-users if re-completing profile
        from app.models.sub_user import SubUser
        db.query(SubUser).filter(SubUser.owner_user_id == user.id).delete()
        
        # Create sub-users if provided
        if request.sub_users:
            from app.models.sub_user import SubUser
            
            for sub_user_data in request.sub_users:
                sub_user = SubUser(
                    owner_user_id=user.id,
                    email=f"{user.email}+{sub_user_data.first_name.lower()}",  # Generate unique email
                    first_name=sub_user_data.first_name,
                    last_name=sub_user_data.last_name,
                    age=sub_user_data.age,
                    sex=sub_user_data.sex.value,
                    ethnicity=sub_user_data.ethnicity.value,
                    country=sub_user_data.country,
                    province=sub_user_data.province,
                    respiratory_history=json.dumps([h.value for h in sub_user_data.respiratory_history])
                )
                db.add(sub_user)
        
        db.commit()
        db.refresh(user)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="Profile completed successfully",
            data={"profile_completed": True, "user_id": user.id}
        )
        
    except Exception as e:
        print(f"Profile completion error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise_bad_request(f"Failed to complete profile: {str(e)}")


@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(
    request: LoginRequest,
    db: Session = Depends(create_local_session)
):
    """Admin login with email/password (DATA_ADMIN and SUPER_ADMIN only)."""
    print(f"Admin login attempt: {request.email}")
    
    user = UserRepository.authenticate_user(db, request.email, request.password)
    
    if not user:
        print(f"Authentication failed for {request.email}")
        raise_unauthorized("Invalid credentials")
    
    print(f"User authenticated: {user.email}, role: {user.role}")
    
    # Only allow admin roles
    if user.role not in [UserRole.DATA_ADMIN, UserRole.SUPER_ADMIN]:
        print(f"Non-admin role attempted login: {user.role}")
        raise_unauthorized("Admin access only")
    
    # Generate tokens
    access_token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    })
    
    # Use temp refresh token since table doesn't exist
    refresh_token = "temp_refresh_token"
    
    print(f"Login successful for {user.email}")
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        role=user.role,
        profile_completed=True
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    request: RefreshTokenRequest,
    db: Session = Depends(create_local_session)
):
    """Refresh access token using refresh token."""
    try:
        # Verify refresh token
        refresh_token_record = RefreshTokenRepository.verify_refresh_token(
            db, request.refresh_token
        )
        
        if not refresh_token_record:
            raise_unauthorized("Invalid or expired refresh token")
        
        # Get user
        user = db.query(User).filter(
            User.id == refresh_token_record.user_id,
            User.deleted_at.is_(None)
        ).first()
        
        if not user:
            raise_unauthorized("User not found")
        
        # Generate new access token
        access_token = create_access_token({
            "user_id": user.id,
            "email": user.email,
            "role": user.role
        })
        
        # Rotate refresh token
        new_refresh_token = RefreshTokenRepository.rotate_refresh_token(
            db, request.refresh_token
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            user_id=user.id,
            role=user.role,
            profile_completed=user.profile_completed
        )
        
    except Exception as e:
        raise_unauthorized(f"Token refresh failed: {str(e)}")


@router.post("/logout", response_model=APIResponse)
async def logout(
    request: RefreshTokenRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Logout user by revoking refresh token."""
    try:
        RefreshTokenRepository.revoke_token(db, request.refresh_token)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message="Logged out successfully"
        )
    except Exception as e:
        raise_bad_request(f"Logout failed: {str(e)}")


@router.post("/logout-all", response_model=APIResponse)
async def logout_all_devices(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(create_local_session)
):
    """Logout from all devices by revoking all refresh tokens."""
    try:
        count = RefreshTokenRepository.revoke_all_user_tokens(db, current_user.user_id)
        
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message=f"Logged out from {count} device(s)"
        )
    except Exception as e:
        raise_bad_request(f"Logout failed: {str(e)}")
