"""Multi-pass rewrite orchestration pipeline."""

from loguru import logger

from .schemas import HumanizeRequest, HumanizeResponse, HumanizerReport, HumanizerScore
from .scorer import score_text
from .prompts import get_system_prompt, get_user_prompt
from .rewrite import rewrite_pass


async def humanize_text(request: HumanizeRequest) -> HumanizeResponse:
    """
    Execute multi-pass humanization pipeline.
    
    Pipeline:
    1. Score original text
    2. PASS 1: Structural Rewrite (temp: 0.3) - Break AI symmetry
    3. PASS 2: Voice & Rhythm (temp: 0.6) - Burstiness, human cadence
    4. PASS 3: Clarity Polish (temp: 0.4) - Readability, flow
    5. PASS 4: QA Lock (temp: 0.2) - Ensure no meaning drift
    6. Score final text
    7. Compute delta and return
    
    Args:
        request: Humanization request with text and parameters
    
    Returns:
        HumanizeResponse with original, humanized text, and report
    """
    original_text = request.text
    
    # Step 1: Score original text
    logger.info(f"Scoring original text (lang={request.lang})")
    before_score = score_text(original_text, request.lang)
    
    # Step 2: Multi-pass rewrite pipeline
    current_text = original_text
    
    # PASS 1: Structural Rewrite
    logger.info("PASS 1: Structural Rewrite")
    system_prompt_1 = get_system_prompt(
        request.mode, request.lang, request.strict_meaning, request.voice_strength
    )
    user_prompt_1 = get_user_prompt(original_text, request.preserve_keywords, request.avoid_phrases)
    
    try:
        current_text = await rewrite_pass(current_text, system_prompt_1, user_prompt_1, temperature=0.3)
        logger.debug(f"PASS 1 complete, length: {len(current_text)}")
    except Exception as e:
        logger.error(f"PASS 1 failed: {e}")
        # Fallback to original if first pass fails
        current_text = original_text
    
    # PASS 2: Voice & Rhythm
    logger.info("PASS 2: Voice & Rhythm")
    system_prompt_2 = get_system_prompt(
        request.mode, request.lang, request.strict_meaning, request.voice_strength
    )
    # Update prompt focus for voice/rhythm
    if request.lang == "en":
        system_prompt_2 += "\n\nFocus on: Vary sentence lengths dramatically. Create natural rhythm and cadence. Add personality."
    else:
        system_prompt_2 += "\n\nتمرکز بر: تنوع چشمگیر در طول جملات. ایجاد ریتم و ضرب‌آهنگ طبیعی. اضافه کردن شخصیت."
    
    user_prompt_2 = get_user_prompt(current_text, request.preserve_keywords, request.avoid_phrases)
    
    try:
        current_text = await rewrite_pass(current_text, system_prompt_2, user_prompt_2, temperature=0.6)
        logger.debug(f"PASS 2 complete, length: {len(current_text)}")
    except Exception as e:
        logger.warning(f"PASS 2 failed: {e}, continuing with previous result")
    
    # PASS 3: Clarity Polish
    logger.info("PASS 3: Clarity Polish")
    system_prompt_3 = get_system_prompt(
        request.mode, request.lang, request.strict_meaning, request.voice_strength
    )
    if request.lang == "en":
        system_prompt_3 += "\n\nFocus on: Improve readability and flow. Ensure clarity while maintaining natural variation."
    else:
        system_prompt_3 += "\n\nتمرکز بر: بهبود خوانایی و جریان. اطمینان از وضوح در حالی که تنوع طبیعی حفظ می‌شود."
    
    user_prompt_3 = get_user_prompt(current_text, request.preserve_keywords, request.avoid_phrases)
    
    try:
        current_text = await rewrite_pass(current_text, system_prompt_3, user_prompt_3, temperature=0.4)
        logger.debug(f"PASS 3 complete, length: {len(current_text)}")
    except Exception as e:
        logger.warning(f"PASS 3 failed: {e}, continuing with previous result")
    
    # PASS 4: QA Lock
    logger.info("PASS 4: QA Lock - Meaning verification")
    system_prompt_4 = get_system_prompt(
        request.mode, request.lang, request.strict_meaning, request.voice_strength
    )
    if request.lang == "en":
        system_prompt_4 += "\n\nCRITICAL: Verify meaning is preserved. Make only minimal adjustments if needed. Do not change facts or core information."
    else:
        system_prompt_4 += "\n\nبسیار مهم: بررسی کنید که معنی حفظ شده است. فقط در صورت نیاز تنظیمات minimal انجام دهید. حقایق یا اطلاعات اصلی را تغییر ندهید."
    
    user_prompt_4 = get_user_prompt(current_text, request.preserve_keywords, request.avoid_phrases)
    
    try:
        current_text = await rewrite_pass(current_text, system_prompt_4, user_prompt_4, temperature=0.2)
        logger.debug(f"PASS 4 complete, length: {len(current_text)}")
    except Exception as e:
        logger.warning(f"PASS 4 failed: {e}, continuing with previous result")
    
    # Step 3: Score final text
    logger.info("Scoring final text")
    after_score = score_text(current_text, request.lang)
    
    # Step 4: Compute delta
    delta = {
        "naturalness": after_score.naturalness - before_score.naturalness,
        "predictability_index": after_score.predictability_index - before_score.predictability_index,
        "burstiness_index": after_score.burstiness_index - before_score.burstiness_index,
        "readability": after_score.readability - before_score.readability,
        "repetition_density": after_score.repetition_density - before_score.repetition_density,
    }
    
    report = HumanizerReport(before=before_score, after=after_score, delta=delta)
    
    logger.info(f"Humanization complete. Naturalness: {before_score.naturalness} -> {after_score.naturalness}")
    
    return HumanizeResponse(
        original_text=original_text,
        humanized_text=current_text,
        report=report,
    )




