"""
Script to create a practitioner account with email/password credentials.
Run: python create_practitioner.py
"""
import sys
import secrets
import string
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.sessions.db import create_local_session
from app.models.user import User
from app.constants.jwt_utils import hash_password
from app.constants.enums import UserRole


def generate_password(length: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$"
    while True:
        pwd = ''.join(secrets.choice(alphabet) for _ in range(length))
        if (any(c.islower() for c in pwd) and
                any(c.isupper() for c in pwd) and
                any(c.isdigit() for c in pwd)):
            return pwd


def create_practitioner():
    session_gen = create_local_session()
    db = next(session_gen)

    try:
        print("\n=== Create Practitioner Account ===\n")

        first_name = input("First name: ").strip()
        last_name  = input("Last name: ").strip()
        email      = input("Email: ").strip()
        institution = input("Institution/Hospital: ").strip()
        country    = input("Country: ").strip()
        province   = input("Province/State (leave blank if N/A): ").strip()

        if not all([first_name, last_name, email, institution, country]):
            print("First name, last name, email, institution and country are required.")
            return

        # Check email not already taken
        if db.query(User).filter(User.email == email).first():
            print(f"Email '{email}' is already registered.")
            return

        # Auto-generate practitioner_id: LS-DR-XXXXXX
        practitioner_id = "LS-DR-" + secrets.token_hex(3).upper()
        while db.query(User).filter(User.practitioner_id == practitioner_id).first():
            practitioner_id = "LS-DR-" + secrets.token_hex(3).upper()

        # Auto-generate password
        plain_password = generate_password()

        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            hashed_password=hash_password(plain_password),
            role=UserRole.PRACTITIONER,
            practitioner_id=practitioner_id,
            institution=institution,
            institution_location_country=country,
            institution_location_province=province or "N/A",
            profile_completed=True,
            age=30,
            sex="O",
            ethnicity="UND"
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        print("\n✅ Practitioner created successfully!")
        print("=" * 40)
        print(f"  Name            : {user.full_name}")
        print(f"  Email           : {email}")
        print(f"  Password        : {plain_password}")
        print(f"  Practitioner ID : {practitioner_id}")
        print(f"  Institution     : {institution}")
        print(f"  Login URL       : /auth/login?role=practitioner")
        print("=" * 40)
        print("⚠️  Share these credentials with the doctor securely.")
        print("   Password is shown only once and cannot be recovered.\n")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_practitioner()
