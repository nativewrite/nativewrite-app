import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import ytdl from "ytdl-core";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { unlink } from "fs/promises";
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

    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    const tempPath = path.join("/tmp", `${Date.now()}.mp3`);
    
    try {
      // Download audio from YouTube
      console.log("Downloading audio from YouTube:", url);
      const stream = ytdl(url, { 
        filter: "audioonly", 
        quality: "highestaudio"
      });
      
      const writeStream = fs.createWriteStream(tempPath);
      
      await new Promise((resolve, reject) => {
        stream.pipe(writeStream);
        stream.on("end", resolve);
        stream.on("error", reject);
        writeStream.on("error", reject);
      });

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
    console.error("URL transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe from URL" },
      { status: 500 }
    );
  }
}
