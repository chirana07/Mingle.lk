from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from backend.app.models.base import TimeStampedModel


class UserRole(str, enum.Enum):
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    BANNED = "banned"
    PENDING_VERIFICATION = "pending_verification"


class VerificationType(str, enum.Enum):
    PHONE = "phone"
    EMAIL = "email"
    SELFIE = "selfie"
    PROFILE_COMPLETE = "profile_complete"


class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class User(TimeStampedModel):
    __tablename__ = "users"

    phone = Column(String(32), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    role = Column(String(32), default=UserRole.USER.value, nullable=False)
    status = Column(String(32), default=UserStatus.ACTIVE.value, nullable=False)
    
    # Discovery mode / Privacy
    discovery_enabled = Column(Boolean, default=True, nullable=False)
    approximate_distance_only = Column(Boolean, default=True, nullable=False)
    show_neighborhood_only = Column(Boolean, default=True, nullable=False)

    # Trust Badges Flags (computed from Verification table)
    is_phone_verified = Column(Boolean, default=False, nullable=False)
    is_email_verified = Column(Boolean, default=False, nullable=False)
    is_selfie_verified = Column(Boolean, default=False, nullable=False)
    is_profile_completed = Column(Boolean, default=False, nullable=False)

    # Katha Plus Micro-Subscription Entitlements (Issue #4)
    is_katha_plus = Column(Boolean, default=False, nullable=False)
    subscription_tier = Column(String(50), default="free", nullable=False)
    subscription_expires_at = Column(DateTime, nullable=True)
    spotlight_district = Column(String(50), nullable=True)
    extra_cards_count = Column(Integer, default=0, nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    verifications = relationship("Verification", back_populates="user", cascade="all, delete-orphan")
    sent_connections = relationship("ConnectionRequest", foreign_keys="ConnectionRequest.sender_id", back_populates="sender")
    received_connections = relationship("ConnectionRequest", foreign_keys="ConnectionRequest.receiver_id", back_populates="receiver")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")


class Verification(TimeStampedModel):
    __tablename__ = "verifications"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    verification_type = Column(String(32), nullable=False)
    status = Column(String(32), default=VerificationStatus.PENDING.value, nullable=False)
    proof_reference = Column(String(512), nullable=True)  # URL or hash
    verified_at = Column(DateTime(timezone=True), nullable=True)
    reviewer_notes = Column(String(512), nullable=True)

    user = relationship("User", back_populates="verifications")
