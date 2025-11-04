from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.user import Role, AccountStatus


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    role: Role


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProfileCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    role: Role
    specialty: Optional[str] = None
    bio: Optional[str] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    specialty: Optional[str] = None
    bio: Optional[str] = None
    account_status: Optional[AccountStatus] = None


class ProfileResponse(BaseModel):
    id: UUID
    name: Optional[str]
    email: Optional[str]
    avatar: Optional[str]
    role: Role
    specialty: Optional[str]
    bio: Optional[str]
    account_status: AccountStatus
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: ProfileResponse


class TokenData(BaseModel):
    email: Optional[str] = None








