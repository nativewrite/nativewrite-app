"""Pydantic schemas for Humanizer API."""

from typing import Literal
from pydantic import BaseModel, Field


class HumanizerScore(BaseModel):
    """Score metrics for text humanization quality."""
    
    naturalness: int = Field(ge=0, le=100, description="Naturalness score (0-100)")
    predictability_index: float = Field(ge=0, le=200, description="Predictability index (0-200)")
    burstiness_index: float = Field(ge=0, le=300, description="Burstiness index (0-300)")
    readability: int = Field(ge=0, le=100, description="Readability score (0-100)")
    repetition_density: int = Field(ge=0, le=100, description="Repetition density (0-100)")


class HumanizerReport(BaseModel):
    """Before/after comparison report with delta calculations."""
    
    before: HumanizerScore
    after: HumanizerScore
    delta: dict[str, float] = Field(description="Change in each metric (after - before)")


class HumanizeRequest(BaseModel):
    """Request model for humanization endpoint."""
    
    text: str = Field(min_length=1, description="Text to humanize")
    lang: Literal["en", "fa"] = Field(default="en", description="Language code")
    mode: Literal["standard", "academic", "business", "narrative"] = Field(
        default="standard", description="Humanization mode"
    )
    strict_meaning: Literal["low", "medium", "high"] = Field(
        default="high", description="How strictly to preserve original meaning"
    )
    voice_strength: int = Field(
        default=50, ge=0, le=100, description="Voice strength (0-100)"
    )
    preserve_keywords: list[str] = Field(
        default_factory=list, description="Keywords to preserve exactly"
    )
    avoid_phrases: list[str] = Field(
        default_factory=list, description="Phrases to avoid in output"
    )


class HumanizeResponse(BaseModel):
    """Response model for humanization endpoint."""
    
    original_text: str
    humanized_text: str
    report: HumanizerReport

