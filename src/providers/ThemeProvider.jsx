/**
 * ThemeProvider — Centralized theme management.
 *
 * Moves theme state out of Navbar into a global provider.
 * Provides theme, toggleTheme, and isDark through context.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Permanently remove light mode class to enforce dark mode globally
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
    window.localStorage.setItem('theme', 'dark')
  }, [])

  const value = useMemo(
    () => ({
      theme: 'dark',
      isDark: true,
      isLight: false,
      toggleTheme: () => {}, // No-op
      setTheme: () => {},    // No-op
    }),
    []
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
