import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Users } from "lucide-react"

export default async function AdminEmployeesPage() {
  const auth = await getAuthUser()
  if (!auth || auth.role === "EMPLOYEE") redirect("/employee")

  const employees = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
        <p className="mt-1 text-muted-foreground">
          {employees.length} total team members
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold">All Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Role
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    <Users className="mx-auto mb-2 size-8 opacity-30" />
                    No employees yet.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {emp.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          emp.role === "ADMIN"
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : emp.role === "HR"
                              ? "border-warning/30 bg-warning/10 text-warning-foreground"
                              : "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(emp.createdAt).toLocaleDateString()}
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
