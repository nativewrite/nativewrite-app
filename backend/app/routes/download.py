import os
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, HttpUrl

from ..core.config import get_settings
from ..core.yt_dlp_wrapper import download_best_audio
from ..core.ffmpeg_utils import ensure_mp3
from ..core.security import require_api_key, enforce_rate_limit


class DownloadRequest(BaseModel):
    url: HttpUrl


router = APIRouter(prefix="/download", tags=["download"])


@router.post("/audio", dependencies=[Depends(require_api_key)])
async def download_audio_endpoint(
    payload: DownloadRequest,
    request: Request,
):
    enforce_rate_limit(request)

    settings = get_settings()
    os.makedirs(settings.audio_root, exist_ok=True)

    try:
        raw_path, duration = download_best_audio(str(payload.url), settings.audio_root)
        normalized_path = ensure_mp3(raw_path, settings.audio_root)

        filename = os.path.basename(normalized_path)
        file_url = request.url_for("files", path=filename)

        return {
            "status": "success",
            "audio_url": str(file_url),
            "duration": duration,
            "filename": filename,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process video: {exc}",
        ) from exc

