"""
Enums for the application.
"""
from enum import Enum


class UserRole(str, Enum):
    """User roles."""
    PATIENT = "patient"
    PRACTITIONER = "practitioner"
    DATA_ADMIN = "data_admin"
    SUPER_ADMIN = "super_admin"


class Sex(str, Enum):
    """Sex options."""
    FEMALE = "F"
    MALE = "M"
    OTHER = "O"


class Ethnicity(str, Enum):
    """Ethnicity codes."""
    AFR = "AFR"  # African
    ASN = "ASN"  # Asian
    CAU = "CAU"  # Caucasian
    HIS = "HIS"  # Hispanic
    MDE = "MDE"  # Middle Eastern
    MIX = "MIX"  # Mixed
    UND = "UND"  # Undisclosed

class RespiratoryHistory(str, Enum):
    COPD = "COPD"
    ASTHMA = "ASTHMA"
    TB = "TB"
    CF = "CF"
    SMOKER = "SMOKER"
    WORK_EXPOSURE = "WORK_EXPOSURE"
    NONE = "NONE"


class ResponseStatus(str, Enum):
    """API response status."""
    SUCCESS = "success"
    ERROR = "error"