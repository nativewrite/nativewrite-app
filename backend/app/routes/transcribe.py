import os
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, HttpUrl
from openai import OpenAI

from ..core.config import get_settings
from ..core.yt_dlp_wrapper import download_best_audio
from ..core.ffmpeg_utils import ensure_mp3
from ..core.security import require_api_key, enforce_rate_limit


class TranscribeRequest(BaseModel):
    url: HttpUrl


router = APIRouter(prefix="/api", tags=["transcribe"])


@router.post("/transcribe-url", dependencies=[Depends(require_api_key)])
async def transcribe_url_endpoint(
    payload: TranscribeRequest,
    request: Request,
):
    enforce_rate_limit(request)

    settings = get_settings()
    
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI API key not configured",
        )

    os.makedirs(settings.audio_root, exist_ok=True)

    try:
        # Step 1: Download audio
        raw_path, duration = download_best_audio(str(payload.url), settings.audio_root)
        normalized_path = ensure_mp3(raw_path, settings.audio_root)

        # Step 2: Transcribe using OpenAI Whisper
        openai_client = OpenAI(api_key=settings.openai_api_key)
        
        with open(normalized_path, "rb") as audio_file:
            transcription = openai_client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",
            )

        filename = os.path.basename(normalized_path)
        file_id = os.path.splitext(filename)[0]  # Remove .mp3 extension

        return {
            "success": True,
            "transcript": transcription.text,
            "file_id": file_id,
            "duration": duration,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to transcribe video: {str(exc)}",
        ) from exc

