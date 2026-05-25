"""
Script to create the default practitioner account for Gmail/individual patient assignments.
Run from backend directory: python create_default_practitioner.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.sessions.db import SessionLocal
from app.models.user import User
from app.constants.enums import UserRole
from app.constants.jwt_utils import hash_password

EMAIL = "mohammadafroze26@gmail.com"
PASSWORD = "Afroze@2025"  # Change this after first login
FIRST_NAME = "Mohammad"
LAST_NAME = "Afroze"
PRACTITIONER_ID = "AFROZE001"

db = SessionLocal()

try:
    existing = db.query(User).filter(User.email == EMAIL).first()
    if existing:
        print(f"User already exists: {EMAIL} (id={existing.id}, role={existing.role})")
    else:
        user = User(
            email=EMAIL,
            first_name=FIRST_NAME,
            last_name=LAST_NAME,
            hashed_password=hash_password(PASSWORD),
            role=UserRole.PRACTITIONER,
            practitioner_id=PRACTITIONER_ID,
            institution=None,  # No institution - this is the default/individual practitioner
            profile_completed=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created default practitioner: {EMAIL} (id={user.id})")
        print(f"Password: {PASSWORD}")
        print(f"IMPORTANT: Change the password after first login!")
finally:
    db.close()
