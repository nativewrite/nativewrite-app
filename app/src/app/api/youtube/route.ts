import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    // Extract video ID from YouTube URL
    let videoId = '';
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match) {
      videoId = match[1];
    } else {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // For web apps, we can't use yt-dlp directly
    // Return basic video information
    return NextResponse.json({ 
      success: true, 
      audioUrl: url,
      videoId,
      title: `YouTube Video ${videoId}`,
      duration: 0,
      message: 'YouTube URL processed (web app mode - no audio download)'
    });

  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process YouTube URL' 
    }, { status: 500 });
  }
}
