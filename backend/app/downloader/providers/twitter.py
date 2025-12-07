"""Twitter/X download provider (stub - not implemented yet)."""

from __future__ import annotations

from typing import Optional
from urllib.parse import urlparse

from ..base import BaseProvider, DownloadResult


class TwitterProvider(BaseProvider):
    """Twitter/X provider - not yet implemented."""

    name = "twitter"
    supported_domains = ["twitter.com", "www.twitter.com", "x.com", "www.x.com"]

    def can_handle(self, url: str) -> bool:
        """Check if URL is a Twitter/X URL."""
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
        """Twitter/X download not implemented yet."""
        return DownloadResult(
            success=False,
            error_message="Twitter/X provider is not yet implemented. Please use the 'Upload File' option instead.",
        )

