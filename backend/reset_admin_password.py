"""
Script to reset admin password.
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from app.sessions.db import create_local_session
from app.models.user import User
from app.constants.jwt_utils import hash_password
from app.constants.enums import UserRole

def reset_admin_password():
    """Reset admin password."""
    session_gen = create_local_session()
    db = next(session_gen)
    
    try:
        email = input("Enter admin email: ").strip()
        new_password = input("Enter new password: ").strip()
        
        admin = db.query(User).filter(
            User.email == email,
            User.deleted_at.is_(None)
        ).first()
        
        if not admin:
            print(f"✗ Admin user not found: {email}")
            return
        
        if admin.role not in [UserRole.DATA_ADMIN, UserRole.SUPER_ADMIN]:
            print(f"✗ User is not an admin. Role: {admin.role}")
            return
        
        admin.hashed_password = hash_password(new_password)
        db.commit()
        
        print(f"\n✓ Password reset successful!")
        print(f"Email: {admin.email}")
        print(f"Role: {admin.role}")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()
