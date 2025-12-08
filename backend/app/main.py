from __future__ import annotations

import asyncio
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger

from .core.config import get_settings
from .routes import download, health, transcribe
from .routers.download import router as download_router
from .workers.cleanup import start_cleanup_scheduler


settings = get_settings()

app = FastAPI(title="Nativewrite Backend")


if settings.allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

os.makedirs(settings.audio_root, exist_ok=True)
app.mount("/files", StaticFiles(directory=settings.audio_root), name="files")

# Mount media storage for downloader engine
media_dir = Path("storage/media")
media_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")

app.include_router(download.router)
app.include_router(health.router)
app.include_router(transcribe.router)
app.include_router(download_router.router)


@app.on_event("startup")
async def on_startup():
    logger.info("Starting Nativewrite backend")
    os.makedirs(settings.audio_root, exist_ok=True)
    app.state.cleanup_task = asyncio.create_task(
        start_cleanup_scheduler(
            settings.audio_root,
            settings.cleanup_interval_seconds,
            settings.cleanup_max_age_seconds,
        )
    )


@app.on_event("shutdown")
async def on_shutdown():
    logger.info("Shutting down Nativewrite backend")
    task = getattr(app.state, "cleanup_task", None)
    if task:
        task.cancel()

