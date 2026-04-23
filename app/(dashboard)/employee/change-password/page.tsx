"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { KeyRound, Send, Lock } from "lucide-react"

export default function ChangePasswordPage() {
  const [step, setStep] = useState<"email" | "reset">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error)
        return
      }
      setDevOtp(data.data.otp) // shown in dev mode
      toast.success("OTP sent! Check the response below (dev mode).")
      setStep("reset")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error)
        return
      }
      toast.success("Password changed successfully!")
      setStep("email")
      setEmail("")
      setOtp("")
      setNewPassword("")
      setConfirmPassword("")
      setDevOtp(null)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Change Password</h2>
        <p className="mt-1 text-muted-foreground">
          Update your account password using OTP verification.
        </p>
      </div>

      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <KeyRound className="size-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Password Reset</p>
            <p className="text-sm text-muted-foreground">
              Step {step === "email" ? "1" : "2"} of 2
            </p>
          </div>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="otp-email" className="text-sm font-medium">
                Your Email
              </label>
              <input
                id="otp-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Send className="size-4" />
              )}
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {devOtp && (
              <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
                <p className="font-medium text-warning-foreground">
                  Dev Mode OTP:
                </p>
                <p className="mt-0.5 font-mono text-lg font-bold tracking-widest">
                  {devOtp}
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="otp-code" className="text-sm font-medium">
                OTP Code
              </label>
              <input
                id="otp-code"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm tracking-widest focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="new-pass" className="text-sm font-medium">
                New Password
              </label>
              <input
                id="new-pass"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm-pass" className="text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="confirm-pass"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Lock className="size-4" />
                )}
                Change Password
              </button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-accent"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
