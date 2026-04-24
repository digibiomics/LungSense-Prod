"""
Add 'Other' symptom to existing database.
"""
from app.sessions.db import SessionLocal
from app.models.symptom import SymptomsMaster


def add_other_symptom():
    """Add 'Other' symptom to symptoms master table if it doesn't exist."""
    db = SessionLocal()
    try:
        # Check if 'Other' symptom already exists
        existing = db.query(SymptomsMaster).filter(SymptomsMaster.name == "Other").first()
        if existing:
            print(f"✅ 'Other' symptom already exists with ID {existing.id}")
            return existing.id
        
        # Add 'Other' symptom
        other_symptom = SymptomsMaster(name="Other")
        db.add(other_symptom)
        db.commit()
        db.refresh(other_symptom)
        
        print(f"✅ Added 'Other' symptom with ID {other_symptom.id}")
        return other_symptom.id
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error adding 'Other' symptom: {e}")
        return None
    finally:
        db.close()


if __name__ == "__main__":
    add_other_symptom()