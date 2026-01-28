"""
File validation utilities.
"""
from fastapi import UploadFile
from app.utils.exception_handler import raise_bad_request

# File size limits (in bytes)
MAX_XRAY_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_AUDIO_SIZE = 50 * 1024 * 1024  # 50 MB

# Allowed file types
ALLOWED_XRAY_TYPES = {"jpg", "jpeg", "png", "pdf"}
ALLOWED_AUDIO_TYPES = {"wav", "mp3", "m4a", "webm"}


def validate_xray_file(file: UploadFile) -> None:
    """Validate X-ray file type and size."""
    if not file:
        return
    
    # Check file extension
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ALLOWED_XRAY_TYPES:
        raise_bad_request(
            f"Invalid X-ray file type. Allowed: {', '.join(ALLOWED_XRAY_TYPES)}"
        )
    
    # Check content type
    allowed_content_types = {
        "image/jpeg", "image/jpg", "image/png", "application/pdf"
    }
    if file.content_type not in allowed_content_types:
        raise_bad_request("Invalid X-ray content type")


def validate_audio_file(file: UploadFile) -> None:
    """Validate audio file type and size."""
    if not file:
        return
    
    # Check file extension
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ALLOWED_AUDIO_TYPES:
        raise_bad_request(
            f"Invalid audio file type. Allowed: {', '.join(ALLOWED_AUDIO_TYPES)}"
        )
    
    # Check content type
    allowed_content_types = {
        "audio/wav", "audio/wave", "audio/x-wav",
        "audio/mpeg", "audio/mp3",
        "audio/mp4", "audio/x-m4a",
        "audio/webm"
    }
    if file.content_type not in allowed_content_types:
        raise_bad_request(f"Invalid audio content type")


def validate_file_size(file_content: bytes, max_size: int, file_type: str) -> None:
    """Validate file size."""
    if len(file_content) > max_size:
        max_mb = max_size / (1024 * 1024)
        raise_bad_request(f"{file_type} file size exceeds {max_mb:.1f}MB limit")
