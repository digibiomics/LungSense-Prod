"""
Test admin login endpoint locally.
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from app.sessions.db import create_local_session
from app.repository.user_repo import UserRepository

def test_login(email, password):
    """Test admin login."""
    session_gen = create_local_session()
    db = next(session_gen)
    
    try:
        print(f"Testing login for: {email}")
        user = UserRepository.authenticate_user(db, email, password)
        
        if user:
            print(f"SUCCESS - Authentication works!")
            print(f"User ID: {user.id}")
            print(f"Role: {user.role}")
            return True
        else:
            print(f"FAILED - Invalid credentials")
            return False
            
    except Exception as e:
        print(f"ERROR: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python test_admin_login.py <email> <password>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    test_login(email, password)
