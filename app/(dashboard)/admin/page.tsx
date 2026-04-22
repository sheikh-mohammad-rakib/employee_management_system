import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Users, Clock, CalendarOff, CheckSquare, TrendingUp } from "lucide-react"

export default async function AdminDashboard() {
  const auth = await getAuthUser()
  if (!auth || auth.role === "EMPLOYEE") redirect("/employee")

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [totalEmployees, presentToday, pendingLeaves, openTasks] = await Promise.all([
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.attendance.count({
      where: { date: { gte: today, lt: tomorrow } },
    }),
    prisma.leave.count({ where: { status: "PENDING" } }),
    prisma.task.count({ where: { status: { not: "DONE" } } }),
  ])

  const stats = [
    { label: "Total Employees", value: totalEmployees.toString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Present Today", value: presentToday.toString(), icon: Clock, color: "text-success", bg: "bg-success/10" },
    { label: "Pending Leaves", value: pendingLeaves.toString(), icon: CalendarOff, color: "text-warning", bg: "bg-warning/10" },
    { label: "Open Tasks", value: openTasks.toString(), icon: CheckSquare, color: "text-destructive", bg: "bg-destructive/10" },
  ]

  // Recent leaves
  const recentLeaves = await prisma.leave.findMany({
    where: { status: "PENDING" },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Overview 📊</h2>
        <p className="mt-1 text-muted-foreground">
          {new Date().toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
              </div>
              <div className={`flex size-10 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`size-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Leave Requests */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="font-semibold">Pending Leave Requests</h3>
            <a href="/admin/leaves" className="text-xs text-primary hover:underline">View all →</a>
          </div>
          <div className="divide-y divide-border">
            {recentLeaves.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">No pending requests</p>
            ) : (
              recentLeaves.map((l) => (
                <div key={l.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium">{l.user.name}</p>
                    <p className="text-xs text-muted-foreground">{l.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}
                    </p>
                    <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning-foreground">
                      Pending
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Quick Actions</h3>
          <div className="grid gap-3">
            {[
              { href: "/admin/employees", label: "Manage Employees", icon: Users, color: "text-primary", bg: "bg-primary/10" },
              { href: "/admin/leaves", label: "Review Leaves", icon: CalendarOff, color: "text-warning", bg: "bg-warning/10" },
              { href: "/admin/tasks", label: "Assign Tasks", icon: CheckSquare, color: "text-success", bg: "bg-success/10" },
              { href: "/admin/attendance", label: "View Attendance", icon: TrendingUp, color: "text-muted-foreground", bg: "bg-muted" },
            ].map(({ href, label, icon: Icon, color, bg }) => (
              <a key={href} href={href}
                className="flex items-center gap-3 rounded-lg border border-border p-4 transition hover:bg-accent">
                <div className={`flex size-8 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className={`size-4 ${color}`} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
