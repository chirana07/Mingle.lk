from fastapi import APIRouter
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.profiles import router as profiles_router
from backend.app.api.v1.cards import router as cards_router
from backend.app.api.v1.discovery import router as discovery_router
from backend.app.api.v1.connections import router as connections_router
from backend.app.api.v1.chat import router as chat_router
from backend.app.api.v1.dates import router as dates_router
from backend.app.api.v1.safety import router as safety_router
from backend.app.api.v1.admin import router as admin_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(profiles_router)
api_router.include_router(cards_router)
api_router.include_router(discovery_router)
api_router.include_router(connections_router)
api_router.include_router(chat_router)
api_router.include_router(dates_router)
api_router.include_router(safety_router)
api_router.include_router(admin_router)
