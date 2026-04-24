"""
Database migration: Add custom_text field to case_symptoms table.
Run this script to update existing databases.
"""
from sqlalchemy import text
from app.sessions.db import SessionLocal, engine


def migrate_add_custom_text_field():
    """Add custom_text field to case_symptoms table."""
    db = SessionLocal()
    try:
        # Check if column already exists
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'case_symptoms' 
            AND column_name = 'custom_text'
        """))
        
        if result.fetchone():
            print("✅ custom_text column already exists in case_symptoms table")
            return
        
        # Add the column
        db.execute(text("""
            ALTER TABLE case_symptoms 
            ADD COLUMN custom_text TEXT NULL
        """))
        
        db.commit()
        print("✅ Successfully added custom_text column to case_symptoms table")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error adding custom_text column: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    migrate_add_custom_text_field()