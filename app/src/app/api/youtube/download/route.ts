import { NextRequest, NextResponse } from 'next/server';
import { YTDlpWrap } from 'yt-dlp-wrap';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    // Create temporary file path
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    tempFilePath = path.join(tempDir, `audio_${Date.now()}.mp3`);

    // Use yt-dlp to download audio
    const ytDlpWrap = new YTDlpWrap();
    
    // Download audio as MP3
    await ytDlpWrap.exec([
      url,
      '--extract-audio',
      '--audio-format', 'mp3',
      '--output', tempFilePath,
      '--no-playlist'
    ]);

    // Read the downloaded file
    const audioBuffer = fs.readFileSync(tempFilePath);
    const base64Audio = audioBuffer.toString('base64');

    // Clean up temp file
    await unlink(tempFilePath);
    tempFilePath = null;

    return NextResponse.json({ 
      success: true, 
      audioData: `data:audio/mpeg;base64,${base64Audio}`,
      message: 'YouTube audio downloaded and processed successfully'
    });

  } catch (error) {
    console.error('YouTube download error:', error);
    
    // Clean up temp file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to download YouTube audio. Please try again.' 
    }, { status: 500 });
  }
}
