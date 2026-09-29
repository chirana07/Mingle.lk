from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from backend.app.models.user import User, UserRole, UserStatus, Verification, VerificationType, VerificationStatus
from backend.app.models.profile import Profile
from backend.app.core.security import generate_otp, verify_otp, create_access_token, get_password_hash, verify_password
from backend.app.core.config import settings


class AuthService:
    @staticmethod
    async def request_otp(db: AsyncSession, identifier: str) -> str:
        """Sends an OTP to phone or email (simulated for MVP)"""
        code = generate_otp(identifier)
        return code

    @staticmethod
    async def verify_otp_and_login(db: AsyncSession, identifier: str, code: str) -> Tuple[User, str, bool]:
        """
        Validates OTP, creates user if first time, marks verified, and issues JWT.
        Returns: (user, token, has_profile)
        """
        if not verify_otp(identifier, code):
            raise ValueError("Invalid or expired verification code.")

        is_email = "@" in identifier
        
        # Check if user exists
        stmt = select(User).where(User.email == identifier if is_email else User.phone == identifier)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        is_new = False
        if not user:
            is_new = True
            user = User(
                email=identifier if is_email else None,
                phone=identifier if not is_email else None,
                role=UserRole.USER.value,
                status=UserStatus.ACTIVE.value,
                is_email_verified=is_email,
                is_phone_verified=not is_email,
            )
            db.add(user)
            await db.flush()

            # Record verification
            verification = Verification(
                user_id=user.id,
                verification_type=VerificationType.EMAIL.value if is_email else VerificationType.PHONE.value,
                status=VerificationStatus.VERIFIED.value,
                verified_at=datetime.now(timezone.utc),
            )
            db.add(verification)
        else:
            if is_email and not user.is_email_verified:
                user.is_email_verified = True
            elif not is_email and not user.is_phone_verified:
                user.is_phone_verified = True

        # Check if profile exists
        profile_stmt = select(Profile).where(Profile.user_id == user.id)
        p_res = await db.execute(profile_stmt)
        profile = p_res.scalar_one_or_none()
        has_profile = profile is not None

        token = create_access_token(subject=user.id)
        await db.commit()
        await db.refresh(user)
        return user, token, has_profile

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        stmt = select(User).where(User.id == user_id, User.deleted_at.is_(None))
        res = await db.execute(stmt)
        return res.scalar_one_or_none()
