import { useState } from 'react'
import { useMoodData } from '@/hooks/useMoodData'
import { useTheme } from '@/hooks/useTheme'
import { getMoodColor } from '@/utils/colorUtils'
import { MOOD_LABELS } from '@/types'
import styles from './Legend.module.css'

export function Legend() {
  const { moods } = useMoodData()
  const { theme } = useTheme()
  const [showCounts, setShowCounts] = useState(false)

  // Calculate counts for each mood
  const moodCounts = MOOD_LABELS.reduce((acc, { value }) => {
    acc[value] = Object.values(moods).filter((mood) => mood === value).length
    return acc
  }, {} as Record<number, number>)

  const totalLogged = Object.keys(moods).length

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Mood Legend</h3>
        <button
          className={styles.toggleButton}
          onClick={() => setShowCounts(!showCounts)}
          aria-label={showCounts ? 'Hide counts' : 'Show counts'}
        >
          {showCounts ? 'Hide' : 'Show'} Counts
        </button>
      </div>
      <div className={styles.items}>
        {MOOD_LABELS.map(({ value, label }) => (
          <div key={value} className={styles.item}>
            <div
              className={styles.colorSwatch}
              style={{
                backgroundColor: getMoodColor(value, theme),
              }}
              aria-label={`Mood ${value}: ${label}`}
            />
            <div className={styles.labelContainer}>
              <span className={styles.label}>{label}</span>
              {showCounts && (
                <span className={styles.count}>
                  {moodCounts[value]} {moodCounts[value] === 1 ? 'day' : 'days'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {showCounts && (
        <div className={styles.total}>
          Total: {totalLogged} {totalLogged === 1 ? 'day' : 'days'} logged
        </div>
      )}
    </div>
  )
}
