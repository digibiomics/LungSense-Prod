"""
Minimal privacy utility for patient catalog numbers.
"""
import hashlib
import secrets
from typing import Optional

def generate_patient_catalog(user_id: int, sub_user_id: Optional[int] = None) -> str:
    """Generate unique catalog number for patient."""
    if sub_user_id:
        base = f"patient_{user_id}_{sub_user_id}"
    else:
        base = f"patient_{user_id}"
    
    salt = secrets.token_hex(4)
    hash_obj = hashlib.sha256(f"{base}_{salt}".encode())
    return f"LS{hash_obj.hexdigest()[:10].upper()}"