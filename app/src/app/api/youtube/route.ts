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

    // For now, we'll simulate successful processing
    // In production, you'd use youtube-dl or yt-dlp to extract audio
    const audioUrl = `https://www.youtube.com/watch?v=${videoId}`;

    return NextResponse.json({ 
      success: true, 
      audioUrl,
      videoId,
      title: `YouTube Video ${videoId}`,
      message: 'YouTube URL processed successfully. Note: For real transcription, you need to implement audio extraction.'
    });

  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process YouTube URL' 
    }, { status: 500 });
  }
}
