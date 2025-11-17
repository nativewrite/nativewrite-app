import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { chapterTitle, chapterSummary, currentText } = await req.json();

    if (!chapterTitle) {
      return NextResponse.json({ error: 'Chapter title is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert writing assistant. Expand the given chapter content with engaging, well-written prose.

Guidelines:
- Continue the existing writing style and tone
- Add depth to descriptions, dialogue, and narrative
- Maintain consistency with the chapter's theme and summary
- Write 300-500 words of high-quality content
- Do not repeat what's already written
- Focus on advancing the story and developing characters

Return ONLY the new content to be added, not the entire chapter.`,
        },
        {
          role: 'user',
          content: `Chapter Title: ${chapterTitle}
${chapterSummary ? `Chapter Summary: ${chapterSummary}` : ''}
${currentText ? `Current Content:\n${currentText}\n\nContinue writing from here:` : 'Start writing this chapter:'}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const text = completion.choices[0]?.message?.content || '';
    const wordCount = text.split(/\s+/).filter(w => w).length;

    if (!text.trim()) {
      return NextResponse.json({ error: 'No content generated' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      text: text.trim(),
      wordCount,
    });
  } catch (error) {
    console.error('Chapter expand error:', error);
    return NextResponse.json({ 
      error: 'Failed to expand chapter. Please try again.' 
    }, { status: 500 });
  }
}

