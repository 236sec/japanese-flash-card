'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark'

const THEME_KEY = 'jfc-theme'
const STORAGE_UNAVAILABLE = 'unavailable'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Safely read theme from localStorage — returns null if unavailable.
 */
function readStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    if (raw === 'dark' || raw === 'light') return raw
    return null
  } catch {
    return null
  }
}

/**
 * Safely write theme to localStorage.
 */
function writeStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // localStorage unavailable — silently ignore
  }
}

function getInitialTheme(): Theme {
  // 1. Check localStorage
  const stored = readStoredTheme()
  if (stored) return stored

  // 2. Check system preference
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount (client-side only)
  useEffect(() => {
    setTheme(getInitialTheme())
    setMounted(true)
  }, [])

  // Apply theme class to <html>
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    writeStoredTheme(theme)
  }, [theme, mounted])

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
