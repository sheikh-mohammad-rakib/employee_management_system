import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const createLeaveSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
})

// GET /api/leaves
export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const leaves = await prisma.leave.findMany({
      where: auth.role === "EMPLOYEE" ? { userId: auth.userId } : {},
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, data: leaves }, { status: 200 })
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/leaves
export async function POST(request: Request) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createLeaveSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { startDate, endDate, reason } = parsed.data

    const leave = await prisma.leave.create({
      data: {
        userId: auth.userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: "PENDING",
      },
    })

    return NextResponse.json({ success: true, data: leave }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
