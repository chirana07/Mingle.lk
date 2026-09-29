from typing import List, Tuple, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, not_
from sqlalchemy.orm import selectinload
from backend.app.models.profile import Profile
from backend.app.models.user import User
from backend.app.models.card import ConnectionCard, CardAnswer
from backend.app.models.match import ConnectionRequest, Match
from backend.app.models.safety import Block
from backend.app.schemas.match import DiscoveryProfile
from backend.app.schemas.card import CardComparisonResponse
from backend.app.services.profile_service import ProfileService, calculate_age
from backend.app.core.config import settings


class MatchingService:
    @staticmethod
    def calculate_compatibility(
        current_profile: Profile,
        target_profile: Profile,
        current_cards: Dict[str, str],   # card_id -> selected_option_key
        target_cards: Dict[str, str],    # card_id -> selected_option_key
        cards_metadata: Dict[str, ConnectionCard]
    ) -> Tuple[float, List[str], List[str], List[CardComparisonResponse], List[str]]:
        """
        Calculates explainable compatibility score and human-readable reasons.
        Returns:
            (score [0-100], match_reasons, shared_interests, card_comparisons, suggested_starters)
        """
        reasons = []
        starters = []

        # 1. Intent Compatibility (Weight: 25%)
        intent_score = 0.0
        if current_profile.relationship_intent == target_profile.relationship_intent:
            intent_score = 1.0
            reasons.append(f"Aligned intention: Both looking for {current_profile.relationship_intent.lower()}")
        elif "open to" in current_profile.relationship_intent.lower() or "open to" in target_profile.relationship_intent.lower():
            intent_score = 0.7
            reasons.append("Compatible relationship openness")
        else:
            intent_score = 0.3

        # 2. Lifestyle Compatibility (Weight: 20%)
        lifestyle_score = 0.0
        if current_profile.lifestyle_pace == target_profile.lifestyle_pace:
            lifestyle_score = 1.0
            reasons.append(f"Matching lifestyle rhythm: {current_profile.lifestyle_pace}")
        else:
            lifestyle_score = 0.6

        # 3. Connection Cards Alignment (Weight: 20%)
        card_comparisons = []
        card_score = 0.0
        shared_card_count = 0
        total_compared = 0

        for card_id, user_choice in current_cards.items():
            if card_id in target_cards:
                total_compared += 1
                target_choice = target_cards[card_id]
                card_meta = cards_metadata.get(card_id)
                
                # Find labels
                user_label = user_choice
                target_label = target_choice
                card_question = card_meta.question if card_meta else "Connection Question"
                
                if card_meta and isinstance(card_meta.options, list):
                    for opt in card_meta.options:
                        if opt.get("key") == user_choice:
                            user_label = opt.get("label", user_choice)
                        if opt.get("key") == target_choice:
                            target_label = opt.get("label", target_choice)

                is_identical = (user_choice == target_choice)
                if is_identical:
                    shared_card_count += 1
                    starter = f"You both picked '{user_label}' for '{card_question}'! How did you develop that preference?"
                else:
                    starter = f"You picked '{user_label}' while they chose '{target_label}' for '{card_question}'. Would you be open to trying both?"

                card_comparisons.append(CardComparisonResponse(
                    card_id=card_id,
                    question=card_question,
                    user_choice_key=user_choice,
                    user_choice_label=user_label,
                    target_choice_key=target_choice,
                    target_choice_label=target_label,
                    is_identical=is_identical,
                    conversation_starter=starter
                ))

        if total_compared > 0:
            card_score = shared_card_count / total_compared
            if shared_card_count > 0:
                reasons.append(f"Agreed on {shared_card_count} key Connection Card{'s' if shared_card_count > 1 else ''}")
        else:
            card_score = 0.5  # Neutral default if no shared cards answered yet

        # 4. Shared Interests (Weight: 15%)
        user_interests = set(current_profile.interests or [])
        target_interests = set(target_profile.interests or [])
        shared_interests = list(user_interests.intersection(target_interests))
        
        interest_score = min(1.0, len(shared_interests) / 3.0) if user_interests else 0.5
        if shared_interests:
            reasons.append(f"{len(shared_interests)} shared passions: {', '.join(shared_interests[:3])}")
            starters.append(f"I noticed we both love {shared_interests[0]}! What's your favourite experience with that in Sri Lanka?")

        # 5. Communication Style (Weight: 10%)
        comm_score = 0.0
        if current_profile.communication_style == target_profile.communication_style:
            comm_score = 1.0
            reasons.append(f"Same communication pace: {current_profile.communication_style}")
        else:
            comm_score = 0.5

        # 6. Location / Neighborhood Proximity (Weight: 10%)
        loc_score = 0.0
        if current_profile.city == target_profile.city:
            if current_profile.neighborhood == target_profile.neighborhood:
                loc_score = 1.0
                reasons.append(f"Same local neighborhood: {current_profile.neighborhood}")
            else:
                loc_score = 0.8
                reasons.append(f"Nearby in {current_profile.city}")
        else:
            loc_score = 0.4

        # Weighted composite score
        composite = (
            (intent_score * settings.WEIGHT_INTENT) +
            (lifestyle_score * settings.WEIGHT_LIFESTYLE) +
            (card_score * settings.WEIGHT_CARDS) +
            (interest_score * settings.WEIGHT_INTERESTS) +
            (comm_score * settings.WEIGHT_COMMUNICATION) +
            (loc_score * settings.WEIGHT_LOCATION)
        ) * 100.0

        # Ensure at least 2 conversational starters
        if not starters:
            starters.append(f"Hey {target_profile.first_name}, what's your favourite weekend spot around {target_profile.neighborhood}?")
            if target_profile.prompt_answers:
                p = target_profile.prompt_answers[0]
                starters.append(f"Loved your answer to '{p.prompt_question}': '{p.answer_text}'. Tell me more!")

        return round(composite, 1), reasons, shared_interests, card_comparisons, starters

    @staticmethod
    async def get_discovery_feed(
        db: AsyncSession,
        current_user_id: str,
        limit: int = 20,
        city_filter: Optional[str] = None,
        intent_filter: Optional[str] = None
    ) -> List[DiscoveryProfile]:
        """
        Produces a curated discovery feed excluding blocked users, already connected/matched users,
        and accounts that have disabled discovery.
        """
        current_profile = await ProfileService.get_profile_by_user_id(db, current_user_id)
        if not current_profile:
            return []

        # Find blocked user IDs (both ways)
        block_stmt = select(Block).where(
            or_(Block.blocker_id == current_user_id, Block.blocked_id == current_user_id)
        )
        b_res = await db.execute(block_stmt)
        blocked_user_ids = set()
        for b in b_res.scalars():
            blocked_user_ids.add(b.blocker_id)
            blocked_user_ids.add(b.blocked_id)

        # Find already requested or matched user IDs
        req_stmt = select(ConnectionRequest).where(
            or_(ConnectionRequest.sender_id == current_user_id, ConnectionRequest.receiver_id == current_user_id)
        )
        r_res = await db.execute(req_stmt)
        connected_user_ids = {r.sender_id for r in r_res.scalars()}.union({r.receiver_id for r in r_res.scalars()})

        match_stmt = select(Match).where(
            or_(Match.user1_id == current_user_id, Match.user2_id == current_user_id)
        )
        m_res = await db.execute(match_stmt)
        for m in m_res.scalars():
            connected_user_ids.add(m.user1_id)
            connected_user_ids.add(m.user2_id)

        excluded_ids = blocked_user_ids.union(connected_user_ids)
        excluded_ids.add(current_user_id)

        # Fetch current user's card answers
        user_card_answers_stmt = select(CardAnswer).where(CardAnswer.profile_id == current_profile.id)
        uca_res = await db.execute(user_card_answers_stmt)
        current_user_cards = {ca.card_id: ca.selected_option_key for ca in uca_res.scalars()}

        # Fetch candidate profiles
        query = (
            select(Profile)
            .join(User, Profile.user_id == User.id)
            .where(
                not_(User.id.in_(list(excluded_ids))),
                User.status == "active",
                User.discovery_enabled.is_(True),
                Profile.deleted_at.is_(None),
            )
            .options(
                selectinload(Profile.photos),
                selectinload(Profile.prompt_answers),
                selectinload(Profile.card_answers),
                selectinload(Profile.user),
            )
        )

        # Optional filters
        if city_filter:
            query = query.where(Profile.city.ilike(f"%{city_filter}%"))
        if intent_filter:
            query = query.where(Profile.relationship_intent == intent_filter)

        # Gender preference matching
        if current_profile.looking_for_gender != "everyone":
            query = query.where(Profile.gender == current_profile.looking_for_gender)

        result = await db.execute(query.limit(limit * 2))
        candidate_profiles = result.scalars().all()

        # Fetch all active cards metadata
        all_cards_res = await db.execute(select(ConnectionCard).where(ConnectionCard.is_active == 1))
        cards_metadata = {c.id: c for c in all_cards_res.scalars()}

        scored_profiles = []
        for candidate in candidate_profiles:
            # Candidate's card answers
            cand_cards = {ca.card_id: ca.selected_option_key for ca in (candidate.card_answers or [])}
            
            score, reasons, shared_ints, card_comps, starters = MatchingService.calculate_compatibility(
                current_profile=current_profile,
                target_profile=candidate,
                current_cards=current_user_cards,
                target_cards=cand_cards,
                cards_metadata=cards_metadata,
            )

            # Categorize level
            if score >= 80:
                level = "Very Strong Connection"
            elif score >= 65:
                level = "High Compatibility"
            else:
                level = "Great Potential"

            scored_profiles.append((
                score,
                DiscoveryProfile(
                    profile=ProfileService.to_profile_response(candidate, candidate.user),
                    compatibility_score=score,
                    compatibility_level=level,
                    match_reasons=reasons,
                    shared_interests=shared_ints,
                    card_comparisons=card_comps,
                    suggested_starters=starters,
                )
            ))

        # Sort descending by compatibility score
        scored_profiles.sort(key=lambda x: x[0], reverse=True)
        return [sp[1] for sp in scored_profiles[:limit]]
