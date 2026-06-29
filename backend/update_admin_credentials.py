import os
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from app.sessions.db import SessionLocal
from app.models.user import User
from app.constants.jwt_utils import hash_password

db = SessionLocal()

try:
    print("=== Update Admin Credentials ===")
    old_email = input("Enter current admin email (e.g. ayesha.khan@gmail.com): ").strip()
    
    user = db.query(User).filter(User.email == old_email).first()
    if not user:
        print(f"No user found with email '{old_email}'")
        sys.exit(0)
        
    print(f"Found user: {user.first_name} {user.last_name} | Role: {user.role}")
    
    new_email = input(f"Enter new email (leave blank to keep '{user.email}'): ").strip()
    new_password = input("Enter new password (leave blank to keep current): ").strip()
    
    if new_email:
        # Check if the new email is already taken by someone else
        existing = db.query(User).filter(User.email == new_email).first()
        if existing and existing.id != user.id:
            print(f"Error: Email '{new_email}' is already taken by another user!")
            sys.exit(0)
        user.email = new_email
        print(f"Updating email to: {new_email}")
        
    if new_password:
        if len(new_password) < 8:
            print("Error: Password must be at least 8 characters.")
            sys.exit(0)
        user.hashed_password = hash_password(new_password)
        print("Updating password...")
        
    if new_email or new_password:
        db.commit()
        print("\n✅ Admin credentials updated successfully!")
    else:
        print("\nNo updates made.")
        
except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()
