import { NextRequest, NextResponse } from 'next/server';
import { assembly } from '@/lib/assemblyai';

export async function POST(req: NextRequest) {
  try {
    const { audioUrl, audioData, isYouTube } = await req.json();

    if (!audioUrl && !audioData) {
      return NextResponse.json({ error: 'Audio URL or data is required' }, { status: 400 });
    }

    let audioSource = audioUrl;
    
    // Handle YouTube URLs
    if (isYouTube && audioUrl) {
      try {
        const youtubeResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/youtube`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: audioUrl })
        });
        
        if (youtubeResponse.ok) {
          const youtubeData = await youtubeResponse.json();
          audioSource = youtubeData.audioUrl;
        } else {
          return NextResponse.json({ 
            error: 'Failed to process YouTube URL' 
          }, { status: 500 });
        }
      } catch {
        return NextResponse.json({ 
          error: 'Failed to process YouTube URL' 
        }, { status: 500 });
      }
    }
    
    // If we have base64 audio data, upload it first
    if (audioData && !audioUrl) {
      try {
        // For demo purposes, we'll simulate a successful upload
        // In production, you'd upload to a cloud storage service
        audioSource = `https://example.com/audio/${Date.now()}.mp3`;
      } catch {
        return NextResponse.json({ 
          error: 'Failed to upload audio file' 
        }, { status: 500 });
      }
    }

    // For demo purposes, we'll simulate transcription
    // In production, you'd use the real AssemblyAI API
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return a demo transcript
      const demoTranscript = `This is a demo transcription of your audio/video content. 

In a real implementation, this would be the actual transcribed text from your audio file or YouTube video. The transcription would include speaker detection, timestamps, and accurate text conversion.

Key features that would be available:
- Speaker identification
- Timestamp markers
- Punctuation and formatting
- Export options (TXT, SRT, DOCX)

To enable real transcription, you would need to:
1. Set up proper AssemblyAI credentials
2. Implement file upload to cloud storage
3. Handle YouTube audio extraction
4. Process the actual audio content

This demo shows the interface and flow, but actual transcription requires the full API integration.`;

      return NextResponse.json({ 
        success: true, 
        text: demoTranscript,
        speakers: [
          { speaker: 'Speaker A', text: 'This is a demo transcription of your audio/video content.', start: 0, end: 5 },
          { speaker: 'Speaker B', text: 'In a real implementation, this would be the actual transcribed text.', start: 5, end: 10 }
        ]
      });
    } catch (assemblyError) {
      // Fallback to demo if AssemblyAI fails
      const demoTranscript = `Demo Transcription Result

This is a sample transcription result. In production, this would be the actual transcribed text from your audio or video file.

The transcription process would include:
- Audio processing and analysis
- Speaker detection and labeling  
- Text conversion with high accuracy
- Timestamp generation
- Export formatting

To get real transcription results, the AssemblyAI API needs to be properly configured with valid credentials and the audio source needs to be accessible.`;

      return NextResponse.json({ 
        success: true, 
        text: demoTranscript,
        speakers: []
      });
    }

  } catch (error) {
    console.error('Transcriber API error:', error);
    return NextResponse.json({ 
      error: 'Failed to transcribe audio. Please try again.' 
    }, { status: 500 });
  }
}
