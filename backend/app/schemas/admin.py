from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from backend.app.schemas.safety import ReportResponse
from backend.app.schemas.auth import UserResponse


class AdminDashboardMetrics(BaseModel):
    total_users: int
    active_users: int
    verified_users: int
    matches_created: int
    conversations_started: int
    dates_planned: int
    reports_pending: int
    match_to_conversation_rate: float
    conversation_to_date_rate: float
    safety_incident_rate: float


class AdminUserUpdate(BaseModel):
    status: Optional[str] = None  # active, suspended, banned
    role: Optional[str] = None    # user, moderator, admin
    is_selfie_verified: Optional[bool] = None


class AdminReportUpdate(BaseModel):
    status: str  # reviewed, action_taken, dismissed
    admin_notes: Optional[str] = None


class AnalyticsTrackRequest(BaseModel):
    event_name: str
    properties: Dict[str, Any] = {}
