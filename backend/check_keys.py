import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path('.env'), override=True)
print('KEY in .env:', os.getenv('AWS_ACCESS_KEY_ID'))

import boto3
s3 = boto3.client('s3')
creds = s3._request_signer._credentials
print('KEY boto3 using:', creds.access_key)
