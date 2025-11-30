"""
Alternative YouTube extraction using multiple strategies.
Similar to how TurboScribe handles YouTube URLs.
"""
from __future__ import annotations

import os
import subprocess
import tempfile
from typing import Optional, Tuple
from loguru import logger
from yt_dlp import YoutubeDL


def extract_with_ytdlp(url: str, output_dir: str, cookies_file: Optional[str] = None) -> Optional[Tuple[str, float]]:
    """Try extracting with yt-dlp (primary method)."""
    try:
        tmp_template = os.path.join(output_dir, "%(id)s.%(ext)s")
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": tmp_template,
            "noplaylist": True,
            "quiet": False,
            "no_warnings": False,
            "merge_output_format": "mp3",
            "extractor_args": {
                "youtube": {
                    "player_client": ["mweb", "ios", "android", "web"],
                }
            },
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ],
        }
        
        if cookies_file and os.path.exists(cookies_file):
            ydl_opts["cookiefile"] = cookies_file
            logger.info("Using cookies file: {cookies_file}", cookies_file=cookies_file)
        
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
        
        file_id = info.get("id")
        downloaded_path = os.path.join(output_dir, f"{file_id}.mp3")
        
        if os.path.exists(downloaded_path):
            duration = float(info.get("duration") or 0)
            return downloaded_path, duration
        
    except Exception as e:
        logger.warning("yt-dlp extraction failed: {error}", error=str(e))
    
    return None


def extract_with_playwright(url: str, output_dir: str) -> Optional[Tuple[str, float]]:
    """
    Extract YouTube audio using Playwright (headless browser).
    This is more reliable but slower.
    """
    try:
        # This would require installing playwright and browsers
        # For now, return None - can be implemented later
        logger.info("Playwright extraction not yet implemented")
        return None
    except Exception as e:
        logger.warning("Playwright extraction failed: {error}", error=str(e))
        return None


def extract_youtube_audio(url: str, output_dir: str, cookies_file: Optional[str] = None) -> Tuple[str, float]:
    """
    Extract YouTube audio using multiple strategies (like TurboScribe).
    Tries yt-dlp first, then falls back to other methods.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Strategy 1: Try yt-dlp with cookies
    result = extract_with_ytdlp(url, output_dir, cookies_file)
    if result:
        return result
    
    # Strategy 2: Try yt-dlp without cookies (in case cookies are invalid)
    if cookies_file:
        logger.info("Retrying without cookies...")
        result = extract_with_ytdlp(url, output_dir, None)
        if result:
            return result
    
    # Strategy 3: Try Playwright (if implemented)
    result = extract_with_playwright(url, output_dir)
    if result:
        return result
    
    # If all strategies fail, raise an error
    raise Exception(
        "Failed to extract YouTube audio. YouTube may be blocking requests. "
        "Try: 1) Export cookies from your browser, 2) Try a different video URL, "
        "3) Use the 'Upload File' option instead."
    )

