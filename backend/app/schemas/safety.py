from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ReportCreate(BaseModel):
    reported_id: str
    category: str = Field(..., description="Harassment, Inappropriate Media, Impersonation/Fake, Financial Solicitation/Scam, Other")
    details: str = Field(..., min_length=5, max_length=1000)


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    reporter_id: str
    reported_id: str
    category: str
    details: str
    status: str
    created_at: datetime


class BlockCreate(BaseModel):
    blocked_id: str


class BlockResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    blocker_id: str
    blocked_id: str
    created_at: datetime
