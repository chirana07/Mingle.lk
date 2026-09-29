from typing import List, Optional, Dict, Set, Tuple
from datetime import datetime, timezone
import re
from fastapi import WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import selectinload
from backend.app.models.chat import Conversation, Message
from backend.app.models.match import Match
from backend.app.models.user import User
from backend.app.schemas.chat import MessageResponse, ConversationSummary, MessageSend
from backend.app.services.profile_service import ProfileService

# Anti-scam keyword triggers for early fraud detection
SUSPICIOUS_PATTERNS = [
    r"\b(crypto|bitcoin|usdt|binance)\b",
    r"\b(bank transfer|commercial bank|boc|sampath|hnb|account number)\b",
    r"\b(send money|emergency cash|lkr \d{4,}|urgent loan)\b",
    r"\b(telegram me|whatsapp me \+94\d{9}|contact me outside)\b",
]


class ChatService:
    @staticmethod
    def scan_for_safety(content: str) -> Tuple[bool, Optional[str]]:
        """Scans message content for suspicious scam or solicitation keywords"""
        lower = content.lower()
        for pattern in SUSPICIOUS_PATTERNS:
            if re.search(pattern, lower):
                return True, "Potential financial solicitation or external redirect detected"
        return False, None

    @staticmethod
    async def get_user_conversations(db: AsyncSession, user_id: str) -> List[ConversationSummary]:
        stmt = (
            select(Conversation)
            .join(Match, Conversation.match_id == Match.id)
            .where(
                or_(Match.user1_id == user_id, Match.user2_id == user_id),
                Match.is_active.is_(True),
            )
            .options(
                selectinload(Conversation.match),
                selectinload(Conversation.messages),
            )
            .order_by(Conversation.updated_at.desc())
        )
        res = await db.execute(stmt)
        convs = res.scalars().all()

        summaries = []
        for c in convs:
            match = c.match
            target_id = match.user2_id if match.user1_id == user_id else match.user1_id
            target_profile = await ProfileService.get_profile_response_by_user_id(db, target_id)
            if not target_profile:
                continue

            # Latest message
            last_msg = None
            unread_count = 0
            if c.messages:
                sorted_msgs = sorted(c.messages, key=lambda m: m.created_at)
                last_m = sorted_msgs[-1]
                last_msg = MessageResponse(
                    id=last_m.id,
                    conversation_id=last_m.conversation_id,
                    sender_id=last_m.sender_id,
                    content=last_m.content,
                    created_at=last_m.created_at,
                    read_at=last_m.read_at,
                    is_mine=(last_m.sender_id == user_id),
                )
                unread_count = sum(1 for m in sorted_msgs if m.sender_id != user_id and m.read_at is None)

            starters = [
                f"Hey {target_profile.first_name}, how's your week in {target_profile.neighborhood} going?",
                "What's your go-to weekend spot for good coffee or kottu?",
            ]

            summaries.append(ConversationSummary(
                id=c.id,
                match_id=match.id,
                target_profile=target_profile,
                last_message=last_msg,
                unread_count=unread_count,
                updated_at=c.updated_at or c.created_at,
                suggested_starters=starters,
            ))
        return summaries

    @staticmethod
    async def get_messages(
        db: AsyncSession,
        conversation_id: str,
        user_id: str,
        limit: int = 50
    ) -> List[MessageResponse]:
        # Verify access
        c_stmt = select(Conversation).where(Conversation.id == conversation_id).options(selectinload(Conversation.match))
        c_res = await db.execute(c_stmt)
        conv = c_res.scalar_one_or_none()
        if not conv or (conv.match.user1_id != user_id and conv.match.user2_id != user_id):
            raise ValueError("Conversation not found or access denied.")

        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
        )
        res = await db.execute(stmt)
        messages = res.scalars().all()

        # Mark unread messages as read
        now = datetime.now(timezone.utc)
        for m in messages:
            if m.sender_id != user_id and m.read_at is None:
                m.read_at = now
        await db.commit()

        return [
            MessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                sender_id=m.sender_id,
                content=m.content,
                created_at=m.created_at,
                read_at=m.read_at,
                is_mine=(m.sender_id == user_id),
            )
            for m in messages
        ]

    @staticmethod
    async def send_message(
        db: AsyncSession,
        conversation_id: str,
        sender_id: str,
        content: str
    ) -> MessageResponse:
        c_stmt = select(Conversation).where(Conversation.id == conversation_id).options(selectinload(Conversation.match))
        c_res = await db.execute(c_stmt)
        conv = c_res.scalar_one_or_none()
        if not conv or (conv.match.user1_id != sender_id and conv.match.user2_id != sender_id):
            raise ValueError("Conversation not found or access denied.")

        # Scan for scam signals
        is_flagged, flag_reason = ChatService.scan_for_safety(content)

        msg = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content,
            is_flagged=is_flagged,
            flag_reason=flag_reason,
        )
        db.add(msg)
        conv.last_message_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(msg)

        return MessageResponse(
            id=msg.id,
            conversation_id=msg.conversation_id,
            sender_id=msg.sender_id,
            content=msg.content,
            created_at=msg.created_at,
            read_at=msg.read_at,
            is_mine=True,
        )


# Realtime WebSocket Connection Manager
class RealtimeConnectionManager:
    def __init__(self):
        # conversation_id -> set of WebSocket connections
        self.active_rooms: Dict[str, Set[WebSocket]] = {}
        # user_id -> set of active WebSockets
        self.user_sockets: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, conversation_id: str, user_id: str):
        await websocket.accept()
        if conversation_id not in self.active_rooms:
            self.active_rooms[conversation_id] = set()
        self.active_rooms[conversation_id].add(websocket)

        if user_id not in self.user_sockets:
            self.user_sockets[user_id] = set()
        self.user_sockets[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, conversation_id: str, user_id: str):
        if conversation_id in self.active_rooms:
            self.active_rooms[conversation_id].discard(websocket)
            if not self.active_rooms[conversation_id]:
                del self.active_rooms[conversation_id]

        if user_id in self.user_sockets:
            self.user_sockets[user_id].discard(websocket)
            if not self.user_sockets[user_id]:
                del self.user_sockets[user_id]

    async def broadcast_to_room(self, conversation_id: str, data: dict):
        if conversation_id in self.active_rooms:
            for connection in list(self.active_rooms[conversation_id]):
                try:
                    await connection.send_json(data)
                except Exception:
                    self.active_rooms[conversation_id].discard(connection)


ws_manager = RealtimeConnectionManager()
