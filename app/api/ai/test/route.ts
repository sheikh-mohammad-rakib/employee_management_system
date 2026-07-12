import { NextResponse } from "next/server";
import { callGitHubAI } from "@/lib/github-ai";

export async function GET() {
  try {
    const answer = await callGitHubAI([
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "What is the capital of France?" },
    ]);

    return NextResponse.json({
      success: true,
      model: "openai/gpt-4.1-mini",
      answer,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
