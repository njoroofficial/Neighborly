from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel

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

# # 2. The Task Blueprint
class Task(SQLModel, table=True): 
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    title: str
    description: str
    status: str = Field(default="open")
    requester_id: UUID = Field(foreign_key="user.id")
    volunteer_id: Optional[UUID] = Field(default=None, foreign_key="user.id")


    