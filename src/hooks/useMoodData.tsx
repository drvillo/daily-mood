import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { loadMoodData, saveMoodData, setMoodForDate, getMoodEntry } from '@/utils/storage'
import { isFutureDate } from '@/utils/dateUtils'
import type { Mood, MoodData } from '@/types'
import { getMoodValue } from '@/types'

interface MoodContextValue {
  moods: MoodData
  setMood: (date: string, mood: Mood, options?: { comment?: string; photo?: string }) => void
  getMood: (date: string) => Mood | null
  getComment: (date: string) => string | null
  getPhoto: (date: string) => string | null
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

  const setMood = useCallback((date: string, mood: Mood, options?: { comment?: string; photo?: string }) => {
    // Prevent setting mood for future dates
    if (isFutureDate(date)) {
      console.warn('Cannot set mood for future date:', date)
      return
    }
    
    setMoods((prev) => setMoodForDate(prev, date, mood, options))
  }, [])

  const getMood = useCallback(
    (date: string): Mood | null => {
      const entry = moods[date]
      if (!entry) return null
      return getMoodValue(entry)
    },
    [moods]
  )

  const getComment = useCallback(
    (date: string): string | null => {
      const entry = getMoodEntry(moods, date)
      return entry?.comment || null
    },
    [moods]
  )

  const getPhoto = useCallback(
    (date: string): string | null => {
      const entry = getMoodEntry(moods, date)
      return entry?.photo || null
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
    getComment,
    getPhoto,
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


