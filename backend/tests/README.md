# 🧪 LungSense Testing Guide

## Quick Start

```bash
# Install dependencies
pip install -r requirements-dev.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v

# Run specific test
pytest tests/test_auth.py::test_admin_login_success -v
```

## Test Structure

```
tests/
├── test_auth.py       # Authentication & authorization tests
├── test_users.py      # User management tests
└── test_database.py   # Database & model tests
```

## What's Tested

### ✅ Authentication (test_auth.py)
- Health check endpoint
- Admin login (success/failure)
- Token validation
- Role-based access control
- Protected routes

### ✅ User Management (test_users.py)
- Get current user
- Update profile
- Unauthorized access

### ✅ Database (test_database.py)
- User creation
- Soft delete
- Email uniqueness

## Test Coverage

Run coverage report:
```bash
pytest --cov=app --cov-report=term-missing
```

View HTML report:
```bash
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

## Before Deployment

Run full test suite:
```bash
pytest tests/ -v
```

All tests should pass ✅

## Troubleshooting

**Import errors:**
```bash
# Make sure you're in backend directory
cd backend
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
pytest
```

**Database errors:**
- Tests use in-memory SQLite (no setup needed)
- Each test gets fresh database

**Token errors:**
- Check JWT_SECRET_KEY in .env
- Tokens are auto-generated in fixtures
