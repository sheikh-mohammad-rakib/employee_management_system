import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/attendance/checkin
export async function POST() {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Check for open check-in today (checkOut is null)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existing = await prisma.attendance.findFirst({
      where: {
        userId: auth.userId,
        checkOut: null,
        date: { gte: today, lt: tomorrow },
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already checked in. Please check out first." },
        { status: 409 }
      )
    }

    const record = await prisma.attendance.create({
      data: {
        userId: auth.userId,
        checkIn: new Date(),
        date: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: record }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
