from fastapi import Depends, HTTPException, Request, status
from fastapi.security import APIKeyHeader
import time
from typing import Dict

from .config import get_settings


api_key_header = APIKeyHeader(name="X-API-KEY", auto_error=False)


def require_api_key(api_key: str = Depends(api_key_header)):
    settings = get_settings()
    if not settings.api_key:
        return
    if api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )


class RateLimiter:
    def __init__(self):
        self.store: Dict[str, Dict[str, float]] = {}

    def verify(self, request: Request):
        settings = get_settings()
        window = settings.rate_limit_window_seconds
        limit = settings.rate_limit_requests

        identifier = request.client.host if request.client else "unknown"
        now = time.time()

        bucket = self.store.get(identifier)
        if not bucket or now > bucket["reset"]:
            self.store[identifier] = {"count": 1, "reset": now + window}
            return

        if bucket["count"] >= limit:
            retry_after = int(bucket["reset"] - now)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Try again in {retry_after}s",
                headers={"Retry-After": str(max(retry_after, 1))},
            )

        bucket["count"] += 1


rate_limiter = RateLimiter()


def enforce_rate_limit(request: Request):
    rate_limiter.verify(request)

