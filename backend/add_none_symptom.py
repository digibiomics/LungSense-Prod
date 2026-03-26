"""
One-time script to insert 'None' symptom into existing symptoms_master table.
"""
from app.sessions.db import SessionLocal
from app.models.symptom import SymptomsMaster

def add_none_symptom():
    db = SessionLocal()
    try:
        existing = db.query(SymptomsMaster).filter(SymptomsMaster.name == "None").first()
        if existing:
            print(f"'None' symptom already exists with id={existing.id}")
            return

        none_symptom = SymptomsMaster(name="None")
        db.add(none_symptom)
        db.commit()
        db.refresh(none_symptom)
        print(f"✅ 'None' symptom added with id={none_symptom.id}")
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_none_symptom()
