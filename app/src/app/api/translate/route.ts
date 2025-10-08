import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { text, from, to } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!to) {
      return NextResponse.json(
        { error: "Target language is required" },
        { status: 400 }
      );
    }

    // Language name mapping
    const languageNames: Record<string, string> = {
      en: "English",
      fr: "French", 
      es: "Spanish",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
      ar: "Arabic",
      hi: "Hindi",
      fa: "Persian",
      tr: "Turkish",
      nl: "Dutch",
      sv: "Swedish",
      no: "Norwegian",
      da: "Danish",
      fi: "Finnish",
    };

    const fromLanguage = from && from !== "auto" ? languageNames[from] || from : "the detected language";
    const toLanguage = languageNames[to] || to;

    const systemPrompt = `You are a professional translator. Translate the following text from ${fromLanguage} to ${toLanguage}. 

Requirements:
- Maintain the original tone and style
- Preserve technical terms when appropriate
- Keep the same formatting and structure
- Provide a natural, fluent translation
- If the text contains proper nouns or names, keep them as is unless they have standard translations

Return only the translated text, no explanations or additional commentary.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const translation = completion.choices[0]?.message?.content;

    if (!translation) {
      throw new Error("No translation received from OpenAI");
    }

    return NextResponse.json({
      translation: translation.trim(),
      from: from || "auto-detected",
      to: to,
      fromLanguage: fromLanguage,
      toLanguage: toLanguage,
    });

  } catch (error) {
    console.error("Translation error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to translate text. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
