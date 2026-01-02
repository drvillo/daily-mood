import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import type { Theme } from '@/types'

const THEME_STORAGE_KEY = 'mood-tracker-theme'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

/**
 * Theme provider component
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load theme from localStorage or default to light
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      return (stored === 'dark' ? 'dark' : 'light') as Theme
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    // Apply theme class to root element
    document.documentElement.setAttribute('data-theme', theme)
    
    // Save to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch (error) {
      console.warn('Failed to save theme preference:', error)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

