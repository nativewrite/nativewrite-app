import { NextRequest, NextResponse } from 'next/server';
import { assembly } from '@/lib/assemblyai';

export async function POST(req: NextRequest) {
  try {
    const { audioUrl, audioData } = await req.json();

    if (!audioUrl && !audioData) {
      return NextResponse.json({ error: 'Audio URL or data is required' }, { status: 400 });
    }

    let audioSource = audioUrl;
    
    // If we have base64 audio data, upload it first
    if (audioData && !audioUrl) {
      try {
        // For demo purposes, we'll simulate a successful upload
        // In production, you'd upload to a cloud storage service
        audioSource = `https://example.com/audio/${Date.now()}.mp3`;
      } catch (uploadError) {
        return NextResponse.json({ 
          error: 'Failed to upload audio file' 
        }, { status: 500 });
      }
    }

    // Start transcription with AssemblyAI
    const transcript = await assembly.transcripts.transcribe({
      audio: audioSource,
      speaker_labels: true,
    });

    if (transcript.status === 'error') {
      return NextResponse.json({ 
        error: 'Transcription failed. Please try again.' 
      }, { status: 500 });
    }

    // Wait for completion (with timeout)
    let finalTranscript = transcript;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while (finalTranscript.status !== 'completed' && finalTranscript.status !== 'error' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      finalTranscript = await assembly.transcripts.get(transcript.id);
      attempts++;
    }

    if (finalTranscript.status === 'error') {
      return NextResponse.json({ 
        error: 'Transcription failed. Please try again.' 
      }, { status: 500 });
    }

    if (finalTranscript.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Transcription timed out. Please try again.' 
      }, { status: 408 });
    }

    return NextResponse.json({ 
      success: true, 
      text: finalTranscript.text || 'No transcript available',
      speakers: finalTranscript.utterances?.map(u => ({
        speaker: u.speaker,
        text: u.text,
        start: u.start,
        end: u.end
      })) || []
    });

  } catch (error) {
    console.error('Transcriber API error:', error);
    return NextResponse.json({ 
      error: 'Failed to transcribe audio. Please try again.' 
    }, { status: 500 });
  }
}
