import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/attendance/checkout
export async function POST() {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const openRecord = await prisma.attendance.findFirst({
      where: { userId: auth.userId, checkOut: null },
      orderBy: { checkIn: "desc" },
    })

    if (!openRecord) {
      return NextResponse.json(
        { success: false, error: "No active check-in found" },
        { status: 404 }
      )
    }

    const updated = await prisma.attendance.update({
      where: { id: openRecord.id },
      data: { checkOut: new Date() },
    })

    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
