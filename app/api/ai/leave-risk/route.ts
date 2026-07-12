import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callGitHubAI } from "@/lib/github-ai";

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "ADMIN" && auth.role !== "HR")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin or HR access required." },
        { status: 401 }
      );
    }

    const { leaveId, userId, startDate, endDate, employeeName, reason } =
      await req.json();

    if (!userId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Missing required leave parameters." },
        { status: 400 }
      );
    }

    // Query active tasks assigned to this employee
    const activeTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: "DONE" },
      },
      orderBy: { dueDate: "asc" },
      take: 15,
    });

    const tasksSummary =
      activeTasks
        .map(
          (t) =>
            `- "${t.title}" [Status: ${t.status}, Due Date: ${t.dueDate
              .toISOString()
              .slice(0, 10)}]`
        )
        .join("\n") || "No active tasks currently assigned.";

    const prompt = `Employee: ${employeeName}
Requested Leave Period: ${startDate.slice(0, 10)} to ${endDate.slice(0, 10)}
Leave Reason: "${reason}"

Employee's Currently Active Tasks:
${tasksSummary}

Analyze this leave request for potential workflow bottlenecks or missed deadlines.
Please output a concise risk assessment formatted with these exact Markdown headings:
**1. Risk Level**
(State: LOW RISK, MEDIUM RISK, or HIGH RISK with a 1-sentence rationale)

**2. Task Impact Analysis**
(Identify any tasks whose due date conflicts with or falls close to the leave period)

**3. Action Recommendation**
(Recommend whether to Approve immediately, or advise reassigning specific tasks first)`;

    const analysis = await callGitHubAI([
      {
        role: "system",
        content:
          "You are an AI HR & Operations Risk Analyst. Provide objective, clear, and actionable leave risk assessments.",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    return NextResponse.json({
      success: true,
      analysis: analysis.trim(),
    });
  } catch (error: any) {
    console.error("Error in leave risk analysis:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze leave risk" },
      { status: 500 }
    );
  }
}
