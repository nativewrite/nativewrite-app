import { NextRequest, NextResponse } from 'next/server';
import { YTDlpWrap } from 'yt-dlp-wrap';

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

    try {
      // Use yt-dlp to extract audio information
      const ytDlpWrap = new YTDlpWrap();
      
      // Get video info first
      const videoInfo = await ytDlpWrap.getVideoInfo(url);
      
      if (!videoInfo) {
        return NextResponse.json({ error: 'Could not get video information' }, { status: 400 });
      }

      // Extract audio URL
      const audioUrl = videoInfo.url || url;
      const title = videoInfo.title || `YouTube Video ${videoId}`;
      const duration = videoInfo.duration || 0;

      return NextResponse.json({ 
        success: true, 
        audioUrl,
        videoId,
        title,
        duration,
        message: 'YouTube video processed successfully'
      });

    } catch (ytError) {
      console.error('yt-dlp error:', ytError);
      
      // Fallback to basic processing
      return NextResponse.json({ 
        success: true, 
        audioUrl: url,
        videoId,
        title: `YouTube Video ${videoId}`,
        duration: 0,
        message: 'YouTube URL processed (basic mode)'
      });
    }

  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process YouTube URL' 
    }, { status: 500 });
  }
}
