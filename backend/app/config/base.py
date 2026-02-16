from __future__ import annotations
import os
from dotenv import load_dotenv
from app.utils.secrets_manager import get_secret

load_dotenv()


class Settings:
    SECRET_KEY: str = get_secret("SECRET_KEY", os.environ.get("SECRET_KEY", "devsecret"))
    SENTRY_DSN: str | None = get_secret("SENTRY_DSN", os.environ.get("SENTRY_DSN"))

    # DB fields
    DB_HOSTNAME: str = get_secret("DB_HOSTNAME", os.environ.get("DB_HOSTNAME"))
    DB_PORT: str = get_secret("DB_PORT", os.environ.get("DB_PORT", "5432"))
    DB_NAME: str = get_secret("DB_NAME", os.environ.get("DB_NAME"))
    DB_USERNAME: str = get_secret("DB_USERNAME", os.environ.get("DB_USERNAME"))
    DB_PASSWORD: str = get_secret("DB_PASSWORD", os.environ.get("DB_PASSWORD"))

    # S3 Configuration
    AWS_S3_BUCKET: str = get_secret("AWS_S3_BUCKET", os.environ.get("AWS_S3_BUCKET"))
    AWS_REGION: str = get_secret("AWS_REGION", os.environ.get("AWS_REGION", "ap-south-1"))
    AWS_ACCESS_KEY_ID: str = get_secret("AWS_ACCESS_KEY_ID", os.environ.get("AWS_ACCESS_KEY_ID"))
    AWS_SECRET_ACCESS_KEY: str = get_secret("AWS_SECRET_ACCESS_KEY", os.environ.get("AWS_SECRET_ACCESS_KEY"))

    # Google OAuth2
    GOOGLE_CLIENT_ID: str = get_secret("GOOGLE_CLIENT_ID", os.environ.get("GOOGLE_CLIENT_ID"))
    GOOGLE_CLIENT_SECRET: str = get_secret("GOOGLE_CLIENT_SECRET", os.environ.get("GOOGLE_CLIENT_SECRET"))
    GOOGLE_REDIRECT_URI: str = get_secret("GOOGLE_REDIRECT_URI", os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback"))
    FRONTEND_URL: str = get_secret("FRONTEND_URL", os.environ.get("FRONTEND_URL", "http://localhost:5173"))

    # Optional full DB URL override
    DATABASE_URL: str | None = get_secret("DATABASE_URL", os.environ.get("DATABASE_URL"))

settings = Settings()
