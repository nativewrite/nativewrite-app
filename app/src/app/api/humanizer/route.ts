import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, lang = "en", mode = "standard" } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Try backend service first if configured
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const backendApiKey = process.env.BACKEND_API_KEY;

    if (backendUrl && backendApiKey) {
      try {
        const backendResponse = await fetch(`${backendUrl}/api/humanizer/humanize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': backendApiKey,
          },
          body: JSON.stringify({
            text,
            lang,
            mode,
            strict_meaning: 'high',
            voice_strength: 50,
            preserve_keywords: [],
            avoid_phrases: [],
          }),
          signal: AbortSignal.timeout(300000), // 5 minute timeout
        });

        if (backendResponse.ok) {
          const contentType = backendResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const backendData = await backendResponse.json();
            if (backendData && backendData.humanized_text) {
              return NextResponse.json({
                success: true,
                humanizedText: backendData.humanized_text,
                originalText: backendData.original_text || text,
                report: backendData.report,
                originalLength: text.length,
                humanizedLength: backendData.humanized_text.length
              });
            }
          }
        }
        // If backend fails, fall through to OpenAI direct
      } catch (backendError) {
        console.error('Backend humanizer error, falling back to OpenAI:', backendError);
        // Fall through to OpenAI direct
      }
    }

    // Fallback to direct OpenAI (original working method)
    const systemPrompt = `You are an expert at humanizing AI-generated text. Rewrite the given text to sound more natural, human-like, and conversational while maintaining the original meaning and key information. Make it sound like it was written by a human, not an AI. Use natural language patterns, varied sentence structures, and human-like expressions.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    const humanizedText = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ 
      success: true, 
      humanizedText,
      originalText: text,
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
