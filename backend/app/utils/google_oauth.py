"""
Google OAuth2 utilities for authentication.
"""
from __future__ import annotations

import httpx
from typing import Dict, Optional

from app.config.base import settings
from app.utils.exception_handler import raise_bad_request, raise_unauthorized


async def exchange_code_for_token(code: str) -> Dict[str, str]:
    """Exchange authorization code for access token."""
    token_url = "https://oauth2.googleapis.com/token"
    
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(token_url, data=data)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise_bad_request(f"Failed to exchange code for token: {str(e)}")


async def get_google_user_info(access_token: str) -> Dict[str, str]:
    """Fetch user info from Google."""
    user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(user_info_url, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise_unauthorized(f"Failed to fetch user info: {str(e)}")


def verify_google_token(credential: str) -> Optional[Dict]:
    """Verify Google ID token (for frontend direct auth)."""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        
        print(f"Verifying token with client ID: {settings.GOOGLE_CLIENT_ID}")
        print(f"Token (first 50 chars): {credential[:50]}...")
        
        # Verify the credential token
        idinfo = id_token.verify_oauth2_token(
            credential, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        print(f"Token verification successful: {idinfo}")
        
        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            print(f"Invalid issuer: {idinfo['iss']}")
            raise ValueError('Wrong issuer.')
        
        return idinfo
    except Exception as e:
        print(f"Token verification error: {e}")
        import traceback
        traceback.print_exc()
        return None
