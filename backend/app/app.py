from __future__ import annotations

from fastapi import FastAPI

from app.routes.home.home import home_router
from app.routes.users.users import users_router
from app.routes.practitioners.practitioners import router as practitioners_router
from app.routes.patients.patients import router as patients_router


def create_app() -> FastAPI:
    app = FastAPI(title="LungSense API")
    app.include_router(home_router)
    app.include_router(users_router)
    app.include_router(practitioners_router)
    app.include_router(patients_router)
    return app


app = create_app()
