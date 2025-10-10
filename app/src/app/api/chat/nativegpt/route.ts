import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    console.log("NativeGPT API called");
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    console.log("Processing", messages.length, "messages");
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.8,
      max_tokens: 1200,
    });
    
    const reply = completion.choices[0]?.message?.content;
    console.log("Generated reply:", reply?.substring(0, 100) + "...");
    
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("NativeGPT API error:", err);
    return NextResponse.json({ error: "NativeGPT failed" }, { status: 500 });
  }
}
