from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.practitioners import PractitionerProfile
from app.daos.users import create_user, get_user_by_email


def create_practitioner(db: Session, *, email: str, password: str, practitioner_id: str, first_name: str | None = None, last_name: str | None = None, institution: str | None = None, institution_location: str | None = None) -> PractitionerProfile:
    # create user with role 'practitioner'
    user = create_user(db, email=email, password=password, role="practitioner", first_name=first_name, last_name=last_name)

    profile = PractitionerProfile(user_id=user.id, practitioner_id=practitioner_id, institution=institution, institution_location=institution_location)
    db.add(profile)
    try:
        db.commit()
        db.refresh(profile)
    except IntegrityError:
        db.rollback()
        raise
    return profile


def get_practitioner_by_user(db: Session, user_id: int) -> PractitionerProfile | None:
    return db.query(PractitionerProfile).filter(PractitionerProfile.user_id == user_id).first()


def get_practitioner_by_id(db: Session, practitioner_id: str) -> PractitionerProfile | None:
    return db.query(PractitionerProfile).filter(PractitionerProfile.practitioner_id == practitioner_id).first()


def list_practitioners(db: Session, skip: int = 0, limit: int = 100):
    return db.query(PractitionerProfile).offset(skip).limit(limit).all()


def soft_delete_practitioner(db: Session, practitioner_id: int):
    profile = db.query(PractitionerProfile).get(practitioner_id)
    if profile:
        # mark underlying user as deleted
        profile.user.is_deleted = True
        db.commit()
        return True
    return False


def hard_delete_practitioner(db: Session, practitioner_id: int):
    profile = db.query(PractitionerProfile).get(practitioner_id)
    if profile:
        db.delete(profile)
        db.delete(profile.user)
        db.commit()
        return True
    return False
