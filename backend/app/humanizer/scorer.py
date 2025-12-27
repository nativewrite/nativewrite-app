"""Native scoring engine for text humanization quality (EN + FA)."""

import re
import statistics
from collections import Counter
from typing import Dict

from .schemas import HumanizerScore


def score_text(text: str, lang: str = "en") -> HumanizerScore:
    """
    Compute native humanization scores for text.
    
    Args:
        text: Input text to score
        lang: Language code ("en" or "fa")
    
    Returns:
        HumanizerScore with all metrics computed
    """
    if not text or not text.strip():
        return HumanizerScore(
            naturalness=0,
            predictability_index=0,
            burstiness_index=0,
            readability=0,
            repetition_density=100,
        )
    
    # Split into sentences
    sentences = _split_sentences(text, lang)
    if not sentences:
        return HumanizerScore(
            naturalness=0,
            predictability_index=0,
            burstiness_index=0,
            readability=0,
            repetition_density=100,
        )
    
    # Compute sentence lengths
    sentence_lengths = [len(s.split()) for s in sentences]
    
    # Compute metrics
    naturalness = _compute_naturalness(text, sentences, sentence_lengths, lang)
    predictability_index = _compute_predictability_index(text, sentences, lang)
    burstiness_index = _compute_burstiness_index(sentences, sentence_lengths)
    readability = _compute_readability(text, sentences, sentence_lengths, lang)
    repetition_density = _compute_repetition_density(sentences, lang)
    
    return HumanizerScore(
        naturalness=round(naturalness),
        predictability_index=round(predictability_index, 2),
        burstiness_index=round(burstiness_index, 2),
        readability=round(readability),
        repetition_density=round(repetition_density),
    )


def _split_sentences(text: str, lang: str) -> list[str]:
    """Split text into sentences based on language."""
    if lang == "fa":
        # Persian sentence delimiters
        pattern = r'[.!?؟]\s+'
    else:
        # English sentence delimiters
        pattern = r'[.!?]\s+'
    
    sentences = re.split(pattern, text)
    # Clean and filter empty sentences
    sentences = [s.strip() for s in sentences if s.strip()]
    return sentences


def _compute_naturalness(
    text: str, sentences: list[str], sentence_lengths: list[int], lang: str
) -> float:
    """Compute naturalness score (0-100)."""
    scores = []
    
    # 1. Sentence length variance (25% weight)
    if len(sentence_lengths) > 1:
        variance = statistics.stdev(sentence_lengths) if len(sentence_lengths) > 1 else 0
        avg_length = statistics.mean(sentence_lengths)
        if avg_length > 0:
            # Normalize variance (higher is better, up to 50% of mean)
            length_variance_score = min(100, (variance / avg_length) * 100 * 2)
        else:
            length_variance_score = 0
        scores.append(length_variance_score * 0.25)
    else:
        scores.append(25)  # Neutral score for single sentence
    
    # 2. Lexical diversity - type/token ratio (25% weight)
    words = text.lower().split()
    if words:
        unique_words = set(words)
        type_token_ratio = len(unique_words) / len(words)
        lexical_score = type_token_ratio * 100
        scores.append(lexical_score * 0.25)
    else:
        scores.append(0)
    
    # 3. Connector variety (25% weight)
    connectors_en = ["and", "but", "or", "however", "therefore", "although", "because", "while", "since", "though"]
    connectors_fa = ["و", "اما", "یا", "با این حال", "بنابراین", "اگرچه", "زیرا", "در حالی که", "از آنجا که"]
    connectors = connectors_fa if lang == "fa" else connectors_en
    
    connector_counts = Counter()
    words_lower = [w.lower() for w in words]
    for conn in connectors:
        connector_counts[conn] = words_lower.count(conn)
    
    unique_connectors = sum(1 for count in connector_counts.values() if count > 0)
    max_connectors = min(len(connectors), 5)  # Expect up to 5 different connectors
    connector_score = min(100, (unique_connectors / max_connectors) * 100) if max_connectors > 0 else 50
    scores.append(connector_score * 0.25)
    
    # 4. Punctuation diversity (25% weight)
    punct_chars = set(re.findall(r'[.,!?;:—–-(){}[\]""''؟،؛]', text))
    # More punctuation types = more natural
    punct_score = min(100, len(punct_chars) * 15)  # ~6-7 types = 100
    scores.append(punct_score * 0.25)
    
    return sum(scores)


def _compute_predictability_index(text: str, sentences: list[str], lang: str) -> float:
    """
    Compute predictability index (0-200, lower is better).
    Higher score = more predictable/AI-like.
    """
    penalties = 0.0
    
    # 1. Repeated n-grams penalty
    words = text.lower().split()
    if len(words) >= 4:
        # Check for repeated 3-grams
        trigrams = [tuple(words[i:i+3]) for i in range(len(words) - 2)]
        trigram_counts = Counter(trigrams)
        repeated_trigrams = sum(1 for count in trigram_counts.values() if count > 1)
        if repeated_trigrams > 0:
            penalties += min(50, repeated_trigrams * 5)
    
    # 2. Word frequency uniformity (AI tends to use words more evenly)
    if words:
        word_counts = Counter(words)
        if len(word_counts) > 1:
            frequencies = list(word_counts.values())
            # High uniformity = more AI-like
            if len(frequencies) > 1:
                freq_stdev = statistics.stdev(frequencies)
                freq_mean = statistics.mean(frequencies)
                if freq_mean > 0:
                    uniformity = 1 - (freq_stdev / freq_mean)
                    penalties += uniformity * 50
    
    # 3. Sentence symmetry penalty (repeated sentence patterns)
    if len(sentences) >= 3:
        # Check if sentences start similarly
        sentence_starts = [s.split()[0].lower() if s.split() else "" for s in sentences[:10]]
        start_counts = Counter(sentence_starts)
        most_common_starts = start_counts.most_common(3)
        if most_common_starts:
            # Penalty for starting many sentences the same way
            top_start_count = most_common_starts[0][1]
            if top_start_count > len(sentences) * 0.3:
                penalties += min(50, (top_start_count / len(sentences)) * 100)
    
    # 4. Formulaic phrasing penalty
    formulaic_patterns_en = [
        r"it is important to",
        r"it should be noted that",
        r"in order to",
        r"it can be seen that",
        r"as a result of",
    ]
    formulaic_patterns_fa = [
        r"باید توجه داشت که",
        r"به منظور",
        r"در نتیجه",
        r"به عبارت دیگر",
        r"به طور کلی",
    ]
    patterns = formulaic_patterns_fa if lang == "fa" else formulaic_patterns_en
    
    text_lower = text.lower()
    for pattern in patterns:
        matches = len(re.findall(pattern, text_lower))
        if matches > 0:
            penalties += matches * 10
    
    return min(200, penalties)


def _compute_burstiness_index(sentences: list[str], sentence_lengths: list[int]) -> float:
    """
    Compute burstiness index (0-300, higher is better).
    Measures variation in sentence lengths and starters.
    """
    if len(sentences) < 2:
        return 0
    
    scores = []
    
    # 1. Sentence length variation (std deviation) - up to 150 points
    if len(sentence_lengths) > 1:
        length_stdev = statistics.stdev(sentence_lengths)
        # Normalize: stdev of 10+ words = good burstiness
        length_score = min(150, length_stdev * 15)
        scores.append(length_score)
    else:
        scores.append(0)
    
    # 2. Sentence starter variety - up to 150 points
    starters = []
    for sentence in sentences[:20]:  # Check first 20 sentences
        words = sentence.split()
        if words:
            first_word = words[0].lower()
            # Remove common articles/prepositions for variety
            if first_word not in ["the", "a", "an", "this", "that", "these", "those", "در", "از", "به", "با"]:
                starters.append(first_word)
            else:
                # Use second word if available
                if len(words) > 1:
                    starters.append(words[1].lower())
                else:
                    starters.append(first_word)
    
    if starters:
        unique_starters = len(set(starters))
        total_starters = len(starters)
        variety_ratio = unique_starters / total_starters
        starter_score = variety_ratio * 150
        scores.append(starter_score)
    else:
        scores.append(0)
    
    return sum(scores)


def _compute_readability(
    text: str, sentences: list[str], sentence_lengths: list[int], lang: str
) -> int:
    """
    Compute readability score (0-100, higher is better).
    EN: Flesch-like approximation
    FA: sentence length + uncommon word ratio
    """
    if lang == "fa":
        # Persian readability: simpler = better
        if not sentences:
            return 0
        
        avg_sentence_length = statistics.mean(sentence_lengths) if sentence_lengths else 0
        
        # Shorter sentences = more readable (inverse relationship)
        # Target: 15-20 words per sentence = 100
        if avg_sentence_length <= 20:
            length_score = 100 - (avg_sentence_length - 10) * 5
        else:
            length_score = max(0, 50 - (avg_sentence_length - 20) * 2)
        
        # Common Persian words (most frequent)
        common_words_fa = {
            "که", "در", "از", "به", "و", "را", "این", "آن", "با", "برای",
            "تا", "یا", "اگر", "اما", "هم", "همچنین", "همه", "است", "بود", "خواهد",
        }
        words = text.split()
        common_count = sum(1 for w in words if w in common_words_fa)
        total_words = len(words)
        
        if total_words > 0:
            common_ratio = common_count / total_words
            # More common words = more readable
            common_score = common_ratio * 100
        else:
            common_score = 50
        
        # Average of length and common word scores
        return round((length_score * 0.6 + common_score * 0.4))
    
    else:
        # English readability: Flesch-like
        if not sentences:
            return 0
        
        avg_sentence_length = statistics.mean(sentence_lengths) if sentence_lengths else 0
        
        # Count syllables (approximation: vowels + diphthongs)
        words = text.split()
        total_syllables = 0
        for word in words:
            word_lower = word.lower().strip(".,!?;:")
            # Simple syllable count: count vowel groups
            vowels = re.findall(r'[aeiouy]+', word_lower)
            syllables = len(vowels)
            if syllables == 0:
                syllables = 1
            total_syllables += syllables
        
        avg_syllables_per_word = total_syllables / len(words) if words else 0
        
        # Simplified Flesch score (0-100 scale)
        # Flesch = 206.835 - (1.015 * ASL) - (84.6 * ASW)
        # ASL = average sentence length, ASW = average syllables per word
        flesch_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
        # Normalize to 0-100
        flesch_normalized = max(0, min(100, (flesch_score / 2.06835)))
        
        return round(flesch_normalized)


def _compute_repetition_density(sentences: list[str], lang: str) -> int:
    """
    Compute repetition density (0-100, lower is better).
    Measures repeated patterns, sentence starters, duplicated phrases.
    """
    if len(sentences) < 2:
        return 0
    
    penalties = 0
    
    # 1. Repeated sentence starters
    starters = []
    for sentence in sentences:
        words = sentence.split()
        if words:
            first_word = words[0].lower()
            starters.append(first_word)
    
    if starters:
        start_counts = Counter(starters)
        most_common = start_counts.most_common(1)[0]
        repetition_ratio = most_common[1] / len(starters)
        if repetition_ratio > 0.3:  # More than 30% same start
            penalties += repetition_ratio * 40
    
    # 2. Duplicated phrases (3+ word phrases)
    all_words = " ".join(sentences).lower().split()
    if len(all_words) >= 6:
        # Check for repeated 3-word phrases
        phrases = []
        for i in range(len(all_words) - 2):
            phrase = " ".join(all_words[i:i+3])
            phrases.append(phrase)
        
        phrase_counts = Counter(phrases)
        repeated_phrases = sum(1 for count in phrase_counts.values() if count > 1)
        if repeated_phrases > 0:
            penalties += min(40, repeated_phrases * 2)
    
    # 3. Excessive filler patterns
    fillers_en = ["um", "uh", "like", "you know", "I mean", "so", "well"]
    fillers_fa = ["مثلا", "یعنی", "مثلاً", "خب", "اگه", "که", "ببین"]
    fillers = fillers_fa if lang == "fa" else fillers_en
    
    text_lower = " ".join(sentences).lower()
    for filler in fillers:
        count = text_lower.count(filler)
        if count > len(sentences) * 0.2:  # More than 20% of sentences
            penalties += min(20, (count / len(sentences)) * 20)
    
    return round(min(100, penalties))

