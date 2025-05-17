
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render a placeholder or null until theme is known client-side
    return <div className={cn("h-10 w-10", className)} {...props}></div>;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
    if (buttonRef.current) {
      const btn = buttonRef.current;
      // Remove class first to ensure animation can re-trigger if clicked quickly
      btn.classList.remove('animate-spin-short');
      // Force reflow to allow re-triggering animation
      void btn.offsetWidth; 
      btn.classList.add('animate-spin-short');
      
      // Clean up class after animation using onanimationend
      const handleAnimationEnd = () => {
        if (btn.classList.contains('animate-spin-short')) {
           btn.classList.remove('animate-spin-short');
        }
        btn.removeEventListener('animationend', handleAnimationEnd);
      };
      btn.addEventListener('animationend', handleAnimationEnd);
    }
  }

  return (
    <div className={className} {...props}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </div>
  )
}
