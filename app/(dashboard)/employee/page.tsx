import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Clock, CalendarOff, CheckSquare, TrendingUp } from "lucide-react"

export default async function EmployeeDashboard() {
  const auth = await getAuthUser()
  if (!auth) redirect("/login")

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [todayAttendance, activeTasks, pendingLeaves] = await Promise.all([
    prisma.attendance.findFirst({
      where: { userId: auth.userId, date: { gte: today, lt: tomorrow } },
      orderBy: { checkIn: "desc" },
    }),
    prisma.task.count({
      where: { assigneeId: auth.userId, status: { not: "DONE" } },
    }),
    prisma.leave.count({
      where: { userId: auth.userId, status: "PENDING" },
    }),
  ])

  const isCheckedIn = todayAttendance && !todayAttendance.checkOut
  const isCheckedOut = todayAttendance && todayAttendance.checkOut

  const stats = [
    {
      label: "Today's Status",
      value: isCheckedIn ? "Checked In" : isCheckedOut ? "Checked Out" : "Not Checked In",
      icon: Clock,
      color: isCheckedIn ? "text-success" : isCheckedOut ? "text-muted-foreground" : "text-destructive",
      bg: isCheckedIn ? "bg-success/10" : isCheckedOut ? "bg-muted" : "bg-destructive/10",
    },
    {
      label: "Active Tasks",
      value: activeTasks.toString(),
      icon: CheckSquare,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending Leaves",
      value: pendingLeaves.toString(),
      icon: CalendarOff,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Performance",
      value: "Good",
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Good day! 👋</h2>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s your workspace overview for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
              </div>
              <div className={`flex size-10 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`size-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a
            href="/employee/attendance"
            className="flex items-center gap-3 rounded-lg border border-border p-4 transition hover:bg-accent"
          >
            <Clock className="size-5 text-primary" />
            <span className="text-sm font-medium">
              {isCheckedIn ? "Check Out" : "Check In"}
            </span>
          </a>
          <a
            href="/employee/leaves"
            className="flex items-center gap-3 rounded-lg border border-border p-4 transition hover:bg-accent"
          >
            <CalendarOff className="size-5 text-warning" />
            <span className="text-sm font-medium">Request Leave</span>
          </a>
          <a
            href="/employee/tasks"
            className="flex items-center gap-3 rounded-lg border border-border p-4 transition hover:bg-accent"
          >
            <CheckSquare className="size-5 text-success" />
            <span className="text-sm font-medium">View Tasks</span>
          </a>
        </div>
      </div>
    </div>
  )
}
