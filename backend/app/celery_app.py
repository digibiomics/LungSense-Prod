from celery import Celery
from app.config import settings

celery_app = Celery(
    "lungsense",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer='pickle',
    accept_content=['pickle','json'],
    result_serializer='pickle',
    timezone='UTC',
    enable_utc=True,
)
