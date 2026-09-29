from sqlalchemy import Column, String, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.models.base import TimeStampedModel


class Report(TimeStampedModel):
    __tablename__ = "reports"

    reporter_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reported_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    category = Column(String(64), nullable=False)  # Harassment, Inappropriate Media, Impersonation/Fake, Financial Solicitation/Scam, Other
    details = Column(Text, nullable=False)
    status = Column(String(32), default="pending", nullable=False)  # pending, reviewed, action_taken, dismissed
    admin_notes = Column(Text, nullable=True)

    reporter = relationship("User", foreign_keys=[reporter_id])
    reported = relationship("User", foreign_keys=[reported_id])


class Block(TimeStampedModel):
    __tablename__ = "blocks"
    __table_args__ = (
        UniqueConstraint('blocker_id', 'blocked_id', name='uq_blocker_blocked'),
    )

    blocker_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    blocked_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    blocker = relationship("User", foreign_keys=[blocker_id])
    blocked = relationship("User", foreign_keys=[blocked_id])
