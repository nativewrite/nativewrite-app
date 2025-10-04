import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    // For web apps, we can't download YouTube audio directly
    // This is a demo endpoint that explains the limitation
    return NextResponse.json({ 
      success: false, 
      error: 'YouTube audio download not available in web environment',
      message: 'For real YouTube transcription, you need a backend service with yt-dlp installed'
    });

  } catch (error) {
    console.error('YouTube download error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to process YouTube URL' 
    }, { status: 500 });
  }
}
