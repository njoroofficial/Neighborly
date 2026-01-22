from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, Integer, CheckConstraint
from pydantic import field_validator

# 1. The User Blueprint
class User(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    name: str
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: str
    latitude: float
    longitude: float
    is_verified: bool = Field(default=False)
    profile_image: Optional[str] = None # We will store the URL path here

# The Task Blueprint
class HelpRequest(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    title: str
    description: str
    status: str = "open" # open, in_progress, resolved
    created_at: str      # We'll store simple strings for now
    # Who asked?
    user_id: Optional[UUID] = Field(default=None, foreign_key="user.id")
    # Who is helping?
    helper_id: Optional[UUID] = Field(default=None, foreign_key="user.id") 
    
    # Denormalization: Storing location directly on the request makes filtering faster
    latitude: float
    longitude: float

# The messages shared 
class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    timestamp: str
    
    # Relationships
    sender_id: UUID = Field(foreign_key="user.id")
    receiver_id: UUID = Field(foreign_key="user.id")

class Review(SQLModel, table=True):
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="rating_range"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    rating: int = Field(sa_column=Column(Integer, nullable=False))  # 1 to 5
    comment: str
    reviewer_id: UUID = Field(foreign_key="user.id")
    reviewee_id: UUID = Field(foreign_key="user.id") # The person being reviewed
    timestamp: str
    
    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("Rating must be between 1 and 5")
        return v
    