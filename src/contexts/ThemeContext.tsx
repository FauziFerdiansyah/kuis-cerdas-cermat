'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'

interface ThemeContextType {
  theme: 'light'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Apply light theme to document
  useEffect(() => {
    // Force remove dark class and add light class
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}