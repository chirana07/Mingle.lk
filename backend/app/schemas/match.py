from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.profile import ProfileResponse
from backend.app.schemas.card import CardComparisonResponse


class ConnectionRequestCreate(BaseModel):
    receiver_id: str
    card_id: Optional[str] = None
    card_option_key: Optional[str] = None
    prompt_key: Optional[str] = None
    intro_note: Optional[str] = Field(None, max_length=500)


class ConnectionRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    sender_id: str
    receiver_id: str
    card_id: Optional[str] = None
    card_option_key: Optional[str] = None
    prompt_key: Optional[str] = None
    intro_note: Optional[str] = None
    status: str
    created_at: datetime
    sender_profile: Optional[ProfileResponse] = None


class MatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    compatibility_score: float
    match_reasons: List[str]
    created_at: datetime
    target_profile: ProfileResponse
    conversation_id: Optional[str] = None
    suggested_starters: List[str] = []


class DiscoveryProfile(BaseModel):
    profile: ProfileResponse
    compatibility_score: float
    compatibility_level: str  # "Very Strong Connection", "High Compatibility", "Great Potential"
    match_reasons: List[str]
    shared_interests: List[str]
    card_comparisons: List[CardComparisonResponse] = []
    suggested_starters: List[str] = []
