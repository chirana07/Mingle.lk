from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from backend.app.models.date import DatePlan, DateSafetyPlan, DateFeedback
from backend.app.models.match import Match
from backend.app.models.user import User
from backend.app.schemas.date import (
    DatePlanCreate, DatePlanResponse, DateSafetyPlanCreate,
    DateSafetyPlanResponse, DateFeedbackSubmit, DateRecommendationItem
)

# Curated Sri Lankan Safe Public Venues & Date Concepts
CURATED_DATE_SPOTS = [
    DateRecommendationItem(
        category="Coffee & Walk",
        venue_name="Department of Coffee",
        neighborhood="Colombo 07",
        city="Colombo",
        budget_bracket="Under LKR 2,000",
        vibe_description="Specialty coffee in an airy, tranquil setting near Viharamahadevi Park.",
        safety_highlights="High foot traffic, public park proximity, polite staff, open daylight.",
        why_recommended="Ideal low-pressure first meeting with option for an outdoor stroll in the park."
    ),
    DateRecommendationItem(
        category="Cafe & Books",
        venue_name="Barefoot Garden Cafe",
        neighborhood="Colombo 03",
        city="Colombo",
        budget_bracket="LKR 2,000–5,000",
        vibe_description="Iconic courtyard surrounded by Sri Lankan textile art, books, and live acoustic music.",
        safety_highlights="Secure premises, established cultural landmark, respectful crowd, open garden.",
        why_recommended="Rich conversational backdrop with an art gallery and bookshop on site."
    ),
    DateRecommendationItem(
        category="Beach Sunset",
        venue_name="Mount Lavinia Beach Promenade",
        neighborhood="Mount Lavinia",
        city="Colombo",
        budget_bracket="Free",
        vibe_description="Golden hour ocean breezes, scenic train line views, and fresh thambili (king coconut).",
        safety_highlights="Busy seaside promenade, family friendly, public road access.",
        why_recommended="Completely free, casual, and relaxed atmosphere to talk without cafe noise."
    ),
    DateRecommendationItem(
        category="Casual Bites",
        venue_name="Black Cat Cafe",
        neighborhood="Colombo 07",
        city="Colombo",
        budget_bracket="Under LKR 2,000",
        vibe_description="Cozy heritage bungalow with artisanal roasts, light wraps, and local art displays.",
        safety_highlights="Visible counter, central residential neighborhood, well-lit.",
        why_recommended="Intimate yet public setting suited for thoughtful deep conversations."
    ),
    DateRecommendationItem(
        category="Art & Culture",
        venue_name="National Museum & Viharamahadevi Walk",
        neighborhood="Colombo 07",
        city="Colombo",
        budget_bracket="Free",
        vibe_description="Cultural exploration through Sri Lankan history followed by a stroll under rain trees.",
        safety_highlights="Gated heritage grounds, security personnel, public daylight venue.",
        why_recommended="Great for discovering shared intellectual interests and Sri Lankan heritage."
    ),
    DateRecommendationItem(
        category="Coffee & Walk",
        venue_name="Kandy Lake Round Walk & Cafe Secret Alley",
        neighborhood="Kandy City",
        city="Kandy",
        budget_bracket="Under LKR 2,000",
        vibe_description="Breezy lakeside circuit followed by artisan smoothie bowls in a tucked-away green cafe.",
        safety_highlights="Prominent urban walkway, scenic daylight crowds, safe pedestrian paths.",
        why_recommended="Scenic, active, and conversational date in the Hill Capital."
    ),
    DateRecommendationItem(
        category="Heritage Stroll",
        venue_name="Galle Fort Ramparts & Pedlar's Inn Cafe",
        neighborhood="Galle Fort",
        city="Galle",
        budget_bracket="LKR 2,000–5,000",
        vibe_description="Cobblestone rampart sunset stroll followed by homemade gelato in a Dutch colonial tavern.",
        safety_highlights="UNESCO heritage district, highly monitored pedestrian zone, tourist police nearby.",
        why_recommended="Historic romantic charm with maximum public safety and sea views."
    ),
]


class DateService:
    @staticmethod
    def get_recommendations(
        city: Optional[str] = "Colombo",
        budget_bracket: Optional[str] = None
    ) -> List[DateRecommendationItem]:
        results = [spot for spot in CURATED_DATE_SPOTS if not city or spot.city.lower() == city.lower()]
        if budget_bracket and budget_bracket != "Flexible":
            results = [s for s in results if s.budget_bracket == budget_bracket]
        return results or CURATED_DATE_SPOTS[:4]

    @staticmethod
    async def create_date_plan(
        db: AsyncSession,
        user_id: str,
        data: DatePlanCreate
    ) -> DatePlanResponse:
        # Verify match participant
        m_stmt = select(Match).where(Match.id == data.match_id)
        m_res = await db.execute(m_stmt)
        match = m_res.scalar_one_or_none()
        if not match or (match.user1_id != user_id and match.user2_id != user_id):
            raise ValueError("Match not found or access denied.")

        plan = DatePlan(
            match_id=data.match_id,
            proposed_by_id=user_id,
            category=data.category,
            venue_name=data.venue_name,
            neighborhood=data.neighborhood,
            budget_bracket=data.budget_bracket,
            scheduled_time=data.scheduled_time,
            invitation_note=data.invitation_note,
            status="proposed"
        )
        db.add(plan)
        await db.commit()
        await db.refresh(plan)

        return DatePlanResponse(
            id=plan.id,
            match_id=plan.match_id,
            proposed_by_id=plan.proposed_by_id,
            category=plan.category,
            venue_name=plan.venue_name,
            neighborhood=plan.neighborhood,
            budget_bracket=plan.budget_bracket,
            scheduled_time=plan.scheduled_time,
            status=plan.status,
            invitation_note=plan.invitation_note,
            created_at=plan.created_at,
            is_proposed_by_me=True,
        )

    @staticmethod
    async def respond_to_date_plan(
        db: AsyncSession,
        date_plan_id: str,
        user_id: str,
        accept: bool
    ) -> DatePlanResponse:
        p_stmt = select(DatePlan).where(DatePlan.id == date_plan_id).options(selectinload(DatePlan.match))
        p_res = await db.execute(p_stmt)
        plan = p_res.scalar_one_or_none()
        if not plan:
            raise ValueError("Date plan not found.")

        # Ensure user is receiver
        match = plan.match
        if user_id not in (match.user1_id, match.user2_id) or user_id == plan.proposed_by_id:
            raise ValueError("Cannot respond to your own proposal or unauthorized.")

        plan.status = "accepted" if accept else "declined"
        await db.commit()
        await db.refresh(plan)

        return DatePlanResponse(
            id=plan.id,
            match_id=plan.match_id,
            proposed_by_id=plan.proposed_by_id,
            category=plan.category,
            venue_name=plan.venue_name,
            neighborhood=plan.neighborhood,
            budget_bracket=plan.budget_bracket,
            scheduled_time=plan.scheduled_time,
            status=plan.status,
            invitation_note=plan.invitation_note,
            created_at=plan.created_at,
            is_proposed_by_me=(plan.proposed_by_id == user_id),
        )

    @staticmethod
    async def create_safety_plan(
        db: AsyncSession,
        date_plan_id: str,
        user_id: str,
        data: DateSafetyPlanCreate
    ) -> DateSafetyPlanResponse:
        sp = DateSafetyPlan(
            date_plan_id=date_plan_id,
            user_id=user_id,
            trusted_contact_name=data.trusted_contact_name,
            trusted_contact_phone=data.trusted_contact_phone,
            check_in_time=data.check_in_time,
            emergency_notes=data.emergency_notes,
            check_in_status="pending",
        )
        db.add(sp)
        await db.commit()
        await db.refresh(sp)
        return DateSafetyPlanResponse.model_validate(sp)

    @staticmethod
    async def submit_date_feedback(
        db: AsyncSession,
        date_plan_id: str,
        user_id: str,
        data: DateFeedbackSubmit
    ) -> bool:
        fb = DateFeedback(
            date_plan_id=date_plan_id,
            user_id=user_id,
            met_in_person=data.met_in_person,
            accurate_profile=data.accurate_profile,
            comfort_rating=data.comfort_rating,
            would_meet_again=data.would_meet_again,
            private_safety_notes=data.private_safety_notes,
        )
        db.add(fb)
        await db.commit()
        return True
