from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.card import ConnectionCard, CardAnswer
from backend.app.models.profile import Profile
from backend.app.schemas.card import (
    ConnectionCardResponse, CardAnswerSubmit, CardAnswerResponse, CardComparisonResponse
)
from backend.app.services.matching_service import MatchingService
from backend.app.services.profile_service import ProfileService

router = APIRouter(prefix="/cards", tags=["Connection Cards"])


@router.get("", response_model=List[ConnectionCardResponse])
async def get_connection_cards(
    db: AsyncSession = Depends(get_db)
):
    """List all interactive Connection Cards available in the platform"""
    stmt = select(ConnectionCard).where(ConnectionCard.is_active == 1).order_by(ConnectionCard.order_index.asc())
    res = await db.execute(stmt)
    return [ConnectionCardResponse.model_validate(c) for c in res.scalars().all()]


@router.get("/my-answers", response_model=List[CardAnswerResponse])
async def get_my_card_answers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all Connection Cards answered by the current user"""
    profile = await ProfileService.get_profile_by_user_id(db, current_user.id)
    if not profile:
        return []

    stmt = select(CardAnswer).where(CardAnswer.profile_id == profile.id)
    res = await db.execute(stmt)
    answers = res.scalars().all()

    # Load cards metadata for questions/labels
    cards_res = await db.execute(select(ConnectionCard))
    cards_map = {c.id: c for c in cards_res.scalars()}

    results = []
    for a in answers:
        card = cards_map.get(a.card_id)
        q = card.question if card else None
        lbl = a.selected_option_key
        if card and isinstance(card.options, list):
            for opt in card.options:
                if opt.get("key") == a.selected_option_key:
                    lbl = opt.get("label", a.selected_option_key)
        
        results.append(CardAnswerResponse(
            id=a.id,
            card_id=a.card_id,
            selected_option_key=a.selected_option_key,
            comment=a.comment,
            question=q,
            selected_option_label=lbl
        ))
    return results


@router.post("/answer", response_model=CardAnswerResponse)
async def submit_card_answer(
    data: CardAnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Answer or update a Connection Card"""
    profile = await ProfileService.get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Please complete basic profile before answering Connection Cards.")

    # Check card exists
    card_stmt = select(ConnectionCard).where(ConnectionCard.id == data.card_id)
    card_res = await db.execute(card_stmt)
    card = card_res.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Connection Card not found.")

    # Check existing answer
    stmt = select(CardAnswer).where(CardAnswer.profile_id == profile.id, CardAnswer.card_id == data.card_id)
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()

    if existing:
        existing.selected_option_key = data.selected_option_key
        existing.comment = data.comment
        ans = existing
    else:
        ans = CardAnswer(
            profile_id=profile.id,
            card_id=data.card_id,
            selected_option_key=data.selected_option_key,
            comment=data.comment
        )
        db.add(ans)

    await db.commit()
    await db.refresh(ans)

    lbl = ans.selected_option_key
    if isinstance(card.options, list):
        for opt in card.options:
            if opt.get("key") == ans.selected_option_key:
                lbl = opt.get("label", ans.selected_option_key)

    return CardAnswerResponse(
        id=ans.id,
        card_id=ans.card_id,
        selected_option_key=ans.selected_option_key,
        comment=ans.comment,
        question=card.question,
        selected_option_label=lbl
    )


@router.get("/compare/{target_user_id}", response_model=List[CardComparisonResponse])
async def compare_cards_with_user(
    target_user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Compare answered Connection Cards between current user and target user to show matches & starters"""
    current_profile = await ProfileService.get_profile_by_user_id(db, current_user.id)
    target_profile = await ProfileService.get_profile_by_user_id(db, target_user_id)
    if not current_profile or not target_profile:
        return []

    cards_res = await db.execute(select(ConnectionCard).where(ConnectionCard.is_active == 1))
    cards_metadata = {c.id: c for c in cards_res.scalars()}

    cards_a = {ca.card_id: ca.selected_option_key for ca in (current_profile.card_answers or [])}
    cards_b = {ca.card_id: ca.selected_option_key for ca in (target_profile.card_answers or [])}

    _, _, _, card_comparisons, _ = MatchingService.calculate_compatibility(
        current_profile, target_profile, cards_a, cards_b, cards_metadata
    )
    return card_comparisons
