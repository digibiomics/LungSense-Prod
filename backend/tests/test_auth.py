"""
Critical authentication tests.
"""
import pytest


def test_health_check(client):
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_admin_login_success(client, test_admin):
    """Test successful admin login."""
    response = client.post("/api/auth/admin/login", json={
        "email": "admin@test.com",
        "password": "adminpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "super_admin"


def test_admin_login_wrong_password(client, test_admin):
    """Test admin login with wrong password."""
    response = client.post("/api/auth/admin/login", json={
        "email": "admin@test.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401


def test_admin_login_nonexistent_user(client):
    """Test admin login with non-existent user."""
    response = client.post("/api/auth/admin/login", json={
        "email": "nonexistent@test.com",
        "password": "password123"
    })
    assert response.status_code == 401


def test_patient_cannot_admin_login(client, test_patient):
    """Test that patient cannot use admin login."""
    response = client.post("/api/auth/admin/login", json={
        "email": "patient@test.com",
        "password": "testpass123"
    })
    assert response.status_code == 401


def test_protected_route_without_token(client, test_patient):
    """Test accessing protected route without token."""
    response = client.get(f"/api/user/{test_patient.id}")
    assert response.status_code == 401


def test_protected_route_with_valid_token(client, test_patient, patient_token):
    """Test accessing protected route with valid token."""
    response = client.get(f"/api/user/{test_patient.id}", headers={
        "Authorization": f"Bearer {patient_token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["email"] == "patient@test.com"


def test_protected_route_with_invalid_token(client, test_patient):
    """Test accessing protected route with invalid token."""
    response = client.get(f"/api/user/{test_patient.id}", headers={
        "Authorization": "Bearer invalid_token_here"
    })
    assert response.status_code == 401
