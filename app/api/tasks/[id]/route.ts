import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const patchTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  assigneeId: z.string().optional(),
})

// PATCH /api/tasks/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    // Employee can only update status of own assigned tasks
    if (auth.role === "EMPLOYEE") {
      if (task.assigneeId !== auth.userId) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
      }
    }

    const body = await request.json()
    const parsed = patchTaskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title, description, dueDate, status, assigneeId } = parsed.data

    // Employees can only change status
    const updateData =
      auth.role === "EMPLOYEE"
        ? { status }
        : {
            ...(title !== undefined ? { title } : {}),
            ...(description !== undefined ? { description } : {}),
            ...(dueDate !== undefined ? { dueDate: new Date(dueDate) } : {}),
            ...(status !== undefined ? { status } : {}),
            ...(assigneeId !== undefined ? { assigneeId } : {}),
          }

    const updated = await prisma.task.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] — Admin/HR only
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (auth.role === "EMPLOYEE") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
