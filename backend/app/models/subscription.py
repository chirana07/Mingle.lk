from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone

from backend.app.models.base import TimeStampedModel


class Subscription(TimeStampedModel):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id = Column(String(50), nullable=False)  # katha_plus_weekly, katha_plus_monthly_special, katha_plus_monthly
    plan_name = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="LKR", nullable=False)
    billing_cycle = Column(String(20), default="monthly", nullable=False)  # weekly, monthly
    status = Column(String(30), default="pending", nullable=False)  # active, completed, expired, cancelled, pending
    payment_method = Column(String(50), default="payhere", nullable=False)  # payhere, genie, frimi, carrier_billing, simulation
    
    order_id = Column(String(64), unique=True, index=True, nullable=False)
    payment_id = Column(String(64), nullable=True)
    payhere_signature = Column(String(128), nullable=True)

    starts_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    extra_cards_allocated = Column(Integer, default=5, nullable=False)
    spotlight_district = Column(String(50), nullable=True)

    # Relationship
    user = relationship("User", back_populates="subscriptions")
