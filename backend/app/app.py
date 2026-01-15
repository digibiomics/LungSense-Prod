from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
 
 
from app.routes import assignments, sub_users, users


def create_app() -> FastAPI:
    app = FastAPI(title="LungSense API")
    

    app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

    
    app.include_router(users.router, prefix="/api", tags=["users"])
    app.include_router(sub_users.router, prefix="/api", tags=["sub-users"])
    app.include_router(assignments.router, prefix="/api", tags=["assignments"])
    return app


app = create_app()
