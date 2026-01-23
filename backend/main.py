from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select, or_
from database import create_db_and_tables, get_session
from models import User, HelpRequest, Message, Review
from schemas import UserCreate, UserLogin, UserPublic, RequestCreate, RequestPublic, MessageCreate,MessagePublic, ReviewCreate
from auth.security import hash_password, verify_password, create_access_token
from auth.deps import get_current_user
import math
from datetime import datetime
from uuid import UUID
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File 
import shutil
import os
from fastapi.middleware.cors import CORSMiddleware


# The Startup Event
# It runs ONE time when the server starts to make sure our tables exist.
# The Lifespan Context Manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Build the tables
    create_db_and_tables()
    yield
    # Shutdown: Nothing needed here!
    
    
app = FastAPI(lifespan=lifespan)

# The websocket connection manager
class ConnectionManager:
    def __init__(self):
        # A dictionary to hold active connections: {user_id: websocket}
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            # We send JSON data over the socket
            await websocket.send_json(message)

manager = ConnectionManager()


# CORS MIDDLEWARE

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (POST, GET, PATCH, etc.)
    allow_headers=["*"], # Allow all headers (Authorization, etc.)
)

# Mount the static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# A Simple Health Check
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


# Resolve Help Request

@app.patch("/requests/{request_id}/resolve")
def resolve_request(
    request_id: UUID, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    request = session.get(HelpRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    # Security Check: Only the person who ASKED for help can close it
    if request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the requester can resolve this.")

    request.status = "resolved"
    
    session.add(request)
    session.commit()
    return {"message": "Request resolved!"}


# Upload Profile Image

@app.post("/users/image")
def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # 1. Create a safe filename (using user ID to avoid collisions)
    # We use the user's UUID + the file extension
    file_extension = file.filename.split(".")[-1]
    filename = f"{current_user.id}.{file_extension}"
    file_location = f"static/images/{filename}"
    
    # 2. Save the file to disk
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    # 3. Update the User DB record
    # We store the full URL path so the frontend can just use it
    image_url = f"http://127.0.0.1:8000/static/images/{filename}"
    current_user.profile_image = image_url
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return {"message": "Image uploaded", "url": image_url}


# Chat System

# Send a Message
@app.post("/messages", response_model=MessagePublic)
async def send_message( 
    msg_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    new_msg = Message(
        content=msg_data.content,
        sender_id=current_user.id,
        receiver_id=msg_data.receiver_id,
        timestamp=datetime.utcnow().isoformat()
    )
    session.add(new_msg)
    session.commit()
    session.refresh(new_msg)

    # REAL-TIME NOTIFICATION ---
    # We construct the message exactly how the frontend expects it
    socket_data = {
        "id": new_msg.id,
        "content": new_msg.content,
        "sender_id": str(new_msg.sender_id),
        "receiver_id": str(new_msg.receiver_id),
        "timestamp": new_msg.timestamp
    }
    
    # Notify the Receiver (If they are online)
    await manager.send_personal_message(socket_data, str(msg_data.receiver_id))
    
    # Notify the Sender (So my own chat updates instantly too!)
    await manager.send_personal_message(socket_data, str(current_user.id))

    return new_msg


# Get All Conversation

@app.get("/messages/all", response_model=list[MessagePublic])
def get_all_my_messages(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Get any message where I am sender OR receiver
    statement = select(Message).where(
        or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id)
    )
    return session.exec(statement).all()

# Get Conversation with a specific neighbor
@app.get("/messages/{other_user_id}", response_model=list[MessagePublic])
def get_conversation(
    other_user_id: str, # UUID string
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Convert string ID to UUID safely
    try:
        other_uuid = UUID(other_user_id)
    except ValueError as err:
        raise HTTPException(status_code=400, detail="Invalid UUID format") from err
    
    # We want messages where:
    # (Sender is ME and Receiver is THEM) OR (Sender is THEM and Receiver is ME)
    statement = select(Message).where(
        or_(
            (Message.sender_id == current_user.id) & (Message.receiver_id == other_uuid),
            (Message.sender_id == other_uuid) & (Message.receiver_id == current_user.id)
        )
    ).order_by(Message.timestamp)
    
    return session.exec(statement).all()



# Resolve & Review Endpoint

@app.post("/requests/{request_id}/resolve_with_review")
def resolve_and_review(
    request_id: UUID,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # 1. Fetch the request
    request = session.get(HelpRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    # 2. Validate: Only the requester can do this
    if request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your request")
        
    # 3. Validate: Is there actually a helper?
    if not request.helper_id:
        raise HTTPException(status_code=400, detail="No one helped you, so you can't review anyone!")

    # 4. Create the Review
    new_review = Review(
        rating=review_data.rating,
        comment=review_data.comment,
        reviewer_id=current_user.id,
        reviewee_id=request.helper_id, # The person getting the stars
        timestamp=datetime.utcnow().isoformat()
    )
    
    # 5. Mark Request as Resolved
    request.status = "resolved"
    
    session.add(new_review)
    session.add(request)
    session.commit()
    
    return {"message": "Request resolved and review submitted!"}


# get user reviews

@app.get("/users/{user_id}/reviews")
def get_user_reviews(
    user_id: str,
    session: Session = Depends(get_session)
):
    # Convert string ID to UUID safely
    try:
        target_uuid = UUID(user_id)
    except ValueError as err:
        raise HTTPException(status_code=400, detail="Invalid UUID format") from err

    # Fetch reviews (Compare UUID to UUID)
    statement = select(Review).where(Review.reviewee_id == target_uuid)
    reviews = session.exec(statement).all()
    
    return reviews

# WebSocket Endpoint

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id)
