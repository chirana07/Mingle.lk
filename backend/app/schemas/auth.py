from typing import Optional
from pydantic import BaseModel, ConfigDict


class OTPRequest(BaseModel):
    identifier: str  # Phone number (+94...) or email


class OTPResponse(BaseModel):
    message: str
    demo_code: Optional[str] = None  # Provided in dev/demo mode for rapid onboarding


class OTPVerify(BaseModel):
    identifier: str
    code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    has_profile: bool


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: str
    status: str
    is_phone_verified: bool
    is_email_verified: bool
    is_selfie_verified: bool
    is_profile_completed: bool

    discovery_enabled: bool = True
    show_neighborhood_only: bool = True
