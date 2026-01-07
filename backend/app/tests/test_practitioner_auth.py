from __future__ import annotations

from fastapi.testclient import TestClient

from app.app import create_app


client = TestClient(create_app())


def test_practitioner_signup_and_login():
    # signup
    resp = client.post("/api/practitioners/signup", json={"email": "doc1@example.com", "password": "secretpw", "first_name": "Doc", "last_name": "One"})
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data

    # login
    resp2 = client.post("/api/practitioners/login", json={"email": "doc1@example.com", "password": "secretpw"})
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert "access_token" in data2
