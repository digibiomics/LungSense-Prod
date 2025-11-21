from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # core
    app_env: str = Field("development", env="APP_ENV")
    secret_key: str = Field("devsecret", env="SECRET_KEY")

    # DB urls: async for runtime, sync for alembic/migrations
    database_url: str = Field(..., env="DATABASE_URL")
    alembic_db_url: Optional[str] = Field(None, env="ALEMBIC_DATABASE_URL")

    # Celery / Redis
    celery_broker_url: str = Field(..., env="CELERY_BROKER_URL")
    celery_result_backend: str = Field(..., env="CELERY_RESULT_BACKEND")

    # AWS / S3 (optional locally)
    aws_access_key_id: Optional[str] = Field(None, env="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(None, env="AWS_SECRET_ACCESS_KEY")
    aws_region: Optional[str] = Field(None, env="AWS_REGION")
    s3_bucket: Optional[str] = Field(None, env="S3_BUCKET")

    # other
    max_upload_size: int = Field(50 * 1024 * 1024, env="MAX_UPLOAD_SIZE")

    # pydantic-settings config: load .env, allow extra env vars
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow"
    )

# instantiate once for import
settings = Settings()
