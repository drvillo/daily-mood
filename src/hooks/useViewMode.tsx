import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useMoodData } from './useMoodData'
import { getToday } from '@/utils/dateUtils'
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
 * Automatically determines initial mode based on whether today is logged
 */
export function ViewModeProvider({ children }: ViewModeProviderProps) {
  const { hasMood, isLoading } = useMoodData()
  const [viewMode, setViewMode] = useState<ViewMode>('log')
  const [isInitialized, setIsInitialized] = useState(false)

  // Determine initial view mode based on whether today is logged
  useEffect(() => {
    if (!isLoading && !isInitialized) {
      const today = getToday()
      const todayLogged = hasMood(today)
      setViewMode(todayLogged ? 'reflect' : 'log')
      setIsInitialized(true)
    }
  }, [hasMood, isLoading, isInitialized])

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

