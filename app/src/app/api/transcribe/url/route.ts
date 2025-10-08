import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import ytdl from 'ytdl-core';

export async function POST(req: Request) {
  try {
    const { videoUrl } = await req.json();
    if (!videoUrl) {
      return NextResponse.json({ error: 'Missing video URL' }, { status: 400 });
    }

    const supportedPlatforms = ['youtube.com', 'youtu.be', 'tiktok.com', 'vimeo.com', 'instagram.com'];
    const isSupported = supportedPlatforms.some((domain) => videoUrl.includes(domain));

    if (!isSupported) {
      return NextResponse.json({
        error: 'Unsupported platform. Please upload the video manually instead.',
      }, { status: 400 });
    }
    
    // Only YouTube is supported in Vercel serverless with ytdl-core
    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    if (!isYouTube) {
      return NextResponse.json({
        error: "This platform blocks direct downloads. Please upload your video manually.",
      }, { status: 400 });
    }

    const audioPath = path.join('/tmp', `audio-${Date.now()}.mp3`);
    
    // Download audio using ytdl-core
    try {
      await new Promise<void>((resolve, reject) => {
        const stream = ytdl(videoUrl, { quality: 'highestaudio', filter: 'audioonly' });
        const writeStream = fs.createWriteStream(audioPath);
        stream.pipe(writeStream);
        writeStream.on('finish', () => resolve());
        stream.on('error', reject);
        writeStream.on('error', reject);
      });
    } catch {
      return NextResponse.json({ error: 'Failed to fetch audio from YouTube.' }, { status: 500 });
    }

    // Send to OpenAI Whisper API
    const fileStream = fs.createReadStream(audioPath);
    const formData = new FormData();
    formData.append('file', fileStream);
    formData.append('model', 'whisper-1');

    let transcript = '';
    try {
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
      });
      transcript = response.data?.text || '';
    } catch {
      // Clean up before returning error
      try { if (fs.existsSync(audioPath)) { fs.unlinkSync(audioPath); } } catch {}
      return NextResponse.json({ error: 'Failed to transcribe audio. Please try again.' }, { status: 500 });
    }

    // Cleanup temp file
    try { if (fs.existsSync(audioPath)) { fs.unlinkSync(audioPath); } } catch {}

    return NextResponse.json({ success: true, transcript });
  } catch {
    return NextResponse.json({ error: 'Failed to transcribe video. Please try again.' }, { status: 500 });
  }
}


