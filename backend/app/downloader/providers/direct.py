"""Direct media download provider for direct file URLs."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

import httpx
from loguru import logger

from ..base import BaseProvider, DownloadResult


class DirectMediaProvider(BaseProvider):
    """Provider for direct media file URLs (mp4, mp3, m3u8, etc.)."""

    name = "direct"
    supported_domains = []  # No specific domains, matches by extension

    # Supported file extensions
    supported_extensions = {
        "video": [".mp4", ".webm", ".mkv", ".avi", ".mov", ".m4v"],
        "audio": [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac"],
        "stream": [".m3u8", ".m3u"],
    }

    def can_handle(self, url: str) -> bool:
        """Check if URL is a direct media file."""
        try:
            parsed = urlparse(url)
            path = parsed.path.lower()
            extension = Path(path).suffix

            # Check all supported extensions
            all_extensions = []
            for ext_list in self.supported_extensions.values():
                all_extensions.extend(ext_list)

            return extension in all_extensions or "m3u8" in path or "m3u" in path
        except Exception:
            return False

    async def download(
        self,
        url: str,
        output_dir: str,
        output_type: str = "audio",
        job_id: Optional[str] = None,
    ) -> DownloadResult:
        """Download direct media file."""
        os.makedirs(output_dir, exist_ok=True)

        try:
            parsed = urlparse(url)
            path = parsed.path
            extension = Path(path).suffix or ".mp4"

            # Determine output type from URL if not specified
            detected_type = "video"
            if extension in self.supported_extensions["audio"]:
                detected_type = "audio"
            elif extension in self.supported_extensions["video"]:
                detected_type = "video"

            # Handle HLS streams (m3u8)
            if ".m3u8" in path or ".m3u" in path:
                return await self._download_hls_stream(url, output_dir, output_type, job_id)

            # Download direct file
            output_file = os.path.join(output_dir, f"{job_id or 'media'}{extension}")

            async with httpx.AsyncClient(timeout=300.0) as client:
                logger.info(f"Downloading direct media from: {url}")
                response = await client.get(url, follow_redirects=True)
                response.raise_for_status()

                with open(output_file, "wb") as f:
                    async for chunk in response.aiter_bytes():
                        f.write(chunk)

            metadata = {
                "content_type": response.headers.get("content-type", ""),
                "content_length": response.headers.get("content-length", ""),
            }

            return DownloadResult(
                success=True,
                output_path=output_file,
                output_type=detected_type,
                metadata=metadata,
            )

        except Exception as e:
            logger.error(f"Direct media download error: {e}")
            return DownloadResult(
                success=False,
                error_message=f"Failed to download direct media: {str(e)}",
            )

    async def _download_hls_stream(
        self, url: str, output_dir: str, output_type: str, job_id: Optional[str]
    ) -> DownloadResult:
        """Download HLS stream using ffmpeg."""
        import subprocess

        output_file = os.path.join(output_dir, f"{job_id or 'stream'}.mp4")
        if output_type == "audio":
            output_file = os.path.join(output_dir, f"{job_id or 'stream'}.wav")

        try:
            # Use ffmpeg to download and convert HLS stream
            cmd = [
                "ffmpeg",
                "-i",
                url,
                "-c",
                "copy" if output_type == "video" else "pcm_s16le",
                "-y",
                output_file,
            ]

            if output_type == "audio":
                cmd.insert(-2, "-ar")
                cmd.insert(-2, "16000")
                cmd.insert(-2, "-ac")
                cmd.insert(-2, "1")

            subprocess.run(cmd, check=True, capture_output=True, timeout=600)

            return DownloadResult(
                success=True,
                output_path=output_file,
                output_type=output_type,
                metadata={"source": "hls_stream"},
            )

        except subprocess.TimeoutExpired:
            return DownloadResult(
                success=False,
                error_message="Timeout downloading HLS stream (max 10 minutes)",
            )
        except subprocess.CalledProcessError as e:
            logger.error(f"HLS download failed: {e.stderr.decode() if e.stderr else str(e)}")
            return DownloadResult(
                success=False,
                error_message=f"Failed to download HLS stream: {str(e)}",
            )





