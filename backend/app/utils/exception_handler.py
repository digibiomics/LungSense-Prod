from fastapi import HTTPException, status
from typing import Any, Dict

def raise_bad_request(message: str, details: Dict[str, Any] = None) -> None:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={
            "status": "error",
            "code": 400,
            "message": message,
            "details": details or {}
        }
    )

def raise_unauthorized(message: str = "Not authenticated") -> None:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "status": "error",
            "code": 401,
            "message": message
        },
        headers={"WWW-Authenticate": "Bearer"},
    )

def raise_forbidden(message: str = "Access denied") -> None:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "status": "error",
            "code": 403,
            "message": message
        }
    )

def raise_not_found(message: str = "Resource not found") -> None:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={
            "status": "error",
            "code": 404,
            "message": message
        }
    )

def raise_conflict(message: str = "Resource conflict") -> None:
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail={
            "status": "error",
            "code": 409,
            "message": message
        }
    )

def raise_too_many_requests(message: str = "Too many requests") -> None:
    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail={
            "status": "error",
            "code": 429,
            "message": message
        }
    )

def raise_internal_server_error(message: str = "Internal server error") -> None:
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail={
            "status": "error",
            "code": 500,
            "message": message
        }
    )

# ✅ Your existing working exceptions
class CentryTestException(Exception):
    """Simple sentinel exception used for Sentry test endpoint."""
    pass

class DatabaseConnectionException(Exception):
    """Raised when database connection fails."""
    pass

# ➕ New extensions added below as requested
class BadRequestException(Exception):
    """Custom 400 error without FastAPI wrapper."""
    pass

class UnauthorizedException(Exception):
    """Custom 401 error without FastAPI wrapper."""
    pass

class ForbiddenException(Exception):
    """Custom 403 error without FastAPI wrapper."""
    pass

class NotFoundException(Exception):
    """Custom 404 error without FastAPI wrapper."""
    pass

class ConflictException(Exception):
    """Custom 409 error without FastAPI wrapper."""
    pass

class TooManyRequestsException(Exception):
    """Custom 429 error without FastAPI wrapper."""
    pass

class InternalServerErrorException(Exception):
    """Custom 500 error without FastAPI wrapper."""
    pass
