// Shared TypeScript types for the Employee Management System

export type Role = "ADMIN" | "HR" | "EMPLOYEE"
export type LeaveStatus = "PENDING" | "APPROVED" | "DECLINED"
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string
  email: string
  role: Role
}

export interface AuthUser {
  userId: string
  email: string
  role: Role
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface SafeUser {
  id: string
  name: string
  email: string
  role: Role
  createdAt: Date
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id: string
  userId: string
  checkIn: Date
  checkOut: Date | null
  date: Date
  createdAt: Date
  user?: SafeUser
}

// ─── Leave ───────────────────────────────────────────────────────────────────

export interface LeaveRecord {
  id: string
  userId: string
  startDate: Date
  endDate: Date
  reason: string
  status: LeaveStatus
  createdAt: Date
  updatedAt: Date
  user?: SafeUser
}

// ─── Task ────────────────────────────────────────────────────────────────────

export interface TaskRecord {
  id: string
  title: string
  description: string | null
  dueDate: Date
  status: TaskStatus
  creatorId: string
  assigneeId: string | null
  createdAt: Date
  updatedAt: Date
  creator?: SafeUser
  assignee?: SafeUser | null
}
