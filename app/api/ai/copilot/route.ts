import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callGitHubAI, type ChatMessage } from "@/lib/github-ai";

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }

    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages array is required." },
        { status: 400 }
      );
    }

    // 1. Fetch relevant user details and database context
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true, email: true, role: true },
    });

    let contextSummary = "";

    if (auth.role === "ADMIN" || auth.role === "HR") {
      const [employeeCount, pendingLeaves, tasks] = await Promise.all([
        prisma.user.count({ where: { role: "EMPLOYEE" } }),
        prisma.leave.findMany({
          where: { status: "PENDING" },
          include: { user: { select: { name: true } } },
          take: 5,
        }),
        prisma.task.findMany({
          where: { status: { not: "DONE" } },
          include: { assignee: { select: { name: true } } },
          take: 10,
        }),
      ]);

      contextSummary = `System Overview (Admin/HR View):
- Total Employees: ${employeeCount}
- Pending Leave Requests (${pendingLeaves.length}): ${
        pendingLeaves.map((l) => `${l.user.name}: ${l.reason} (${l.startDate.toISOString().slice(0,10)} to ${l.endDate.toISOString().slice(0,10)})`).join("; ") || "None"
      }
- Active Pending Tasks (${tasks.length}): ${
        tasks.map((t) => `"${t.title}" assigned to ${t.assignee?.name || "Unassigned"} [Status: ${t.status}]`).join("; ") || "None"
      }`;
    } else {
      // EMPLOYEE context
      const [myTasks, myLeaves, todayAttendance] = await Promise.all([
        prisma.task.findMany({
          where: { assigneeId: auth.userId },
          orderBy: { dueDate: "asc" },
          take: 10,
        }),
        prisma.leave.findMany({
          where: { userId: auth.userId },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.attendance.findFirst({
          where: { userId: auth.userId },
          orderBy: { checkIn: "desc" },
        }),
      ]);

      contextSummary = `My Live Work Context (${user?.name}):
- Assigned Tasks (${myTasks.length}): ${
        myTasks.map((t) => `"${t.title}" [Status: ${t.status}, Due: ${t.dueDate.toISOString().slice(0, 10)}]`).join("; ") || "No assigned tasks"
      }
- Recent Leave Requests: ${
        myLeaves.map((l) => `${l.status}: ${l.reason}`).join("; ") || "No leaves submitted"
      }
- Last Check-In: ${
        todayAttendance ? todayAttendance.checkIn.toLocaleString() : "Not checked in today"
      }`;
    }

    const systemPrompt: ChatMessage = {
      role: "system",
      content: `You are AI Workplace Copilot, an intelligent, helpful, and friendly workplace assistant embedded in the Employee Management System.
Current Logged-in User: ${user?.name || "User"} (${auth.role})

Real-Time Workspace Context:
${contextSummary}

Instructions:
1. Answer questions about the user's tasks, leaves, workload, or general HR/workplace writing help accurately and concisely.
2. Format your response cleanly using Markdown, bullet points, or bold text for easy reading.
3. Be professional, supportive, and action-oriented.`,
    };

    const reply = await callGitHubAI([systemPrompt, ...messages], {
      model: "openai/gpt-4.1-mini",
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      reply: reply.trim(),
    });
  } catch (error: any) {
    console.error("Error in AI Copilot route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Copilot failed to respond" },
      { status: 500 }
    );
  }
}
