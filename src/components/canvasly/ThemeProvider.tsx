
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return null on the server to avoid hydration mismatch
    // The theme will be applied on the client after mount
    return null
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
