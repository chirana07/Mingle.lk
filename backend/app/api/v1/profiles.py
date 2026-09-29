from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.profile import ProfileCreate, ProfileResponse, ProfileUpdate
from backend.app.services.profile_service import ProfileService

router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.get("/me", response_model=Optional[ProfileResponse])
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve authenticated user's full profile"""
    profile = await ProfileService.get_profile_response_by_user_id(db, current_user.id)
    return profile


@router.post("/me", response_model=ProfileResponse)
async def create_or_update_my_profile(
    data: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create or update full conversational profile, photos, and prompts"""
    return await ProfileService.create_or_update_profile(db, current_user.id, data)


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_user_profile(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """View public profile of another user with privacy-filtered location"""
    profile = await ProfileService.get_profile_response_by_user_id(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return profile


@router.patch("/me/privacy")
async def update_privacy_settings(
    discovery_enabled: Optional[bool] = None,
    show_neighborhood_only: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Adjust Discovery Mode and privacy controls"""
    if discovery_enabled is not None:
        current_user.discovery_enabled = discovery_enabled
    if show_neighborhood_only is not None:
        current_user.show_neighborhood_only = show_neighborhood_only
    await db.commit()
    return {"message": "Privacy settings updated successfully."}
