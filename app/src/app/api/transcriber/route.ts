import { NextRequest, NextResponse } from 'next/server';
import { assembly } from '@/lib/assemblyai';

export async function POST(req: NextRequest) {
  try {
    const { audioUrl } = await req.json();

    if (!audioUrl) {
      return NextResponse.json({ error: 'Audio URL is required' }, { status: 400 });
    }

    // Start transcription
    const transcript = await assembly.transcripts.transcribe({
      audio: audioUrl,
      speaker_labels: true,
    });

    if (transcript.status === 'error') {
      return NextResponse.json({ 
        error: 'Transcription failed. Please try again.' 
      }, { status: 500 });
    }

    // Wait for completion
    let finalTranscript = transcript;
    while (finalTranscript.status !== 'completed' && finalTranscript.status !== 'error') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      finalTranscript = await assembly.transcripts.get(transcript.id);
    }

    if (finalTranscript.status === 'error') {
      return NextResponse.json({ 
        error: 'Transcription failed. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      text: finalTranscript.text,
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
