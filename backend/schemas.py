from pydantic import BaseModel
from uuid import UUID

# UserLogin: What we expect for /login
class UserLogin(BaseModel):
    email: str
    password: str

# UserCreate: What we expect for /register
class UserCreate(BaseModel):
    name: str
    email: str
    password: str  # Frontend sends 'password', not 'password_hash'
    role: str = "neighbor" # Default role
    latitude: float
    longitude: float

# UserPublic: What we send BACK to the frontend (No passwords!)
class UserPublic(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    is_verified: bool
    latitude: float  
    longitude: float
    profile_image: str | None = None

# Incoming Data (What the user types)
class RequestCreate(BaseModel):
    title: str
    description: str

# Outgoing Data (What the map sees)
class RequestPublic(BaseModel):
    id: UUID
    title: str
    description: str
    status: str
    created_at: str
    user_id: UUID
    latitude: float
    longitude: float

# Incoming Message
class MessageCreate(BaseModel):
    content: str
    receiver_id: UUID

# Outgoing Message (What the frontend sees)
class MessagePublic(BaseModel):
    id: int
    content: str
    timestamp: str
    sender_id: UUID
    receiver_id: UUID