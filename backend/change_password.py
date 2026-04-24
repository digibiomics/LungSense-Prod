"""
Script to change/reset a practitioner's password.
Run: python change_password.py
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.sessions.db import create_local_session
from app.models.user import User
from app.constants.jwt_utils import hash_password
import getpass


def change_password():
    session_gen = create_local_session()
    db = next(session_gen)

    try:
        print("\n=== Change User Password ===\n")

        search_by = input("Search by (1) Email or (2) User ID? Enter 1 or 2: ").strip()

        user = None
        if search_by == "1":
            email = input("Enter user email: ").strip()
            user = db.query(User).filter(
                User.email == email,
                User.deleted_at.is_(None)
            ).first()
            if not user:
                print(f"No active user found with email '{email}'.")
                return
        elif search_by == "2":
            user_id = input("Enter user ID: ").strip()
            if not user_id.isdigit():
                print("User ID must be a number.")
                return
            user = db.query(User).filter(
                User.id == int(user_id),
                User.deleted_at.is_(None)
            ).first()
            if not user:
                print(f"No active user found with ID '{user_id}'.")
                return
        else:
            print("Invalid option.")
            return

        print(f"\nFound: {user.full_name} | Role: {user.role}")

        # Use getpass so password isn't visible while typing
        new_password = getpass.getpass("New password: ")
        confirm     = getpass.getpass("Confirm password: ")

        if new_password != confirm:
            print("Passwords do not match.")
            return

        if len(new_password) < 8:
            print("Password must be at least 8 characters.")
            return

        user.hashed_password = hash_password(new_password)
        db.commit()

        print(f"\n✅ Password updated successfully for {user.full_name} ({user.email})\n")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    change_password()
