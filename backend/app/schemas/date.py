from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class DatePlanCreate(BaseModel):
    match_id: str
    category: str = Field(..., description="Coffee & Walk, Cafe & Books, Beach Sunset, Art & Culture, Casual Dining")
    venue_name: str
    neighborhood: str
    budget_bracket: str = Field("Under LKR 2,000", description="Free, Under LKR 2,000, LKR 2,000–5,000, Flexible")
    scheduled_time: Optional[datetime] = None
    invitation_note: Optional[str] = None


class DatePlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    match_id: str
    proposed_by_id: str
    category: str
    venue_name: str
    neighborhood: str
    budget_bracket: str
    scheduled_time: Optional[datetime] = None
    status: str
    invitation_note: Optional[str] = None
    created_at: datetime
    is_proposed_by_me: bool = False


class DateSafetyPlanCreate(BaseModel):
    trusted_contact_name: str = Field(..., min_length=2, max_length=100)
    trusted_contact_phone: str = Field(..., min_length=8, max_length=20)
    check_in_time: Optional[datetime] = None
    emergency_notes: Optional[str] = None


class DateSafetyPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    date_plan_id: str
    trusted_contact_name: str
    trusted_contact_phone: str
    check_in_time: Optional[datetime] = None
    check_in_status: str
    emergency_notes: Optional[str] = None


class DateFeedbackSubmit(BaseModel):
    met_in_person: bool
    accurate_profile: bool
    comfort_rating: int = Field(..., ge=1, le=5)
    would_meet_again: bool
    private_safety_notes: Optional[str] = None


class DateRecommendationItem(BaseModel):
    category: str
    venue_name: str
    neighborhood: str
    city: str
    budget_bracket: str
    vibe_description: str
    safety_highlights: str
    why_recommended: str
