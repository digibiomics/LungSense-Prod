"""AWS Secrets Manager integration with caching and fallback."""
import os
import json
import time
from typing import Optional, Dict
from functools import lru_cache

try:
    import boto3
    from botocore.exceptions import ClientError, BotoCoreError
except ImportError:
    boto3 = None


class SecretsManager:
    """Manages secrets from AWS Secrets Manager with local cache and fallback."""
    
    def __init__(self, secret_name: str = "lungsense/prod/app-secrets", region: str = "ap-south-1"):
        self.secret_name = secret_name
        self.region = region
        self._cache: Dict[str, any] = {}
        self._cache_time: float = 0
        self._cache_ttl: int = 300  # 5 minutes
        self._fallback_cache: Dict[str, str] = {}
        
    def _fetch_from_aws(self) -> Dict[str, str]:
        """Fetch secrets from AWS Secrets Manager."""
        if not boto3:
            raise ImportError("boto3 not installed. Run: pip install boto3")
        
        try:
            client = boto3.client("secretsmanager", region_name=self.region)
            response = client.get_secret_value(SecretId=self.secret_name)
            secrets = json.loads(response["SecretString"])
            
            # Update fallback cache on successful fetch
            self._fallback_cache = secrets.copy()
            return secrets
            
        except (ClientError, BotoCoreError) as e:
            print(f"⚠️  AWS Secrets Manager error: {e}")
            
            # Use fallback cache if available
            if self._fallback_cache:
                print("✅ Using cached secrets (fallback mode)")
                return self._fallback_cache
            
            raise Exception(f"Failed to fetch secrets and no fallback available: {e}")
    
    def get_secrets(self) -> Dict[str, str]:
        """Get all secrets with caching."""
        current_time = time.time()
        
        # Return cached if still valid
        if self._cache and (current_time - self._cache_time) < self._cache_ttl:
            return self._cache
        
        # Fetch fresh secrets
        try:
            self._cache = self._fetch_from_aws()
            self._cache_time = current_time
            return self._cache
        except Exception as e:
            print(f"❌ Failed to fetch secrets: {e}")
            
            # Return stale cache if available
            if self._cache:
                print("⚠️  Using stale cache")
                return self._cache
            
            raise
    
    def get(self, key: str, default: Optional[str] = None) -> Optional[str]:
        """Get individual secret value."""
        try:
            secrets = self.get_secrets()
            return secrets.get(key, default)
        except Exception:
            return default


# Global instance
_secrets_manager: Optional[SecretsManager] = None


def get_secret(key: str, default: Optional[str] = None) -> Optional[str]:
    """
    Get secret value with fallback strategy:
    1. Try environment variable (for local dev)
    2. Try AWS Secrets Manager (for production)
    3. Return default
    """
    global _secrets_manager
    
    # Priority 1: Environment variable (local dev)
    env_value = os.getenv(key)
    if env_value:
        return env_value
    
    # Priority 2: AWS Secrets Manager (production)
    environment = os.getenv("ENVIRONMENT", "development")
    if environment == "production":
        try:
            if _secrets_manager is None:
                _secrets_manager = SecretsManager()
            return _secrets_manager.get(key, default)
        except Exception as e:
            print(f"⚠️  Secrets Manager unavailable for {key}: {e}")
    
    # Priority 3: Default value
    return default
