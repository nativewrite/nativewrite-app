import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, isFavorite } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Transcription ID is required" },
        { status: 400 }
      );
    }

    // Update the favorite status
    const { error } = await supabase
      .from("transcriptions")
      .update({ is_favorite: isFavorite })
      .eq("id", id)
      .eq("user_id", session.user.email); // Ensure user owns this transcription

    if (error) {
      console.error("Error updating favorite status:", error);
      return NextResponse.json(
        { error: "Failed to update favorite status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      isFavorite 
    });

  } catch (error) {
    console.error("Favorite API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

