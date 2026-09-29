from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.match import ConnectionRequestCreate, ConnectionRequestResponse, MatchResponse
from backend.app.services.connection_service import ConnectionService

router = APIRouter(prefix="/connections", tags=["Connections & Matches"])


@router.post("/request")
async def send_connection_request(
    data: ConnectionRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send an intentional connection request attached to a specific Connection Card or prompt.
    If the recipient already sent a request, instantly unlocks a mutual match!
    """
    try:
        req, match = await ConnectionService.send_connection_request(db, current_user.id, data)
        if match:
            return {
                "status": "matched",
                "message": "It's a connection! You both expressed mutual interest.",
                "match_id": match.id
            }
        return {
            "status": "pending",
            "message": "Connection request sent successfully.",
            "request_id": req.id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/received", response_model=List[ConnectionRequestResponse])
async def get_received_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List pending connection requests received by the current user"""
    return await ConnectionService.get_received_requests(db, current_user.id)


@router.post("/{request_id}/accept")
async def accept_connection(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Accept a pending connection request and unlock the conversation"""
    try:
        match = await ConnectionService.accept_connection_request(db, request_id, current_user.id)
        return {
            "status": "matched",
            "message": "Connection accepted! Conversation unlocked.",
            "match_id": match.id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/matches", response_model=List[MatchResponse])
async def get_matches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all mutual matches with compatibility reasons and suggested starters"""
    return await ConnectionService.get_user_matches(db, current_user.id)
