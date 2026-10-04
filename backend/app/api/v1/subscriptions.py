import hashlib
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import Profile
from backend.app.models.card import ConnectionCard, CardAnswer
from backend.app.models.subscription import Subscription
from backend.app.schemas.subscription import (
    SubscriptionPlanItem,
    CheckoutRequest,
    PayHereCheckoutParams,
    SubscriptionStatusResponse,
    CardResponderItem,
    SetSpotlightDistrictRequest,
)
from backend.app.services.profile_service import ProfileService

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions & Katha Plus"])

# Configured Plans for Issue #4
PLANS: List[SubscriptionPlanItem] = [
    SubscriptionPlanItem(
        id="katha_plus_weekly",
        name="Katha Plus Weekly",
        billing_cycle="weekly",
        duration_days=7,
        price_lkr=490,
        formatted_price="LKR 490 / week",
        is_popular=False,
        description="7-day micro-pass for active weekend dating & priority matching in your area",
        perks=[
            "5 Extra Connection Cards per week",
            "See who responded to your Connection Cards",
            "Priority discovery spotlight in chosen district",
            "Instant FriMi & Dialog Carrier Billing support",
        ],
        payment_methods=["PayHere (Visa/MC)", "Dialog Carrier Billing", "FriMi", "Genie"],
    ),
    SubscriptionPlanItem(
        id="katha_plus_monthly_special",
        name="Katha Plus Launch Special",
        billing_cycle="monthly",
        duration_days=30,
        price_lkr=990,
        formatted_price="LKR 990 / month",
        is_popular=True,
        description="Early adopter promotional tier: Full access to all 3 core entitlements (Save 33%)",
        perks=[
            "5 Extra Connection Cards per week",
            "View full profiles & choices of card responders",
            "Priority discovery spotlight in your home district",
            "10% discount on Date Mode bookings at partner cafes",
        ],
        payment_methods=["PayHere (Visa/MC)", "FriMi", "Genie", "Dialog Carrier Billing"],
    ),
    SubscriptionPlanItem(
        id="katha_plus_monthly",
        name="Katha Plus Monthly",
        billing_cycle="monthly",
        duration_days=30,
        price_lkr=1490,
        formatted_price="LKR 1,490 / month",
        is_popular=False,
        description="Standard monthly membership for high-intent daters across Sri Lanka",
        perks=[
            "5 Extra Connection Cards per week",
            "Unlimited Card Responders reveals & answer comparisons",
            "Highest-ranking district spotlight boost",
            "15% voucher at Barefoot, Black Cat & partner cafes",
        ],
        payment_methods=["PayHere (Visa/MC)", "FriMi", "Genie", "Dialog Carrier Billing"],
    ),
]


def generate_payhere_hash(
    merchant_id: str, order_id: str, amount: float, currency: str, merchant_secret: str
) -> str:
    """Generates PayHere MD5 checksum signature"""
    formatted_amount = f"{amount:.2f}"
    secret_hash = hashlib.md5(merchant_secret.encode("utf-8")).hexdigest().upper()
    raw = f"{merchant_id}{order_id}{formatted_amount}{currency}{secret_hash}"
    return hashlib.md5(raw.encode("utf-8")).hexdigest().upper()


def verify_payhere_signature(
    merchant_id: str,
    order_id: str,
    amount: str,
    currency: str,
    status_code: str,
    received_md5: str,
    merchant_secret: str,
) -> bool:
    """Verifies incoming PayHere IPN webhook checksum"""
    secret_hash = hashlib.md5(merchant_secret.encode("utf-8")).hexdigest().upper()
    raw = f"{merchant_id}{order_id}{amount}{currency}{status_code}{secret_hash}"
    calculated_md5 = hashlib.md5(raw.encode("utf-8")).hexdigest().upper()
    return calculated_md5 == received_md5.upper()


@router.get("/plans", response_model=List[SubscriptionPlanItem])
async def get_subscription_plans():
    """Returns available micro-subscription tiers and LKR pricing"""
    return PLANS


@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns current user's Katha Plus entitlement status"""
    now = datetime.now(timezone.utc)
    is_active = current_user.is_katha_plus
    days_rem = None

    if is_active and current_user.subscription_expires_at:
        exp = current_user.subscription_expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < now:
            is_active = False
            current_user.is_katha_plus = False
            current_user.subscription_tier = "free"
            await db.commit()
        else:
            days_rem = max(0, (exp - now).days)

    active_plan_name = None
    for p in PLANS:
        if p.id == current_user.subscription_tier:
            active_plan_name = p.name

    entitlements = []
    if is_active:
        entitlements = [
            f"+{current_user.extra_cards_count or 5} Extra Connection Cards per week",
            "Full Card Responders Reveal Unlocked",
            f"Priority Discovery Spotlight Active in {current_user.spotlight_district or 'Colombo'}",
        ]

    return SubscriptionStatusResponse(
        is_katha_plus=is_active,
        subscription_tier=current_user.subscription_tier or "free",
        subscription_expires_at=current_user.subscription_expires_at,
        spotlight_district=current_user.spotlight_district,
        extra_cards_count=current_user.extra_cards_count if is_active else 0,
        days_remaining=days_rem,
        active_plan_name=active_plan_name,
        entitlements=entitlements,
    )


@router.post("/checkout", response_model=PayHereCheckoutParams)
async def create_payhere_checkout(
    req: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates an order and returns signed PayHere sandbox checkout parameters.
    """
    plan = next((p for p in PLANS if p.id == req.plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Invalid subscription plan ID.")

    profile = await ProfileService.get_profile_by_user_id(db, current_user.id)
    first_name = profile.first_name if profile else "Katha"
    city = req.spotlight_district or (profile.city if profile else "Colombo")

    order_id = f"KATHA-{int(datetime.now().timestamp())}-{uuid.uuid4().hex[:6].upper()}"
    merchant_id = getattr(settings, "PAYHERE_MERCHANT_ID", "1220001")
    merchant_secret = getattr(settings, "PAYHERE_MERCHANT_SECRET", "4N3Y8u4398e4u3894389e4u8934")

    # Save pending subscription record
    sub = Subscription(
        user_id=current_user.id,
        plan_id=plan.id,
        plan_name=plan.name,
        amount=float(plan.price_lkr),
        currency="LKR",
        billing_cycle=plan.billing_cycle,
        status="pending",
        payment_method=req.payment_method or "payhere",
        order_id=order_id,
        spotlight_district=city,
        extra_cards_allocated=5,
    )
    db.add(sub)
    await db.commit()

    # Calculate checksum hash
    hash_sig = generate_payhere_hash(
        merchant_id=merchant_id,
        order_id=order_id,
        amount=float(plan.price_lkr),
        currency="LKR",
        merchant_secret=merchant_secret,
    )

    frontend_base = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
    backend_base = "http://localhost:8000"

    return PayHereCheckoutParams(
        action_url="https://sandbox.payhere.lk/pay/checkout",
        merchant_id=merchant_id,
        order_id=order_id,
        items=plan.name,
        currency="LKR",
        amount=f"{plan.price_lkr:.2f}",
        hash=hash_sig,
        return_url=f"{frontend_base}?katha_plus=success&order_id={order_id}",
        cancel_url=f"{frontend_base}?katha_plus=cancelled",
        notify_url=f"{backend_base}/api/v1/subscriptions/payhere-notify",
        first_name=first_name,
        last_name="Member",
        email=current_user.email or "member@mingle.lk",
        phone=current_user.phone or "+94771234567",
        city=city,
        country="Sri Lanka",
    )


@router.post("/simulate-payment", response_model=SubscriptionStatusResponse)
async def simulate_payhere_payment(
    req: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Investor & Demo Sandbox Simulation:
    Instantly activates Katha Plus for frictionless demonstration of unit economics & entitlements.
    """
    plan = next((p for p in PLANS if p.id == req.plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Invalid subscription plan ID.")

    profile = await ProfileService.get_profile_by_user_id(db, current_user.id)
    district = req.spotlight_district or (profile.city if profile else "Colombo")

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=plan.duration_days)

    order_id = f"SIM-{int(now.timestamp())}-{uuid.uuid4().hex[:6].upper()}"

    sub = Subscription(
        user_id=current_user.id,
        plan_id=plan.id,
        plan_name=plan.name,
        amount=float(plan.price_lkr),
        currency="LKR",
        billing_cycle=plan.billing_cycle,
        status="active",
        payment_method=req.payment_method or "payhere_simulation",
        order_id=order_id,
        payment_id=f"PAY-{uuid.uuid4().hex[:8].upper()}",
        starts_at=now,
        expires_at=expires_at,
        extra_cards_allocated=5,
        spotlight_district=district,
    )
    db.add(sub)

    # Grant entitlements to user record
    current_user.is_katha_plus = True
    current_user.subscription_tier = plan.id
    current_user.subscription_expires_at = expires_at
    current_user.spotlight_district = district
    current_user.extra_cards_count = (current_user.extra_cards_count or 0) + 5

    await db.commit()
    await db.refresh(current_user)

    return SubscriptionStatusResponse(
        is_katha_plus=True,
        subscription_tier=plan.id,
        subscription_expires_at=expires_at,
        spotlight_district=district,
        extra_cards_count=current_user.extra_cards_count,
        days_remaining=plan.duration_days,
        active_plan_name=plan.name,
        entitlements=[
            f"+{current_user.extra_cards_count} Extra Connection Cards per week",
            "Full Card Responders Reveal Unlocked",
            f"Priority Discovery Spotlight Active in {district}",
        ],
    )


@router.post("/payhere-notify")
async def payhere_webhook_listener(
    request: Request,
    merchant_id: str = Form(...),
    order_id: str = Form(...),
    payment_id: Optional[str] = Form(None),
    payhere_amount: str = Form(...),
    payhere_currency: str = Form(...),
    status_code: str = Form(...),
    md5sig: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    """
    PayHere Webhook IPN listener:
    Receives automated payment confirmation, verifies cryptographic signature, and activates entitlements.
    """
    merchant_secret = getattr(settings, "PAYHERE_MERCHANT_SECRET", "4N3Y8u4398e4u3894389e4u8934")

    # Verify signature
    is_valid = verify_payhere_signature(
        merchant_id=merchant_id,
        order_id=order_id,
        amount=payhere_amount,
        currency=payhere_currency,
        status_code=status_code,
        received_md5=md5sig,
        merchant_secret=merchant_secret,
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid PayHere MD5 checksum.")

    # Status code '2' represents Success in PayHere
    if str(status_code) == "2":
        stmt = select(Subscription).where(Subscription.order_id == order_id)
        res = await db.execute(stmt)
        sub = res.scalar_one_or_none()

        if sub:
            now = datetime.now(timezone.utc)
            duration = 30 if "monthly" in sub.plan_id else 7
            expires_at = now + timedelta(days=duration)

            sub.status = "active"
            sub.payment_id = payment_id
            sub.starts_at = now
            sub.expires_at = expires_at

            # Update user entitlements
            user_stmt = select(User).where(User.id == sub.user_id)
            user_res = await db.execute(user_stmt)
            user = user_res.scalar_one_or_none()
            if user:
                user.is_katha_plus = True
                user.subscription_tier = sub.plan_id
                user.subscription_expires_at = expires_at
                user.spotlight_district = sub.spotlight_district
                user.extra_cards_count = (user.extra_cards_count or 0) + 5

            await db.commit()

    return {"status": "ok"}


@router.get("/card-responders", response_model=List[CardResponderItem])
async def get_card_responders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Katha Plus Feature: View who responded to your Connection Cards.
    - If user is Katha Plus: returns full profiles and exact answers.
    - If user is Free: returns teaser/blurred items with locked indication.
    """
    my_profile = await ProfileService.get_profile_by_user_id(db, current_user.id)
    if not my_profile:
        return []

    # Get my answered cards
    my_answers_stmt = select(CardAnswer).where(CardAnswer.profile_id == my_profile.id)
    my_ans_res = await db.execute(my_answers_stmt)
    my_answers = {ca.card_id: ca for ca in my_ans_res.scalars()}

    if not my_answers:
        return []

    # Load all cards metadata
    cards_stmt = select(ConnectionCard).where(ConnectionCard.is_active == 1)
    cards_res = await db.execute(cards_stmt)
    cards_map = {c.id: c for c in cards_res.scalars()}

    # Find responses from other profiles on those same cards
    other_answers_stmt = (
        select(CardAnswer)
        .where(
            CardAnswer.card_id.in_(list(my_answers.keys())),
            CardAnswer.profile_id != my_profile.id,
        )
        .order_by(desc(CardAnswer.updated_at))
        .limit(30)
    )
    oa_res = await db.execute(other_answers_stmt)
    other_answers = oa_res.scalars().all()

    # Get profiles for other responders
    responder_profile_ids = list({oa.profile_id for oa in other_answers})
    if not responder_profile_ids:
        return []

    profiles_stmt = (
        select(Profile)
        .where(Profile.id.in_(responder_profile_ids))
        .options(
            selectinload(Profile.photos),
            selectinload(Profile.prompt_answers),
            selectinload(Profile.user),
        )
    )
    p_res = await db.execute(profiles_stmt)
    profiles_map = {p.id: p for p in p_res.scalars()}

    is_unlocked = current_user.is_katha_plus

    results: List[CardResponderItem] = []
    for oa in other_answers:
        card = cards_map.get(oa.card_id)
        my_ans = my_answers.get(oa.card_id)
        resp_prof = profiles_map.get(oa.profile_id)

        if not card or not my_ans or not resp_prof:
            continue

        q_text = card.question
        my_lbl = my_ans.selected_option_key
        resp_lbl = oa.selected_option_key

        if card.options and isinstance(card.options, list):
            for opt in card.options:
                if opt.get("key") == my_ans.selected_option_key:
                    my_lbl = opt.get("label", my_lbl)
                if opt.get("key") == oa.selected_option_key:
                    resp_lbl = opt.get("label", resp_lbl)

        is_identical = my_ans.selected_option_key == oa.selected_option_key

        if is_unlocked:
            # Full revealed responder item
            prof_resp = ProfileService.to_profile_response(resp_prof, resp_prof.user)
            results.append(
                CardResponderItem(
                    id=oa.id,
                    card_id=card.id,
                    card_question=q_text,
                    my_answer_key=my_ans.selected_option_key,
                    my_answer_label=my_lbl,
                    responder_answer_key=oa.selected_option_key,
                    responder_answer_label=resp_lbl,
                    responded_at=oa.updated_at or oa.created_at,
                    is_locked=False,
                    is_identical_choice=is_identical,
                    responder_profile=prof_resp,
                )
            )
        else:
            # Locked teaser item
            teaser = (
                f"Someone in {resp_prof.neighborhood or resp_prof.city} answered this card"
                + (" with the exact same choice as you!" if is_identical else ".")
            )
            results.append(
                CardResponderItem(
                    id=oa.id,
                    card_id=card.id,
                    card_question=q_text,
                    my_answer_key=my_ans.selected_option_key,
                    my_answer_label=my_lbl,
                    responder_answer_key="?",
                    responder_answer_label="Hidden (Upgrade to Katha Plus)",
                    responded_at=oa.updated_at or oa.created_at,
                    is_locked=True,
                    is_identical_choice=is_identical,
                    responder_profile=None,
                    locked_teaser=teaser,
                )
            )

    return results


@router.post("/set-spotlight-district", response_model=SubscriptionStatusResponse)
async def set_spotlight_district(
    req: SetSpotlightDistrictRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Allows Katha Plus users to change their priority discovery spotlight district"""
    if not current_user.is_katha_plus:
        raise HTTPException(
            status_code=403,
            detail="Priority district spotlight requires an active Katha Plus subscription.",
        )

    current_user.spotlight_district = req.district
    await db.commit()

    return await get_subscription_status(current_user=current_user, db=db)
