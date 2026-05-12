import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const createTaskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  assigneeId: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
})

// GET /api/tasks?assigneeId=&status=
export async function GET(request: Request) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const assigneeId = searchParams.get("assigneeId")
    const status = searchParams.get("status")

    const tasks = await prisma.task.findMany({
      where: {
        ...(auth.role === "EMPLOYEE" ? { assigneeId: auth.userId } : {}),
        ...(assigneeId && auth.role !== "EMPLOYEE" ? { assigneeId } : {}),
        ...(status
          ? { status: status as "TODO" | "IN_PROGRESS" | "DONE" }
          : {}),
      },
      include: {
        creator: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, data: tasks }, { status: 200 })
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/tasks
export async function POST(request: Request) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = createTaskSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title, description, dueDate, assigneeId, status } = parsed.data

    // Employees create tasks for themselves only
    const resolvedAssigneeId =
      auth.role === "EMPLOYEE" ? auth.userId : (assigneeId ?? auth.userId)
    const resolvedStatus =
      auth.role === "EMPLOYEE" ? "IN_PROGRESS" : (status ?? "TODO")

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        status: resolvedStatus,
        creatorId: auth.userId,
        assigneeId: resolvedAssigneeId,
      },
    })

    return NextResponse.json({ success: true, data: task }, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
