"""Base provider interface for downloaders."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional
from pydantic import BaseModel


class DownloadResult(BaseModel):
    """Result of a download operation."""

    success: bool
    output_path: Optional[str] = None
    output_type: str  # "audio" or "video"
    metadata: dict = {}
    error_message: Optional[str] = None


class BaseProvider(ABC):
    """Base class for all download providers."""

    name: str
    supported_domains: list[str]

    @abstractmethod
    def can_handle(self, url: str) -> bool:
        """
        Check if this provider can handle the given URL.

        Args:
            url: The URL to check

        Returns:
            True if this provider can handle the URL, False otherwise
        """
        pass

    @abstractmethod
    async def download(
        self,
        url: str,
        output_dir: str,
        output_type: str = "audio",
        job_id: Optional[str] = None,
    ) -> DownloadResult:
        """
        Download media from the given URL.

        Args:
            url: The URL to download from
            output_dir: Directory to save the output file
            output_type: "audio" or "video"
            job_id: Optional job ID for tracking

        Returns:
            DownloadResult with success status and file path
        """
        pass





