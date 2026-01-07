from __future__ import annotations

from fastapi.testclient import TestClient

from app.app import create_app


def test_create_user_success(client: TestClient):
    resp = client.post("/users/", json={"email": "test@example.com", "password": "secretpw", "first_name": "Test", "last_name": "User"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "test@example.com"
    assert "id" in data


def test_create_user_duplicate(client: TestClient):
    client.post("/users/", json={"email": "dup@example.com", "password": "pw12345"})
    resp = client.post("/users/", json={"email": "dup@example.com", "password": "pw12345"})
    assert resp.status_code == 409
