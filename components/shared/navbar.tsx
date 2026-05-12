"use client"

import { useState, useEffect } from "react"
import { Bell, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface NavbarProps {
  title: string
}

export function Navbar({ title }: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle theme"
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </button>
        <button
          className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>
      </div>
    </header>
  )
}
