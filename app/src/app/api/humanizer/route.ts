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

        // Handle non-JSON responses (like 404 HTML pages)
        const contentType = backendResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await backendResponse.text();
          console.error('Backend returned non-JSON response:', text);
          return NextResponse.json({
            error: `Backend returned invalid response (status ${backendResponse.status}). Please check that the backend is running at ${backendUrl} and the humanizer route is registered.`,
          }, { status: 502 });
        }

        const backendData = await backendResponse.json();

        if (backendResponse.ok && backendData) {
          return NextResponse.json({
            success: true,
            originalText: backendData.original_text,
            humanizedText: backendData.humanized_text,
            report: backendData.report,
          });
        } else {
          const errorMessage = backendData?.detail || backendData?.error || `Backend returned status ${backendResponse.status}`;
          return NextResponse.json({
            error: errorMessage,
          }, { status: backendResponse.status || 500 });
        }
      } catch (backendError) {
        console.error('Backend humanizer error:', backendError);
        const errorMessage = backendError instanceof Error ? backendError.message : 'Unknown error';
        return NextResponse.json({
          error: `Backend service unavailable: ${errorMessage}. Please ensure your backend is running at ${backendUrl} and accessible.`,
        }, { status: 503 });
      }
    } else {
      // If backend is not configured, return a helpful error message
      const isConfigured = !!(process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL);
      const hasApiKey = !!process.env.BACKEND_API_KEY;
      
      let errorMsg = 'Backend service not configured. ';
      if (!isConfigured && !hasApiKey) {
        errorMsg += 'Please set BACKEND_URL (or NEXT_PUBLIC_BACKEND_URL) and BACKEND_API_KEY environment variables.';
      } else if (!isConfigured) {
        errorMsg += 'Please set BACKEND_URL (or NEXT_PUBLIC_BACKEND_URL) environment variable.';
      } else if (!hasApiKey) {
        errorMsg += 'Please set BACKEND_API_KEY environment variable.';
      }
      
      return NextResponse.json({
        error: errorMsg,
        debug: process.env.NODE_ENV === 'development' ? {
          hasBackendUrl: isConfigured,
          hasApiKey: hasApiKey,
        } : undefined,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Humanizer API error:', error);
    return NextResponse.json({ 
      error: 'Failed to humanize text. Please try again.' 
    }, { status: 500 });
  }
}
