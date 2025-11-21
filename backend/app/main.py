# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users  # add users
from app.db.session import engine, Base

app = FastAPI(title="LungSense")

# Add CORS for your frontend dev servers (adjust origins if you run on other ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://localhost:8080",  # if you use 8080
        "http://localhost:3000",  # common React port (optional)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)

@app.on_event("startup")
async def startup():
    # dev-only: create tables automatically. For prod, use Alembic.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"status": "ok"}
