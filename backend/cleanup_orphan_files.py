"""
Remove orphan case_file DB records where the S3 file no longer exists.
Run: python cleanup_orphan_files.py
"""
from app.sessions.db import SessionLocal
from app.models.case_file import CaseFile
from app.utils.s3_utils import s3_client, AWS_S3_BUCKET
from botocore.exceptions import ClientError


def cleanup():
    db = SessionLocal()
    try:
        files = db.query(CaseFile).filter(
            CaseFile.modality.in_(["cough_audio", "breath_audio"])
        ).all()

        removed = 0
        for cf in files:
            try:
                s3_client.head_object(Bucket=AWS_S3_BUCKET, Key=cf.s3_key)
            except ClientError as e:
                if e.response['Error']['Code'] in ('404', 'NoSuchKey'):
                    print(f"Removing orphan: Case {cf.case_id} | {cf.s3_key}")
                    db.delete(cf)
                    removed += 1

        db.commit()
        print(f"\nDone. Removed {removed} orphan record(s).")
    finally:
        db.close()


if __name__ == "__main__":
    cleanup()
