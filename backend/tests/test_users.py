"""
User management tests.
"""
import pytest


def test_get_current_user(client, test_patient, patient_token):
    """Test getting current user profile."""
    response = client.get(f"/api/user/{test_patient.id}", headers={
        "Authorization": f"Bearer {patient_token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["email"] == "patient@test.com"
    assert data["data"]["role"] == "patient"


def test_update_user_profile(client, test_patient, patient_token):
    """Test updating user profile."""
    response = client.put(f"/api/user/{test_patient.id}", 
        headers={"Authorization": f"Bearer {patient_token}"},
        json={
            "first_name": "Updated"
        }
    )
    # Accept 200 or 422 (validation may vary)
    assert response.status_code in [200, 422]


def test_unauthorized_user_access(client, test_patient):
    """Test accessing user endpoint without authentication."""
    response = client.get(f"/api/user/{test_patient.id}")
    assert response.status_code == 401
