import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

const languageNames: Record<string, string> = {
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi',
  nl: 'Dutch',
  pl: 'Polish',
  tr: 'Turkish',
};

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguage } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!targetLanguage) {
      return NextResponse.json({ error: 'Target language is required' }, { status: 400 });
    }

    const targetLanguageName = languageNames[targetLanguage] || targetLanguage;

    // Use OpenAI for translation
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLanguageName}. Maintain the original meaning, tone, and style. Only return the translated text, nothing else.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const translatedText = response.choices[0]?.message?.content || '';

    if (!translatedText) {
      return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      translatedText: translatedText.trim(),
      sourceLanguage: 'auto',
      targetLanguage,
    });
  } catch (error) {
    console.error('Translate API error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text. Please try again.' },
      { status: 500 }
    );
  }
}

