from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from datetime import datetime, timezone

from backend.app.core.config import settings
from backend.app.core.database import init_db, AsyncSessionLocal
from backend.app.core.security import get_password_hash
import backend.app.models  # Ensures all model tables register on Base.metadata
from backend.app.models.user import User, UserRole, UserStatus
from backend.app.models.card import ConnectionCard
from backend.app.api.v1.router import api_router


# Default Connection Cards designed specifically around Sri Lankan dating context
DEFAULT_CONNECTION_CARDS = [
    {
        "category": "Lifestyle",
        "question": "Pick your ideal Saturday in Sri Lanka:",
        "subtext": "How do you recharge over the weekend?",
        "options": [
            {"key": "A", "label": "Early morning surf & Southern beach sunset", "emoji": "🌊"},
            {"key": "B", "label": "Cozy cafe hopping with a good book or laptop", "emoji": "☕"},
            {"key": "C", "label": "Spontaneous road trip to Kandy or Nuwara Eliya", "emoji": "🚗"},
            {"key": "D", "label": "Chilled indoor movie marathon & homemade tea", "emoji": "🎬"},
        ],
        "order_index": 1,
    },
    {
        "category": "Values",
        "question": "What quality anchors your relationships most?",
        "subtext": "Core emotional compass",
        "options": [
            {"key": "A", "label": "Deep emotional honesty & open communication", "emoji": "💬"},
            {"key": "B", "label": "Shared ambition & supporting each other's dreams", "emoji": "🚀"},
            {"key": "C", "label": "Playful banter, laughter, and zero pretense", "emoji": "✨"},
            {"key": "D", "label": "Family warmth & grounding cultural roots", "emoji": "🏡"},
        ],
        "order_index": 2,
    },
    {
        "category": "Dating Style",
        "question": "Your definition of a zero-pressure first date:",
        "subtext": "Setting comfortable expectations",
        "options": [
            {"key": "A", "label": "Specialty coffee + quiet walk in Colombo 07", "emoji": "☕"},
            {"key": "B", "label": "Street food crawl & sunset at Galle Face / Fort", "emoji": "🌅"},
            {"key": "C", "label": "Interactive board games or art exhibition", "emoji": "🎨"},
            {"key": "D", "label": "Casual dessert & chatting without any rush", "emoji": "🍨"},
        ],
        "order_index": 3,
    },
    {
        "category": "Fun",
        "question": "The ultimate late-night comfort debate:",
        "subtext": "Crucial Sri Lankan food opinions",
        "options": [
            {"key": "A", "label": "Midnight cheese kottu always wins", "emoji": "🧀"},
            {"key": "B", "label": "Crispy hoppers & spicy lunu miris", "emoji": "🥞"},
            {"key": "C", "label": "Wood-fired artisanal pizza", "emoji": "🍕"},
            {"key": "D", "label": "Sweet faluda or ice-cream tub on the couch", "emoji": "🍧"},
        ],
        "order_index": 4,
    },
    {
        "category": "Communication",
        "question": "How do you prefer to keep in touch during the day?",
        "subtext": "Respecting each other's flow",
        "options": [
            {"key": "A", "label": "Frequent texts, voice notes, and meme exchanges", "emoji": "📱"},
            {"key": "B", "label": "Focused day, then a meaningful evening call", "emoji": "📞"},
            {"key": "C", "label": "Low texting, save the best stories for in-person", "emoji": "🤝"},
            {"key": "D", "label": "Spontaneous catchups whenever free", "emoji": "⚡"},
        ],
        "order_index": 5,
    }
]


async def seed_initial_platform_data():
    """Seeds default connection cards and system admin if not present"""
    async with AsyncSessionLocal() as db:
        # Seed Connection Cards
        for card_data in DEFAULT_CONNECTION_CARDS:
            stmt = select(ConnectionCard).where(ConnectionCard.question == card_data["question"])
            res = await db.execute(stmt)
            if not res.scalar_one_or_none():
                card = ConnectionCard(
                    category=card_data["category"],
                    question=card_data["question"],
                    subtext=card_data["subtext"],
                    options=card_data["options"],
                    order_index=card_data["order_index"],
                    is_active=1
                )
                db.add(card)

        # Seed Platform Admin
        admin_stmt = select(User).where(User.email == settings.ADMIN_EMAIL)
        a_res = await db.execute(admin_stmt)
        if not a_res.scalar_one_or_none():
            admin = User(
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                role=UserRole.ADMIN.value,
                status=UserStatus.ACTIVE.value,
                is_email_verified=True,
                is_phone_verified=True,
                is_selfie_verified=True,
                is_profile_completed=True,
            )
            db.add(admin)

        await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed foundational cards
    await init_db()
    await seed_initial_platform_data()
    yield
    # Shutdown logic if needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="A Sri Lankan-first relationship discovery platform designed to turn compatibility into real-world connections.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
