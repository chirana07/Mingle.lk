from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from backend.app.models.match import ConnectionRequest, Match
from backend.app.models.chat import Conversation
from backend.app.models.user import User
from backend.app.models.profile import Profile
from backend.app.models.card import ConnectionCard, CardAnswer
from backend.app.schemas.match import ConnectionRequestCreate, ConnectionRequestResponse, MatchResponse
from backend.app.services.profile_service import ProfileService
from backend.app.services.matching_service import MatchingService


class ConnectionService:
    @staticmethod
    async def send_connection_request(
        db: AsyncSession,
        sender_id: str,
        data: ConnectionRequestCreate
    ) -> Tuple[ConnectionRequest, Optional[Match]]:
        """
        Sends a targeted connection request. If receiver already sent a request to sender,
        instantly creates a mutual Match and unlocks Conversation!
        """
        if sender_id == data.receiver_id:
            raise ValueError("Cannot send connection request to yourself.")

        # Check existing reverse request
        reverse_stmt = select(ConnectionRequest).where(
            ConnectionRequest.sender_id == data.receiver_id,
            ConnectionRequest.receiver_id == sender_id,
            ConnectionRequest.status == "pending"
        )
        res = await db.execute(reverse_stmt)
        reverse_req = res.scalar_one_or_none()

        if reverse_req:
            # Mutual match condition met!
            reverse_req.status = "accepted"
            
            # Check or create Match
            match = await ConnectionService._create_match(db, sender_id, data.receiver_id)
            await db.commit()
            return reverse_req, match

        # Check existing sent request
        existing_stmt = select(ConnectionRequest).where(
            ConnectionRequest.sender_id == sender_id,
            ConnectionRequest.receiver_id == data.receiver_id
        )
        e_res = await db.execute(existing_stmt)
        existing_req = e_res.scalar_one_or_none()

        if existing_req:
            return existing_req, None

        req = ConnectionRequest(
            sender_id=sender_id,
            receiver_id=data.receiver_id,
            card_id=data.card_id,
            card_option_key=data.card_option_key,
            prompt_key=data.prompt_key,
            intro_note=data.intro_note,
            status="pending",
        )
        db.add(req)
        await db.commit()
        await db.refresh(req)
        return req, None

    @staticmethod
    async def accept_connection_request(
        db: AsyncSession,
        request_id: str,
        user_id: str
    ) -> Match:
        stmt = select(ConnectionRequest).where(
            ConnectionRequest.id == request_id,
            ConnectionRequest.receiver_id == user_id,
            ConnectionRequest.status == "pending"
        )
        res = await db.execute(stmt)
        req = res.scalar_one_or_none()
        if not req:
            raise ValueError("Connection request not found or already processed.")

        req.status = "accepted"
        match = await ConnectionService._create_match(db, req.sender_id, req.receiver_id)
        await db.commit()
        return match

    @staticmethod
    async def _create_match(db: AsyncSession, user_a_id: str, user_b_id: str) -> Match:
        # Check existing match
        stmt = select(Match).where(
            or_(
                and_(Match.user1_id == user_a_id, Match.user2_id == user_b_id),
                and_(Match.user1_id == user_b_id, Match.user2_id == user_a_id),
            )
        )
        res = await db.execute(stmt)
        existing_match = res.scalar_one_or_none()
        if existing_match:
            return existing_match

        # Compute compatibility score & reasons
        profile_a = await ProfileService.get_profile_by_user_id(db, user_a_id)
        profile_b = await ProfileService.get_profile_by_user_id(db, user_b_id)

        cards_res = await db.execute(select(ConnectionCard).where(ConnectionCard.is_active == 1))
        cards_metadata = {c.id: c for c in cards_res.scalars()}

        cards_a = {ca.card_id: ca.selected_option_key for ca in (profile_a.card_answers if profile_a else [])}
        cards_b = {ca.card_id: ca.selected_option_key for ca in (profile_b.card_answers if profile_b else [])}

        score = 75.0
        reasons = ["Mutual interest in connecting!"]
        if profile_a and profile_b:
            score, reasons, _, _, _ = MatchingService.calculate_compatibility(
                profile_a, profile_b, cards_a, cards_b, cards_metadata
            )

        match = Match(
            user1_id=user_a_id,
            user2_id=user_b_id,
            compatibility_score=score,
            match_reasons=reasons,
            is_active=True,
        )
        db.add(match)
        await db.flush()

        # Create active Conversation
        conversation = Conversation(match_id=match.id)
        db.add(conversation)
        await db.flush()

        return match

    @staticmethod
    async def get_received_requests(db: AsyncSession, user_id: str) -> List[ConnectionRequestResponse]:
        stmt = (
            select(ConnectionRequest)
            .where(ConnectionRequest.receiver_id == user_id, ConnectionRequest.status == "pending")
            .order_by(ConnectionRequest.created_at.desc())
        )
        res = await db.execute(stmt)
        requests = res.scalars().all()

        responses = []
        for r in requests:
            sender_profile = await ProfileService.get_profile_response_by_user_id(db, r.sender_id)
            responses.append(ConnectionRequestResponse(
                id=r.id,
                sender_id=r.sender_id,
                receiver_id=r.receiver_id,
                card_id=r.card_id,
                card_option_key=r.card_option_key,
                prompt_key=r.prompt_key,
                intro_note=r.intro_note,
                status=r.status,
                created_at=r.created_at,
                sender_profile=sender_profile,
            ))
        return responses

    @staticmethod
    async def get_user_matches(db: AsyncSession, user_id: str) -> List[MatchResponse]:
        stmt = (
            select(Match)
            .where(
                or_(Match.user1_id == user_id, Match.user2_id == user_id),
                Match.is_active.is_(True),
                Match.deleted_at.is_(None),
            )
            .options(selectinload(Match.conversation))
            .order_by(Match.created_at.desc())
        )
        res = await db.execute(stmt)
        matches = res.scalars().all()

        responses = []
        for m in matches:
            target_id = m.user2_id if m.user1_id == user_id else m.user1_id
            target_profile = await ProfileService.get_profile_response_by_user_id(db, target_id)
            if not target_profile:
                continue

            starters = [
                f"You both connected over: {m.match_reasons[0] if m.match_reasons else 'shared goals'}!",
                "Who gets to choose the first coffee spot?",
            ]

            responses.append(MatchResponse(
                id=m.id,
                compatibility_score=m.compatibility_score,
                match_reasons=m.match_reasons,
                created_at=m.created_at,
                target_profile=target_profile,
                conversation_id=m.conversation.id if m.conversation else None,
                suggested_starters=starters,
            ))
        return responses
