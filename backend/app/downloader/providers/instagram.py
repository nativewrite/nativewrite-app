"""Instagram download provider (stub - not implemented yet)."""

from __future__ import annotations

from typing import Optional
from urllib.parse import urlparse

from ..base import BaseProvider, DownloadResult


class InstagramProvider(BaseProvider):
    """Instagram provider - not yet implemented."""

    name = "instagram"
    supported_domains = ["instagram.com", "www.instagram.com"]

    def can_handle(self, url: str) -> bool:
        """Check if URL is an Instagram URL."""
        try:
            parsed = urlparse(url)
            hostname = parsed.hostname or ""
            return any(domain in hostname for domain in self.supported_domains)
        except Exception:
            return False

    async def download(
        self,
        url: str,
        output_dir: str,
        output_type: str = "audio",
        job_id: Optional[str] = None,
    ) -> DownloadResult:
        """Instagram download not implemented yet."""
        return DownloadResult(
            success=False,
            error_message="Instagram provider is not yet implemented. Please use the 'Upload File' option instead.",
        )





