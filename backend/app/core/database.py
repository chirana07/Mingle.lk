from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from backend.app.core.config import settings

# Engine configuration
is_sqlite = settings.DATABASE_URL.startswith("sqlite")
engine_kwargs = {}
if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for providing database sessions per request"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initializes tables on startup"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        def migrate_sqlite_columns(connection):
            try:
                res = connection.exec_driver_sql("PRAGMA table_info(profiles)").fetchall()
                cols = [r[1] for r in res]
                alter_statements = [
                    ("voice_intro_url", "ALTER TABLE profiles ADD COLUMN voice_intro_url TEXT"),
                    ("voice_prompt_key", "ALTER TABLE profiles ADD COLUMN voice_prompt_key TEXT"),
                    ("voice_prompt_title", "ALTER TABLE profiles ADD COLUMN voice_prompt_title TEXT"),
                    ("voice_intro_duration", "ALTER TABLE profiles ADD COLUMN voice_intro_duration INTEGER DEFAULT 15"),
                ]
                for col_name, stmt in alter_statements:
                    if col_name not in cols:
                        connection.exec_driver_sql(stmt)
            except Exception:
                pass

        if is_sqlite:
            await conn.run_sync(migrate_sqlite_columns)
