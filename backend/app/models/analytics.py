from sqlalchemy import Column, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.models.base import TimeStampedModel


class AnalyticsEvent(TimeStampedModel):
    __tablename__ = "analytics_events"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    event_name = Column(String(128), nullable=False, index=True)
    properties = Column(JSON, default=dict, nullable=False)

    user = relationship("User")
