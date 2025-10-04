import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { action, title, genre, outline, chapterTitle, chapterContent } = await req.json();

    if (action === 'generate_plan') {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert book planner. Create a detailed chapter-by-chapter outline for a ${genre} book titled "${title}". 
            Based on the outline provided, generate 8-12 chapters with clear titles and brief descriptions of what happens in each chapter.
            Format the response as a structured plan that an author can follow.`
          },
          {
            role: "user",
            content: `Book Title: ${title}\nGenre: ${genre}\nOutline: ${outline}\n\nPlease create a detailed chapter plan.`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      });

      return NextResponse.json({ 
        success: true, 
        chapterPlan: completion.choices[0]?.message?.content || ''
      });
    }

    if (action === 'ai_assist') {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert writing assistant. Help improve and expand the given chapter content. 
            Provide suggestions for better flow, character development, dialogue, and narrative structure.
            Keep the same writing style and tone.`
          },
          {
            role: "user",
            content: `Chapter Title: ${chapterTitle}\nCurrent Content: ${chapterContent}\n\nPlease help improve this chapter.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return NextResponse.json({ 
        success: true, 
        improvedContent: completion.choices[0]?.message?.content || ''
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Book Writer API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request. Please try again.' 
    }, { status: 500 });
  }
}
