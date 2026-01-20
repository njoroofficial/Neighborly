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