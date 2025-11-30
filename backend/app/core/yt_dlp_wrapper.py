from __future__ import annotations

import os
import re
import tempfile
from typing import Tuple, Optional

from loguru import logger
from yt_dlp import YoutubeDL

# Import the multi-strategy extractor
from .youtube_extractor import extract_youtube_audio


FILENAME_SANITIZE_REGEX = re.compile(r"[^A-Za-z0-9._-]")


def sanitize_filename(name: str) -> str:
    """Remove invalid filesystem characters."""
    sanitized = FILENAME_SANITIZE_REGEX.sub("_", name).strip("._ ")
    return sanitized or "nativewrite_audio"


def download_best_audio(url: str, output_dir: str, cookies_file: Optional[str] = None) -> Tuple[str, float]:
    """
    Download the best audio track using multiple strategies (like TurboScribe).
    Tries yt-dlp first, then falls back to other methods.
    """
    # Use the multi-strategy extractor
    raw_path, duration = extract_youtube_audio(url, output_dir, cookies_file)
    
    # Rename file to use sanitized title
    file_id = os.path.splitext(os.path.basename(raw_path))[0]
    title = sanitize_filename(file_id or "nativewrite_audio")
    final_path = os.path.join(output_dir, f"{title}.mp3")
    
    if raw_path != final_path:
        os.replace(raw_path, final_path)
    
    logger.info("Downloaded audio for {url} -> {path}", url=url, path=final_path)
    return final_path, duration

