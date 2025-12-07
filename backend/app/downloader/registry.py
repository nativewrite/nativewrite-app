"""Provider registry for resolving URLs to appropriate providers."""

from __future__ import annotations

from typing import Optional
from urllib.parse import urlparse

from .base import BaseProvider
from .providers.youtube import YouTubeProvider
from .providers.direct import DirectMediaProvider
from .providers.tiktok import TikTokProvider
from .providers.instagram import InstagramProvider
from .providers.twitter import TwitterProvider
from .providers.vimeo import VimeoProvider


class ProviderRegistry:
    """Registry that manages all download providers."""

    def __init__(self):
        """Initialize registry with all available providers."""
        self._providers: list[BaseProvider] = [
            YouTubeProvider(),
            DirectMediaProvider(),
            TikTokProvider(),
            InstagramProvider(),
            TwitterProvider(),
            VimeoProvider(),
        ]

    def get_provider(self, url: str) -> Optional[BaseProvider]:
        """
        Get the appropriate provider for a URL.

        Args:
            url: The URL to find a provider for

        Returns:
            The provider that can handle the URL, or None if no provider found
        """
        for provider in self._providers:
            if provider.can_handle(url):
                return provider
        return None

    def get_provider_by_name(self, name: str) -> Optional[BaseProvider]:
        """
        Get a provider by its name.

        Args:
            name: The provider name

        Returns:
            The provider with the given name, or None if not found
        """
        for provider in self._providers:
            if provider.name == name:
                return provider
        return None

    def list_providers(self) -> list[BaseProvider]:
        """List all registered providers."""
        return self._providers.copy()

