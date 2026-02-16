"""
File upload and validation tests.
"""
import pytest
from unittest.mock import Mock


def test_validate_audio_file_type():
    """Test audio file type validation."""
    from app.utils.file_validation import validate_audio_file
    
    # Mock valid audio file
    valid_file = Mock()
    valid_file.filename = "test.wav"
    valid_file.content_type = "audio/wav"
    
    # Should not raise exception
    validate_audio_file(valid_file)


def test_validate_audio_file_invalid_type():
    """Test audio file validation with invalid type."""
    from app.utils.file_validation import validate_audio_file
    
    # Mock invalid file
    invalid_file = Mock()
    invalid_file.filename = "test.txt"
    invalid_file.content_type = "text/plain"
    
    with pytest.raises(Exception):
        validate_audio_file(invalid_file)


def test_validate_xray_file_type():
    """Test X-ray file type validation."""
    from app.utils.file_validation import validate_xray_file
    
    # Mock valid image file
    valid_file = Mock()
    valid_file.filename = "xray.jpg"
    valid_file.content_type = "image/jpeg"
    
    # Should not raise exception
    validate_xray_file(valid_file)


def test_validate_xray_file_invalid_type():
    """Test X-ray file validation with invalid type."""
    from app.utils.file_validation import validate_xray_file
    
    # Mock invalid file (PDF is actually allowed, use .txt instead)
    invalid_file = Mock()
    invalid_file.filename = "test.txt"
    invalid_file.content_type = "text/plain"
    
    with pytest.raises(Exception):
        validate_xray_file(invalid_file)


def test_validate_file_size_within_limit():
    """Test file size validation within limit."""
    from app.utils.file_validation import validate_file_size, MAX_AUDIO_SIZE
    
    # File within limit
    small_file = b"x" * 1000  # 1KB
    
    # Should not raise exception
    validate_file_size(small_file, MAX_AUDIO_SIZE, "audio")


def test_validate_file_size_exceeds_limit():
    """Test file size validation exceeding limit."""
    from app.utils.file_validation import validate_file_size
    
    # File exceeds limit
    large_file = b"x" * (11 * 1024 * 1024)  # 11MB
    max_size = 10 * 1024 * 1024  # 10MB
    
    with pytest.raises(Exception):
        validate_file_size(large_file, max_size, "audio")
