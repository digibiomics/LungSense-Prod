"""
Seed symptoms master data.
"""
from app.sessions.db import SessionLocal
from app.models.symptom import SymptomsMaster

SYMPTOMS = [
    "Cough",
    "Shortness of Breath",
    "Flu Symptoms",
    "Chest Pain/ tightness/ Congestion",
    "Fever",
    "Chills or rigors",
    "Fatigue/Weakness",
    "Sputum Change",
    "Wheezing",
    "Night Sweats",
    "Abnormal/Unexpected Weight Loss",
    "Difficulty sleeping due to breathing",
    "Activity Limitation (stairs, walking etc)",
    "Recent Infection or cold before onset",
    "Known Exposure (TB/COVID/flu)",
    "Smoking habits",
    "None",
    "Other",
]


def seed_symptoms():
    """Seed symptoms master table."""
    db = SessionLocal()
    try:
        existing = db.query(SymptomsMaster).count()
        if existing > 0:
            print(f"Symptoms already seeded ({existing} symptoms found)")
            return
        
        for symptom_name in SYMPTOMS:
            symptom = SymptomsMaster(name=symptom_name)
            db.add(symptom)
        
        db.commit()
        print(f"✅ Seeded {len(SYMPTOMS)} symptoms successfully")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding symptoms: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_symptoms()
