from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from backend.app.models.safety import Report, Block
from backend.app.models.match import Match
from backend.app.schemas.safety import ReportCreate, ReportResponse, BlockCreate, BlockResponse


class SafetyService:
    @staticmethod
    async def report_user(
        db: AsyncSession,
        reporter_id: str,
        data: ReportCreate
    ) -> ReportResponse:
        report = Report(
            reporter_id=reporter_id,
            reported_id=data.reported_id,
            category=data.category,
            details=data.details,
            status="pending",
        )
        db.add(report)
        
        # Also auto-block on report to instantly protect user
        block_stmt = select(Block).where(
            Block.blocker_id == reporter_id,
            Block.blocked_id == data.reported_id
        )
        b_res = await db.execute(block_stmt)
        if not b_res.scalar_one_or_none():
            block = Block(blocker_id=reporter_id, blocked_id=data.reported_id)
            db.add(block)

        # Deactivate any active match between them
        match_stmt = select(Match).where(
            or_(
                and_(Match.user1_id == reporter_id, Match.user2_id == data.reported_id),
                and_(Match.user1_id == data.reported_id, Match.user2_id == reporter_id),
            )
        )
        m_res = await db.execute(match_stmt)
        for m in m_res.scalars():
            m.is_active = False

        await db.commit()
        await db.refresh(report)
        return ReportResponse.model_validate(report)

    @staticmethod
    async def block_user(
        db: AsyncSession,
        blocker_id: str,
        data: BlockCreate
    ) -> BlockResponse:
        existing = await db.execute(
            select(Block).where(Block.blocker_id == blocker_id, Block.blocked_id == data.blocked_id)
        )
        b = existing.scalar_one_or_none()
        if not b:
            b = Block(blocker_id=blocker_id, blocked_id=data.blocked_id)
            db.add(b)

            # Deactivate active match
            match_stmt = select(Match).where(
                or_(
                    and_(Match.user1_id == blocker_id, Match.user2_id == data.blocked_id),
                    and_(Match.user1_id == data.blocked_id, Match.user2_id == blocker_id),
                )
            )
            m_res = await db.execute(match_stmt)
            for m in m_res.scalars():
                m.is_active = False

            await db.commit()
            await db.refresh(b)
        return BlockResponse.model_validate(b)
