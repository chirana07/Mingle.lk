from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.safety import ReportCreate, ReportResponse, BlockCreate, BlockResponse
from backend.app.services.safety_service import SafetyService

router = APIRouter(prefix="/safety", tags=["Trust & Safety"])


@router.post("/report", response_model=ReportResponse)
async def report_user(
    data: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Report a user for harassment, fake profile, financial solicitation, or inappropriate media.
    Silently isolates the reporter and sends the case to moderation queue.
    """
    if data.reported_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot report yourself.")
    return await SafetyService.report_user(db, current_user.id, data)


@router.post("/block", response_model=BlockResponse)
async def block_user(
    data: BlockCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Block a user immediately from Discovery, Connections, and Chat"""
    if data.blocked_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot block yourself.")
    return await SafetyService.block_user(db, current_user.id, data)
