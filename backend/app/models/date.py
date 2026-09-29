from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.models.base import TimeStampedModel


class DatePlan(TimeStampedModel):
    __tablename__ = "date_plans"

    match_id = Column(String(36), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False, index=True)
    proposed_by_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    category = Column(String(64), nullable=False)  # Coffee & Walk, Cafe & Books, Beach Sunset, Art & Culture, Casual Bites
    venue_name = Column(String(150), nullable=False)
    neighborhood = Column(String(100), nullable=False)  # e.g., Colombo 03, Colombo 07, Kandy City, Galle Fort
    budget_bracket = Column(String(64), default="Under LKR 2,000", nullable=False)
    scheduled_time = Column(DateTime(timezone=True), nullable=True)
    
    status = Column(String(32), default="proposed", nullable=False)  # proposed, accepted, declined, completed, cancelled
    invitation_note = Column(String(255), nullable=True)

    match = relationship("Match", back_populates="date_plans")
    proposed_by = relationship("User")
    safety_plans = relationship("DateSafetyPlan", back_populates="date_plan", cascade="all, delete-orphan")
    feedbacks = relationship("DateFeedback", back_populates="date_plan", cascade="all, delete-orphan")


class DateSafetyPlan(TimeStampedModel):
    __tablename__ = "date_safety_plans"

    date_plan_id = Column(String(36), ForeignKey("date_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    trusted_contact_name = Column(String(100), nullable=False)
    trusted_contact_phone = Column(String(32), nullable=False)
    check_in_time = Column(DateTime(timezone=True), nullable=True)
    check_in_status = Column(String(32), default="pending", nullable=False)  # pending, checked_in, alert_triggered
    emergency_notes = Column(Text, nullable=True)

    date_plan = relationship("DatePlan", back_populates="safety_plans")
    user = relationship("User")


class DateFeedback(TimeStampedModel):
    __tablename__ = "date_feedbacks"

    date_plan_id = Column(String(36), ForeignKey("date_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    met_in_person = Column(Boolean, nullable=False)
    accurate_profile = Column(Boolean, nullable=False)
    comfort_rating = Column(Integer, nullable=False)  # 1 to 5 scale
    would_meet_again = Column(Boolean, nullable=False)
    private_safety_notes = Column(Text, nullable=True)

    date_plan = relationship("DatePlan", back_populates="feedbacks")
    user = relationship("User")
