from fastapi import FastAPI
from contextlib import asynccontextmanager
from database import create_db_and_tables


# 1. The Startup Event
# It runs ONE time when the server starts to make sure our tables exist.
# The Lifespan Context Manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Build the tables
    create_db_and_tables()
    yield
    # Shutdown: Nothing needed here!
    
    

app = FastAPI(lifespan=lifespan)

# 2. A Simple Health Check
# Just to make sure the API is talking to us.
@app.get("/")
def read_root():
    return {"message": "Welcome to Neighborly API 🏡"}