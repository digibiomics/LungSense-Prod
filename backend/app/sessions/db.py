from __future__ import annotations

import json
import os
import sys
import time
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.exc import OperationalError, DisconnectionError

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
    # Adjusted for db.t3.micro (max ~85 connections)
    engine = create_engine(
        database_uri,
        pool_size=10,
        max_overflow=15,
        pool_pre_ping=True,
        pool_recycle=1800,
        pool_timeout=30,
        connect_args={
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5
        }
    )
    
    @event.listens_for(engine, "connect")
    def receive_connect(dbapi_conn, connection_record):
        connection_record.info['pid'] = os.getpid()
    
    @event.listens_for(engine, "checkout")
    def receive_checkout(dbapi_conn, connection_record, connection_proxy):
        pid = os.getpid()
        if connection_record.info['pid'] != pid:
            connection_record.dbapi_connection = connection_proxy.dbapi_connection = None
            raise DisconnectionError("Connection record belongs to different process")

metadata = MetaData()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Expose metadata for Alembic autogenerate
Base = declarative_base(metadata=metadata)
target_metadata = Base.metadata  # used by Alembic

# Test DB connection (commented out to allow imports without connection)
# try:
#     with engine.connect() as conn:
#         print("\n-------------------------- Database connected ----------------------------")
#         print(f"DB URI: {database_uri}")
#         print("-----------------------------------------------------------------------\n")
# except Exception as e:
#     raise DatabaseConnectionException(f"Failed to connect to database: {e}")

def create_local_session() -> Generator[Session, None, None]:
    max_retries = 3
    retry_delay = 1
    
    for attempt in range(max_retries):
        try:
            db = SessionLocal()
            yield db
            break
        except (OperationalError, DisconnectionError) as e:
            if attempt < max_retries - 1:
                time.sleep(retry_delay * (2 ** attempt))
                continue
            raise DatabaseConnectionException(f"Failed to create session after {max_retries} attempts: {e}")
        finally:
            if 'db' in locals():
                db.close()

Base = declarative_base(metadata=metadata)


