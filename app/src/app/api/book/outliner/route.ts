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

    const { idea, chapterCount = 10 } = await request.json();

    if (!idea || !idea.trim()) {
      return NextResponse.json(
        { error: "Book idea is required" },
        { status: 400 }
      );
    }

    const prompt = `Generate a detailed book outline based on the following idea or theme:

"${idea}"

Requirements:
- Create ${chapterCount} chapters (between 8-15 is ideal)
- Each chapter should have a compelling title
- Include a 1-2 sentence summary/synopsis for each chapter
- Ensure logical flow and progression throughout the book
- Make it engaging and well-structured

Format your response exactly like this:

Chapter 1: [Compelling Title] — [Brief summary of what this chapter covers and its purpose in the narrative]
Chapter 2: [Compelling Title] — [Brief summary of what this chapter covers and its purpose in the narrative]
...and so on.

Focus on creating a cohesive story arc or logical progression that would make for an engaging book.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional book outline creator. Generate well-structured, engaging book outlines that help authors organize their ideas into coherent chapters."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const outline = completion.choices[0]?.message?.content;

    if (!outline) {
      throw new Error("No outline generated");
    }

    // Parse the outline into structured chapters
    const chapters = outline
      .split("\n")
      .filter(line => line.trim() && (line.includes("Chapter") || line.match(/^\d+\./)))
      .map((line, index) => {
        // Extract title and summary
        const parts = line.split("—");
        let title = parts[0]?.trim() || `Chapter ${index + 1}`;
        const summary = parts[1]?.trim() || "";
        
        // Clean up the title (remove "Chapter X:" prefix if present)
        title = title.replace(/^Chapter \d+:\s*/, '').replace(/^\d+\.\s*/, '');
        
        return {
          title,
          summary,
          content: "", // Empty content - user will fill this in
        };
      });

    return NextResponse.json({
      outline: outline,
      chapters: chapters,
      totalChapters: chapters.length,
    });

  } catch (error) {
    console.error("Book outliner error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate book outline",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

