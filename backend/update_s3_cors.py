#!/usr/bin/env python3
"""
Script to update S3 bucket CORS configuration to allow ngrok domain.
"""
import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

def update_s3_cors():
    """Update S3 bucket CORS configuration."""
    s3_client = boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )
    
    cors_configuration = {
        'CORSRules': [
            {
                'AllowedHeaders': ['*'],
                'AllowedMethods': ['GET', 'HEAD', 'PUT'],  # Added PUT for uploads
                'AllowedOrigins': [
                    'http://localhost:3000',
                    'http://localhost:5173',
                    'http://localhost:4173',
                    'http://localhost:8080',
                    'https://lungsense.ai',
                    'https://www.lungsense.ai',
                    'https://utopia-confusion-gating.ngrok-free.dev'  # Your ngrok domain
                ],
                'ExposeHeaders': ['ETag'],
                'MaxAgeSeconds': 3000
            }
        ]
    }
    
    try:
        s3_client.put_bucket_cors(
            Bucket=AWS_S3_BUCKET,
            CORSConfiguration=cors_configuration
        )
        print(f"Successfully updated CORS configuration for bucket: {AWS_S3_BUCKET}")
        print("Added ngrok domain to allowed origins.")
        
        # Verify the configuration
        response = s3_client.get_bucket_cors(Bucket=AWS_S3_BUCKET)
        print("\nCurrent CORS configuration:")
        for rule in response['CORSRules']:
            print(f"  Allowed Origins: {rule['AllowedOrigins']}")
            print(f"  Allowed Methods: {rule['AllowedMethods']}")
            
    except ClientError as e:
        print(f"Error updating CORS configuration: {e}")
        return False
    
    return True

if __name__ == "__main__":
    if not AWS_S3_BUCKET:
        print("Error: AWS_S3_BUCKET environment variable not set")
        exit(1)
    
    print(f"Updating CORS configuration for S3 bucket: {AWS_S3_BUCKET}")
    update_s3_cors()