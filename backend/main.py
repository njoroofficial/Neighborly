from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from sqlmodel import Session, select, or_
from database import create_db_and_tables, get_session
from models import User, HelpRequest
from schemas import UserCreate, UserLogin, UserPublic, RequestCreate, RequestPublic
from auth.security import hash_password, verify_password, create_access_token
from auth.deps import get_current_user
import math
from datetime import datetime
from uuid import UUID



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

    # Create the wristband (Token)
    access_token = create_access_token(data={"sub": user.email})
    
    # Return it to the frontend
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


# User Profile Endpoint

@app.get("/users/me", response_model=UserPublic)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Returns the profile of the currently logged-in user.
    """
    return current_user

# helper function to calculate distance between neighbors
def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Returns distance in km between two coordinates using Haversine formula
    """
    R = 6371  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(d_lat / 2) * math.sin(d_lat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) * math.sin(d_lon / 2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Find Neighbors Endpoint

@app.get("/users/nearby", response_model=list[UserPublic])
def find_nearby_neighbors(
    radius_km: float = 5.0, # Default search radius: 5km
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Get all users (except yourself)
    # Note: For huge apps, use PostGIS (SQL filtering). 
    # For <1000 users, Python filtering is fine.
    statement = select(User).where(User.id != current_user.id)
    all_users = session.exec(statement).all()
    
    nearby_users = []
    
    # 2. Filter by distance
    for user in all_users:
        dist = calculate_distance(
            current_user.latitude, current_user.longitude,
            user.latitude, user.longitude
        )
        if dist <= radius_km:
            nearby_users.append(user)
            
    return nearby_users


# Create Help Request

@app.post("/requests", response_model=RequestPublic)
def create_request(
    request_data: RequestCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    new_request = HelpRequest(
        title=request_data.title,
        description=request_data.description,
        user_id=current_user.id,
        latitude=current_user.latitude,   # Auto-fill location from user
        longitude=current_user.longitude,
        created_at=datetime.utcnow().isoformat()
    )
    
    session.add(new_request)
    session.commit()
    session.refresh(new_request)
    return new_request

# Get my own request

@app.get("/requests/me", response_model=list[RequestPublic])
def read_my_requests(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(HelpRequest).where(HelpRequest.user_id == current_user.id)
    return session.exec(statement).all()


# Get Nearby Requests

@app.get("/requests/nearby", response_model=list[RequestPublic])
def read_nearby_requests(
    radius_km: float = 10.0,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Get all open or in progress requests
    
    statement = select(HelpRequest).where(
        or_(HelpRequest.status == "open", HelpRequest.status == "in_progress")
    )
    all_requests = session.exec(statement).all()
    
    nearby_requests = []
    
    for req in all_requests:
        dist = calculate_distance(
            current_user.latitude, current_user.longitude,
            req.latitude, req.longitude
        )
        if dist <= radius_km:
            nearby_requests.append(req)
            
    return nearby_requests


# Accept Help Request

@app.patch("/requests/{request_id}/accept")
def accept_request(
    request_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # 1. Find the request
    request = session.get(HelpRequest, request_id)
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # 2. Validation
    if request.status != "open":
        raise HTTPException(status_code=400, detail="Request is already taken!")
    
    if request.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot help yourself!")

    # 3. Update the request
    request.status = "in_progress"
    request.helper_id = current_user.id
    
    session.add(request)
    session.commit()
    session.refresh(request)
    
    return {"message": "Request accepted!", "status": "in_progress"}