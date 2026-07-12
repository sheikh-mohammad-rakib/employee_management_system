import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callGitHubAI } from "@/lib/github-ai";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true, email: true },
    });

    const tasks = await prisma.task.findMany({
      where: { assigneeId: auth.userId },
      orderBy: { updatedAt: "desc" },
      take: 15,
    });

    const doneTasks = tasks.filter((t) => t.status === "DONE");
    const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
    const todoTasks = tasks.filter((t) => t.status === "TODO");

    const taskSnapshot = `Employee Name: ${user?.name}
Completed Tasks (${doneTasks.length}):
${doneTasks.map((t) => `- "${t.title}" (Due: ${t.dueDate.toISOString().slice(0, 10)})`).join("\n") || "None"}

In-Progress Tasks (${inProgressTasks.length}):
${inProgressTasks.map((t) => `- "${t.title}" (Due: ${t.dueDate.toISOString().slice(0, 10)})`).join("\n") || "None"}

To-Do / Upcoming Tasks (${todoTasks.length}):
${todoTasks.map((t) => `- "${t.title}" (Due: ${t.dueDate.toISOString().slice(0, 10)})`).join("\n") || "None"}`;

    const prompt = `Here is my current task status and recent work activity:
${taskSnapshot}

Please generate a professional Weekly Standup / Status Report for my manager.
Format with clean Markdown bold headings:
**1. Key Accomplishments & Completed Work**
(Bullet points summarizing completed items)

**2. Work Currently In Progress**
(Bullet points on active focus areas)

**3. Next Priorities & Focus**
(Summary of upcoming tasks or milestones)

Keep it concise, professional, and ready to share in a standup email or Slack update.`;

    const report = await callGitHubAI([
      {
        role: "system",
        content:
          "You are an AI Executive Career & Standup Assistant. Synthesize work progress into crisp, professional status reports.",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    return NextResponse.json({
      success: true,
      report: report.trim(),
    });
  } catch (error: any) {
    console.error("Error generating weekly report:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate standup report" },
      { status: 500 }
    );
  }
}
