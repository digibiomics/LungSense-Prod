"""
Refresh Token model for OAuth2 token rotation.
"""
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.sessions.db import Base


class RefreshToken(Base):
    """Refresh token model for OAuth2 authentication."""
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    replaced_by_token_id = Column(Integer, ForeignKey("refresh_tokens.id"), nullable=True)
    device_info = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", backref="refresh_tokens")

    def __repr__(self) -> str:
        return f"<RefreshToken(id={self.id}, user_id={self.user_id}, expires_at={self.expires_at})>"

    @property
    def is_valid(self) -> bool:
        """Check if token is valid (not expired and not revoked)."""
        return (
            self.revoked_at is None and
            self.expires_at > datetime.now(datetime.timezone.utc)
        )

    def revoke(self, replaced_by_id: int = None) -> None:
        """Revoke this refresh token."""
        self.revoked_at = datetime.now(datetime.timezone.utc)
        if replaced_by_id:
            self.replaced_by_token_id = replaced_by_id
