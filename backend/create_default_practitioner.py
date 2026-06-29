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

EMAIL = "admin.lungsense@practitioner@gamil.com"
PASSWORD = "casetest"  # Change this after first login
FIRST_NAME = "Default"
LAST_NAME = "Practitioner"
PRACTITIONER_ID = "111"

db = SessionLocal()

try:
    existing_by_email = db.query(User).filter(User.email == EMAIL).first()
    existing_by_id = db.query(User).filter(User.practitioner_id == PRACTITIONER_ID).first()
    
    if existing_by_email:
        print(f"User with email {EMAIL} already exists (id={existing_by_email.id}). Updating credentials...")
        existing_by_email.practitioner_id = PRACTITIONER_ID
        existing_by_email.hashed_password = hash_password(PASSWORD)
        existing_by_email.role = UserRole.PRACTITIONER
        existing_by_email.profile_completed = True
        
        # If another user had this ID, set their ID to None or a random one to avoid conflict
        if existing_by_id and existing_by_id.id != existing_by_email.id:
            print(f"Removing duplicate practitioner ID {PRACTITIONER_ID} from user {existing_by_id.email}")
            existing_by_id.practitioner_id = None
            
        db.commit()
        db.refresh(existing_by_email)
        print(f"Successfully updated default practitioner: {EMAIL} (id={existing_by_email.id})")
        print(f"Password: {PASSWORD}")
        
    elif existing_by_id:
        print(f"User with practitioner ID {PRACTITIONER_ID} exists under email {existing_by_id.email}. Updating email...")
        existing_by_id.email = EMAIL
        existing_by_id.hashed_password = hash_password(PASSWORD)
        existing_by_id.role = UserRole.PRACTITIONER
        existing_by_id.profile_completed = True
        db.commit()
        db.refresh(existing_by_id)
        print(f"Successfully updated default practitioner: {EMAIL} (id={existing_by_id.id})")
        print(f"Password: {PASSWORD}")
        
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
