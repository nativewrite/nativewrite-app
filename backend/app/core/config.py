import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Ignore extra env vars that don't match fields
    )
    
    api_key: str = ""
    openai_api_key: str = ""
    allowed_origins: List[str] = []
    audio_root: str = "/tmp/nativewrite/audio"
    youtube_cookies_file: str = ""  # Path to cookies.txt file (optional)
    cleanup_interval_seconds: int = 900  # 15 min
    cleanup_max_age_seconds: int = 7200  # 2 hours
    rate_limit_requests: int = 30
    rate_limit_window_seconds: int = 60

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: Union[str, List[str], None]) -> List[str]:
        if v is None:
            # Try reading from ALLOWED_ORIGIN (singular) as fallback
            v = os.getenv("ALLOWED_ORIGIN", "") or os.getenv("ALLOWED_ORIGINS", "")
        if isinstance(v, str):
            # Handle comma-separated string from env var
            origins = [origin.strip() for origin in v.split(",") if origin.strip()]
            return origins
        if isinstance(v, list):
            return v
        return []


@lru_cache()
def get_settings() -> Settings:
    return Settings()

