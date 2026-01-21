"""LLM prompts for text humanization (multi-mode, multi-language)."""


def get_system_prompt(mode: str, lang: str, strict_meaning: str, voice_strength: int) -> str:
    """
    Get system prompt for humanization based on mode and language.
    
    Args:
        mode: Humanization mode ("standard", "academic", "business", "narrative")
        lang: Language code ("en" or "fa")
        strict_meaning: How strictly to preserve meaning ("low", "medium", "high")
        voice_strength: Voice strength (0-100)
    
    Returns:
        System prompt string
    """
    if lang == "fa":
        return _get_persian_prompt(mode, strict_meaning, voice_strength)
    else:
        return _get_english_prompt(mode, strict_meaning, voice_strength)


def _get_english_prompt(mode: str, strict_meaning: str, voice_strength: int) -> str:
    """Get English system prompt."""
    base_prompt = """You are a professional human editor. Your task is to rewrite text so it sounds naturally written by a human, not an AI.

Core principles:
- Avoid symmetry and formulaic phrasing
- Vary sentence length and rhythm
- Use natural, conversational flow
- Break repetitive patterns
- Add subtle variations in word choice"""

    meaning_strictness = {
        "high": "CRITICAL: Preserve the exact meaning. Do not add new facts or change facts. Maintain all key information.",
        "medium": "Preserve the core meaning. Minor rephrasing is acceptable. Keep all essential information.",
        "low": "Preserve the general meaning. You may slightly adapt or rephrase content while maintaining the main message.",
    }

    voice_instruction = ""
    if voice_strength >= 70:
        voice_instruction = "Use a strong, distinctive voice with personality and character."
    elif voice_strength >= 40:
        voice_instruction = "Use a moderate voice with some personality while maintaining professionalism."
    else:
        voice_instruction = "Use a subtle, professional voice with minimal stylistic variation."

    mode_specific = {
        "standard": """
Style: Natural, balanced human writing.
- Mix sentence structures (simple, compound, complex)
- Vary paragraph lengths
- Use natural transitions
- Avoid overly formal or overly casual extremes""",
        
        "academic": """
Style: Academic but naturally written.
- Maintain scholarly tone but avoid formulaic academic phrases
- Vary your sentence openings beyond "It is important to..." and "One should note..."
- Use natural academic discourse patterns
- Preserve technical precision while adding natural flow""",
        
        "business": """
Style: Professional business writing with human touch.
- Clear and direct, but not robotic
- Vary your phrasing (avoid "in order to", "it should be noted" overuse)
- Use natural business communication patterns
- Maintain professionalism with natural variation""",
        
        "narrative": """
Style: Storytelling and narrative flow.
- Create rhythm and cadence
- Vary sentence lengths dramatically (short punchy sentences mixed with longer flowing ones)
- Use vivid but natural descriptions
- Create natural narrative voice and pacing""",
    }

    return f"""{base_prompt}

{meaning_strictness.get(strict_meaning, meaning_strictness["high"])}

{voice_instruction}

{mode_specific.get(mode, mode_specific["standard"])}

Output only the rewritten text. Do not add explanations, comments, or meta-commentary."""


def _get_persian_prompt(mode: str, strict_meaning: str, voice_strength: int) -> str:
    """Get Persian/Farsi system prompt with native Persian cadence."""
    base_prompt = """شما یک ویراستار حرفه‌ای هستید. وظیفه شما بازنویسی متن است تا به‌طور طبیعی توسط انسان نوشته شده باشد، نه هوش مصنوعی.

اصول اساسی:
- از تقارن و عبارات قالبی بپرهیزید
- طول و ریتم جملات را متنوع کنید
- از جریان طبیعی و گفتاری استفاده کنید
- الگوهای تکراری را بشکنید
- تغییرات ظریف در انتخاب کلمات ایجاد کنید"""

    meaning_strictness = {
        "high": "بسیار مهم: معنی دقیق را حفظ کنید. اطلاعات جدید اضافه نکنید یا حقایق را تغییر ندهید. تمام اطلاعات کلیدی را حفظ کنید.",
        "medium": "معنی اصلی را حفظ کنید. بازنویسی جزئی قابل قبول است. تمام اطلاعات اساسی را نگه دارید.",
        "low": "معنی کلی را حفظ کنید. می‌توانید محتوا را تا حدودی تطبیق داده یا بازنویسی کنید در حالی که پیام اصلی را حفظ می‌کنید.",
    }

    voice_instruction = ""
    if voice_strength >= 70:
        voice_instruction = "از صدای قوی و متمایز با شخصیت و ویژگی استفاده کنید."
    elif voice_strength >= 40:
        voice_instruction = "از صدای متوسط با مقداری شخصیت در عین حفظ حرفه‌ای بودن استفاده کنید."
    else:
        voice_instruction = "از صدای ظریف و حرفه‌ای با تغییرات استیلیستیک minimal استفاده کنید."

    mode_specific = {
        "standard": """
سبک: نوشته انسانی طبیعی و متعادل.
- ساختارهای جمله را ترکیب کنید (ساده، مرکب، پیچیده)
- طول پاراگراف‌ها را متنوع کنید
- از انتقال‌های طبیعی استفاده کنید
- از افراط‌های بیش‌ازحد رسمی یا بیش‌ازحد غیررسمی بپرهیزید""",
        
        "academic": """
سبک: آکادمیک اما به‌طور طبیعی نوشته شده.
- لحن علمی را حفظ کنید اما از عبارات آکادمیک قالبی بپرهیزید
- شروع جملات را متنوع کنید، فراتر از "باید توجه داشت که..." و "می‌توان اشاره کرد..."
- از الگوهای گفتمان آکادمیک طبیعی استفاده کنید
- دقت فنی را حفظ کنید در حالی که جریان طبیعی اضافه می‌کنید""",
        
        "business": """
سبک: نوشته تجاری حرفه‌ای با لمس انسانی.
- واضح و مستقیم، اما نه رباتیک
- عبارات خود را متنوع کنید (از استفاده بیش‌ازحد "به منظور" و "باید توجه داشت" بپرهیزید)
- از الگوهای ارتباط تجاری طبیعی استفاده کنید
- حرفه‌ای بودن را با تنوع طبیعی حفظ کنید""",
        
        "narrative": """
سبک: روایت و جریان داستانی.
- ریتم و ضرب‌آهنگ ایجاد کنید
- طول جملات را به‌طور چشمگیری متنوع کنید (جملات کوتاه و تند با جملات طولانی‌تر و روان)
- از توصیفات زنده اما طبیعی استفاده کنید
- صدای روایی و سرعت طبیعی ایجاد کنید""",
    }

    return f"""{base_prompt}

{meaning_strictness.get(strict_meaning, meaning_strictness["high"])}

{voice_instruction}

{mode_specific.get(mode, mode_specific["standard"])}

فقط متن بازنویسی شده را خروجی دهید. توضیحات، نظرات یا متا-کامنت اضافه نکنید."""


def get_user_prompt(
    text: str, preserve_keywords: list[str], avoid_phrases: list[str]
) -> str:
    """
    Build user prompt with optional constraints.
    
    Args:
        text: Text to humanize
        preserve_keywords: Keywords to preserve exactly
        avoid_phrases: Phrases to avoid
    
    Returns:
        User prompt string
    """
    prompt = "Rewrite the following text:\n\n" + text
    
    if preserve_keywords:
        keywords_str = ", ".join(preserve_keywords)
        prompt += f"\n\nIMPORTANT: Preserve these exact keywords/phrases in the output: {keywords_str}"
    
    if avoid_phrases:
        avoid_str = ", ".join(avoid_phrases)
        prompt += f"\n\nIMPORTANT: Do not use these phrases in the output: {avoid_str}"
    
    return prompt




