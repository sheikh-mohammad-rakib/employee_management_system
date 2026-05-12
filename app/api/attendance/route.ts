import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/attendance?userId=&date=&startDate=&endDate=
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
    const userId = searchParams.get("userId")
    const date = searchParams.get("date")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Employees can only see their own records
    const targetUserId =
      auth.role === "EMPLOYEE" ? auth.userId : (userId ?? undefined)

    const dateFilter: Record<string, Date> = {}
    if (date) {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      dateFilter.gte = d
      dateFilter.lt = next
    } else {
      if (startDate) dateFilter.gte = new Date(startDate)
      if (endDate) dateFilter.lte = new Date(endDate)
    }

    const records = await prisma.attendance.findMany({
      where: {
        ...(targetUserId ? { userId: targetUserId } : {}),
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json({ success: true, data: records }, { status: 200 })
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
