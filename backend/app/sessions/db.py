from __future__ import annotations

import json
import os
import sys
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.ext.declarative import declarative_base

from app.config.base import settings
from app.utils.exception_handler import DatabaseConnectionException

load_dotenv()

# Build database URL from env (no defaults)
if settings.DATABASE_URL:
    database_uri = settings.DATABASE_URL
else:
    database_uri = f"postgresql+psycopg2://{settings.DB_USERNAME}:{settings.DB_PASSWORD}@{settings.DB_HOSTNAME}:{settings.DB_PORT}/{settings.DB_NAME}"

# Use SQLite only when running pytest
if "PYTEST_CURRENT_TEST" in os.environ or "pytest" in sys.modules:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(database_uri)

metadata = MetaData()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Expose metadata for Alembic autogenerate
Base = declarative_base(metadata=metadata)
target_metadata = Base.metadata  # used by Alembic

# Test DB connection
try:
    with engine.connect() as conn:
        print("\n-------------------------- Database connected ----------------------------")
        print(f"DB URI: {database_uri}")
        print("-----------------------------------------------------------------------\n")
except Exception as e:
    raise DatabaseConnectionException(f"Failed to connect to database: {e}")

def create_local_session() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base = declarative_base(metadata=metadata)


