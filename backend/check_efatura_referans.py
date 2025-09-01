import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env.local'))

# Import models after loading environment
from core.config import settings
from db.models import EFaturaReferans

# Create database engine
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_efatura_referans():
    db = SessionLocal()
    try:
        # Check for FASDAT entries
        fasdat_referans = db.query(EFaturaReferans).filter(
            EFaturaReferans.Alici_Unvani.like('%FASDAT%')
        ).all()
        
        print(f"Found {len(fasdat_referans)} FASDAT referans entries:")
        for ref in fasdat_referans:
            print(f"  - Alici_Unvani: {ref.Alici_Unvani}")
            print(f"    Kategori_ID: {ref.Kategori_ID}")
            print(f"    Aktif_Pasif: {ref.Aktif_Pasif}")
            print()
            
        # Check all referans entries with Kategori_ID = 17
        kategori_17_referans = db.query(EFaturaReferans).filter(
            EFaturaReferans.Kategori_ID == 17
        ).all()
        
        print(f"Found {len(kategori_17_referans)} referans entries with Kategori_ID = 17:")
        for ref in kategori_17_referans:
            print(f"  - Alici_Unvani: {ref.Alici_Unvani}")
            print(f"    Kategori_ID: {ref.Kategori_ID}")
            print(f"    Aktif_Pasif: {ref.Aktif_Pasif}")
            print()
            
    finally:
        db.close()

if __name__ == "__main__":
    check_efatura_referans()