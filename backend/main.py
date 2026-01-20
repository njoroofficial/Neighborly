from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from sqlmodel import Session, select
from database import create_db_and_tables, get_session
from models import User
from schemas import UserCreate, UserLogin, UserPublic
from auth.security import hash_password, verify_password 



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

# Registration Endpoint
@app.post("/register", response_model=UserPublic)
def register_user(user_input: UserCreate, session: Session = Depends(get_session)):

    # Check if email already exists
    statement = select(User).where(User.email == user_input.email)
    existing_user = session.exec(statement).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_pwd = hash_password(user_input.password)

    # Create the DB User object
    # We map user_input data to the User model, but swap password for password_hash
    new_user = User(
        name=user_input.name,
        email=user_input.email,
        password_hash=hashed_pwd, 
        role=user_input.role,
        latitude=user_input.latitude,
        longitude=user_input.longitude
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    return new_user

# Login endpoint
@app.post("/login")
def login_user(user_input: UserLogin, session: Session = Depends(get_session)):
    # Find the user
    statement = select(User).where(User.email == user_input.email)
    user = session.exec(statement).first()

    # Check if user exists AND password matches
    if not user or not verify_password(user_input.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Success! (For now, just a message. Later, a Token)
    return {"message": "Login successful!", "user_id": user.id, "name": user.name}

