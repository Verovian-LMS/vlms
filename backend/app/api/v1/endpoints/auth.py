from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db, get_async_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_user_from_token
from app.models.user import User, Profile
from app.schemas.user import UserCreate, UserLogin, Token, ProfileResponse
from datetime import timedelta
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> ProfileResponse:
    """Get current authenticated user."""
    try:
        user_data = get_user_from_token(credentials.credentials)
        
        # Get user profile from database
        result = db.execute(select(Profile).where(Profile.id == user_data["id"]))
        profile = result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        return ProfileResponse.from_orm(profile)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


@router.post("/register", response_model=Token)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user."""
    logger.info(f"DEBUG: Received user_data.role = {user_data.role}")
    logger.info(f"DEBUG: user_data.role type = {type(user_data.role)}")
    logger.info(f"DEBUG: user_data.role value = {user_data.role.value if hasattr(user_data.role, 'value') else 'no value attr'}")
    
    # Check if user already exists
    result = db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_password
    )
    db.add(user)
    db.flush()  # Get the user ID
    
    # Create profile
    logger.info(f"DEBUG: About to create profile with role = {user_data.role}")
    profile = Profile(
        id=user.id,
        name=user_data.name,
        email=user_data.email,
        role=user_data.role
    )
    logger.info(f"DEBUG: Created profile object with role = {profile.role}")
    db.add(profile)
    logger.info(f"DEBUG: Added profile to session, role = {profile.role}")
    db.flush()
    logger.info(f"DEBUG: After flush, profile.role = {profile.role}")
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": profile.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": ProfileResponse(
            id=profile.id,
            name=profile.name,
            email=profile.email,
            avatar=profile.avatar,
            role=profile.role,
            specialty=profile.specialty,
            bio=profile.bio,
            account_status=profile.account_status,
            last_login=profile.last_login,
            created_at=profile.created_at,
            updated_at=profile.updated_at
        )
    }


@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin,
    db: AsyncSession = Depends(get_async_db)
):
    """Authenticate user and return access token."""
    # Get user
    result = await db.execute(select(User).where(User.email == user_credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user profile
    result = await db.execute(select(Profile).where(Profile.id == user.id))
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": profile.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": ProfileResponse.from_orm(profile)
    }


@router.get("/me", response_model=ProfileResponse)
async def get_current_user_profile(current_user: ProfileResponse = Depends(get_current_user)):
    """Get current user profile."""
    return current_user


@router.post("/logout")
async def logout():
    """Logout user (client should discard token)."""
    return {"message": "Successfully logged out"}


@router.get("/health")
async def auth_health():
    """Lightweight health check for the auth service."""
    return {"status": "ok", "service": "auth"}
