from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.profile import ProfileResponse


class MessageSend(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    sender_id: str
    content: str
    created_at: datetime
    read_at: Optional[datetime] = None
    is_mine: bool = False


class ConversationSummary(BaseModel):
    id: str
    match_id: str
    target_profile: ProfileResponse
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    updated_at: datetime
    suggested_starters: List[str] = []
