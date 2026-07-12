import { NextResponse } from "next/server";
import { callGitHubAI } from "@/lib/github-ai";

export async function POST(req: Request) {
  try {
    const { title, assigneeName } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Task title is required to generate a description." },
        { status: 400 }
      );
    }

    const prompt = `Task Title: "${title}"${
      assigneeName ? `\nAssignee: ${assigneeName}` : ""
    }

Please generate a professional, structured, and actionable task description. Include:
- A brief 1-sentence objective.
- 3 to 5 clear action items/deliverables as bullet points.
- Acceptance criteria for completion.

Keep it concise, clear, and well-formatted so the employee knows exactly what to do.`;

    const description = await callGitHubAI([
      {
        role: "system",
        content:
          "You are an expert HR and Engineering Project Manager AI assistant. Write clear, professional, and actionable task descriptions.",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    return NextResponse.json({
      success: true,
      description: description.trim(),
    });
  } catch (error: any) {
    console.error("Error generating task description with AI:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate description" },
      { status: 500 }
    );
  }
}
