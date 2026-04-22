"use client"

import { useEffect, useState, useCallback } from "react"
import toast from "react-hot-toast"
import { Clock, LogIn, LogOut } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { LoadingSpinner } from "@/components/shared/loading-spinner"

interface Attendance {
  id: string
  checkIn: string
  checkOut: string | null
  date: string
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: "short", year: "numeric", month: "short", day: "numeric" })
}
function calcDuration(checkIn: string, checkOut: string | null) {
  if (!checkOut) return "—"
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}h ${m}m`
}

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchRecords = useCallback(async () => {
    const res = await fetch("/api/attendance")
    const data = await res.json()
    if (data.success) setRecords(data.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const hasOpenCheckIn = records.some((r) => !r.checkOut)

  async function handleAction(action: "checkin" | "checkout") {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/attendance/${action}`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success(action === "checkin" ? "Checked in successfully!" : "Checked out successfully!")
      await fetchRecords()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
        <p className="mt-1 text-muted-foreground">Track your daily check-in and check-out.</p>
      </div>

      {/* Action Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-full ${hasOpenCheckIn ? "bg-success/15" : "bg-muted"}`}>
              <Clock className={`size-5 ${hasOpenCheckIn ? "text-success" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="font-medium">
                {hasOpenCheckIn ? "You are checked in" : "You are not checked in"}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <button
            id={hasOpenCheckIn ? "checkout-btn" : "checkin-btn"}
            onClick={() => handleAction(hasOpenCheckIn ? "checkout" : "checkin")}
            disabled={actionLoading}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold shadow-sm transition disabled:opacity-50 ${
              hasOpenCheckIn
                ? "bg-destructive text-destructive-foreground hover:opacity-90"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {actionLoading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : hasOpenCheckIn ? (
              <LogOut className="size-4" />
            ) : (
              <LogIn className="size-4" />
            )}
            {hasOpenCheckIn ? "Check Out" : "Check In"}
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold">Attendance History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Check In</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Check Out</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Duration</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No attendance records yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{formatDate(r.date)}</td>
                    <td className="px-6 py-4">{formatTime(r.checkIn)}</td>
                    <td className="px-6 py-4">{r.checkOut ? formatTime(r.checkOut) : "—"}</td>
                    <td className="px-6 py-4">{calcDuration(r.checkIn, r.checkOut)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.checkOut ? "DONE" : "IN_PROGRESS"} />
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
