from app.sessions.db import SessionLocal
from app.models.case import Case
from app.models.case_file import CaseFile
from sqlalchemy import distinct

db = SessionLocal()

try:
    total_cases = db.query(Case.id).count()
    cases_with_files = db.query(distinct(CaseFile.case_id)).count()
    
    print(f"Total cases in DB: {total_cases}")
    print(f"Unique case_ids in case_files table: {cases_with_files}")
    
    # Let's find cases that don't have files
    cases_without_files = db.query(Case.id, Case.catalog_number).filter(
        ~Case.id.in_(db.query(CaseFile.case_id).distinct().subquery())
    ).all()
    print(f"Cases without files count: {len(cases_without_files)}")
    for c in cases_without_files:
        print(f"Case ID: {c.id}, Catalog: {c.catalog_number}")
        
finally:
    db.close()
