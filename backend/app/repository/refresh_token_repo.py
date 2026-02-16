"""
Refresh token repository for OAuth2 token management.
"""
from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.utils.exception_handler import raise_unauthorized


class RefreshTokenRepository:
    """Repository for refresh token operations."""
    
    @staticmethod
    def create_refresh_token(
        db: Session,
        user_id: int,
        device_info: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> str:
        """Create a new refresh token."""
        # Generate secure random token
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        # Create refresh token record
        refresh_token = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
            device_info=device_info,
            ip_address=ip_address
        )
        
        db.add(refresh_token)
        db.commit()
        
        return token
    
    @staticmethod
    def verify_refresh_token(db: Session, token: str) -> Optional[RefreshToken]:
        """Verify and return refresh token if valid."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        refresh_token = db.query(RefreshToken).filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > datetime.now(timezone.utc)
        ).first()
        
        return refresh_token
    
    @staticmethod
    def rotate_refresh_token(
        db: Session,
        old_token: str,
        device_info: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Optional[str]:
        """Rotate refresh token (revoke old, create new)."""
        old_refresh_token = RefreshTokenRepository.verify_refresh_token(db, old_token)
        
        if not old_refresh_token:
            return None
        
        # Create new token
        new_token = RefreshTokenRepository.create_refresh_token(
            db,
            old_refresh_token.user_id,
            device_info,
            ip_address
        )
        
        # Revoke old token
        old_refresh_token.revoke()
        db.commit()
        
        return new_token
    
    @staticmethod
    def revoke_token(db: Session, token: str) -> bool:
        """Revoke a refresh token."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        refresh_token = db.query(RefreshToken).filter(
            RefreshToken.token_hash == token_hash
        ).first()
        
        if refresh_token:
            refresh_token.revoke()
            db.commit()
            return True
        
        return False
    
    @staticmethod
    def revoke_all_user_tokens(db: Session, user_id: int) -> int:
        """Revoke all refresh tokens for a user."""
        tokens = db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at.is_(None)
        ).all()
        
        count = 0
        for token in tokens:
            token.revoke()
            count += 1
        
        db.commit()
        return count
