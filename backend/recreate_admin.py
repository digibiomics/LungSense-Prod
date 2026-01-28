"""
Script to delete existing admin and create new super admin.
"""
import sys
import os
from pathlib import Path

# Add the parent directory to the path so we can import app modules
sys.path.append(str(Path(__file__).parent))

from app.sessions.db import create_local_session
from app.models.user import User
from app.constants.enums import UserRole
import bcrypt

def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def recreate_admin():
    """Delete existing admin and create new one."""
    session_gen = create_local_session()
    db = next(session_gen)
    
    try:
        # Delete existing admin user
        existing_admin = db.query(User).filter(User.email == "afroze.mohammad25@gmail.com").first()
        if existing_admin:
            print(f"Deleting existing admin: {existing_admin.email}")
            db.delete(existing_admin)
            db.commit()
        
        # Get new admin details
        name = input("Enter admin full name: ").strip()
        email = input("Enter admin email (or press Enter for afroze.mohammad25@gmail.com): ").strip()
        if not email:
            email = "afroze.mohammad25@gmail.com"
        password = input("Enter admin password: ").strip()
        
        if not all([name, password]):
            print("Name and password are required!")
            return
        
        # Create new admin user
        hashed_password = hash_password(password)
        name_parts = name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        admin_user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            hashed_password=hashed_password,
            role=UserRole.SUPER_ADMIN,
            age=30,  # Default values
            sex="O",
            ethnicity="UND"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"\n✅ Super Admin created successfully!")
        print(f"ID: {admin_user.id}")
        print(f"Name: {admin_user.full_name}")
        print(f"Email: {admin_user.email}")
        print(f"Role: {admin_user.role}")
        print(f"\nYou can now login at: http://localhost:4173/admin/login")
        
    except Exception as e:
        print(f"Error: {e}")
        try:
            db.rollback()
        except:
            pass
    finally:
        try:
            db.close()
        except:
            pass

if __name__ == "__main__":
    recreate_admin()