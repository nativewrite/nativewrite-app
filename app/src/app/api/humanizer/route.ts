import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, lang = "en", mode = "standard", strict_meaning = "high", voice_strength = 50, preserve_keywords = [], avoid_phrases = [] } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Forward to backend service
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
            strict_meaning,
            voice_strength,
            preserve_keywords,
            avoid_phrases,
          }),
          signal: AbortSignal.timeout(300000), // 5 minute timeout
        });

        const backendData = await backendResponse.json();

        if (backendResponse.ok && backendData) {
          return NextResponse.json({
            success: true,
            originalText: backendData.original_text,
            humanizedText: backendData.humanized_text,
            report: backendData.report,
          });
        } else {
          const errorMessage = backendData?.detail || backendData?.error || 'Backend humanization failed';
          return NextResponse.json({
            error: errorMessage,
          }, { status: backendResponse.status || 500 });
        }
      } catch (backendError) {
        console.error('Backend humanizer error:', backendError);
        return NextResponse.json({
          error: 'Backend service unavailable. Please ensure your backend is running and configured.',
        }, { status: 503 });
      }
    } else {
      return NextResponse.json({
        error: 'Backend service not configured. Please set BACKEND_URL and BACKEND_API_KEY.',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Humanizer API error:', error);
    return NextResponse.json({ 
      error: 'Failed to humanize text. Please try again.' 
    }, { status: 500 });
  }
}
