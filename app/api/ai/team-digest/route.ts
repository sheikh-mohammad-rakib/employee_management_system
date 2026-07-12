import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callGitHubAI } from "@/lib/github-ai";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "ADMIN" && auth.role !== "HR")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin or HR access required." },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalEmployees, presentToday, pendingLeaves, activeTasks] =
      await Promise.all([
        prisma.user.count({ where: { role: "EMPLOYEE" } }),
        prisma.attendance.count({
          where: { date: { gte: today, lt: tomorrow } },
        }),
        prisma.leave.findMany({
          where: { status: "PENDING" },
          include: { user: { select: { name: true } } },
          take: 10,
        }),
        prisma.task.findMany({
          where: { status: { not: "DONE" } },
          include: { assignee: { select: { name: true } } },
          orderBy: { dueDate: "asc" },
          take: 15,
        }),
      ]);

    const dataSnapshot = `
Total Employees: ${totalEmployees}
Employees Checked In Today: ${presentToday}
Pending Leave Requests (${pendingLeaves.length}):
${pendingLeaves
  .map(
    (l) =>
      `- ${l.user.name}: "${l.reason}" (${l.startDate.toISOString().slice(0, 10)} to ${l.endDate.toISOString().slice(0, 10)})`
  )
  .join("\n") || "None"}

Active Open Tasks (${activeTasks.length}):
${activeTasks
  .map(
    (t) =>
      `- "${t.title}" assigned to ${
        t.assignee?.name || "Unassigned"
      } [Status: ${t.status}, Due: ${t.dueDate.toISOString().slice(0, 10)}]`
  )
  .join("\n") || "None"}
`;

    const prompt = `Here is the current operational data from the Employee Management System:
${dataSnapshot}

Please generate an Executive Management Briefing based on this data. Include these exact sections formatted with Markdown bold headings:
**1. Executive Summary**
(1-2 sentences summarizing overall presence and workload)

**2. Key Task & Deadline Highlights**
(Bullet points highlighting notable open tasks or unassigned work)

**3. Leave & Resource Outlook**
(Summary of pending leaves and any capacity recommendations)

**4. Today's Recommended Action**
(One clear action item for the Admin/HR manager today)`;

    const digest = await callGitHubAI([
      {
        role: "system",
        content:
          "You are an AI Executive Operations Advisor for an Employee Management System. Provide clear, analytical, and actionable briefings.",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    return NextResponse.json({
      success: true,
      digest: digest.trim(),
    });
  } catch (error: any) {
    console.error("Error generating team digest:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate briefing" },
      { status: 500 }
    );
  }
}
