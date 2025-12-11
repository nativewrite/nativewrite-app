"""YouTube download provider using Playwright headless browser."""

from __future__ import annotations

import asyncio
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

from loguru import logger
from playwright.async_api import async_playwright, Browser, Page, TimeoutError as PlaywrightTimeout

from ..base import BaseProvider, DownloadResult


class YouTubeProvider(BaseProvider):
    """YouTube provider using Playwright to extract media URLs."""

    name = "youtube"
    supported_domains = [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
    ]

    def can_handle(self, url: str) -> bool:
        """Check if URL is a YouTube URL."""
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
        """
        Download YouTube video/audio using Playwright.

        Strategy:
        1. Launch headless browser
        2. Navigate to YouTube URL
        3. Wait for page to load and media to be available
        4. Extract media stream URLs from network requests or page state
        5. Download using httpx or Playwright's request API
        6. Process with ffmpeg if needed
        """
        os.makedirs(output_dir, exist_ok=True)
        output_file = os.path.join(output_dir, f"{job_id or 'youtube'}.mp4")

        try:
            async with async_playwright() as p:
                # Launch browser
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                )
                page = await context.new_page()

                # Intercept network requests to capture media URLs
                media_urls = []
                video_url = None
                audio_url = None

                async def handle_route(route):
                    """Intercept network requests to find media streams."""
                    request = route.request
                    url = request.url

                    # Look for video/audio streams
                    if ".googlevideo.com" in url or "videoplayback" in url:
                        if "mime=video" in url or "itag=18" in url or "itag=22" in url:
                            nonlocal video_url
                            if not video_url:
                                video_url = url
                                logger.info(f"Found video stream: {url[:100]}...")
                        elif "mime=audio" in url or "itag=140" in url:
                            nonlocal audio_url
                            if not audio_url:
                                audio_url = url
                                logger.info(f"Found audio stream: {url[:100]}...")

                    await route.continue_()

                # Set up route interception
                await page.route("**/*", handle_route)

                # Navigate to YouTube URL
                logger.info(f"Navigating to YouTube URL: {url}")
                await page.goto(url, wait_until="networkidle", timeout=30000)

                # Wait a bit for media to load
                await asyncio.sleep(3)

                # Try to get video element and extract src
                try:
                    video_element = await page.query_selector("video")
                    if video_element:
                        src = await video_element.get_attribute("src")
                        if src:
                            video_url = src
                            logger.info("Found video src attribute")
                except Exception as e:
                    logger.warning(f"Could not extract video src: {e}")

                # Try to extract metadata
                metadata = {}
                try:
                    title = await page.title()
                    metadata["title"] = title.replace(" - YouTube", "").strip()

                    # Try to get duration
                    try:
                        duration_text = await page.evaluate(
                            """() => {
                                const timeElement = document.querySelector('.ytp-time-duration');
                                return timeElement ? timeElement.textContent : null;
                            }"""
                        )
                        if duration_text:
                            # Parse duration (e.g., "10:30" -> 630 seconds)
                            parts = duration_text.split(":")
                            if len(parts) == 2:
                                metadata["duration"] = int(parts[0]) * 60 + int(parts[1])
                            elif len(parts) == 3:
                                metadata["duration"] = int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
                    except Exception:
                        pass
                except Exception as e:
                    logger.warning(f"Could not extract metadata: {e}")

                await browser.close()

                # Download the media
                if not video_url and not audio_url:
                    # Fallback to yt-dlp if Playwright fails
                    logger.warning("Playwright failed to extract URLs, falling back to yt-dlp")
                    return await self._fallback_to_ytdlp(url, output_dir, output_type, job_id)

                # Download video or audio
                import httpx

                async with httpx.AsyncClient(timeout=300.0) as client:
                    if output_type == "video" and video_url:
                        # Download video
                        logger.info("Downloading video stream...")
                        response = await client.get(video_url, follow_redirects=True)
                        response.raise_for_status()

                        with open(output_file, "wb") as f:
                            f.write(response.content)

                        # Convert to mp4 if needed
                        final_file = await self._convert_to_mp4(output_file, output_dir, job_id)
                        if final_file != output_file:
                            os.remove(output_file)
                            output_file = final_file

                    elif output_type == "audio" and audio_url:
                        # Download audio
                        logger.info("Downloading audio stream...")
                        response = await client.get(audio_url, follow_redirects=True)
                        response.raise_for_status()

                        temp_audio = os.path.join(output_dir, f"{job_id or 'temp'}_audio.webm")
                        with open(temp_audio, "wb") as f:
                            f.write(response.content)

                        # Convert to audio format (wav for Whisper compatibility)
                        output_file = await self._convert_to_audio(temp_audio, output_dir, job_id)
                        os.remove(temp_audio)

                    elif output_type == "video" and audio_url:
                        # Only audio available, download as audio
                        logger.info("Only audio stream available, downloading as audio...")
                        response = await client.get(audio_url, follow_redirects=True)
                        response.raise_for_status()

                        temp_audio = os.path.join(output_dir, f"{job_id or 'temp'}_audio.webm")
                        with open(temp_audio, "wb") as f:
                            f.write(response.content)

                        output_file = await self._convert_to_audio(temp_audio, output_dir, job_id)
                        os.remove(temp_audio)
                        output_type = "audio"  # Update type since we only got audio

                    else:
                        # Fallback to yt-dlp if no stream found
                        logger.warning("No stream found with Playwright, falling back to yt-dlp")
                        return await self._fallback_to_ytdlp(url, output_dir, output_type, job_id)

                return DownloadResult(
                    success=True,
                    output_path=output_file,
                    output_type=output_type,
                    metadata=metadata,
                )

        except PlaywrightTimeout:
            logger.warning("Playwright timeout, falling back to yt-dlp")
            return await self._fallback_to_ytdlp(url, output_dir, output_type, job_id)
        except Exception as e:
            logger.warning(f"Playwright error: {e}, falling back to yt-dlp")
            return await self._fallback_to_ytdlp(url, output_dir, output_type, job_id)

    async def _convert_to_mp4(self, input_file: str, output_dir: str, job_id: Optional[str]) -> str:
        """Convert video to MP4 using ffmpeg."""
        output_file = os.path.join(output_dir, f"{job_id or 'video'}.mp4")
        try:
            subprocess.run(
                ["ffmpeg", "-i", input_file, "-c", "copy", "-y", output_file],
                check=True,
                capture_output=True,
            )
            return output_file
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg conversion failed: {e.stderr.decode()}")
            # Return original file if conversion fails
            return input_file

    async def _convert_to_audio(self, input_file: str, output_dir: str, job_id: Optional[str]) -> str:
        """Convert to audio (WAV) using ffmpeg for Whisper compatibility."""
        output_file = os.path.join(output_dir, f"{job_id or 'audio'}.wav")
        try:
            subprocess.run(
                [
                    "ffmpeg",
                    "-i",
                    input_file,
                    "-ar",
                    "16000",  # Whisper prefers 16kHz
                    "-ac",
                    "1",  # Mono
                    "-y",
                    output_file,
                ],
                check=True,
                capture_output=True,
            )
            return output_file
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg audio conversion failed: {e.stderr.decode()}")
            # Fallback to mp3
            output_file = os.path.join(output_dir, f"{job_id or 'audio'}.mp3")
            try:
                subprocess.run(
                    ["ffmpeg", "-i", input_file, "-acodec", "libmp3lame", "-y", output_file],
                    check=True,
                    capture_output=True,
                )
                return output_file
            except Exception:
                return input_file

    async def _fallback_to_ytdlp(
        self,
        url: str,
        output_dir: str,
        output_type: str,
        job_id: Optional[str],
    ) -> DownloadResult:
        """
        Fallback to yt-dlp when Playwright fails.
        Uses the existing multi-strategy extractor.
        """
        try:
            from ...core.config import get_settings
            from ...core.youtube_extractor import extract_youtube_audio

            settings = get_settings()
            cookies_file = settings.youtube_cookies_file if hasattr(settings, 'youtube_cookies_file') else None

            logger.info("Using yt-dlp fallback for YouTube download")

            if output_type == "audio":
                # Use the existing extractor
                audio_path, duration = extract_youtube_audio(url, output_dir, cookies_file)

                # Convert to WAV for Whisper if needed
                if not audio_path.endswith('.wav'):
                    output_file = await self._convert_to_audio(audio_path, output_dir, job_id)
                    if output_file != audio_path and os.path.exists(audio_path):
                        os.remove(audio_path)
                else:
                    output_file = audio_path

                metadata = {"duration": duration}
                return DownloadResult(
                    success=True,
                    output_path=output_file,
                    output_type="audio",
                    metadata=metadata,
                )
            else:
                # For video, use yt-dlp directly
                from yt_dlp import YoutubeDL

                output_file = os.path.join(output_dir, f"{job_id or 'video'}.mp4")
                ydl_opts = {
                    "format": "bestvideo+bestaudio/best",
                    "outtmpl": output_file.replace(".mp4", ".%(ext)s"),
                    "merge_output_format": "mp4",
                    "noplaylist": True,
                }

                if cookies_file and os.path.exists(cookies_file):
                    ydl_opts["cookiefile"] = cookies_file

                with YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=True)
                    downloaded_path = ydl.prepare_filename(info).replace(".webm", ".mp4").replace(".mkv", ".mp4")

                if os.path.exists(downloaded_path):
                    metadata = {
                        "title": info.get("title", ""),
                        "duration": float(info.get("duration") or 0),
                    }
                    return DownloadResult(
                        success=True,
                        output_path=downloaded_path,
                        output_type="video",
                        metadata=metadata,
                    )

            return DownloadResult(
                success=False,
                output_type=output_type,
                error_message="yt-dlp fallback also failed. The video may be restricted or unavailable.",
            )

        except Exception as e:
            logger.error(f"yt-dlp fallback error: {e}")
            return DownloadResult(
                success=False,
                output_type=output_type,
                error_message=f"Both Playwright and yt-dlp failed: {str(e)}",
            )

