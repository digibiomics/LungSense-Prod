Summary of changes (automatically added):

What I added

- User model: `app/models/users.py` (id, email, first_name, last_name, hashed_password, created_at)
- Pydantic schemas: `app/schemas/users/users_request.py`, `app/schemas/users/users_response.py`
- DAO: `app/daos/users.py` with `create_user` and `get_user_by_email`
- Route: `app/routes/users/users.py` with POST `/users/` endpoint
- App entry: `app/app.py` exposing `create_app()` and `app`
- Tests: `app/tests/test_users.py` and `app/tests/conftest.py` that setup an in-memory sqlite DB before tests
- Alembic: `alembic.ini`, `alembic/env.py`, and a very small initial migration `alembic/versions/0001_create_users_table.py`
- Small dependency helpers: `dependencies.py` and `requirements-dev.txt`

How to run locally

1. Create and activate your virtualenv. Example (Windows PowerShell):
   python -m venv .venv; .\.venv\Scripts\Activate.ps1
2. Install runtime + dev dependencies:
   pip install -r requirements-dev.txt
   pip install -r requirements.txt # if you have one
3. Run tests:
   pytest -q

Run Alembic migrations (example):
alembic upgrade head

Notes / decisions

- Tests use an in-memory sqlite DB (SQLAlchemy engine created when pytest is detected). Alembic is configured to use the project's engine in `alembic/env.py`.
- Passwords are hashed using sha256 (simple for example; replace with a secure hasher for production).
- I added simple conflict handling for duplicate emails in the POST handler.

Next steps you might want me to do

- Add password hashing with `passlib` and add login endpoint.
- Add more tests (read, update, delete) and CI integration.
- Add factory scripts for migrations (alembic revision --autogenerate) and ensure migrations run for MySQL environments.
- Switched database connector to **PostgreSQL** using `psycopg2` (project now prefers `DATABASE_URL`/`ALEMBIC_DATABASE_URL` env vars; tests still use sqlite in-memory).

If you want me to run tests here, tell me which Python environment to use or let me install dev deps into the workspace env.
