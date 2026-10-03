from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union
from jose import jwt, JWTError
import bcrypt
import random
from backend.app.core.config import settings

# In-memory OTP storage for MVP simulation (in production: Redis with 5-min TTL)
_otp_storage = {}


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8")[:72], hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    # Bcrypt maximum length is 72 bytes
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


DEMO_IDENTIFIERS = {
    "+94771234567",
    "demo@mingle.lk",
    "admin@mingle.lk",
}


def is_demo_identifier(identifier: str) -> bool:
    if identifier in DEMO_IDENTIFIERS:
        return True
    # In development/test mode, also allow automated test suite numbers
    if settings.ENVIRONMENT in ["development", "test"] and (
        identifier.startswith("+94771111") or identifier.startswith("+94772222")
    ):
        return True
    return False


def generate_otp(identifier: str) -> str:
    """
    Generates a 6-digit OTP code for a phone number or email.
    In development/test, fixed demo identifiers produce '123456'.
    """
    if settings.ENVIRONMENT in ["development", "test"] and is_demo_identifier(identifier):
        code = "123456"
    else:
        code = f"{random.randint(100000, 999999)}"
    
    _otp_storage[identifier] = {
        "code": code,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5)
    }
    return code


def verify_otp(identifier: str, code: str) -> bool:
    """Verifies submitted OTP code against storage"""
    # Demo bypass allowed only in development or test environment for verified demo identifiers
    if settings.ENVIRONMENT in ["development", "test"] and code == "123456" and is_demo_identifier(identifier):
        return True
    
    record = _otp_storage.get(identifier)
    if not record:
        return False
    
    if datetime.now(timezone.utc) > record["expires_at"]:
        del _otp_storage[identifier]
        return False
        
    if record["code"] == code:
        del _otp_storage[identifier]
        return True
    return False

