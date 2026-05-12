import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { StatusBadge } from "@/components/shared/status-badge"

export default async function AdminAttendancePage() {
  const auth = await getAuthUser()
  if (!auth || auth.role === "EMPLOYEE") redirect("/employee")

  const records = await prisma.attendance.findMany({
    orderBy: { date: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  })

  function calcDuration(checkIn: Date, checkOut: Date | null) {
    if (!checkOut) return "—"
    const ms = checkOut.getTime() - checkIn.getTime()
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    return `${h}h ${m}m`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Attendance Records
        </h2>
        <p className="mt-1 text-muted-foreground">
          View all employee attendance data.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold">All Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Employee
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Check In
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Duration
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No attendance records yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium">{r.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(r.checkIn).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {r.checkOut
                        ? new Date(r.checkOut).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {calcDuration(r.checkIn, r.checkOut)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={r.checkOut ? "DONE" : "IN_PROGRESS"}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
