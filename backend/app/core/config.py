import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Project Katha (Mingle.lk)"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://chirana@localhost:5432/mingle_lk"
    )

    # Security
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "katha-super-secret-investor-demo-key-change-in-production-2026"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    ALGORITHM: str = "HS256"

    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ]

    # Admin
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@mingle.lk")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "AdminKathaSecure2026!")

    # Matching Weights Configuration (Normalized to 1.0)
    WEIGHT_INTENT: float = 0.25
    WEIGHT_LIFESTYLE: float = 0.20
    WEIGHT_CARDS: float = 0.20
    WEIGHT_INTERESTS: float = 0.15
    WEIGHT_COMMUNICATION: float = 0.10
    WEIGHT_LOCATION: float = 0.10


settings = Settings()
