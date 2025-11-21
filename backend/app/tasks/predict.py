from app.celery_app import celery_app
import time

@celery_app.task(name="app.tasks.predict.enqueue_prediction")
def enqueue_prediction(rec_id: int, s3_key: str):
    time.sleep(2)
    return {"rec_id": rec_id, "result": {"label": "cough", "confidence": 0.9}}
