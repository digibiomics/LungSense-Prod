from __future__ import annotations
import os
from dotenv import load_dotenv

load_dotenv()  # <-- add this at the top


class Settings:
    SECRET_KEY: str = os.environ.get("SECRET_KEY")
    SENTRY_DSN: str | None = os.environ.get("SENTRY_DSN")

    # DB fields (no defaults)
    DB_HOSTNAME: str = os.environ.get("DB_HOSTNAME")
    DB_PORT: str = os.environ.get("DB_PORT")
    DB_NAME: str = os.environ.get("DB_NAME")
    DB_USERNAME: str = os.environ.get("DB_USERNAME")
    DB_PASSWORD: str = os.environ.get("DB_PASSWORD")

    # Optional full DB URL override (no defaults)
    DATABASE_URL: str | None = os.environ.get("DATABASE_URL")

settings = Settings()
