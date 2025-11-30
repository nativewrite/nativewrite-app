from __future__ import annotations

import os
import re
import tempfile
from typing import Tuple, Optional

from loguru import logger
from yt_dlp import YoutubeDL


FILENAME_SANITIZE_REGEX = re.compile(r"[^A-Za-z0-9._-]")


def sanitize_filename(name: str) -> str:
    """Remove invalid filesystem characters."""
    sanitized = FILENAME_SANITIZE_REGEX.sub("_", name).strip("._ ")
    return sanitized or "nativewrite_audio"


def download_best_audio(url: str, output_dir: str, cookies_file: Optional[str] = None) -> Tuple[str, float]:
    """
    Download the best audio track and return (filepath, duration_seconds).
    """
    os.makedirs(output_dir, exist_ok=True)

    tmp_template = os.path.join(output_dir, "%(id)s.%(ext)s")
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": tmp_template,
        "noplaylist": True,
        "quiet": False,  # Set to False to see errors
        "no_warnings": False,
        "merge_output_format": "mp3",
        "extractor_args": {
            "youtube": {
                "player_client": ["mweb", "ios", "android", "web"],  # Try mweb first (mobile web)
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
    
    # Add cookies if provided
    if cookies_file and os.path.exists(cookies_file):
        ydl_opts["cookiefile"] = cookies_file
        logger.info("Using cookies file: {cookies_file}", cookies_file=cookies_file)

    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    file_id = info.get("id")
    downloaded_path = os.path.join(output_dir, f"{file_id}.mp3")

    if not os.path.exists(downloaded_path):
        raise FileNotFoundError("Audio file was not created by yt-dlp.")

    title = sanitize_filename(info.get("title") or file_id or "nativewrite_audio")
    final_path = os.path.join(output_dir, f"{title}.mp3")
    os.replace(downloaded_path, final_path)

    duration = float(info.get("duration") or 0)
    logger.info("Downloaded audio for {url} -> {path}", url=url, path=final_path)

    return final_path, duration

