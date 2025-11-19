import os
from pydantic import BaseSettings, AnyHttpUrl
from functools import lru_cache


class Settings(BaseSettings):
    api_key: str = os.getenv("API_KEY", "")
    allowed_origins: list[AnyHttpUrl] = []
    audio_root: str = os.getenv("AUDIO_ROOT", "/tmp/nativewrite/audio")
    cleanup_interval_seconds: int = int(os.getenv("CLEANUP_INTERVAL_SECONDS", "900"))  # 15 min
    cleanup_max_age_seconds: int = int(os.getenv("CLEANUP_MAX_AGE_SECONDS", "7200"))  # 2 hours
    rate_limit_requests: int = int(os.getenv("RATE_LIMIT_REQUESTS", "30"))
    rate_limit_window_seconds: int = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

