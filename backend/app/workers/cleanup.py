from __future__ import annotations

import asyncio
import os
import time
from typing import Optional

from loguru import logger


async def cleanup_job(directory: str, max_age_seconds: int):
    now = time.time()
    removed = 0

    for root, _, files in os.walk(directory):
        for name in files:
            filepath = os.path.join(root, name)
            try:
                age = now - os.path.getmtime(filepath)
                if age > max_age_seconds:
                    os.remove(filepath)
                    removed += 1
            except FileNotFoundError:
                continue

    if removed:
        logger.info("Cleanup removed {count} files from {dir}", count=removed, dir=directory)


def start_cleanup_scheduler(directory: str, interval: int, max_age: int):
    async def scheduler():
        while True:
            await cleanup_job(directory, max_age)
            await asyncio.sleep(interval)

    return scheduler()

