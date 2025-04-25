"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Settings2, Bell, Coffee, BellRing } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

type TimerMode = "pomodoro" | "shortBreak" | "longBreak"

interface TimerSettings {
  pomodoro: number
  shortBreak: number
  longBreak: number
}

export function PomodoroTimer() {
  const { theme } = useTheme()
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [timerMode, setTimerMode] = useState<TimerMode>("pomodoro")
  const [settings, setSettings] = useState<TimerSettings>({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [autoStartBreaks, setAutoStartBreaks] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Get current mode duration in minutes
  const getCurrentModeDuration = () => {
    return settings[timerMode]
  }

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progress = (timeLeft / (getCurrentModeDuration() * 60)) * 100

  // Switch timer mode
  const switchMode = (mode: TimerMode) => {
    setTimerMode(mode)
    setTimeLeft(settings[mode] * 60)
    pauseTimer()
  }

  // Start timer
  const startTimer = () => {
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current as NodeJS.Timeout)
          setIsRunning(false)
          handleTimerComplete()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
  }

  // Handle timer completion
  const handleTimerComplete = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch((e) => console.error("Error playing sound:", e))
    }

    if (timerMode === "pomodoro") {
      setCompletedSessions((prev) => prev + 1)
      const nextMode = completedSessions % 4 === 3 ? "longBreak" : "shortBreak"
      setTimerMode(nextMode)
      setTimeLeft(settings[nextMode] * 60)
      if (autoStartBreaks) {
        setTimeout(() => startTimer(), 1000)
      }
    } else {
      setTimerMode("pomodoro")
      setTimeLeft(settings.pomodoro * 60)
      if (autoStartBreaks) {
        setTimeout(() => startTimer(), 1000)
      }
    }
  }

  // Pause timer
  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }

  // Reset timer
  const resetTimer = () => {
    pauseTimer()
    setTimeLeft(settings[timerMode] * 60)
  }

  // Apply custom duration
  const applySettings = () => {
    setTimeLeft(settings[timerMode] * 60)
    setShowSettings(false)
  }

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Get mode icon
  const getModeIcon = () => {
    switch (timerMode) {
      case "pomodoro":
        return <Bell className="h-5 w-5" />
      case "shortBreak":
        return <Coffee className="h-5 w-5" />
      case "longBreak":
        return <Coffee className="h-5 w-5" />
    }
  }

  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-background/50 shadow-xl transition-all duration-500">
      <CardContent className="p-6">
        <div className="mb-6">
          <Tabs value={timerMode} onValueChange={(v) => switchMode(v as TimerMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="pomodoro"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Pomodoro
              </TabsTrigger>
              <TabsTrigger
                value="shortBreak"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Short Break
              </TabsTrigger>
              <TabsTrigger
                value="longBreak"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Long Break
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="relative mb-8 flex justify-center">
          <div className="relative h-64 w-64">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full border-8 border-muted/30"></div>

            {/* Progress circle */}
            <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <motion.circle
                initial={{ pathLength: 1 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="289.027"
                strokeDashoffset="0"
              />
            </svg>

            {/* Glowing effect when running */}
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [0.85, 0.9, 0.85],
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  className={`absolute inset-0 rounded-full ${
                    theme === "dark"
                      ? "shadow-[0_0_30px_15px_rgba(var(--primary-rgb),0.3)]"
                      : "shadow-[0_0_30px_15px_rgba(var(--primary-rgb),0.15)]"
                  } transition-shadow duration-300`}
                />
              )}
            </AnimatePresence>

            {/* Timer display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                key={timeLeft}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-5xl font-bold text-foreground"
              >
                {formatTime(timeLeft)}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Session counter */}
        <div className="mb-6 flex justify-center">
          <Badge variant="outline" className="px-3 py-1 text-sm">
            <BellRing className="mr-1 h-3 w-3" />
            {completedSessions} {completedSessions === 1 ? "session" : "sessions"} completed
          </Badge>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {!isRunning ? (
              <Button
                onClick={startTimer}
                size="lg"
                className="h-14 w-14 rounded-full p-0 transition-all duration-300 hover:shadow-lg"
                disabled={timeLeft === 0}
              >
                <Play className="h-6 w-6" />
                <span className="sr-only">Start</span>
              </Button>
            ) : (
              <Button
                onClick={pauseTimer}
                variant="secondary"
                size="lg"
                className="h-14 w-14 rounded-full p-0 transition-all duration-300 hover:shadow-lg"
              >
                <Pause className="h-6 w-6" />
                <span className="sr-only">Pause</span>
              </Button>
            )}
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={resetTimer}
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full p-0 transition-all duration-300 hover:shadow-lg"
            >
              <RotateCcw className="h-6 w-6" />
              <span className="sr-only">Reset</span>
            </Button>
          </motion.div>

          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 w-14 rounded-full p-0 transition-all duration-300 hover:shadow-lg"
                >
                  <Settings2 className="h-6 w-6" />
                  <span className="sr-only">Settings</span>
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
              </DialogHeader>
              <div className="py-6">
                <div className="mb-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Pomodoro: {settings.pomodoro} minutes</Label>
                    <Slider
                      value={[settings.pomodoro]}
                      min={5}
                      max={60}
                      step={5}
                      onValueChange={(value) => setSettings({ ...settings, pomodoro: value[0] })}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Short Break: {settings.shortBreak} minutes</Label>
                    <Slider
                      value={[settings.shortBreak]}
                      min={1}
                      max={15}
                      step={1}
                      onValueChange={(value) => setSettings({ ...settings, shortBreak: value[0] })}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Long Break: {settings.longBreak} minutes</Label>
                    <Slider
                      value={[settings.longBreak]}
                      min={5}
                      max={30}
                      step={5}
                      onValueChange={(value) => setSettings({ ...settings, longBreak: value[0] })}
                      className="py-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-breaks">Auto-start breaks</Label>
                    <Switch id="auto-breaks" checked={autoStartBreaks} onCheckedChange={setAutoStartBreaks} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-enabled">Sound notifications</Label>
                    <Switch id="sound-enabled" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={applySettings}>Apply</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

