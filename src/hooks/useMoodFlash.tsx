import { useState, useCallback, useRef } from 'react'
import type { Mood } from '@/types'

/**
 * Hook to manage mood flash effect
 * Returns a function to trigger the flash and the current flash mood state
 */
export function useMoodFlash() {
  const [flashMood, setFlashMood] = useState<Mood | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const triggerFlash = useCallback((mood: Mood) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set flash mood
    setFlashMood(mood)

    // Clear flash after 2 seconds
    timeoutRef.current = setTimeout(() => {
      setFlashMood(null)
      timeoutRef.current = null
    }, 2000)
  }, [])

  return { flashMood, triggerFlash }
}

