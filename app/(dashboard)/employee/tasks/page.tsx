"use client"

import { useEffect, useState, useCallback } from "react"
import toast from "react-hot-toast"
import { Plus, CheckSquare } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import type { TaskStatus } from "@/types"

interface Task {
  id: string
  title: string
  description: string | null
  dueDate: string
  status: TaskStatus
}

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" })
  const [submitting, setSubmitting] = useState(false)

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks")
    const data = await res.json()
    if (data.success) setTasks(data.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error)
        return
      }
      toast.success("Task created!")
      setForm({ title: "", description: "", dueDate: "" })
      setShowForm(false)
      await fetchTasks()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  async function markDone(id: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error)
      return
    }
    toast.success("Task marked as done!")
    await fetchTasks()
  }

  if (loading) return <LoadingSpinner fullPage />

  const grouped: Record<TaskStatus, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  }
  tasks.forEach((t) => grouped[t.status].push(t))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Tasks</h2>
          <p className="mt-1 text-muted-foreground">
            Track and manage your assigned tasks.
          </p>
        </div>
        <button
          id="new-task-btn"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Plus className="size-4" />
          New Task
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">New Task</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="task-title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="task-title"
                type="text"
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Task title"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="task-desc" className="text-sm font-medium">
                Description (optional)
              </label>
              <textarea
                id="task-desc"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Task details..."
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="task-due" className="text-sm font-medium">
                Due Date
              </label>
              <input
                id="task-due"
                type="date"
                required
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                Create Task
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border px-5 py-2 text-sm font-medium transition hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban-style columns */}
      <div className="grid gap-4 lg:grid-cols-3">
        {(["IN_PROGRESS", "TODO", "DONE"] as TaskStatus[]).map((status) => (
          <div
            key={status}
            className="rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">
                {status === "IN_PROGRESS"
                  ? "In Progress"
                  : status === "TODO"
                    ? "To Do"
                    : "Done"}
              </h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {grouped[status].length}
              </span>
            </div>
            <div className="space-y-3 p-4">
              {grouped[status].length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
                  <CheckSquare className="mb-2 size-6 opacity-30" />
                  <span>No tasks</span>
                </div>
              ) : (
                grouped[status].map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-border bg-background p-4 transition hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{task.title}</p>
                      <StatusBadge status={task.status} />
                    </div>
                    {task.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    {status !== "DONE" && (
                      <button
                        onClick={() => markDone(task.id)}
                        className="mt-3 w-full rounded-md border border-success/30 bg-success/10 py-1.5 text-xs font-medium text-success transition hover:bg-success/20"
                      >
                        Mark as Done
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
