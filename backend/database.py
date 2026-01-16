from sqlmodel import SQLModel, create_engine, Session

# 1. The Connection String
# For local dev, we use SQLite (a file). In production, we just swap this URL for PostgreSQL.
sqlite_file_name = "neighborly.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# 2. The Engine
# The engine is the connection factory.
# echo=True means "Log every SQL query to the terminal" (Great for learning!)
engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})

# 3. The Initializer
# This function looks at your models.py and creates the tables in the database
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# 4. The Dependency
# This is a special function for FastAPI.
# It opens a fresh session for a request, and closes it when the request is done.
def get_session():
    with Session(engine) as session:
        yield session