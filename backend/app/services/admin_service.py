from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from backend.app.models.user import User, UserStatus
from backend.app.models.match import Match
from backend.app.models.chat import Conversation
from backend.app.models.date import DatePlan
from backend.app.models.safety import Report
from backend.app.models.analytics import AnalyticsEvent
from backend.app.schemas.admin import AdminDashboardMetrics, AdminUserUpdate, AdminReportUpdate
from backend.app.schemas.safety import ReportResponse
from backend.app.schemas.auth import UserResponse


class AdminService:
    @staticmethod
    async def get_metrics(db: AsyncSession) -> AdminDashboardMetrics:
        # Total & active users
        total_users_res = await db.execute(select(func.count(User.id)))
        total_users = total_users_res.scalar() or 0

        active_users_res = await db.execute(select(func.count(User.id)).where(User.status == "active"))
        active_users = active_users_res.scalar() or 0

        verified_users_res = await db.execute(
            select(func.count(User.id)).where(
                User.status == "active",
                (User.is_phone_verified == True) | (User.is_email_verified == True)
            )
        )
        verified_users = verified_users_res.scalar() or 0

        # Matches
        matches_res = await db.execute(select(func.count(Match.id)))
        matches_created = matches_res.scalar() or 0

        # Conversations
        conv_res = await db.execute(select(func.count(Conversation.id)))
        conversations_started = conv_res.scalar() or 0

        # Dates planned
        dates_res = await db.execute(select(func.count(DatePlan.id)))
        dates_planned = dates_res.scalar() or 0

        # Pending reports
        reports_res = await db.execute(select(func.count(Report.id)).where(Report.status == "pending"))
        reports_pending = reports_res.scalar() or 0

        # Rates
        m2c_rate = (conversations_started / matches_created * 100.0) if matches_created > 0 else 0.0
        c2d_rate = (dates_planned / conversations_started * 100.0) if conversations_started > 0 else 0.0
        safety_rate = (reports_pending / max(1, total_users) * 100.0)

        return AdminDashboardMetrics(
            total_users=total_users,
            active_users=active_users,
            verified_users=verified_users,
            matches_created=matches_created,
            conversations_started=conversations_started,
            dates_planned=dates_planned,
            reports_pending=reports_pending,
            match_to_conversation_rate=round(m2c_rate, 1),
            conversation_to_date_rate=round(c2d_rate, 1),
            safety_incident_rate=round(safety_rate, 2),
        )

    @staticmethod
    async def get_all_reports(db: AsyncSession, limit: int = 50) -> List[ReportResponse]:
        stmt = select(Report).order_by(Report.created_at.desc()).limit(limit)
        res = await db.execute(stmt)
        return [ReportResponse.model_validate(r) for r in res.scalars().all()]

    @staticmethod
    async def update_report(db: AsyncSession, report_id: str, data: AdminReportUpdate) -> Optional[ReportResponse]:
        stmt = select(Report).where(Report.id == report_id)
        res = await db.execute(stmt)
        report = res.scalar_one_or_none()
        if not report:
            return None
        report.status = data.status
        if data.admin_notes:
            report.admin_notes = data.admin_notes
        await db.commit()
        await db.refresh(report)
        return ReportResponse.model_validate(report)

    @staticmethod
    async def get_all_users(db: AsyncSession, limit: int = 50) -> List[UserResponse]:
        stmt = select(User).order_by(User.created_at.desc()).limit(limit)
        res = await db.execute(stmt)
        return [UserResponse.model_validate(u) for u in res.scalars().all()]

    @staticmethod
    async def update_user(db: AsyncSession, user_id: str, data: AdminUserUpdate) -> Optional[UserResponse]:
        stmt = select(User).where(User.id == user_id)
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()
        if not user:
            return None
        if data.status:
            user.status = data.status
        if data.role:
            user.role = data.role
        if data.is_selfie_verified is not None:
            user.is_selfie_verified = data.is_selfie_verified
        await db.commit()
        await db.refresh(user)
        return UserResponse.model_validate(user)
