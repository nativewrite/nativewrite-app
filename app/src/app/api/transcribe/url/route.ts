import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import axios from 'axios';
import FormData from 'form-data';

const execPromise = util.promisify(exec);

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

    const audioPath = path.join('/tmp', `audio-${Date.now()}.mp3`);

    // Download audio using yt-dlp
    const downloadCmd = `yt-dlp -x --audio-format mp3 -o "${audioPath}" "${videoUrl}"`;
    try {
      await execPromise(downloadCmd);
    } catch (dlErr: unknown) {
      const err = dlErr as { stderr?: string };
      if (err?.stderr && err.stderr.includes('Sign in')) {
        return NextResponse.json({
          error: "This platform (Instagram or TikTok) blocks direct downloads. Please upload your video manually.",
        }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to download audio for transcription.' }, { status: 500 });
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
      try { fs.existsSync(audioPath) && fs.unlinkSync(audioPath); } catch {}
      return NextResponse.json({ error: 'Failed to transcribe audio. Please try again.' }, { status: 500 });
    }

    // Cleanup temp file
    try { fs.existsSync(audioPath) && fs.unlinkSync(audioPath); } catch {}

    return NextResponse.json({ success: true, transcript });
  } catch {
    return NextResponse.json({ error: 'Failed to transcribe video. Please try again.' }, { status: 500 });
  }
}


