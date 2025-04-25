"use client"

import { PomodoroTimer } from "@/components/pomodoro-timer"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect, useState } from "react"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Ensure theme is only applied after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-background transition-colors duration-500">
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <div className="w-full max-w-md">
            <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-foreground transition-colors duration-300">
              Pomodoro Tracker
            </h1>
            <PomodoroTimer />
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

