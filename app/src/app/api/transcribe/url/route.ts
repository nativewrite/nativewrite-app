import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import ytdl from 'ytdl-core';

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Try to get audio URL from alternative services
async function getYouTubeAudioUrlAlternative(videoUrl: string): Promise<string | null> {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return null;

    // Try vevioz API
    const response = await fetch(`https://api.vevioz.com/api/button/mp3/128/${videoId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.url) return data.url;
    }
  } catch (error) {
    console.error('Alternative YouTube service failed:', error);
  }
  return null;
}

// Try backend service if available
async function tryBackendService(videoUrl: string): Promise<string | null> {
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const backendApiKey = process.env.BACKEND_API_KEY;
    
    if (!backendUrl || !backendApiKey) {
      return null;
    }

    const response = await fetch(`${backendUrl}/api/fetch-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': backendApiKey,
      },
      body: JSON.stringify({ url: videoUrl }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.audio_url) {
        return data.audio_url;
      }
    }
  } catch (error) {
    console.error('Backend service error:', error);
  }
  return null;
}

export async function POST(req: Request) {
  let audioPath: string | null = null;
  
  try {
    const { videoUrl, language } = await req.json();
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

    audioPath = path.join('/tmp', `audio-${Date.now()}.mp3`);
    let audioDownloaded = false;
    
    // Strategy 1: Try backend service first (most reliable)
    const backendAudioUrl = await tryBackendService(videoUrl);
    if (backendAudioUrl) {
      try {
        console.log('Using backend service for audio:', backendAudioUrl);
        const audioResponse = await fetch(backendAudioUrl);
        if (audioResponse.ok) {
          const audioBuffer = await audioResponse.arrayBuffer();
          fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
          audioDownloaded = true;
        }
      } catch (error) {
        console.error('Failed to download from backend service:', error);
      }
    }

    // Strategy 2: Try alternative YouTube audio service
    if (!audioDownloaded) {
      const alternativeUrl = await getYouTubeAudioUrlAlternative(videoUrl);
      if (alternativeUrl) {
        try {
          console.log('Using alternative service for audio:', alternativeUrl);
          const audioResponse = await fetch(alternativeUrl);
          if (audioResponse.ok) {
            const audioBuffer = await audioResponse.arrayBuffer();
            fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
            audioDownloaded = true;
          }
        } catch (error) {
          console.error('Failed to download from alternative service:', error);
        }
      }
    }

    // Strategy 3: Fallback to ytdl-core (may fail in serverless)
    if (!audioDownloaded && audioPath) {
      try {
        console.log('Attempting ytdl-core download...');
        // Store in const to help TypeScript narrow the type
        const finalAudioPath = audioPath;
        await new Promise<void>((resolve, reject) => {
          const stream = ytdl(videoUrl, { 
            quality: 'highestaudio', 
            filter: 'audioonly',
            requestOptions: {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              }
            }
          });
          const writeStream = fs.createWriteStream(finalAudioPath);
          
          stream.on('error', (error) => {
            console.error('ytdl-core stream error:', error);
            reject(error);
          });
          
          writeStream.on('error', (error) => {
            console.error('File write error:', error);
            reject(error);
          });
          
          writeStream.on('finish', () => {
            console.log('Audio download completed');
            resolve();
          });
          
          stream.pipe(writeStream);
        });
        audioDownloaded = true;
      } catch (error: unknown) {
        console.error('ytdl-core download failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Clean up on failure
        try { if (fs.existsSync(audioPath)) { fs.unlinkSync(audioPath); } } catch {}
        
        return NextResponse.json({ 
          error: `Failed to fetch audio from YouTube: ${errorMessage}. Please try uploading the video file directly or ensure the video is publicly accessible.`,
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 });
      }
    }

    if (!audioDownloaded || !fs.existsSync(audioPath)) {
      return NextResponse.json({ 
        error: 'Failed to download audio from YouTube. Please try uploading the video file directly.' 
      }, { status: 500 });
    }

    // Send to OpenAI Whisper API
    if (!fs.existsSync(audioPath)) {
      return NextResponse.json({ 
        error: 'Audio file not found after download. Please try again.' 
      }, { status: 500 });
    }

    const fileStream = fs.createReadStream(audioPath);
    const formData = new FormData();
    formData.append('file', fileStream);
    formData.append('model', 'whisper-1');
    if (language && language !== 'auto') {
      formData.append('language', language);
    }

    let transcript = '';
    try {
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      transcript = response.data?.text || '';
      
      if (!transcript) {
        throw new Error('Empty transcription result');
      }
    } catch (error: unknown) {
      console.error('OpenAI transcription error:', error);
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Clean up before returning error
      try { if (fs.existsSync(audioPath)) { fs.unlinkSync(audioPath); } } catch {}
      
      return NextResponse.json({ 
        error: `Failed to transcribe audio: ${errorMessage}. Please check your OpenAI API key and try again.`,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }, { status: 500 });
    } finally {
      // Cleanup temp file
      try { 
        if (audioPath && fs.existsSync(audioPath)) { 
          fs.unlinkSync(audioPath); 
        } 
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      transcript,
      detectedLanguage: language || 'auto',
      requestedLanguage: language || 'auto'
    });
  } catch (error: unknown) {
    console.error('Transcribe URL route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Cleanup on any error
    try { 
      if (audioPath && fs.existsSync(audioPath)) { 
        fs.unlinkSync(audioPath); 
      } 
    } catch {}
    
    return NextResponse.json({ 
      error: `Failed to transcribe video: ${errorMessage}. Please try again.`,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}


