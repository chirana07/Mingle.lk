from sqlalchemy import Column, String, Integer, Text, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.models.base import TimeStampedModel


class ConnectionCard(TimeStampedModel):
    __tablename__ = "connection_cards"

    category = Column(String(64), nullable=False)  # Lifestyle, Values, Dating Style, Fun
    question = Column(String(255), nullable=False)
    subtext = Column(String(255), nullable=True)
    options = Column(JSON, nullable=False)  # list of {"key": "A", "label": "Beach sunset", "icon": "waves"}
    order_index = Column(Integer, default=0, nullable=False)
    is_active = Column(Integer, default=1, nullable=False)

    answers = relationship("CardAnswer", back_populates="card", cascade="all, delete-orphan")


class CardAnswer(TimeStampedModel):
    __tablename__ = "card_answers"
    __table_args__ = (
        UniqueConstraint('profile_id', 'card_id', name='uq_profile_card'),
    )

    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    card_id = Column(String(36), ForeignKey("connection_cards.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option_key = Column(String(32), nullable=False)
    comment = Column(String(255), nullable=True)

    profile = relationship("Profile", back_populates="card_answers")
    card = relationship("ConnectionCard", back_populates="answers")
