from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from backend.app.schemas.profile import ProfileResponse


class SubscriptionPlanItem(BaseModel):
    id: str
    name: str
    billing_cycle: str  # weekly, monthly
    duration_days: int
    price_lkr: int
    formatted_price: str
    is_popular: bool = False
    description: str
    perks: List[str]
    payment_methods: List[str]


class CheckoutRequest(BaseModel):
    plan_id: str
    spotlight_district: Optional[str] = "Colombo"
    payment_method: Optional[str] = "payhere"  # payhere, genie, frimi, carrier_billing


class PayHereCheckoutParams(BaseModel):
    action_url: str
    merchant_id: str
    order_id: str
    items: str
    currency: str
    amount: str
    hash: str
    return_url: str
    cancel_url: str
    notify_url: str
    first_name: str
    last_name: str
    email: str
    phone: str
    city: str
    country: str = "Sri Lanka"


class SubscriptionStatusResponse(BaseModel):
    is_katha_plus: bool
    subscription_tier: str
    subscription_expires_at: Optional[datetime] = None
    spotlight_district: Optional[str] = None
    extra_cards_count: int = 0
    days_remaining: Optional[int] = None
    active_plan_name: Optional[str] = None
    entitlements: List[str] = []


class CardResponderItem(BaseModel):
    id: str
    card_id: str
    card_question: str
    my_answer_key: str
    my_answer_label: str
    responder_answer_key: str
    responder_answer_label: str
    responded_at: datetime
    is_locked: bool
    is_identical_choice: bool
    responder_profile: Optional[ProfileResponse] = None
    locked_teaser: Optional[str] = None


class SetSpotlightDistrictRequest(BaseModel):
    district: str


class PayHereWebhookPayload(BaseModel):
    merchant_id: str
    order_id: str
    payment_id: Optional[str] = None
    payhere_amount: str
    payhere_currency: str = "LKR"
    status_code: str  # 2 is success
    md5sig: str
    custom_1: Optional[str] = None
    custom_2: Optional[str] = None
