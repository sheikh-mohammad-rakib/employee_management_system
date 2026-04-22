"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Clock,
  CalendarOff,
  CheckSquare,
  Users,
  KeyRound,
  LogOut,
  ChevronRight,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"
import type { Role } from "@/types"

interface SidebarProps {
  role: Role
  userName: string
}

const employeeLinks = [
  { href: "/employee",             label: "Dashboard",    icon: LayoutDashboard },
  { href: "/employee/attendance",  label: "Attendance",   icon: Clock },
  { href: "/employee/leaves",      label: "Leaves",       icon: CalendarOff },
  { href: "/employee/tasks",       label: "Tasks",        icon: CheckSquare },
  { href: "/employee/change-password", label: "Change Password", icon: KeyRound },
]

const adminLinks = [
  { href: "/admin",                label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/employees",      label: "Employees",    icon: Users },
  { href: "/admin/attendance",     label: "Attendance",   icon: Clock },
  { href: "/admin/leaves",         label: "Leaves",       icon: CalendarOff },
  { href: "/admin/tasks",          label: "Tasks",        icon: CheckSquare },
]

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const links = role === "EMPLOYEE" ? employeeLinks : adminLinks

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    toast.success("Logged out successfully")
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Building2 className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">EMS</p>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{role.toLowerCase()}</p>
        </div>
      </div>

      {/* User */}
      <div className="border-b border-sidebar-border px-6 py-4">
        <p className="text-xs text-sidebar-foreground/50 uppercase tracking-wider">Signed in as</p>
        <p className="mt-0.5 truncate text-sm font-medium">{userName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/employee" && href !== "/admin" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="size-3 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
