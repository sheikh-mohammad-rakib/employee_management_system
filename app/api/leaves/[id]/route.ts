import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const patchLeaveSchema = z.object({
  status: z.enum(["APPROVED", "DECLINED"]),
})

// PATCH /api/leaves/[id] — Admin/HR approve or decline
export async function PATCH(
  request: Request,
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
    const body = await request.json()
    const parsed = patchLeaveSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const leave = await prisma.leave.findUnique({ where: { id } })
    if (!leave) {
      return NextResponse.json({ success: false, error: "Leave not found" }, { status: 404 })
    }

    const updated = await prisma.leave.update({
      where: { id },
      data: { status: parsed.data.status },
    })

    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/leaves/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const leave = await prisma.leave.findUnique({ where: { id } })
    if (!leave) {
      return NextResponse.json({ success: false, error: "Leave not found" }, { status: 404 })
    }

    // Employee can only delete own PENDING leaves
    if (auth.role === "EMPLOYEE") {
      if (leave.userId !== auth.userId) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
      }
      if (leave.status !== "PENDING") {
        return NextResponse.json(
          { success: false, error: "Only pending leaves can be deleted" },
          { status: 409 }
        )
      }
    }

    await prisma.leave.delete({ where: { id } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
