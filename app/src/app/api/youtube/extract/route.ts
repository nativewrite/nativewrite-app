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

    // For web apps, we'll provide instructions for manual download
    // and return a direct audio URL that might work with some services
    const audioUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Try to get a direct audio stream URL (this is a simplified approach)
    // In reality, you'd need a service like youtube-dl-api or similar
    const directAudioUrl = `https://www.youtube.com/watch?v=${videoId}`;

    return NextResponse.json({ 
      success: true, 
      videoId,
      audioUrl: directAudioUrl,
      title: `YouTube Video ${videoId}`,
      instructions: {
        manual: "To transcribe this video, please download the audio file and use the 'Upload File' option",
        steps: [
          "1. Download the YouTube video as an audio file (MP3, WAV, etc.)",
          "2. Use the 'Upload File' tab in the transcriber",
          "3. Drag and drop or select the audio file",
          "4. Click 'Start Transcription' for real results"
        ]
      },
      message: 'YouTube URL processed. Please download the audio file and use the Upload File option for real transcription.'
    });

  } catch (error) {
    console.error('YouTube extract error:', error);
    return NextResponse.json({ 
      error: 'Failed to process YouTube URL' 
    }, { status: 500 });
  }
}
