"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, RefreshCw, FileText } from "lucide-react";
import toast from "react-hot-toast";

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

export function AIWeeklyReport() {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateReport() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/weekly-report");
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to generate report");
        return;
      }
      setReport(data.report);
      toast.success("✨ Standup report generated!");
    } catch {
      toast.error("Failed to connect to AI service");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!report) return;
    // Strip bold asterisks for plain text clipboard copy
    const plainText = report.replace(/\*\*(.*?)\*\*/g, "$1");
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    toast.success("Copied standup report to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-sm">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold tracking-tight text-foreground">
                AI Weekly Standup & Progress Report
              </h3>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Live AI
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              One-click synthesis of your completed and in-progress tasks ready
              for your manager.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {report && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition hover:bg-accent"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy Report
                </>
              )}
            </button>
          )}

          <button
            onClick={generateReport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                Drafting Report...
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" />
                {report ? "Refresh Report" : "Generate Standup Report"}
              </>
            )}
          </button>
        </div>
      </div>

      {report && (
        <div className="mt-5 rounded-xl border border-border/60 bg-background/80 p-5 text-sm shadow-inner backdrop-blur-sm">
          <div className="space-y-1.5">{renderFormattedContent(report)}</div>
        </div>
      )}
    </div>
  );
}
