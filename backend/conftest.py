"""
Pytest configuration and fixtures for testing.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.app import create_app
from app.models.user import Base
from app.sessions.db import create_local_session
from app.constants.enums import UserRole
from app.constants.jwt_utils import create_access_token, hash_password
from app.models.user import User


# Test database (in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create test client with database override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app = create_app()
    app.dependency_overrides[create_local_session] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def test_patient(db_session):
    """Create a test patient user."""
    user = User(
        email="patient@test.com",
        first_name="Test",
        last_name="Patient",
        hashed_password=hash_password("testpass123"),
        role=UserRole.PATIENT,
        age=30,
        sex="M",
        ethnicity="CAU",
        profile_completed=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_practitioner(db_session):
    """Create a test practitioner user."""
    user = User(
        email="practitioner@test.com",
        first_name="Test",
        last_name="Practitioner",
        hashed_password=hash_password("testpass123"),
        role=UserRole.PRACTITIONER,
        age=35,
        sex="F",
        ethnicity="CAU",
        practitioner_id="PRAC001",
        institution="Test Hospital",
        profile_completed=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_admin(db_session):
    """Create a test admin user."""
    user = User(
        email="admin@test.com",
        first_name="Test",
        last_name="Admin",
        hashed_password=hash_password("adminpass123"),
        role=UserRole.SUPER_ADMIN,
        age=40,
        sex="O",
        ethnicity="UND",
        profile_completed=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def patient_token(test_patient):
    """Generate JWT token for test patient."""
    return create_access_token({
        "user_id": test_patient.id,
        "email": test_patient.email,
        "role": test_patient.role
    })


@pytest.fixture
def practitioner_token(test_practitioner):
    """Generate JWT token for test practitioner."""
    return create_access_token({
        "user_id": test_practitioner.id,
        "email": test_practitioner.email,
        "role": test_practitioner.role
    })


@pytest.fixture
def admin_token(test_admin):
    """Generate JWT token for test admin."""
    return create_access_token({
        "user_id": test_admin.id,
        "email": test_admin.email,
        "role": test_admin.role
    })
