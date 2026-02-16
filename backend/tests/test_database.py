"""
Database and model tests.
"""
import pytest
from app.models.user import User
from app.constants.enums import UserRole


def test_create_user(db_session):
    """Test creating a user in database."""
    user = User(
        email="newuser@test.com",
        first_name="New",
        last_name="User",
        role=UserRole.PATIENT,
        age=25,
        sex="F",
        ethnicity="CAU"
    )
    db_session.add(user)
    db_session.commit()
    
    assert user.id is not None
    assert user.email == "newuser@test.com"


def test_user_soft_delete(db_session, test_patient):
    """Test soft delete functionality."""
    user_id = test_patient.id
    
    # Soft delete
    from datetime import datetime
    test_patient.deleted_at = datetime.utcnow()
    db_session.commit()
    
    # Query should not find deleted user
    user = db_session.query(User).filter(
        User.id == user_id,
        User.deleted_at.is_(None)
    ).first()
    
    assert user is None


def test_user_unique_email(db_session, test_patient):
    """Test email uniqueness constraint."""
    duplicate_user = User(
        email="patient@test.com",  # Same as test_patient
        first_name="Duplicate",
        last_name="User",
        role=UserRole.PATIENT,
        age=30,
        sex="M",
        ethnicity="CAU"
    )
    db_session.add(duplicate_user)
    
    with pytest.raises(Exception):  # Should raise integrity error
        db_session.commit()
