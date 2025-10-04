import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { action, title, genre, outline, chapterTitle, chapterContent } = await req.json();

    if (action === 'generate_plan') {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert book planner and writing coach. Create a detailed chapter-by-chapter outline for a ${genre} book titled "${title}". 
            Based on the outline provided, generate 8-12 chapters with clear titles and brief descriptions of what happens in each chapter.
            Format the response as a structured plan that an author can follow. Include character development, plot progression, and key themes.`
          },
          {
            role: "user",
            content: `Book Title: ${title}\nGenre: ${genre}\nOutline: ${outline}\n\nPlease create a detailed chapter plan with clear structure and progression.`
          }
        ],
        temperature: 0.8,
        max_tokens: 3000,
      });

      return NextResponse.json({ 
        success: true, 
        chapterPlan: completion.choices[0]?.message?.content || ''
      });
    }

    if (action === 'ai_assist') {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert writing assistant and editor. Help improve and expand the given chapter content. 
            Provide suggestions for better flow, character development, dialogue, and narrative structure.
            Keep the same writing style and tone. Focus on making the writing more engaging, clear, and compelling.`
          },
          {
            role: "user",
            content: `Chapter Title: ${chapterTitle}\nCurrent Content: ${chapterContent}\n\nPlease help improve this chapter with better writing, flow, and engagement.`
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
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
