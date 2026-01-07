from logging.config import fileConfig
import os
import sys

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend root is in Python path
sys.path.insert(0, os.path.abspath(os.getcwd()))

#  Import all your ORM models so metadata gets filled
from app.models.users import User  # your user model file
from app.models.patients import PatientProfile
from app.models.practitioners import PractitionerProfile

# Import DB engine and Base
from app.sessions.db import engine as target_engine
from app.sessions.db import Base

config = context.config

# Setup logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Alembic MUST get this:
target_metadata = Base.metadata  # ✔ FIXED

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        poolclass=pool.NullPool,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = target_engine
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            poolclass=pool.NullPool,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
