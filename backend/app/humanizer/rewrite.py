"""LLM rewrite calls for text humanization."""

from openai import OpenAI
from loguru import logger

from ..core.config import get_settings


async def rewrite_pass(text: str, system_prompt: str, user_prompt: str, temperature: float) -> str:
    """
    Execute a single rewrite pass using OpenAI Chat Completions.
    
    Args:
        text: Text to rewrite
        system_prompt: System prompt for the LLM
        user_prompt: User prompt with text and constraints
        temperature: Temperature for generation (0.0-2.0)
    
    Returns:
        Rewritten text
    """
    settings = get_settings()
    
    if not settings.openai_api_key:
        raise ValueError("OpenAI API key not configured")
    
    client = OpenAI(api_key=settings.openai_api_key)
    
    # Auto-scale max_tokens based on input length (estimate 1.2x for expansion)
    input_tokens_estimate = len(text.split()) * 1.3  # Rough token estimation
    max_tokens = max(1000, int(input_tokens_estimate * 1.5))
    max_tokens = min(max_tokens, 4000)  # Cap at 4000
    
    try:
        # Note: OpenAI SDK is synchronous, but FastAPI handles this fine in async endpoints
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        
        rewritten = response.choices[0].message.content
        if not rewritten:
            logger.warning("Empty response from OpenAI, returning original text")
            return text
        
        return rewritten.strip()
    
    except Exception as e:
        logger.error(f"OpenAI rewrite error: {e}")
        raise

