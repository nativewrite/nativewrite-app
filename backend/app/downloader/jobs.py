"""Job management system for downloads."""

from __future__ import annotations

import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from loguru import logger
from pydantic import BaseModel, Field


class DownloadJob(BaseModel):
    """Download job model."""

    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    provider: str
    status: str = "pending"  # pending, running, completed, failed
    output_path: Optional[str] = None
    output_type: str = "audio"  # audio or video
    metadata: dict = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    error_message: Optional[str] = None


class JobStore:
    """Manages job storage as JSON files."""

    def __init__(self, jobs_dir: str = "storage/jobs"):
        """
        Initialize job store.

        Args:
            jobs_dir: Directory to store job JSON files
        """
        self.jobs_dir = Path(jobs_dir)
        self.jobs_dir.mkdir(parents=True, exist_ok=True)

    def _get_job_path(self, job_id: str) -> Path:
        """Get file path for a job."""
        return self.jobs_dir / f"{job_id}.json"

    def create_job(self, url: str, provider: str, output_type: str = "audio") -> DownloadJob:
        """
        Create a new download job.

        Args:
            url: URL to download
            provider: Provider name
            output_type: "audio" or "video"

        Returns:
            Created DownloadJob
        """
        job = DownloadJob(
            job_id=str(uuid.uuid4()),
            url=url,
            provider=provider,
            output_type=output_type,
            status="pending",
        )
        self.save_job(job)
        logger.info(f"Created job {job.job_id} for {url}")
        return job

    def save_job(self, job: DownloadJob) -> None:
        """
        Save job to disk (atomic write).

        Args:
            job: Job to save
        """
        job.updated_at = datetime.utcnow().isoformat()
        job_path = self._get_job_path(job.job_id)

        # Atomic write: write to temp file, then rename
        temp_path = job_path.with_suffix(".tmp")
        with open(temp_path, "w") as f:
            json.dump(job.model_dump(), f, indent=2)

        temp_path.replace(job_path)
        logger.debug(f"Saved job {job.job_id}")

    def get_job(self, job_id: str) -> Optional[DownloadJob]:
        """
        Get job by ID.

        Args:
            job_id: Job ID

        Returns:
            DownloadJob or None if not found
        """
        job_path = self._get_job_path(job_id)
        if not job_path.exists():
            return None

        try:
            with open(job_path, "r") as f:
                data = json.load(f)
            return DownloadJob(**data)
        except Exception as e:
            logger.error(f"Error reading job {job_id}: {e}")
            return None

    def find_job_by_url(self, url: str) -> Optional[DownloadJob]:
        """
        Find existing job for a URL.

        Args:
            url: URL to search for

        Returns:
            DownloadJob or None if not found
        """
        for job_file in self.jobs_dir.glob("*.json"):
            try:
                with open(job_file, "r") as f:
                    data = json.load(f)
                job = DownloadJob(**data)
                if job.url == url and job.status == "completed":
                    return job
            except Exception:
                continue
        return None

    def update_job_status(
        self,
        job_id: str,
        status: str,
        output_path: Optional[str] = None,
        metadata: Optional[dict] = None,
        error_message: Optional[str] = None,
    ) -> bool:
        """
        Update job status.

        Args:
            job_id: Job ID
            status: New status
            output_path: Optional output file path
            metadata: Optional metadata dict
            error_message: Optional error message

        Returns:
            True if job was updated, False if not found
        """
        job = self.get_job(job_id)
        if not job:
            return False

        job.status = status
        if output_path:
            job.output_path = output_path
        if metadata:
            job.metadata.update(metadata)
        if error_message:
            job.error_message = error_message

        self.save_job(job)
        logger.info(f"Updated job {job_id} to status {status}")
        return True

