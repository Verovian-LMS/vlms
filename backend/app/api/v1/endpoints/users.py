from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_async_db
from app.models.user import Profile
from app.schemas.user import ProfileUpdate, ProfileResponse
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    profile_update: ProfileUpdate,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update user profile."""
    # Get profile from database
    result = await db.execute(select(Profile).where(Profile.id == current_user.id))
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update profile fields
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    await db.commit()
    await db.refresh(profile)
    
    return ProfileResponse.from_orm(profile)


@router.get("/profile/{user_id}", response_model=ProfileResponse)
async def get_user_profile(
    user_id: str,
    db: AsyncSession = Depends(get_async_db)
):
    """Get user profile by ID."""
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return ProfileResponse.from_orm(profile)








