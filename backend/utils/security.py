from datetime import datetime, timedelta

from jose import jwt
from passlib.context import CryptContext

from core.config import SECRET_KEY, ALGORITHM

# Password hashing configuration
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(
    password: str,
    hashed: str
):
    return pwd_context.verify(password, hashed)


# Create a JWT token with an expiry time
def create_token(
    data: dict,
    expires_delta: timedelta
):
    to_encode = data.copy()

    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )