"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="lg"
        className="relative h-12 w-12 rounded-full border-2 border-primary/20 shadow-md"
      >
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const toggleTheme = () => {
    console.log("Current theme:", theme)
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="outline"
        size="lg"
        onClick={toggleTheme}
        className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-primary/20 shadow-md transition-all duration-300"
      >
        <span className="sr-only">Toggle theme</span>
        <div className="relative h-full w-full">
          <motion.div
            initial={false}
            animate={{
              y: theme === "dark" ? 0 : -40,
              opacity: theme === "dark" ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon className="h-5 w-5" />
          </motion.div>

          <motion.div
            initial={false}
            animate={{
              y: theme === "light" ? 0 : 40,
              opacity: theme === "light" ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        </div>
      </Button>
    </motion.div>
  )
}

