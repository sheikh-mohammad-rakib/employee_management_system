import type { LeaveStatus, TaskStatus } from "@/types"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: LeaveStatus | TaskStatus
  className?: string
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  PENDING:     { label: "Pending",     classes: "bg-warning/15 text-warning-foreground border-warning/30" },
  APPROVED:    { label: "Approved",    classes: "bg-success/15 text-success border-success/30" },
  DECLINED:    { label: "Declined",    classes: "bg-destructive/15 text-destructive border-destructive/30" },
  TODO:        { label: "To Do",       classes: "bg-muted text-muted-foreground border-border" },
  IN_PROGRESS: { label: "In Progress", classes: "bg-primary/10 text-primary border-primary/20" },
  DONE:        { label: "Done",        classes: "bg-success/15 text-success border-success/30" },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, classes: "bg-muted text-muted-foreground" }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  )
}
