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
          content: `You are an expert book planner. Create a chapter outline for a book.

CRITICAL: You MUST return ONLY a valid JSON array. No markdown, no code blocks, no explanations.

Required format (JSON array):
[
  {"title": "Chapter 1 Title", "summary": "What happens in this chapter"},
  {"title": "Chapter 2 Title", "summary": "What happens in this chapter"}
]

Generate exactly ${chapterCount} chapters. Each chapter must have a "title" and "summary" field.`,
        },
        {
          role: 'user',
          content: `Create a ${chapterCount}-chapter outline for a book about: ${idea}

Return the JSON array now:`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    if (!content.trim()) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 });
    }

    // Try to parse JSON response
    let chapters: Array<{ title: string; summary: string }> = [];
    
    try {
      // First, try to extract JSON from markdown code blocks
      let jsonString = content.trim();
      
      // Remove markdown code blocks if present
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1].trim();
      }
      
      // Try parsing as JSON
      const parsed = JSON.parse(jsonString);
      
      // Handle different response formats
      if (Array.isArray(parsed)) {
        chapters = parsed;
      } else if (parsed.chapters && Array.isArray(parsed.chapters)) {
        chapters = parsed.chapters;
      } else if (parsed.chapterList && Array.isArray(parsed.chapterList)) {
        chapters = parsed.chapterList;
      } else {
        throw new Error('Response is not in expected format');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content received:', content.substring(0, 500));
      
      // Fallback: try to extract chapters from text format
      const lines = content.split('\n').filter(line => line.trim());
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Look for chapter patterns
        const chapterMatch = line.match(/(?:Chapter\s*)?(\d+)[:\-\.]\s*(.+)/i) || 
                           line.match(/^(\d+)\.\s*(.+)/) ||
                           line.match(/^(.+?):\s*(.+)/);
        
        if (chapterMatch) {
          const title = chapterMatch[2] || chapterMatch[1] || line;
          const summary = lines[i + 1]?.trim() || '';
          if (title && title.length > 0) {
            chapters.push({ title: title.trim(), summary: summary.trim() });
            if (summary) i++; // Skip summary line
          }
        }
      }
      
      // If still no chapters found, try a simpler pattern
      if (chapters.length === 0) {
        const numberedLines = lines.filter(line => /^\d+[\.\:\-]/.test(line.trim()));
        chapters = numberedLines.slice(0, chapterCount).map(line => ({
          title: line.replace(/^\d+[\.\:\-]\s*/, '').trim(),
          summary: ''
        }));
      }
    }

    if (!Array.isArray(chapters) || chapters.length === 0) {
      console.error('Failed to extract chapters. Content:', content.substring(0, 500));
      return NextResponse.json({ 
        error: 'Could not parse chapter outline. Please try again with a different book idea.' 
      }, { status: 500 });
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

