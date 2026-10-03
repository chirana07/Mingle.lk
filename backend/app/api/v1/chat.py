from typing import List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db, AsyncSessionLocal
from backend.app.api.deps import get_current_user
from backend.app.core.security import decode_token
from backend.app.models.user import User
from backend.app.models.chat import Conversation
from backend.app.schemas.chat import ConversationSummary, MessageResponse, MessageSend
from backend.app.services.chat_service import ChatService, ws_manager

router = APIRouter(prefix="/chat", tags=["Chat & Realtime Messaging"])


@router.get("/conversations", response_model=List[ConversationSummary])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all active conversations with target profiles, latest messages, and unread counts"""
    return await ChatService.get_user_conversations(db, current_user.id)


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: str,
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve message history for a conversation and mark as read"""
    try:
        return await ChatService.get_messages(db, conversation_id, current_user.id, limit)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: str,
    data: MessageSend,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message, run anti-scam heuristics, and broadcast to active WebSockets"""
    try:
        msg = await ChatService.send_message(db, conversation_id, current_user.id, data.content)
        # Broadcast via WebSocket if room active
        await ws_manager.broadcast_to_room(conversation_id, {
            "type": "new_message",
            "message": {
                "id": msg.id,
                "conversation_id": msg.conversation_id,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
                "read_at": msg.read_at.isoformat() if msg.read_at else None,
            }
        })
        return msg
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.websocket("/ws/{conversation_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    conversation_id: str,
    token: str = Query(...)
):
    """Realtime WebSocket endpoint for messaging, typing indicators, and read states"""
    payload = decode_token(token)
    if not payload or not payload.get("sub"):
        await websocket.close(code=4001)
        return

    user_id = payload["sub"]

    # Verify conversation exists and user is an authorized participant (IDOR authorization check)
    async with AsyncSessionLocal() as session:
        c_stmt = (
            select(Conversation)
            .where(Conversation.id == conversation_id)
            .options(selectinload(Conversation.match))
        )
        c_res = await session.execute(c_stmt)
        conv = c_res.scalar_one_or_none()
        if not conv or not conv.match or user_id not in (conv.match.user1_id, conv.match.user2_id):
            await websocket.close(code=4003)
            return

    await ws_manager.connect(websocket, conversation_id, user_id)

    try:
        while True:
            data = await websocket.receive_json()
            # Support both 'type' and 'action' conventions
            event_type = data.get("type") or data.get("action")

            if event_type in ["message", "send_message"]:
                content = data.get("content", "").strip()
                if content:
                    async with AsyncSessionLocal() as session:
                        msg = await ChatService.send_message(session, conversation_id, user_id, content)
                        await ws_manager.broadcast_to_room(conversation_id, {
                            "type": "new_message",
                            "message": {
                                "id": msg.id,
                                "conversation_id": msg.conversation_id,
                                "sender_id": msg.sender_id,
                                "content": msg.content,
                                "created_at": msg.created_at.isoformat(),
                                "read_at": None,
                            }
                        })
            elif event_type == "typing":
                await ws_manager.broadcast_to_room(conversation_id, {
                    "type": "typing",
                    "user_id": user_id,
                    "is_typing": data.get("is_typing", False)
                })
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, conversation_id, user_id)
    except Exception:
        ws_manager.disconnect(websocket, conversation_id, user_id)

