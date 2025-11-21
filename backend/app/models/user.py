from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, func
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Basic identity
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)

    email = Column(String(320), unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)

    # "patient" or "practitioner"
    role = Column(String, nullable=False, index=True)

    # Patient-specific fields
    # store birthdate as a Date in DB (convert from dd-mm-yyyy on input)
    birthdate = Column(Date, nullable=True)
    ethnicity = Column(String, nullable=True)
    sex = Column(String, nullable=True)
    practitioner_name = Column(String, nullable=True)  # free text from patient form
    practitioner_id = Column(String, nullable=True)    # optional link to practitioner if you use it

    # Practitioner-only fields (still available on users table)
    institution = Column(String, nullable=True)

    # System metadata
    consent = Column(Boolean, default=False)  # whether user consented
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
