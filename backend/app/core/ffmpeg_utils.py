from __future__ import annotations

import os
from loguru import logger
import ffmpeg


def ensure_mp3(input_path: str, output_dir: str) -> str:
    """
    Normalize audio levels and ensure the file is MP3 for Whisper compatibility.
    """
    os.makedirs(output_dir, exist_ok=True)

    filename = os.path.basename(input_path)
    name, _ = os.path.splitext(filename)
    output_path = os.path.join(output_dir, f"{name}.mp3")

    logger.info("Normalizing audio {input} -> {output}", input=input_path, output=output_path)

    (
        ffmpeg
        .input(input_path)
        .output(
            output_path,
            acodec="mp3",
            audio_bitrate="192k",
            ac=1,
            ar="44100",
            af="loudnorm"
        )
        .overwrite_output()
        .run(quiet=True)
    )

    return output_path

