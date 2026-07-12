import { NextResponse } from "next/server";
import { callGitHubAI } from "@/lib/github-ai";

export async function POST(req: Request) {
  try {
    const { reason } = await req.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter a brief reason first to polish it." },
        { status: 400 }
      );
    }

    const prompt = `Please rewrite and polish the following leave request reason so that it sounds professional, respectful, and clearly articulated for HR/management review. Keep it concise (around 2 to 3 sentences). Do not add placeholder brackets or invent dates.

Draft note:
"${reason}"`;

    const polished = await callGitHubAI([
      {
        role: "system",
        content:
          "You are a professional workplace communication assistant. You refine brief or casual leave notes into clear, professional leave requests.",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    return NextResponse.json({
      success: true,
      polished: polished.trim(),
    });
  } catch (error: any) {
    console.error("Error polishing leave request with AI:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to polish leave request" },
      { status: 500 }
    );
  }
}
