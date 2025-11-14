import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { text, mode } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Map mode to prompt instructions
    const modePrompts: Record<string, string> = {
      standard: 'Rephrase the following text in a clear and straightforward manner, maintaining the original meaning while improving clarity and readability.',
      professional: 'Rephrase the following text in a formal, professional business tone suitable for corporate communications and formal documents.',
      creative: 'Rephrase the following text in an engaging, creative, and imaginative way that captures attention while maintaining the core message.',
      'my-style': 'Rephrase the following text while adapting it to a natural, personalized writing style that feels authentic and conversational.'
    };

    const prompt = modePrompts[mode] || modePrompts.standard;

    // Call OpenAI GPT-4o-mini for rephrasing
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: mode === 'creative' ? 0.8 : 0.7,
      max_tokens: 2000
    });

    const rephrased = response.choices[0]?.message?.content || 'Unable to rephrase text';

    return NextResponse.json({
      success: true,
      rephrased
    });

  } catch (error) {
    console.error('Rephrase API error:', error);
    return NextResponse.json(
      { error: 'Failed to rephrase text. Please try again.' },
      { status: 500 }
    );
  }
}

