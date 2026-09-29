from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.models.base import TimeStampedModel


class Conversation(TimeStampedModel):
    __tablename__ = "conversations"

    match_id = Column(String(36), ForeignKey("matches.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    last_message_at = Column(DateTime(timezone=True), nullable=True)

    match = relationship("Match", back_populates="conversation")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(TimeStampedModel):
    __tablename__ = "messages"

    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    content = Column(Text, nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Safety flag
    is_flagged = Column(Boolean, default=False, nullable=False)
    flag_reason = Column(String(255), nullable=True)

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User")
