import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { url, language = 'auto' } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: "Missing URL" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const tempPath = path.join("/tmp", `${Date.now()}_audio.mp3`);
    
    try {
      console.log("Downloading audio from URL:", url);
      
      // Try to download the audio/video file directly
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      console.log("Content type:", contentType);

      // Check if it's an audio/video file
      if (!contentType || (!contentType.includes('audio') && !contentType.includes('video'))) {
        return NextResponse.json(
          { 
            error: "URL does not appear to contain audio/video content",
            contentType: contentType,
            suggestion: "Please provide a direct link to an audio or video file"
          },
          { status: 400 }
        );
      }

      // Download the file
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(tempPath, buffer);

      console.log("Audio downloaded, starting transcription...");
      
      // Transcribe the downloaded audio
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: "whisper-1",
        language: language === 'auto' ? undefined : language,
      });

      console.log("Transcription completed");

      // Save to Supabase
      let transcriptionId = null;
      try {
        const { data, error } = await supabase
          .from("transcriptions")
          .insert({
            user_id: session.user.email,
            source_type: 'url',
            detected_language: language === 'auto' ? 'auto' : language,
            transcript_text: transcription.text,
            audio_url: url,
            duration_seconds: null,
          })
          .select("id")
          .single();

        if (error) {
          console.error("Error saving transcription:", error);
        } else if (data) {
          transcriptionId = data.id;
        }
      } catch (error) {
        console.error("Error saving to Supabase:", error);
      }

      return NextResponse.json({
        success: true,
        text: transcription.text,
        detectedLanguage: language === 'auto' ? 'auto' : language,
        requestedLanguage: language,
        transcriptionId: transcriptionId,
      });

    } finally {
      // Clean up temp file
      try {
        await unlink(tempPath);
      } catch (error) {
        console.error("Error cleaning up temp file:", error);
      }
    }

  } catch (error) {
    console.error("Universal URL transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe from URL" },
      { status: 500 }
    );
  }
}
