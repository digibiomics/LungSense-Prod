"""
Script to create admin user.
Run this once to create the first admin user.
"""
import sys
import os
from pathlib import Path

# Add the parent directory to the path so we can import app modules
sys.path.append(str(Path(__file__).parent))

from app.sessions.db import create_local_session
from app.models.user import User
from app.constants.jwt_utils import hash_password
from app.constants.enums import UserRole

def create_admin_user():
    """Create admin user."""
    session_gen = create_local_session()
    db = next(session_gen)
    
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(
            (User.role == UserRole.DATA_ADMIN) | (User.role == UserRole.SUPER_ADMIN)
        ).first()
        if existing_admin:
            print(f"Admin user already exists: {existing_admin.email}")
            return
        
        # Get admin details
        name = input("Enter admin name: ").strip()
        email = input("Enter admin email: ").strip()
        password = input("Enter admin password: ").strip()
        
        if not all([name, email, password]):
            print("All fields are required!")
            return
        
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print("Email already exists!")
            return
        
        # Create admin user
        hashed_password = hash_password(password)
        admin_user = User(
            first_name=name.split()[0] if name.split() else name,
            last_name=" ".join(name.split()[1:]) if len(name.split()) > 1 else "",
            email=email,
            hashed_password=hashed_password,
            role=UserRole.SUPER_ADMIN,  # Use SUPER_ADMIN instead of ADMIN
            age=30,  # Default values
            sex="O",  # O for Other (1 character)
            ethnicity="UND"  # UND for Undisclosed (3 characters)
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"Admin user created successfully!")
        print(f"ID: {admin_user.id}")
        print(f"Name: {admin_user.first_name} {admin_user.last_name}")
        print(f"Email: {admin_user.email}")
        print(f"Role: {admin_user.role}")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
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
    create_admin_user()