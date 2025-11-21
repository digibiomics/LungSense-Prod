# app/crud/user.py
from typing import Optional, List
from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.auth import PatientCreate, PractitionerCreate, UserUpdate

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    res = await db.execute(select(User).where(User.email == email))
    return res.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    res = await db.execute(select(User).where(User.id == user_id))
    return res.scalars().first()

async def create_patient(
    db: AsyncSession,
    payload: PatientCreate,
    hashed_password: str,
    *,
    birthdate: Optional[date] = None,
    ethnicity: Optional[str] = None,
    sex: Optional[str] = None,
    practitioner_name: Optional[str] = None,
    consent: bool = False,
) -> User:
    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        hashed_password=hashed_password,
        role="patient",
        birthdate=birthdate,
        ethnicity=ethnicity,
        sex=sex,
        practitioner_name=practitioner_name,
        consent=consent,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def create_practitioner(
    db: AsyncSession,
    payload: PractitionerCreate,
    hashed_password: str,
    *,
    consent: bool = False,
) -> User:
    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        hashed_password=hashed_password,
        role="practitioner",
        practitioner_id=payload.practitioner_id,
        institution=payload.institution,
        consent=consent,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

# --- New / extended CRUD helpers ---

async def get_all_users(db: AsyncSession, include_inactive: bool = False) -> List[User]:
    q = select(User)
    if not include_inactive:
        q = q.where(User.is_active == True)
    res = await db.execute(q)
    return res.scalars().all()

async def get_users_by_role(db: AsyncSession, role: str, include_inactive: bool = False) -> List[User]:
    q = select(User).where(User.role == role)
    if not include_inactive:
        q = q.where(User.is_active == True)
    res = await db.execute(q)
    return res.scalars().all()

async def update_user(db: AsyncSession, user: User, patch: UserUpdate) -> User:
    changed = False
    if patch.first_name is not None:
        user.first_name = patch.first_name
        changed = True
    if patch.last_name is not None:
        user.last_name = patch.last_name
        changed = True
    if patch.email is not None:
        user.email = patch.email
        changed = True
    if patch.practitioner_id is not None:
        user.practitioner_id = patch.practitioner_id
        changed = True
    if patch.institution is not None:
        user.institution = patch.institution
        changed = True
    if patch.is_active is not None:
        user.is_active = patch.is_active
        changed = True

    if changed:
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user

async def soft_delete_user(db: AsyncSession, user: User) -> User:
    user.is_active = False
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def restore_user(db: AsyncSession, user: User) -> User:
    user.is_active = True
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def hard_delete_user(db: AsyncSession, user: User) -> None:
    await db.delete(user)
    await db.commit()
    return None
