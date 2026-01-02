import { useEffect, useCallback } from 'react'
import { useMoodData } from '@/hooks/useMoodData'
import { getToday } from '@/utils/dateUtils'
import { MOOD_LABELS } from '@/types'
import type { Mood } from '@/types'
import { MoodCircleCluster } from './MoodCircleCluster'
import styles from './MoodSelector.module.css'

interface MoodSelectorProps {
  onSelect?: (mood: Mood) => void
}

export function MoodSelector({ onSelect }: MoodSelectorProps) {
  const { setMood } = useMoodData()
  const today = getToday()

  const handleSelect = useCallback((mood: Mood) => {
    setMood(today, mood)
    onSelect?.(mood)
  }, [setMood, today, onSelect])

  // Keyboard shortcuts: 1-4 to select mood
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key
      if (key >= '1' && key <= '4') {
        const moodIndex = parseInt(key) - 1
        if (moodIndex < MOOD_LABELS.length) {
          handleSelect(MOOD_LABELS[moodIndex].value)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleSelect])

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>How are you feeling today?</h2>
      <MoodCircleCluster onSelect={handleSelect} />
    </div>
  )
}
