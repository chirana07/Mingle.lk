from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_admin, get_current_user
from backend.app.models.user import User
from backend.app.models.analytics import AnalyticsEvent
from backend.app.schemas.admin import (
    AdminDashboardMetrics, AdminUserUpdate, AdminReportUpdate, AnalyticsTrackRequest
)
from backend.app.schemas.safety import ReportResponse
from backend.app.schemas.auth import UserResponse
from backend.app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin & Moderation"])


@router.get("/metrics", response_model=AdminDashboardMetrics)
async def get_dashboard_metrics(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Investor & Moderation dashboard metrics with live conversion funnels"""
    return await AdminService.get_metrics(db)


@router.get("/reports", response_model=List[ReportResponse])
async def get_moderation_queue(
    limit: int = Query(50, ge=1, le=100),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve moderation queue of user reports"""
    return await AdminService.get_all_reports(db, limit)


@router.patch("/reports/{report_id}", response_model=ReportResponse)
async def update_report_status(
    report_id: str,
    data: AdminReportUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update report review status and admin notes"""
    updated = await AdminService.update_report(db, report_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Report not found.")
    return updated


@router.get("/users", response_model=List[UserResponse])
async def get_users_list(
    limit: int = Query(50, ge=1, le=100),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """List users for moderation and account status review"""
    return await AdminService.get_all_users(db, limit)


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user_status(
    user_id: str,
    data: AdminUserUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Suspend, ban, verify, or change role of a user"""
    updated = await AdminService.update_user(db, user_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found.")
    return updated


@router.post("/track")
async def track_event(
    data: AnalyticsTrackRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Log an analytics event for funnel and conversion tracking"""
    event = AnalyticsEvent(
        user_id=current_user.id,
        event_name=data.event_name,
        properties=data.properties
    )
    db.add(event)
    await db.commit()
    return {"status": "recorded"}
