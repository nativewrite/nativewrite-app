import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    const { chapterTitle, chapterSummary, currentText } = await request.json();

    if (!chapterTitle) {
      return NextResponse.json(
        { error: "Chapter title is required" },
        { status: 400 }
      );
    }

    const prompt = `Expand the following book chapter into engaging, detailed prose.

Chapter Title: ${chapterTitle}
${chapterSummary ? `Chapter Summary: ${chapterSummary}` : ''}
${currentText ? `Existing Text:\n${currentText}` : 'No existing text - start fresh.'}

Requirements:
- Write 300-500 words of engaging book content
- Use natural storytelling with vivid details and smooth flow
- ${currentText ? 'Continue from where the existing text left off, maintaining consistency' : 'Create a compelling opening for this chapter'}
- Match the tone and style of a published book
- Include dialogue, descriptions, and narrative progression where appropriate
- Make it feel like a continuation of the chapter, not a summary

Write the expanded text now:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional fiction and non-fiction book writer. Your job is to expand chapter outlines into compelling, well-written prose that reads like a published book."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const expandedText = completion.choices[0]?.message?.content;

    if (!expandedText) {
      throw new Error("No text generated");
    }

    return NextResponse.json({
      text: expandedText.trim(),
      wordCount: expandedText.split(/\s+/).filter(w => w).length,
    });

  } catch (error) {
    console.error("Chapter expansion error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to expand chapter",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

