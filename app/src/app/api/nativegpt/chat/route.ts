import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    console.log("NativeGPT API called");
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user?.email ? "Authenticated" : "Not authenticated");
    
    if (!session?.user?.email) {
      console.log("Returning 401 - Unauthorized");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { messages, transcriptionId, sessionId } = await request.json();
    console.log("NativeGPT request data:", { messagesCount: messages?.length, transcriptionId, sessionId });

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Call OpenAI API
    console.log("Calling OpenAI API...");
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    console.log("OpenAI response received");
    const assistantMessage = chatResponse.choices[0]?.message?.content;
    console.log("Assistant message:", assistantMessage?.substring(0, 100) + "...");

    if (!assistantMessage) {
      throw new Error("No response from AI");
    }

    // Prepare full conversation with the new assistant response
    const updatedMessages = [
      ...messages,
      { role: "assistant", content: assistantMessage }
    ];

    // Generate a title from the first user message
    const firstUserMessage = messages.find((m: { role: string }) => m.role === "user");
    const title = firstUserMessage?.content?.slice(0, 50) || "New Chat";

    // Save or update chat session in Supabase
    if (sessionId) {
      // Update existing session
      const { error } = await supabase
        .from("nativegpt_sessions")
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId)
        .eq("user_id", session.user.email);

      if (error) {
        console.error("Error updating chat session:", error);
      }
    } else {
      // Create new session
      const { data, error } = await supabase
        .from("nativegpt_sessions")
        .insert({
          user_id: session.user.email,
          transcription_id: transcriptionId || null,
          title: title,
          messages: updatedMessages,
          model: "gpt-4o-mini",
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating chat session:", error);
      } else if (data) {
        return NextResponse.json({
          reply: assistantMessage,
          sessionId: data.id,
        });
      }
    }

    return NextResponse.json({
      reply: assistantMessage,
      sessionId: sessionId || null,
    });

  } catch (error) {
    console.error("NativeGPT chat error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

