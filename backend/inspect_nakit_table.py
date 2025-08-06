from sqlalchemy import create_engine, inspect
from core.config import settings
import os

# Load environment variables explicitly
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env.local'))

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

inspector = inspect(engine)

print("Tables in the database:", inspector.get_table_names())

if 'Nakit' in inspector.get_table_names():
    print("\nColumns in Nakit table:")
    columns = inspector.get_columns('Nakit')
    for column in columns:
        print(f"- {column['name']} (Type: {column['type']})")
else:
    print("\nNakit table not found in the database.")
