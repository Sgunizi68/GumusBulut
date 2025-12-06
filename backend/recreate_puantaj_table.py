from dotenv import load_dotenv
import os

# Load environment variables explicitly
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env.local'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from db.database import Base, engine
from db.models import Nakit

# Drop the Nakit table
print("Dropping Nakit table...")
Nakit.__table__.drop(engine)
print("Nakit table dropped.")

# Recreate all tables (this will recreate Puantaj with the new schema)
print("Recreating all tables...")
Base.metadata.create_all(bind=engine)
print("All tables recreated.")

print("Database schema updated successfully for Puantaj table.")