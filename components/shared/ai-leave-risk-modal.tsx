"use client";

import { useState } from "react";
import { Sparkles, X, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

interface AILeaveRiskModalProps {
  leave: {
    id: string;
    startDate: string;
    endDate: string;
    reason: string;
    user: { id: string; name: string; email: string };
  };
  onUpdateStatus: (id: string, status: "APPROVED" | "DECLINED") => Promise<void>;
}

function renderFormattedContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <div
        key={lineIdx}
        className={`leading-relaxed ${
          line.trim().startsWith("-") || line.trim().startsWith("*")
            ? "pl-3 text-muted-foreground"
            : line.trim() === ""
            ? "h-2"
            : ""
        }`}
      >
        {parts.map((part, partIdx) => {
          if (
            part.startsWith("**") &&
            part.endsWith("**") &&
            part.length >= 4
          ) {
            return (
              <strong
                key={partIdx}
                className="block font-bold text-foreground sm:inline"
              >
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </div>
    );
  });
}

export function AILeaveRiskModal({
  leave,
  onUpdateStatus,
}: AILeaveRiskModalProps) {
  const [open, setOpen] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  async function openAndAnalyze() {
    setOpen(true);
    if (analysis) return; // Already analyzed

    setLoading(true);
    try {
      const res = await fetch("/api/ai/leave-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveId: leave.id,
          userId: leave.user.id,
          startDate: leave.startDate,
          endDate: leave.endDate,
          employeeName: leave.user.name,
          reason: leave.reason,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to analyze leave risk");
        return;
      }
      setAnalysis(data.analysis);
    } catch {
      toast.error("Could not reach AI service");
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(status: "APPROVED" | "DECLINED") {
    setProcessingAction(true);
    try {
      await onUpdateStatus(leave.id, status);
      setOpen(false);
    } finally {
      setProcessingAction(false);
    }
  }

  return (
    <>
      <button
        onClick={openAndAnalyze}
        className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
        title="Analyze leave deadline & task conflicts with AI"
      >
        <Sparkles className="size-3.5" />
        AI Risk Check
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-primary/5 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    AI Leave Conflict & Risk Assessment
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Employee: {leave.user.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Leave Overview */}
            <div className="border-b border-border/60 bg-muted/20 px-6 py-3 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">Dates:</strong>{" "}
                {new Date(leave.startDate).toLocaleDateString()} —{" "}
                {new Date(leave.endDate).toLocaleDateString()}
              </p>
              <p className="mt-0.5">
                <strong className="text-foreground">Reason:</strong>{" "}
                {leave.reason}
              </p>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 text-sm">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="mt-3 text-xs font-medium text-muted-foreground">
                    Inspecting active task deadlines & schedule risk...
                  </p>
                </div>
              ) : analysis ? (
                <div className="space-y-2 rounded-xl border border-border/60 bg-background/80 p-4 shadow-inner">
                  {renderFormattedContent(analysis)}
                </div>
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  No assessment data loaded.
                </p>
              )}
            </div>

            {/* Footer with immediate actions */}
            <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-foreground transition hover:bg-accent"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDecision("DECLINED")}
                  disabled={processingAction || loading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/20 disabled:opacity-40"
                >
                  <X className="size-3.5" />
                  Decline Leave
                </button>
                <button
                  onClick={() => handleDecision("APPROVED")}
                  disabled={processingAction || loading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-xs font-semibold text-success-foreground transition hover:opacity-90 disabled:opacity-40"
                >
                  <Check className="size-3.5" />
                  Approve Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
