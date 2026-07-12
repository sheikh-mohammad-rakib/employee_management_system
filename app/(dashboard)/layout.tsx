import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { Sidebar } from "@/components/shared/sidebar"
import { Navbar } from "@/components/shared/navbar"
import { prisma } from "@/lib/prisma"
import { Toaster } from "react-hot-toast"
import { AICopilot } from "@/components/shared/ai-copilot"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const auth = await getAuthUser()
  if (!auth) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { name: true, role: true },
  })

  if (!user) redirect("/login")

  const title =
    auth.role === "EMPLOYEE"
      ? "Employee Portal"
      : auth.role === "HR"
        ? "HR Portal"
        : "Admin Portal"

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={user.role} userName={user.name} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar title={title} />
        <main className="animate-fade-in flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
      <AICopilot />
    </div>
  )
}
