"""
Case management tests.
"""
import pytest
import json
from io import BytesIO


def test_create_case_without_files(client, test_patient, patient_token, db_session):
    """Test creating a case with symptoms only (no files)."""
    # Create a test symptom first
    from app.models.symptom import SymptomsMaster
    symptom = SymptomsMaster(name="Cough")
    db_session.add(symptom)
    db_session.commit()
    db_session.refresh(symptom)
    
    symptoms_data = json.dumps([{
        "symptom_id": symptom.id,
        "severity": 3,
        "duration_days": 5
    }])
    
    response = client.post("/api/cases",
        headers={"Authorization": f"Bearer {patient_token}"},
        data={
            "profile_type": "user",
            "profile_id": test_patient.id,
            "symptoms": symptoms_data
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "id" in data


def test_create_case_invalid_symptom(client, test_patient, patient_token):
    """Test creating case with invalid symptom ID."""
    symptoms_data = json.dumps([{
        "symptom_id": 99999,  # Non-existent
        "severity": 3,
        "duration_days": 5
    }])
    
    response = client.post("/api/cases",
        headers={"Authorization": f"Bearer {patient_token}"},
        data={
            "profile_type": "user",
            "profile_id": test_patient.id,
            "symptoms": symptoms_data
        }
    )
    
    assert response.status_code == 400


def test_create_case_unauthorized(client, db_session):
    """Test creating case without authentication."""
    from app.models.symptom import SymptomsMaster
    symptom = SymptomsMaster(name="Fever")
    db_session.add(symptom)
    db_session.commit()
    
    symptoms_data = json.dumps([{
        "symptom_id": symptom.id,
        "severity": 2,
        "duration_days": 3
    }])
    
    response = client.post("/api/cases",
        data={
            "profile_type": "user",
            "profile_id": 1,
            "symptoms": symptoms_data
        }
    )
    
    assert response.status_code == 401


def test_create_case_invalid_json(client, test_patient, patient_token):
    """Test creating case with invalid symptoms JSON."""
    response = client.post("/api/cases",
        headers={"Authorization": f"Bearer {patient_token}"},
        data={
            "profile_type": "user",
            "profile_id": test_patient.id,
            "symptoms": "invalid json"
        }
    )
    
    assert response.status_code == 400


def test_create_case_custom_mapping(client, db_session):
    """Test that cases from admin.lungsense@patient@gmail.com map to admin.lungsense@practitioner@gamil.com."""
    from app.models.user import User
    from app.constants.enums import UserRole
    from app.constants.jwt_utils import hash_password, create_access_token
    from app.models.symptom import SymptomsMaster

    # 1. Create the custom practitioner
    practitioner = User(
        email="admin.lungsense@practitioner@gamil.com",
        first_name="Default",
        last_name="Practitioner",
        hashed_password=hash_password("casetest"),
        role=UserRole.PRACTITIONER,
        age=35,
        sex="F",
        ethnicity="CAU",
        practitioner_id="111",
        profile_completed=True
    )
    db_session.add(practitioner)

    # 2. Create the custom patient
    patient = User(
        email="admin.lungsense@patient@gmail.com",
        first_name="Custom",
        last_name="Patient",
        hashed_password=hash_password("testpass123"),
        role=UserRole.PATIENT,
        age=30,
        sex="M",
        ethnicity="CAU",
        profile_completed=True
    )
    db_session.add(patient)

    # 3. Create a test symptom
    symptom = SymptomsMaster(name="Cough")
    db_session.add(symptom)
    db_session.commit()

    db_session.refresh(practitioner)
    db_session.refresh(patient)
    db_session.refresh(symptom)

    # 4. Generate token for the custom patient
    token = create_access_token({
        "user_id": patient.id,
        "email": patient.email,
        "role": patient.role
    })

    # 5. Submit case
    symptoms_data = json.dumps([{
        "symptom_id": symptom.id,
        "severity": 3,
        "duration_days": 5
    }])
    
    response = client.post("/api/cases",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "profile_type": "user",
            "profile_id": patient.id,
            "symptoms": symptoms_data
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["practitioner_id"] == practitioner.id
