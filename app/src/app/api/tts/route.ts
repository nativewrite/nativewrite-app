import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { text, language, voice } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Voice selection based on language and preference
    const getVoice = (lang?: string, preferredVoice?: string) => {
      if (preferredVoice && ["alloy", "echo", "fable", "onyx", "nova", "shimmer"].includes(preferredVoice)) {
        return preferredVoice;
      }

      // Default voice mapping based on language
      const voiceMap: Record<string, string> = {
        en: "alloy",    // Clear, neutral English
        fr: "nova",     // Elegant French
        es: "echo",     // Warm Spanish
        de: "onyx",     // Strong German
        it: "fable",    // Expressive Italian
        pt: "echo",     // Smooth Portuguese
        ru: "onyx",     // Deep Russian
        ja: "nova",     // Soft Japanese
        ko: "shimmer",  // Gentle Korean
        zh: "nova",     // Clear Chinese
        ar: "echo",     // Rich Arabic
        hi: "alloy",    // Clear Hindi
        fa: "nova",     // Elegant Persian
        tr: "echo",     // Warm Turkish
        nl: "fable",    // Clear Dutch
        sv: "alloy",    // Clear Swedish
        no: "echo",     // Warm Norwegian
        da: "nova",     // Soft Danish
        fi: "onyx",     // Clear Finnish
      };

      return voiceMap[lang || "en"] || "alloy";
    };

    const selectedVoice = getVoice(language, voice);

    // Limit text length for TTS (OpenAI has limits)
    const maxLength = 4000;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: selectedVoice as any,
      input: truncatedText,
      response_format: "mp3",
      speed: 1.0,
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error("TTS error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate speech. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
