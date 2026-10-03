from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


class ProfilePhotoBase(BaseModel):
    url: str
    caption: Optional[str] = None
    is_primary: bool = False
    order_index: int = 0


class ProfilePhotoResponse(ProfilePhotoBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


class PromptAnswerCreate(BaseModel):
    prompt_key: str
    prompt_question: str
    answer_text: str


class PromptAnswerResponse(PromptAnswerCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str


class ProfileBase(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=50)
    birth_date: date
    gender: str = Field(..., description="woman, man, non-binary")
    looking_for_gender: str = Field("everyone", description="woman, man, everyone")
    city: str = Field("Colombo", description="Colombo, Kandy, Galle, Negombo, etc.")
    neighborhood: str = Field("Colombo 05", description="Colombo 03, Colombo 05, Galle Fort, etc.")
    bio: Optional[str] = Field(None, max_length=500)
    occupation: Optional[str] = Field(None, max_length=100)
    education: Optional[str] = Field(None, max_length=100)
    relationship_intent: str = Field("Dating intentionally")
    communication_style: str = Field("Frequent texter")
    lifestyle_pace: str = Field("Cafe explorer & beach sunsets")
    interests: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=lambda: ["English", "Sinhala"])


class ProfileCreate(ProfileBase):
    photos: List[ProfilePhotoBase] = Field(default_factory=list)
    prompts: List[PromptAnswerCreate] = Field(default_factory=list)


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    bio: Optional[str] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    relationship_intent: Optional[str] = None
    communication_style: Optional[str] = None
    lifestyle_pace: Optional[str] = None
    interests: Optional[List[str]] = None
    languages: Optional[List[str]] = None


class PrivacyUpdate(BaseModel):
    discovery_enabled: Optional[bool] = None
    show_neighborhood_only: Optional[bool] = None


class ProfileResponse(ProfileBase):

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    age: int
    photos: List[ProfilePhotoResponse] = []
    prompt_answers: List[PromptAnswerResponse] = []
    
    # Trust Badges
    is_phone_verified: bool = False
    is_email_verified: bool = False
    is_selfie_verified: bool = False
    is_profile_completed: bool = False
