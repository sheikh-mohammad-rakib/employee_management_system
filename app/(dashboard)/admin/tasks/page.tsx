"use client"

import { useEffect, useState, useCallback } from "react"
import toast from "react-hot-toast"
import { Plus, Pencil, Trash2, CheckSquare, Sparkles } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import type { TaskStatus } from "@/types"

interface User {
  id: string
  name: string
  email: string
}
interface Task {
  id: string
  title: string
  description: string | null
  dueDate: string
  status: TaskStatus
  assignee: User | null
  creator: User
}

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"]

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    assigneeId: "",
    status: "TODO" as TaskStatus,
  })
  const [submitting, setSubmitting] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "ALL">("ALL")

  async function handleGenerateAIDescription() {
    if (!form.title.trim()) {
      toast.error("Please enter a task title first")
      return
    }
    setGeneratingAI(true)
    try {
      const selectedAssignee = users.find((u) => u.id === form.assigneeId)
      const res = await fetch("/api/ai/generate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          assigneeName: selectedAssignee?.name,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.error || "AI generation failed")
        return
      }
      setForm((f) => ({ ...f, description: data.description }))
      toast.success("✨ AI generated task description!")
    } catch {
      toast.error("Failed to connect to AI service")
    } finally {
      setGeneratingAI(false)
    }
  }

  const fetchAll = useCallback(async () => {
    const [tasksRes, usersRes] = await Promise.all([
      fetch("/api/tasks"),
      fetch("/api/users"),
    ])
    const [tasksData, usersData] = await Promise.all([
      tasksRes.json(),
      usersRes.json(),
    ])
    if (tasksData.success) setTasks(tasksData.data)
    if (usersData.success) setUsers(usersData.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  function openCreate() {
    setEditTask(null)
    setForm({
      title: "",
      description: "",
      dueDate: "",
      assigneeId: "",
      status: "TODO",
    })
    setShowForm(true)
  }
  function openEdit(task: Task) {
    setEditTask(task)
    setForm({
      title: task.title,
      description: task.description ?? "",
      dueDate: task.dueDate.slice(0, 10),
      assigneeId: task.assignee?.id ?? "",
      status: task.status,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const url = editTask ? `/api/tasks/${editTask.id}` : "/api/tasks"
      const method = editTask ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error)
        return
      }
      toast.success(editTask ? "Task updated!" : "Task created!")
      setShowForm(false)
      await fetchAll()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error)
      return
    }
    toast.success("Task deleted")
    await fetchAll()
  }

  if (loading) return <LoadingSpinner fullPage />

  const filtered =
    filterStatus === "ALL"
      ? tasks
      : tasks.filter((t) => t.status === filterStatus)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="mt-1 text-muted-foreground">
            Create, assign, and manage tasks.
          </p>
        </div>
        <button
          id="admin-new-task"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Plus className="size-4" /> New Task
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">
            {editTask ? "Edit Task" : "New Task"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-task-title"
                  className="text-sm font-medium"
                >
                  Title
                </label>
                <input
                  id="admin-task-title"
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
                <label htmlFor="admin-task-due" className="text-sm font-medium">
                  Due Date
                </label>
                <input
                  id="admin-task-due"
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-task-assignee"
                  className="text-sm font-medium"
                >
                  Assign To
                </label>
                <select
                  id="admin-task-assignee"
                  value={form.assigneeId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, assigneeId: e.target.value }))
                  }
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-task-status"
                  className="text-sm font-medium"
                >
                  Status
                </label>
                <select
                  id="admin-task-status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as TaskStatus,
                    }))
                  }
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="admin-task-desc" className="text-sm font-medium">
                  Description (optional)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAIDescription}
                  disabled={generatingAI || !form.title.trim()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-40"
                >
                  <Sparkles className="size-3.5" />
                  {generatingAI ? "Generating..." : "Generate with AI"}
                </button>
              </div>
              <textarea
                id="admin-task-desc"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Task details..."
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {submitting
                  ? "Saving…"
                  : editTask
                    ? "Update Task"
                    : "Create Task"}
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

      {/* Filter */}
      <div className="flex gap-2">
        {(["ALL", ...STATUS_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${filterStatus === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"}`}
          >
            {s === "ALL" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Task
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    <CheckSquare className="mx-auto mb-2 size-8 opacity-30" />
                    No tasks found.
                  </td>
                </tr>
              ) : (
                filtered.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="max-w-xs truncate text-xs text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {task.assignee?.name ?? "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(task)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="size-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="flex items-center gap-1 text-xs text-destructive hover:underline"
                        >
                          <Trash2 className="size-3" /> Delete
                        </button>
                      </div>
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
