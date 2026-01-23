from sqlmodel import SQLModel, create_engine, Session
from models import User, HelpRequest
import os

# Database Configuration
# Uses PostgreSQL in production (from DATABASE_URL env var)
# Falls back to SQLite for local development

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Production: Use PostgreSQL
    # Render uses "postgres://" but SQLAlchemy needs "postgresql://"
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    engine = create_engine(DATABASE_URL, echo=False)
else:
    # Development: Use SQLite
    sqlite_file_name = "neighborly.db"
    sqlite_url = f"sqlite:///{sqlite_file_name}"
    engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})


def create_db_and_tables():
    """Create all database tables"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """
    Dependency function for FastAPI.
    Opens a fresh session for a request and closes it when done.
    """
    with Session(engine) as session:
        yield session