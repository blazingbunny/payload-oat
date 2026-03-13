'use client'

import { useEffect } from 'react'

// Adds class="dark" to <html> so shadcn's .dark CSS variables from globals.css
// apply automatically in the admin. When the preset changes, globals.css updates
// and the admin picks up the new palette without any manual changes here.
export function DarkModeProvider({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    return () => document.documentElement.classList.remove('dark')
  }, [])

  return <>{children}</>
}
