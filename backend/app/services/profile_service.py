from typing import Optional, List
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from backend.app.models.profile import Profile, ProfilePhoto, PromptAnswer
from backend.app.models.user import User
from backend.app.models.card import ConnectionCard, CardAnswer
from backend.app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse, ProfilePhotoResponse, PromptAnswerResponse


def calculate_age(born: date) -> int:
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


class ProfileService:
    @staticmethod
    def to_profile_response(profile: Profile, user: Optional[User] = None) -> ProfileResponse:
        age = calculate_age(profile.birth_date)
        photos = [ProfilePhotoResponse.model_validate(p) for p in (profile.photos or [])]
        prompts = [PromptAnswerResponse.model_validate(p) for p in (profile.prompt_answers or [])]
        
        # User verification signals
        is_phone_verified = user.is_phone_verified if user else False
        is_email_verified = user.is_email_verified if user else False
        is_selfie_verified = user.is_selfie_verified if user else False
        is_profile_completed = user.is_profile_completed if user else False

        return ProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            first_name=profile.first_name,
            birth_date=profile.birth_date,
            age=age,
            gender=profile.gender,
            looking_for_gender=profile.looking_for_gender,
            city=profile.city,
            neighborhood=profile.neighborhood,
            bio=profile.bio,
            occupation=profile.occupation,
            education=profile.education,
            relationship_intent=profile.relationship_intent,
            communication_style=profile.communication_style,
            lifestyle_pace=profile.lifestyle_pace,
            interests=profile.interests or [],
            languages=profile.languages or [],
            photos=photos,
            prompt_answers=prompts,
            is_phone_verified=is_phone_verified,
            is_email_verified=is_email_verified,
            is_selfie_verified=is_selfie_verified,
            is_profile_completed=is_profile_completed,
            voice_intro_url=profile.voice_intro_url,
            voice_prompt_key=profile.voice_prompt_key,
            voice_prompt_title=profile.voice_prompt_title,
            voice_intro_duration=profile.voice_intro_duration or 15,
        )

    @staticmethod
    async def get_profile_by_user_id(db: AsyncSession, user_id: str) -> Optional[Profile]:
        stmt = (
            select(Profile)
            .where(Profile.user_id == user_id, Profile.deleted_at.is_(None))
            .options(
                selectinload(Profile.photos),
                selectinload(Profile.prompt_answers),
                selectinload(Profile.card_answers),
                selectinload(Profile.user),
            )
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    @staticmethod
    async def create_or_update_profile(db: AsyncSession, user_id: str, data: ProfileCreate) -> ProfileResponse:
        stmt = (
            select(Profile)
            .where(Profile.user_id == user_id)
            .options(selectinload(Profile.photos), selectinload(Profile.prompt_answers))
        )
        res = await db.execute(stmt)
        profile = res.scalar_one_or_none()

        user_stmt = select(User).where(User.id == user_id)
        u_res = await db.execute(user_stmt)
        user = u_res.scalar_one()

        if not profile:
            profile = Profile(
                user_id=user_id,
                first_name=data.first_name,
                birth_date=data.birth_date,
                gender=data.gender,
                looking_for_gender=data.looking_for_gender,
                city=data.city,
                neighborhood=data.neighborhood,
                bio=data.bio,
                occupation=data.occupation,
                education=data.education,
                relationship_intent=data.relationship_intent,
                communication_style=data.communication_style,
                lifestyle_pace=data.lifestyle_pace,
                interests=data.interests,
                languages=data.languages,
                voice_intro_url=data.voice_intro_url,
                voice_prompt_key=data.voice_prompt_key,
                voice_prompt_title=data.voice_prompt_title,
                voice_intro_duration=data.voice_intro_duration or 15,
            )
            db.add(profile)
            await db.flush()
        else:
            profile.first_name = data.first_name
            profile.birth_date = data.birth_date
            profile.gender = data.gender
            profile.looking_for_gender = data.looking_for_gender
            profile.city = data.city
            profile.neighborhood = data.neighborhood
            profile.bio = data.bio
            profile.occupation = data.occupation
            profile.education = data.education
            profile.relationship_intent = data.relationship_intent
            profile.communication_style = data.communication_style
            profile.lifestyle_pace = data.lifestyle_pace
            profile.interests = data.interests
            profile.languages = data.languages
            if data.voice_intro_url is not None:
                profile.voice_intro_url = data.voice_intro_url
                profile.voice_prompt_key = data.voice_prompt_key
                profile.voice_prompt_title = data.voice_prompt_title
                profile.voice_intro_duration = data.voice_intro_duration or 15

        # Update photos
        if data.photos:
            await db.execute(delete(ProfilePhoto).where(ProfilePhoto.profile_id == profile.id))
            for idx, photo_in in enumerate(data.photos):
                photo = ProfilePhoto(
                    profile_id=profile.id,
                    url=photo_in.url,
                    caption=photo_in.caption,
                    is_primary=(idx == 0 or photo_in.is_primary),
                    order_index=idx,
                )
                db.add(photo)

        # Update prompts
        if data.prompts:
            await db.execute(delete(PromptAnswer).where(PromptAnswer.profile_id == profile.id))
            for p in data.prompts:
                prompt_ans = PromptAnswer(
                    profile_id=profile.id,
                    prompt_key=p.prompt_key,
                    prompt_question=p.prompt_question,
                    answer_text=p.answer_text,
                )
                db.add(prompt_ans)

        # Check completeness
        has_photo = len(data.photos) > 0 or len(profile.photos) > 0
        has_bio = bool(profile.bio and len(profile.bio.strip()) >= 10)
        has_intent = bool(profile.relationship_intent)
        if has_photo and has_bio and has_intent:
            user.is_profile_completed = True

        await db.commit()
        await db.refresh(profile)
        await db.refresh(user)

        # Re-fetch with relationships loaded
        return await ProfileService.get_profile_response_by_user_id(db, user_id)

    @staticmethod
    async def save_voice_prompt(
        db: AsyncSession,
        user_id: str,
        voice_url: str,
        prompt_key: Optional[str] = None,
        prompt_title: Optional[str] = None,
        duration: Optional[int] = 15
    ) -> Optional[ProfileResponse]:
        profile = await ProfileService.get_profile_by_user_id(db, user_id)
        if not profile:
            return None
        profile.voice_intro_url = voice_url
        profile.voice_prompt_key = prompt_key or "pronunciation"
        profile.voice_prompt_title = prompt_title or "How to pronounce my name & what it means"
        profile.voice_intro_duration = duration or 15
        await db.commit()
        await db.refresh(profile)
        return await ProfileService.get_profile_response_by_user_id(db, user_id)

    @staticmethod
    async def get_profile_response_by_user_id(db: AsyncSession, user_id: str) -> Optional[ProfileResponse]:
        profile = await ProfileService.get_profile_by_user_id(db, user_id)
        if not profile:
            return None
        return ProfileService.to_profile_response(profile, profile.user)
