# app/services/security.py
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Tuple, Optional
from app.config import settings

# Use argon2 instead of bcrypt
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    # argon2 supports long passwords -> NO LIMIT
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject: str | int, expires_minutes: int = 60*24) -> Tuple[str, int]:
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode = {"sub": str(subject), "exp": expire}
    token = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    expires_in = int((expire - datetime.utcnow()).total_seconds())
    return token, expires_in

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except JWTError:
        return None
