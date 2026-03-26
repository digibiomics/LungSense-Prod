"""
Script to check admin user details.
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from app.sessions.db import create_local_session
from app.models.user import User
from app.constants.enums import UserRole

def check_admin():
    """Check admin user details."""
    session_gen = create_local_session()
    db = next(session_gen)
    
    try:
        admins = db.query(User).filter(
            User.role.in_([UserRole.DATA_ADMIN, UserRole.SUPER_ADMIN]),
            User.deleted_at.is_(None)
        ).all()
        
        if not admins:
            print("✗ No admin users found in database")
            return
        
        print(f"Found {len(admins)} admin user(s):\n")
        for admin in admins:
            print(f"ID: {admin.id}")
            print(f"Email: {admin.email}")
            print(f"Name: {admin.first_name} {admin.last_name}")
            print(f"Role: {admin.role}")
            print(f"Has Password: {'Yes' if admin.hashed_password else 'No'}")
            print(f"Google ID: {admin.google_id if admin.google_id else 'None'}")
            print("-" * 50)
        
    except Exception as e:
        print(f"✗ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_admin()
