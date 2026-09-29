from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.match import DiscoveryProfile
from backend.app.services.matching_service import MatchingService

router = APIRouter(prefix="/discovery", tags=["Discovery Engine"])


@router.get("", response_model=List[DiscoveryProfile])
async def get_discovery_feed(
    city: Optional[str] = Query(None, description="Filter by city e.g. Colombo, Kandy, Galle"),
    intent: Optional[str] = Query(None, description="Filter by relationship intent"),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get explainable discovery feed with compatibility scores, shared reasons,
    and organic conversation openers.
    """
    return await MatchingService.get_discovery_feed(
        db=db,
        current_user_id=current_user.id,
        limit=limit,
        city_filter=city,
        intent_filter=intent,
    )
