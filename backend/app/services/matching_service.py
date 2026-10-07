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

        # 4. Shared Passions & Interests (Weight: 20%)
        curr_ints = set(current_profile.interests or [])
        target_ints = set(target_profile.interests or [])
        shared_interests = list(curr_ints.intersection(target_ints))
        
        interest_score = 0.0
        if len(curr_ints) > 0:
            interest_score = min(1.0, len(shared_interests) / min(3, len(curr_ints)))
            if shared_interests:
                reasons.append(f"Shared passions including {', '.join(shared_interests)}")
        else:
            interest_score = 0.5

        # 5. Sri Lankan Location Proximity (Weight: 15%)
        location_score = 0.5
        if current_profile.city.lower() == target_profile.city.lower():
            location_score = 1.0
            if current_profile.neighborhood.lower() == target_profile.neighborhood.lower():
                reasons.append(f"Same local neighborhood: {current_profile.neighborhood}")
            else:
                reasons.append(f"Both located in {current_profile.city}")
        else:
            location_score = 0.4

        # Weighted Total Score
        total_score = (
            intent_score * 0.25 +
            lifestyle_score * 0.20 +
            card_score * 0.20 +
            interest_score * 0.20 +
            location_score * 0.15
        ) * 100.0

        # High-potential conversation openers
        if shared_interests:
            starters.append(f"I noticed we both love {shared_interests[0]}. Have a favorite spot in Sri Lanka for that?")
        starters.append(f"Your lifestyle note about '{target_profile.lifestyle_pace}' stood out to me!")

        return round(total_score, 1), reasons, shared_interests, card_comparisons, starters

    @staticmethod
    async def get_discovery_feed(
        db: AsyncSession,
        current_user_id: str,
        limit: int = 20,
        city_filter: Optional[str] = None,
        intent_filter: Optional[str] = None,
        lifestyle_pace_filter: Optional[str] = None
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
                User.role == "user",
                Profile.deleted_at.is_(None),
            )
            .options(
                selectinload(Profile.photos),
                selectinload(Profile.prompt_answers),
                selectinload(Profile.card_answers),
                selectinload(Profile.user),
            )
        )

        # Optional filters (District, Intent, Lifestyle Pace)
        if city_filter and city_filter != "all":
            query = query.where(
                or_(
                    Profile.city.ilike(f"%{city_filter}%"),
                    Profile.neighborhood.ilike(f"%{city_filter}%")
                )
            )
        if intent_filter and intent_filter != "all":
            query = query.where(Profile.relationship_intent == intent_filter)
        if lifestyle_pace_filter and lifestyle_pace_filter != "all":
            query = query.where(Profile.lifestyle_pace == lifestyle_pace_filter)

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
            cand_cards = {ca.card_id: ca.selected_option_key for ca in (candidate.card_answers or [])}
            
            score, reasons, shared_ints, card_comps, starters = MatchingService.calculate_compatibility(
                current_profile=current_profile,
                target_profile=candidate,
                current_cards=current_user_cards,
                target_cards=cand_cards,
                cards_metadata=cards_metadata,
            )

            if score >= 80:
                level = "Very Strong Connection"
            elif score >= 65:
                level = "Promising Match"
            elif score >= 50:
                level = "Good Starting Point"
            else:
                level = "Different Perspectives"

            target_prof_resp = ProfileService.to_profile_response(candidate, candidate.user)

            scored_profiles.append(DiscoveryProfile(
                profile=target_prof_resp,
                compatibility_score=score,
                compatibility_level=level,
                match_reasons=reasons,
                shared_interests=shared_ints,
                card_comparisons=card_comps,
                suggested_starters=starters,
            ))

        # Order by spotlight priority then compatibility score descending
        def calculate_sort_priority(dp: DiscoveryProfile):
            spotlight = getattr(dp.profile, "spotlight_district", None)
            is_spotlight = 0
            if spotlight:
                if (city_filter and city_filter != "all" and city_filter.lower() in spotlight.lower()) or \
                   (current_profile.city and current_profile.city.lower() in spotlight.lower()):
                    is_spotlight = 1
            return (is_spotlight, dp.compatibility_score)

        scored_profiles.sort(key=calculate_sort_priority, reverse=True)
        return scored_profiles[:limit]
