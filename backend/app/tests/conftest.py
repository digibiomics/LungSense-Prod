from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.app import create_app
from app.sessions.db import engine, Base

# ensure model modules are imported so metadata includes their tables
import app.models.users  # registers users table
import app.models.practitioners  # registers practitioners table
import app.models.patients  # registers patients table


@pytest.fixture(scope="session")
def setup_db():
    # Create all tables in the sqlite in-memory DB used for tests
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(setup_db) -> TestClient:
    app = create_app()
    return TestClient(app)
