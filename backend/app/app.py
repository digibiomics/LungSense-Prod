from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
 
 
from app.routes import assignments, sub_users, users, profiles, symptoms, cases, practitioner, admin


def create_app() -> FastAPI:
    app = FastAPI(title="LungSense API")
    

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    
    app.include_router(users.router, prefix="/api", tags=["users"])
    app.include_router(sub_users.router, prefix="/api", tags=["sub-users"])
    app.include_router(assignments.router, prefix="/api", tags=["assignments"])
    app.include_router(profiles.router, prefix="/api", tags=["profiles"])
    app.include_router(symptoms.router, prefix="/api", tags=["symptoms"])
    app.include_router(cases.router, prefix="/api", tags=["cases"])
    app.include_router(practitioner.router, prefix="/api", tags=["practitioner"])
    app.include_router(admin.router, prefix="/api", tags=["admin"])
    return app


app = create_app()
