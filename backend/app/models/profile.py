from sqlalchemy import Column, String, Integer, Date, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.models.base import TimeStampedModel


class Profile(TimeStampedModel):
    __tablename__ = "profiles"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    birth_date = Column(Date, nullable=False)
    gender = Column(String(32), nullable=False)  # woman, man, non-binary
    looking_for_gender = Column(String(32), default="everyone", nullable=False)
    
    # Sri Lankan Location & Privacy
    city = Column(String(100), default="Colombo", index=True, nullable=False)
    neighborhood = Column(String(100), default="Colombo 05", index=True, nullable=False)
    
    bio = Column(Text, nullable=True)
    occupation = Column(String(150), nullable=True)
    education = Column(String(150), nullable=True)
    
    # Intent & Communication
    relationship_intent = Column(String(64), default="Dating intentionally", index=True, nullable=False)
    communication_style = Column(String(64), default="Frequent texter", nullable=False)
    lifestyle_pace = Column(String(64), default="Cafe explorer & beach sunsets", nullable=False)
    
    # Tag sets stored as JSON lists
    interests = Column(JSON, default=list, nullable=False)  # e.g. ["Coffee", "Surfing", "Literature", "Cricket", "Kottu Spots"]
    languages = Column(JSON, default=list, nullable=False)  # e.g. ["English", "Sinhala"]
    
    # Relationships
    user = relationship("User", back_populates="profile")
    photos = relationship("ProfilePhoto", back_populates="profile", cascade="all, delete-orphan", order_by="ProfilePhoto.order_index")
    prompt_answers = relationship("PromptAnswer", back_populates="profile", cascade="all, delete-orphan")
    card_answers = relationship("CardAnswer", back_populates="profile", cascade="all, delete-orphan")


class ProfilePhoto(TimeStampedModel):
    __tablename__ = "profile_photos"

    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(512), nullable=False)
    caption = Column(String(255), nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)

    profile = relationship("Profile", back_populates="photos")


class PromptAnswer(TimeStampedModel):
    __tablename__ = "prompt_answers"

    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    prompt_key = Column(String(128), nullable=False)  # e.g. "obsessed_with", "green_flag", "ideal_sunday"
    prompt_question = Column(String(255), nullable=False)
    answer_text = Column(Text, nullable=False)

    profile = relationship("Profile", back_populates="prompt_answers")
