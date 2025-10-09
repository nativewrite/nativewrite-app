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

    const contentType = request.headers.get("content-type");
    
    let language = 'auto';
    let sourceType = 'upload';

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload from WaveformRecorder or file upload
      const formData = await request.formData();
      const file = formData.get("file") as File;
      
      console.log("Received FormData fields:", Array.from(formData.keys()));
      console.log("File received:", file ? { name: file.name, size: file.size, type: file.type } : "No file");
      const lang = formData.get("language") as string;
      
      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      language = lang || 'auto';
      
      // Save file temporarily to handle large files (>1 minute)
      const buffer = Buffer.from(await file.arrayBuffer());
      const tempPath = path.join("/tmp", `${Date.now()}_${file.name}`);
      await writeFile(tempPath, buffer);

      try {
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(tempPath),
          model: "whisper-1",
          language: language === 'auto' ? undefined : language,
        });

        // Clean up temp file
        await unlink(tempPath);

        // Save to Supabase
        let transcriptionId = null;
        try {
          const { data, error } = await supabase
            .from("transcriptions")
            .insert({
              user_id: session.user.email,
              source_type: sourceType,
              detected_language: language === 'auto' ? 'auto' : language,
              transcript_text: transcription.text,
              audio_url: null,
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
      } catch (error) {
        // Clean up temp file on error
        await unlink(tempPath);
        throw error;
      }
    } else {
      // Handle JSON requests (URL or base64 data)
      const body = await request.json();
      const audioData = body.audioData;
      const audioSource = body.audioUrl;
      language = body.language || 'auto';
      sourceType = body.sourceType || 'upload';

      if (!audioData && !audioSource) {
        return NextResponse.json(
          { error: "No audio data or URL provided" },
          { status: 400 }
        );
      }

      let transcription;
      let tempPath: string | null = null;

      try {
        if (audioData) {
          // Convert base64 to buffer and save temporarily
          const base64Data = audioData.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          tempPath = path.join("/tmp", `${Date.now()}_audio.webm`);
          await writeFile(tempPath, buffer);

          transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempPath),
            model: "whisper-1",
            language: language === 'auto' ? undefined : language,
          });
        } else if (audioSource) {
          // Download audio from URL and save temporarily
          const response = await fetch(audioSource);
          if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.status}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          tempPath = path.join("/tmp", `${Date.now()}_audio.mp3`);
          await writeFile(tempPath, buffer);

          transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempPath),
            model: "whisper-1",
            language: language === 'auto' ? undefined : language,
          });
        }

        if (!transcription) {
          return NextResponse.json(
            { error: "Failed to transcribe audio" },
            { status: 500 }
          );
        }

        // Save to Supabase
        let transcriptionId = null;
        try {
          const { data, error } = await supabase
            .from("transcriptions")
            .insert({
              user_id: session.user.email,
              source_type: sourceType,
              detected_language: language === 'auto' ? 'auto' : language,
              transcript_text: transcription.text,
              audio_url: audioSource || null,
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
        if (tempPath) {
          try {
            await unlink(tempPath);
          } catch (error) {
            console.error("Error cleaning up temp file:", error);
          }
        }
      }
    }
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}