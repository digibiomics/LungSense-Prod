"""
S3 utility for file uploads and downloads.
"""
import os
import boto3
from botocore.exceptions import ClientError
from typing import Optional
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file with explicit path
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)


def upload_file_to_s3(file_content: bytes, s3_key: str, content_type: str) -> bool:
    """Upload file to S3."""
    try:
        s3_client.put_object(
            Bucket=AWS_S3_BUCKET,
            Key=s3_key,
            Body=file_content,
            ContentType=content_type
        )
        return True
    except ClientError as e:
        print(f"S3 upload error: {e}")
        return False


def generate_presigned_url(s3_key: str, expiration: int = 3600) -> Optional[str]:
    """Generate presigned URL for file access."""
    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": AWS_S3_BUCKET, "Key": s3_key},
            ExpiresIn=expiration
        )
        return url
    except ClientError as e:
        print(f"Presigned URL error: {e}")
        return None


def delete_file_from_s3(s3_key: str) -> bool:
    """Delete file from S3."""
    try:
        s3_client.delete_object(Bucket=AWS_S3_BUCKET, Key=s3_key)
        return True
    except ClientError as e:
        print(f"S3 delete error: {e}")
        return False
