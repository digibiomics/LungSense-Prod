from __future__ import annotations
from typing import Optional

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.sessions.db import create_local_session
from app.constants.enums import UserRole
from app.constants.jwt_utils import verify_token
from app.models.user import User

from app.utils.exception_handler import raise_unauthorized, raise_forbidden

security = HTTPBearer(auto_error=False)

class AuthenticatedUser:
    def __init__(self, user_id: int, email: str, role: str):
        self.user_id = user_id
        self.email = email
        self.role = role

    @property
    def is_patient(self) -> bool:
        return self.role == UserRole.PATIENT

    @property
    def is_practitioner(self) -> bool:
        return self.role == UserRole.PRACTITIONER

    @property
    def is_admin(self) -> bool:
        return self.role in [UserRole.DATA_ADMIN, UserRole.SUPER_ADMIN]

    @property
    def is_super_admin(self) -> bool:
        return self.role == UserRole.SUPER_ADMIN

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(create_local_session),
) -> AuthenticatedUser:

    if not credentials:
        raise_unauthorized("Not authenticated")

    token_data = verify_token(credentials.credentials)
    if not token_data:
        raise_unauthorized("Invalid authentication token")

    user = db.query(User).filter(
        User.id == token_data.user_id,
        User.deleted_at.is_(None)
    ).first()

    if not user:
        raise_forbidden("User not found or inactive")

    return AuthenticatedUser(
        user_id=token_data.user_id,
        email=token_data.email,
        role=token_data.role,
    )

def require_role(required_roles: list[UserRole]):
    def role_checker(current_user: AuthenticatedUser = Depends(get_current_user)):
        if current_user.role not in [role.value for role in required_roles]:
            raise_forbidden("Insufficient permissions")
        return current_user
    return role_checker

def require_ownership_or_admin(resource_user_id: int):
    def ownership_checker(current_user: AuthenticatedUser = Depends(get_current_user)):
        if current_user.user_id != resource_user_id and not current_user.is_admin:
            raise_forbidden("Access denied: not resource owner or admin")
        return current_user
    return ownership_checker

def require_patient_role():
    return require_role([UserRole.PATIENT])

def require_practitioner_role():
    return require_role([UserRole.PRACTITIONER])

def require_admin_role():
    return require_role([UserRole.DATA_ADMIN, UserRole.SUPER_ADMIN])

def require_super_admin_role():
    return require_role([UserRole.SUPER_ADMIN])

def optional_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(create_local_session),
) -> Optional[AuthenticatedUser]:

    if not credentials:
        return None

    try:
        return get_current_user(credentials, db)
    except Exception:
        return None
