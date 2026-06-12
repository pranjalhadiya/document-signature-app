from datetime import timedelta
from core.config import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from utils.security import create_token


def create_access_token(data: dict):
    return create_token(
        data,
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )


def create_refresh_token(data: dict):
    return create_token(
        data,
        timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )