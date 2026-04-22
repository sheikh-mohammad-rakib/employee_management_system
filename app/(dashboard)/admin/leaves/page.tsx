"use client"

import { useEffect, useState, useCallback } from "react"
import toast from "react-hot-toast"
import { Check, X, CalendarOff } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import type { LeaveStatus } from "@/types"

interface Leave {
  id: string
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  user: { name: string; email: string }
}

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<LeaveStatus | "ALL">("ALL")

  const fetchLeaves = useCallback(async () => {
    const res = await fetch("/api/leaves")
    const data = await res.json()
    if (data.success) setLeaves(data.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchLeaves() }, [fetchLeaves])

  async function updateStatus(id: string, status: "APPROVED" | "DECLINED") {
    const res = await fetch(`/api/leaves/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); return }
    toast.success(`Leave ${status.toLowerCase()}!`)
    await fetchLeaves()
  }

  if (loading) return <LoadingSpinner fullPage />

  const filtered = filter === "ALL" ? leaves : leaves.filter((l) => l.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Leave Requests</h2>
        <p className="mt-1 text-muted-foreground">Approve or decline employee leave requests.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["ALL", "PENDING", "APPROVED", "DECLINED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg border px-4 py-2 text-xs font-medium transition ${
              filter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-accent"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            <span className="ml-1.5 text-muted-foreground">
              ({s === "ALL" ? leaves.length : leaves.filter((l) => l.status === s).length})
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Employee</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Period</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Reason</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    <CalendarOff className="mx-auto mb-2 size-8 opacity-30" />
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium">{l.user.name}</p>
                      <p className="text-xs text-muted-foreground">{l.user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-muted-foreground">{l.reason}</td>
                    <td className="px-6 py-4"><StatusBadge status={l.status} /></td>
                    <td className="px-6 py-4">
                      {l.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(l.id, "APPROVED")}
                            className="flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success transition hover:bg-success/20"
                          >
                            <Check className="size-3" /> Approve
                          </button>
                          <button
                            onClick={() => updateStatus(l.id, "DECLINED")}
                            className="flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/20"
                          >
                            <X className="size-3" /> Decline
                          </button>
                        </div>
                      )}
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
