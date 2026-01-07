from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.patients import PatientProfile
from app.daos.users import create_user


def create_patient(db: Session, *, email: str, password: str, first_name: str | None = None, last_name: str | None = None, country: str | None = None, province: str | None = None, ethnicity: str | None = None) -> PatientProfile:
    # create user with role 'patient'
    user = create_user(db, email=email, password=password, role="patient", first_name=first_name, last_name=last_name)

    profile = PatientProfile(user_id=user.id, country=country, province=province, ethnicity=ethnicity)
    db.add(profile)
    try:
        db.commit()
        db.refresh(profile)
    except IntegrityError:
        db.rollback()
        raise
    return profile


def get_patient_by_user(db: Session, user_id: int) -> PatientProfile | None:
    return db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()


def get_patient_by_id(db: Session, patient_id: int) -> PatientProfile | None:
    return db.query(PatientProfile).get(patient_id)


def list_patients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(PatientProfile).offset(skip).limit(limit).all()


def soft_delete_patient(db: Session, patient_id: int):
    profile = db.query(PatientProfile).get(patient_id)
    if profile:
        profile.user.is_deleted = True
        db.commit()
        return True
    return False


def hard_delete_patient(db: Session, patient_id: int):
    profile = db.query(PatientProfile).get(patient_id)
    if profile:
        db.delete(profile)
        db.delete(profile.user)
        db.commit()
        return True
    return False
