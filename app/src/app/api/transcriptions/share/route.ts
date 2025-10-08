import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, makePublic } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Transcription ID is required" },
        { status: 400 }
      );
    }

    // Generate or clear public ID based on makePublic flag
    const publicId = makePublic ? randomUUID() : null;

    // Update the transcription
    const { data, error } = await supabase
      .from("transcriptions")
      .update({
        is_public: makePublic,
        public_id: publicId,
      })
      .eq("id", id)
      .eq("user_id", session.user.email) // Ensure user owns this transcription
      .select("public_id")
      .single();

    if (error) {
      console.error("Error updating share status:", error);
      return NextResponse.json(
        { error: "Failed to update share status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      publicId: data?.public_id,
      isPublic: makePublic
    });

  } catch (error) {
    console.error("Share API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

