import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { idea, chapterCount = 10 } = await req.json();

    if (!idea || !idea.trim()) {
      return NextResponse.json({ error: 'Book idea is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert book planner and writing coach. Create a detailed chapter-by-chapter outline for a book based on the provided idea.

Generate ${chapterCount} chapters with:
- Clear, descriptive chapter titles
- Brief summaries (1-2 sentences) describing what happens in each chapter

Return ONLY a valid JSON array in this exact format:
[
  {"title": "Chapter Title", "summary": "Brief description"},
  {"title": "Chapter Title", "summary": "Brief description"}
]

Do not include any markdown, code blocks, or additional text. Only return the JSON array.`,
        },
        {
          role: 'user',
          content: `Create a chapter outline for a book about: ${idea}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    // Try to parse JSON response
    let parsed;
    try {
      // If response is wrapped in markdown code blocks, extract JSON
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonString);
    } catch {
      // If direct JSON parsing fails, try to extract chapters from text
      const lines = content.split('\n').filter(line => line.trim());
      const chapters: Array<{ title: string; summary: string }> = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^(Chapter|chapter|\d+)/)) {
          const titleMatch = line.match(/(?:Chapter\s*\d+[:\-]?\s*)?(.+)/);
          if (titleMatch) {
            const title = titleMatch[1].trim();
            const summary = lines[i + 1]?.trim() || '';
            chapters.push({ title, summary });
            i++; // Skip next line as it's the summary
          }
        }
      }
      
      if (chapters.length > 0) {
        return NextResponse.json({ chapters });
      }
      
      throw new Error('Failed to parse outline');
    }

    // Handle different response formats
    const chapters = parsed.chapters || parsed.chapterList || (Array.isArray(parsed) ? parsed : []);

    if (!Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json({ error: 'Invalid outline format' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      chapters: chapters.map((ch: { title?: string; chapterTitle?: string; summary?: string; description?: string; chapterSummary?: string }) => ({
        title: ch.title || ch.chapterTitle || 'Untitled Chapter',
        summary: ch.summary || ch.description || ch.chapterSummary || '',
      })),
    });
  } catch (error) {
    console.error('Book outliner error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate outline. Please try again.' 
    }, { status: 500 });
  }
}

