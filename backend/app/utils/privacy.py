"""
Privacy utilities for data anonymization and patient catalog management.
"""
import hashlib
import secrets
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.sub_user import SubUser


class PrivacyManager:
    """Manages patient privacy and data anonymization."""
    
    @staticmethod
    def generate_catalog_number(user_id: int, sub_user_id: Optional[int] = None) -> str:
        """Generate unique catalog number for patient identification."""
        # Create a unique identifier based on user/sub_user
        if sub_user_id:
            base_string = f"patient_{user_id}_{sub_user_id}"
        else:
            base_string = f"patient_{user_id}"
        
        # Add random salt for additional security
        salt = secrets.token_hex(4)
        combined = f"{base_string}_{salt}"
        
        # Generate hash and take first 12 characters
        hash_obj = hashlib.sha256(combined.encode())
        catalog_number = f"LS{hash_obj.hexdigest()[:10].upper()}"
        
        return catalog_number
    
    @staticmethod
    def anonymize_patient_data(patient_data: dict) -> dict:
        """Anonymize patient data for AI training."""
        anonymized = patient_data.copy()
        
        # Remove direct identifiers
        anonymized.pop('name', None)
        anonymized.pop('email', None)
        anonymized.pop('phone', None)
        
        # Keep only essential medical data
        essential_fields = ['age', 'sex', 'ethnicity', 'symptoms', 'files', 'diagnosis']
        anonymized = {k: v for k, v in anonymized.items() if k in essential_fields}
        
        return anonymized
    
    @staticmethod
    def get_patient_display_name(db: Session, user_id: int, sub_user_id: Optional[int] = None) -> str:
        """Get patient display name with privacy protection."""
        if sub_user_id:
            sub_user = db.query(SubUser).filter(SubUser.id == sub_user_id).first()
            if sub_user:
                # Return initials only
                name_parts = sub_user.name.split()
                if len(name_parts) >= 2:
                    return f"{name_parts[0][0]}.{name_parts[-1][0]}."
                return f"{name_parts[0][0]}."
        else:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                name_parts = user.name.split()
                if len(name_parts) >= 2:
                    return f"{name_parts[0][0]}.{name_parts[-1][0]}."
                return f"{name_parts[0][0]}."
        
        return "Anonymous"
    
    @staticmethod
    def mask_email(email: str) -> str:
        """Mask email for privacy protection."""
        if '@' not in email:
            return "***@***.***"
        
        local, domain = email.split('@', 1)
        if len(local) <= 2:
            masked_local = '*' * len(local)
        else:
            masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
        
        domain_parts = domain.split('.')
        if len(domain_parts) >= 2:
            masked_domain = domain_parts[0][0] + '*' * (len(domain_parts[0]) - 1)
            masked_domain += '.' + '.'.join(domain_parts[1:])
        else:
            masked_domain = '*' * len(domain)
        
        return f"{masked_local}@{masked_domain}"


class DataConsentManager:
    """Manages patient data consent and usage permissions."""
    
    CONSENT_TYPES = {
        'medical_review': 'Allow medical practitioners to review my data',
        'ai_training': 'Allow anonymized data to be used for AI model training',
        'research': 'Allow anonymized data to be used for medical research',
        'data_sharing': 'Allow sharing anonymized data with partner institutions'
    }
    
    @staticmethod
    def get_default_consents() -> dict:
        """Get default consent settings (medical review only)."""
        return {
            'medical_review': True,
            'ai_training': False,
            'research': False,
            'data_sharing': False
        }
    
    @staticmethod
    def validate_consent_for_action(consents: dict, action: str) -> bool:
        """Check if patient has consented to specific action."""
        return consents.get(action, False)


class AuditLogger:
    """Logs data access and usage for compliance."""
    
    @staticmethod
    def log_data_access(user_id: int, accessed_case_id: int, action: str, db: Session):
        """Log when someone accesses patient data."""
        # This would typically write to an audit log table
        # For now, we'll just print (replace with proper logging)
        print(f"AUDIT: User {user_id} performed '{action}' on case {accessed_case_id}")
    
    @staticmethod
    def log_data_export(user_id: int, case_ids: list, purpose: str, db: Session):
        """Log when data is exported for AI training or research."""
        print(f"AUDIT: User {user_id} exported {len(case_ids)} cases for '{purpose}'")