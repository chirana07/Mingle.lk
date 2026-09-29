from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.schemas.auth import OTPRequest, OTPResponse, OTPVerify, TokenResponse, UserResponse
from backend.app.services.auth_service import AuthService
from backend.app.api.deps import get_current_user
from backend.app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/request-otp", response_model=OTPResponse)
async def request_otp(data: OTPRequest, db: AsyncSession = Depends(get_db)):
    """Request a one-time login verification code via Phone or Email"""
    if not data.identifier or len(data.identifier.strip()) < 5:
        raise HTTPException(status_code=400, detail="Valid phone number or email is required.")
    
    code = await AuthService.request_otp(db, data.identifier.strip())
    return OTPResponse(
        message=f"Verification code sent to {data.identifier}. (Demo code: {code})",
        demo_code=code
    )


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(data: OTPVerify, db: AsyncSession = Depends(get_db)):
    """Verify OTP code and receive JWT authentication token"""
    try:
        user, token, has_profile = await AuthService.verify_otp_and_login(db, data.identifier.strip(), data.code.strip())
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user_id=user.id,
            role=user.role,
            has_profile=has_profile
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's account details and verification badges"""
    return current_user
