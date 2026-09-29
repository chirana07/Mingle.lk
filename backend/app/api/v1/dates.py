from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.date import (
    DatePlanCreate, DatePlanResponse, DateSafetyPlanCreate,
    DateSafetyPlanResponse, DateFeedbackSubmit, DateRecommendationItem
)
from backend.app.services.date_service import DateService

router = APIRouter(prefix="/dates", tags=["Date Mode & Safety"])


@router.get("/recommendations", response_model=List[DateRecommendationItem])
async def get_date_recommendations(
    city: Optional[str] = Query("Colombo", description="Filter by city e.g. Colombo, Kandy, Galle"),
    budget: Optional[str] = Query(None, description="Free, Under LKR 2,000, LKR 2,000–5,000, Flexible"),
):
    """Fetch vetted safe, public date locations with vibe and safety highlights"""
    return DateService.get_recommendations(city=city, budget_bracket=budget)


@router.post("/propose", response_model=DatePlanResponse)
async def propose_date(
    data: DatePlanCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Propose an intentional, low-pressure date plan to a match"""
    try:
        return await DateService.create_date_plan(db, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{date_plan_id}/respond", response_model=DatePlanResponse)
async def respond_to_date(
    date_plan_id: str,
    accept: bool = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Accept or decline a date proposal"""
    try:
        return await DateService.respond_to_date_plan(db, date_plan_id, current_user.id, accept)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{date_plan_id}/safety-plan", response_model=DateSafetyPlanResponse)
async def create_safety_plan(
    date_plan_id: str,
    data: DateSafetyPlanCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a private safety plan with a trusted contact and check-in prompt"""
    return await DateService.create_safety_plan(db, date_plan_id, current_user.id, data)


@router.post("/{date_plan_id}/feedback")
async def submit_date_feedback(
    date_plan_id: str,
    data: DateFeedbackSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit post-date comfort and accuracy signals to build platform trust silently"""
    await DateService.submit_date_feedback(db, date_plan_id, current_user.id, data)
    return {"message": "Thank you! Your feedback helps keep Mingle safe and respectful."}
