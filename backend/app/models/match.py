from sqlalchemy import Column, String, Float, Boolean, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.models.base import TimeStampedModel


class ConnectionRequest(TimeStampedModel):
    __tablename__ = "connection_requests"
    __table_args__ = (
        UniqueConstraint('sender_id', 'receiver_id', name='uq_sender_receiver'),
    )

    sender_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Interaction context primitive (card or prompt)
    card_id = Column(String(36), ForeignKey("connection_cards.id", ondelete="SET NULL"), nullable=True)
    card_option_key = Column(String(32), nullable=True)
    prompt_key = Column(String(128), nullable=True)
    
    intro_note = Column(String(500), nullable=True)
    status = Column(String(32), default="pending", nullable=False)  # pending, accepted, rejected, expired

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_connections")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_connections")


class Match(TimeStampedModel):
    __tablename__ = "matches"
    __table_args__ = (
        UniqueConstraint('user1_id', 'user2_id', name='uq_user_pair'),
    )

    user1_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    user2_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    compatibility_score = Column(Float, default=0.0, nullable=False)
    match_reasons = Column(JSON, default=list, nullable=False)  # e.g. ["Both looking for Serious Relationship", "Shared passion for Specialty Coffee", "Both picked Beach sunset over clubs"]
    is_active = Column(Boolean, default=True, nullable=False)

    user1 = relationship("User", foreign_keys=[user1_id])
    user2 = relationship("User", foreign_keys=[user2_id])
    conversation = relationship("Conversation", back_populates="match", uselist=False, cascade="all, delete-orphan")
    date_plans = relationship("DatePlan", back_populates="match", cascade="all, delete-orphan")
