from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env.local'))

class Settings:
    PROJECT_NAME: str = "SilverCloud Backend API"
    PROJECT_VERSION: str = "1.0.0"

    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    DATABASE_URL: str = (
        f"mysql+mysqlconnector://{os.getenv('DB_USER')}:"
        f"{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}:"
        f"{os.getenv('DB_PORT')}/"
        f"{os.getenv('DB_NAME')}"
        
    )

settings = Settings()