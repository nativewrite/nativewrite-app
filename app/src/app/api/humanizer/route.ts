import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at humanizing AI-generated text. Rewrite the given text to sound more natural, human-like, and conversational while maintaining the original meaning and key information. Make it sound like it was written by a human, not an AI."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const humanizedText = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ 
      success: true, 
      humanizedText,
      originalLength: text.length,
      humanizedLength: humanizedText.length
    });

  } catch (error) {
    console.error('Humanizer API error:', error);
    return NextResponse.json({ 
      error: 'Failed to humanize text. Please try again.' 
    }, { status: 500 });
  }
}
