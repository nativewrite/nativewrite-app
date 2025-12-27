"""API routes for Humanizer endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from loguru import logger
from pydantic import BaseModel

from ..core.security import require_api_key, enforce_rate_limit
from .schemas import HumanizeRequest, HumanizeResponse, HumanizerScore
from .scorer import score_text
from .orchestrator import humanize_text

router = APIRouter(prefix="/api/humanizer", tags=["humanizer"])


class ScoreRequest(BaseModel):
    text: str
    lang: str = "en"


@router.post("/score", dependencies=[Depends(require_api_key)])
async def score_endpoint(
    payload: ScoreRequest,
    request: Request,
) -> HumanizerScore:
    """
    Score text for humanization quality.
    
    Args:
        payload: Score request with text and language
        request: FastAPI request object (for rate limiting)
    
    Returns:
        HumanizerScore with all metrics
    """
    enforce_rate_limit(request)
    
    if payload.lang not in ["en", "fa"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Language must be 'en' or 'fa'",
        )
    
    if not payload.text or not payload.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty",
        )
    
    try:
        score = score_text(payload.text, payload.lang)
        return score
    except Exception as e:
        logger.error(f"Scoring error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to score text: {str(e)}",
        ) from e


@router.post("/humanize", dependencies=[Depends(require_api_key)], response_model=HumanizeResponse)
async def humanize_endpoint(
    payload: HumanizeRequest,
    request: Request,
) -> HumanizeResponse:
    """
    Humanize text using multi-pass LLM orchestration.
    
    Args:
        payload: Humanization request with text and parameters
        request: FastAPI request object (for rate limiting)
    
    Returns:
        HumanizeResponse with original, humanized text, and score report
    """
    enforce_rate_limit(request)
    
    if not payload.text or not payload.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty",
        )
    
    if payload.lang not in ["en", "fa"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Language must be 'en' or 'fa'",
        )
    
    try:
        response = await humanize_text(payload)
        return response
    except Exception as e:
        logger.error(f"Humanization error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to humanize text: {str(e)}",
        ) from e

