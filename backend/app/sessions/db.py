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
from app.exceptions import DatabaseConnectionException

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



# get_db_session   last function name 
# from __future__ import annotations

# import json
# import os
# import sys
# from collections.abc import Generator

# from dotenv import load_dotenv
# from sqlalchemy import create_engine
# from sqlalchemy import MetaData
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import Session
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy.pool import StaticPool

# from app.config.base import settings
# from app.exceptions import DatabaseConnectionException

# load_dotenv()

# # Set the default values for connecting locally
# HOST = settings.DB_HOSTNAME
# PORT = settings.DB_PORT
# DBNAME = settings.DB_NAME
# USERNAME = settings.DB_USERNAME
# PASSWORD = settings.DB_PASSWORD

# # Default to an in-memory sqlite for tests, otherwise use PostgreSQL
# if "PYTEST_CURRENT_TEST" in os.environ or "pytest" in sys.modules:
#     SQLALCHEMY_DATABASE_URL = "sqlite://"

#     engine = create_engine(
#         SQLALCHEMY_DATABASE_URL,
#         connect_args={"check_same_thread": False},
#         poolclass=StaticPool,
#     )

# else:
#     # Prefer an explicit DATABASE_URL or ALEMBIC_DATABASE_URL env var if provided
#     database_url = os.environ.get("DATABASE_URL") or os.environ.get("ALEMBIC_DATABASE_URL")
#     if database_url:
#         # allow both async (asyncpg) and sync (psycopg2) URLs; SQLAlchemy will accept both for engine creation
#         engine = create_engine(database_url)
#     elif "PYTHON_FASTAPI_TEMPLATE_CLUSTER_SECRET" in os.environ:
#         print("Connecting to database on RDS..\n")
#         dbSecretJSON = os.environ["PYTHON_FASTAPI_TEMPLATE_CLUSTER_SECRET"]
#         dbSecretParsed = json.loads(dbSecretJSON)

#         HOST = dbSecretParsed["host"]
#         PORT = dbSecretParsed.get("port", PORT)
#         DBNAME = dbSecretParsed["dbname"]
#         USERNAME = dbSecretParsed["username"]
#         PASSWORD = dbSecretParsed["password"]

#         engine = create_engine(f"postgresql+psycopg2://{USERNAME}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}")
#     else:
#         print("Connecting local Postgres database..\n")
#         # default to values from settings; ensure PORT is included
#         engine = create_engine(f"postgresql+psycopg2://{USERNAME}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}")

# meta = MetaData()

# # Test the connection and print the status


# try:
#     conn = engine.connect()
#     print("-------------------------- Database connected ----------------------------")
#     print(f"{{ \n\tdb_uri: postgresql:{USERNAME}@{HOST}/{DBNAME} \n }}")
#     print("\nxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
# except Exception as e:
#     print(f"Failed to connect to database. Error: {e}")
#     raise DatabaseConnectionException("Failed to connect to database")

# localSession = Session(engine)

# # Session factory bound to the module-level engine. Tests set a sqlite engine above
# session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# def create_local_session() -> Generator[Session, None, None]:
#     """Factory function that returns a new session object"""
#     db = session_local()
#     try:
#         yield db
#     finally:
#         db.close()


# Base = declarative_base()
