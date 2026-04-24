"""
Script to create a patient account with email/password credentials.
Run: python create_patient.py
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


def create_patient():
    session_gen = create_local_session()
    db = next(session_gen)

    try:
        print("\n=== Create Patient Account ===\n")

        first_name = input("First name: ").strip()
        last_name  = input("Last name: ").strip()
        email      = input("Email (leave blank to skip): ").strip() or None
        age        = input("Age: ").strip()
        sex        = input("Sex (M/F/O): ").strip().upper()
        ethnicity  = input("Ethnicity (AFR/ASN/CAU/HIS/MDE/MIX/UND): ").strip().upper()
        country    = input("Country: ").strip()
        province   = input("Province/State (leave blank if N/A): ").strip()

        if not all([first_name, last_name, age, sex, country]):
            print("First name, last name, age, sex and country are required.")
            return

        if sex not in ["M", "F", "O"]:
            print("Sex must be M, F or O.")
            return

        if ethnicity not in ["AFR", "ASN", "CAU", "HIS", "MDE", "MIX", "UND"]:
            print("Invalid ethnicity code.")
            return

        if not age.isdigit() or int(age) <= 0:
            print("Age must be a positive number.")
            return

        # Check email not already taken
        if email and db.query(User).filter(User.email == email).first():
            print(f"Email '{email}' is already registered.")
            return

        # If no email provided generate a placeholder
        if not email:
            email = f"patient_{secrets.token_hex(4)}@lungsense.local"
            print(f"No email provided — assigned placeholder: {email}")

        plain_password = generate_password()

        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            hashed_password=hash_password(plain_password),
            role=UserRole.PATIENT,
            age=int(age),
            sex=sex,
            ethnicity=ethnicity,
            country=country,
            province=province or "N/A",
            profile_completed=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        print("\n✅ Patient created successfully!")
        print("=" * 40)
        print(f"  Name      : {user.full_name}")
        print(f"  Email     : {email}")
        print(f"  Password  : {plain_password}")
        print(f"  Patient ID: {user.id}")
        print(f"  Login URL : /auth/login?role=patient")
        print("=" * 40)
        print("⚠️  Share these credentials securely.")
        print("   Password is shown only once and cannot be recovered.\n")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_patient()
