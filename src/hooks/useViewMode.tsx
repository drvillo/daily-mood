import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { ViewMode } from '@/types'

interface ViewModeContextValue {
  viewMode: ViewMode
  switchToLog: () => void
  switchToReflect: () => void
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null)

interface ViewModeProviderProps {
  children: ReactNode
}

/**
 * Provider for view mode state (Log vs Reflect)
 * Always starts in LogView mode
 */
export function ViewModeProvider({ children }: ViewModeProviderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('log')

  const switchToLog = useCallback(() => {
    setViewMode('log')
  }, [])

  const switchToReflect = useCallback(() => {
    setViewMode('reflect')
  }, [])

  const value: ViewModeContextValue = {
    viewMode,
    switchToLog,
    switchToReflect,
  }

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  )
}

/**
 * Hook to access view mode from context
 */
export function useViewMode(): ViewModeContextValue {
  const context = useContext(ViewModeContext)
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider')
  }
  return context
}


