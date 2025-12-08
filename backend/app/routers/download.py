"""Download API router."""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from loguru import logger
from pydantic import BaseModel, HttpUrl

from ..core.config import get_settings
from ..core.security import require_api_key, enforce_rate_limit
from ..downloader import JobStore, ProviderRegistry

router = APIRouter(prefix="/api", tags=["download"])

# Initialize registry and job store
registry = ProviderRegistry()
job_store = JobStore()


class DownloadRequest(BaseModel):
    """Request to create a download job."""

    url: HttpUrl
    type: str = "audio"  # "audio" or "video"


class DownloadResponse(BaseModel):
    """Response for download job creation."""

    job_id: str
    status: str
    url: str
    provider: str


class JobStatusResponse(BaseModel):
    """Response for job status check."""

    job_id: str
    status: str
    url: str
    provider: str
    output_type: str
    download_url: Optional[str] = None
    metadata: dict = {}
    error_message: Optional[str] = None
    created_at: str
    updated_at: str


async def process_download_job(job_id: str, url: str, output_type: str) -> None:
    """
    Background task to process a download job.

    Args:
        job_id: Job ID
        url: URL to download
        output_type: "audio" or "video"
    """
    from ..core.config import get_settings

    settings = get_settings()
    media_dir = Path("storage/media")
    media_dir.mkdir(parents=True, exist_ok=True)

    # Update job to running
    job_store.update_job_status(job_id, "running")

    # Get provider
    provider = registry.get_provider(str(url))
    if not provider:
        job_store.update_job_status(
            job_id,
            "failed",
            error_message="No suitable provider found for this URL",
        )
        return

    # Perform download
    try:
        result = await provider.download(
            str(url),
            str(media_dir),
            output_type=output_type,
            job_id=job_id,
        )

        if result.success and result.output_path:
            # Get file extension
            output_path = Path(result.output_path)
            ext = output_path.suffix

            # Determine download URL
            download_url = f"/media/{job_id}{ext}"

            # Update job with success
            job_store.update_job_status(
                job_id,
                "completed",
                output_path=str(result.output_path),
                metadata=result.metadata,
            )
        else:
            # Update job with failure
            job_store.update_job_status(
                job_id,
                "failed",
                error_message=result.error_message or "Download failed",
            )

    except Exception as e:
        logger.error(f"Download job {job_id} error: {e}")
        job_store.update_job_status(
            job_id,
            "failed",
            error_message=f"Download error: {str(e)}",
        )


@router.post("/download", dependencies=[Depends(require_api_key)])
async def create_download_job(
    request: DownloadRequest,
    background_tasks: BackgroundTasks,
    req: Request,
):
    """
    Create a new download job.

    Returns immediately with job_id, processes download in background.
    """
    enforce_rate_limit(req)

    url_str = str(request.url)
    output_type = request.type

    # Check if job already exists for this URL
    existing_job = job_store.find_job_by_url(url_str)
    if existing_job:
        return DownloadResponse(
            job_id=existing_job.job_id,
            status=existing_job.status,
            url=existing_job.url,
            provider=existing_job.provider,
        )

    # Get provider
    provider = registry.get_provider(url_str)
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No suitable provider found for this URL",
        )

    # Create job
    job = job_store.create_job(url_str, provider.name, output_type)

    # Schedule background task
    background_tasks.add_task(process_download_job, job.job_id, url_str, output_type)

    return DownloadResponse(
        job_id=job.job_id,
        status=job.status,
        url=job.url,
        provider=job.provider,
    )


@router.get("/download/{job_id}", dependencies=[Depends(require_api_key)])
async def get_job_status(job_id: str):
    """
    Get status of a download job.

    Args:
        job_id: Job ID

    Returns:
        Job status and metadata
    """
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found",
        )

    # Build download URL if completed
    download_url = None
    if job.status == "completed" and job.output_path:
        output_path = Path(job.output_path)
        ext = output_path.suffix
        download_url = f"/media/{job_id}{ext}"

    return JobStatusResponse(
        job_id=job.job_id,
        status=job.status,
        url=job.url,
        provider=job.provider,
        output_type=job.output_type,
        download_url=download_url,
        metadata=job.metadata,
        error_message=job.error_message,
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


@router.get("/download", dependencies=[Depends(require_api_key)])
async def find_job_by_url(url: str = Query(..., description="URL to search for")):
    """
    Find existing job by URL.

    Args:
        url: URL to search for

    Returns:
        Job status if found, 404 if not
    """
    job = job_store.find_job_by_url(url)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No job found for URL: {url}",
        )

    download_url = None
    if job.status == "completed" and job.output_path:
        output_path = Path(job.output_path)
        ext = output_path.suffix
        download_url = f"/media/{job.job_id}{ext}"

    return JobStatusResponse(
        job_id=job.job_id,
        status=job.status,
        url=job.url,
        provider=job.provider,
        output_type=job.output_type,
        download_url=download_url,
        metadata=job.metadata,
        error_message=job.error_message,
        created_at=job.created_at,
        updated_at=job.updated_at,
    )

