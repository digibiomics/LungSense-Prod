from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
 
from app.routes import assignments, sub_users, users, profiles, symptoms, cases, practitioner, admin, auth, support
from app.sessions.db import engine


def create_app() -> FastAPI:
    app = FastAPI(title="LungSense API")
    
    @app.get("/health")
    async def health_check():
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return {"status": "healthy", "database": "connected"}
        except Exception as e:
            return {"status": "unhealthy", "database": "disconnected", "error": str(e)}
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",  # Local dev
            "http://localhost:5173",  # Vite dev
            "http://localhost:4173",  # Vite preview
            "http://127.0.0.1:8000",  # Backend self
            "http://localhost:8080", # local web testing
            "http://3.7.190.167",  # EC2 IP (temporary)
            "http://3.7.190.167:8000",  # EC2 IP with port
             "https://lungsense.ai",
             "https://www.lungsense.ai",
            "capacitor://localhost", # IOS Capacitor view
            "http://localhost", #Android Capacitor view 
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # Auth routes (Google OAuth + Admin login)
    app.include_router(auth.router, prefix="/api")
    
    # User management routes
    app.include_router(users.router, prefix="/api", tags=["users"])
    app.include_router(sub_users.router, prefix="/api", tags=["sub-users"])
    app.include_router(assignments.router, prefix="/api", tags=["assignments"])
    app.include_router(profiles.router, prefix="/api", tags=["profiles"])
    app.include_router(symptoms.router, prefix="/api", tags=["symptoms"])
    app.include_router(cases.router, prefix="/api", tags=["cases"])
    app.include_router(practitioner.router, prefix="/api", tags=["practitioner"])
    app.include_router(admin.router, prefix="/api", tags=["admin"])
    app.include_router(support.router, prefix="/api", tags=["support"])
    return app


app = create_app()
