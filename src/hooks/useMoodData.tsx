import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { loadMoodData, saveMoodData, setMoodForDate } from '@/utils/storage'
import type { Mood, MoodData } from '@/types'

interface MoodContextValue {
  moods: MoodData
  setMood: (date: string, mood: Mood) => void
  getMood: (date: string) => Mood | null
  hasMood: (date: string) => boolean
  isLoading: boolean
  error: Error | null
}

const MoodContext = createContext<MoodContextValue | null>(null)

interface MoodProviderProps {
  children: ReactNode
}

/**
 * Provider component that manages mood data with localStorage persistence
 */
export function MoodProvider({ children }: MoodProviderProps) {
  const [moods, setMoods] = useState<MoodData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load data on mount
  useEffect(() => {
    try {
      const data = loadMoodData()
      setMoods(data.moods)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load mood data'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save to localStorage whenever moods change
  useEffect(() => {
    if (!isLoading) {
      try {
        const success = saveMoodData({
          moods,
          version: '1.0',
        })
        if (!success) {
          setError(new Error('Failed to save mood data'))
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to save mood data'))
      }
    }
  }, [moods, isLoading])

  const setMood = useCallback((date: string, mood: Mood) => {
    setMoods((prev) => setMoodForDate(prev, date, mood))
  }, [])

  const getMood = useCallback(
    (date: string): Mood | null => {
      return (moods[date] as Mood) || null
    },
    [moods]
  )

  const hasMood = useCallback(
    (date: string): boolean => {
      return date in moods && moods[date] !== undefined
    },
    [moods]
  )

  const value: MoodContextValue = {
    moods,
    setMood,
    getMood,
    hasMood,
    isLoading,
    error,
  }

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>
}

/**
 * Hook for accessing mood data from context
 */
export function useMoodData(): MoodContextValue {
  const context = useContext(MoodContext)
  if (!context) {
    throw new Error('useMoodData must be used within a MoodProvider')
  }
  return context
}

