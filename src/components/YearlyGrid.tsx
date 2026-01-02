import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMoodData } from '@/hooks/useMoodData'
import { formatDate, isToday, getDateInfo } from '@/utils/dateUtils'
import { MOOD_LABELS } from '@/types'
import type { Mood } from '@/types'
import { GridCell } from './GridCell'
import { MoodCircleCluster } from './MoodCircleCluster'
import styles from './YearlyGrid.module.css'

interface YearlyGridProps {
  year?: number
  onCellClick?: (date: string, mood?: Mood) => void
}

export function YearlyGrid({ year = new Date().getFullYear(), onCellClick }: YearlyGridProps) {
  const { getMood, hasMood, setMood } = useMoodData()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Memoize year days and months calculation - only recalculate when year changes
  const months = useMemo(() => {
    const yearDays: Date[] = []
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      yearDays.push(new Date(date))
    }
    
    const monthsMap: { [month: number]: Date[] } = {}
    yearDays.forEach((date) => {
      const month = date.getMonth()
      if (!monthsMap[month]) {
        monthsMap[month] = []
      }
      monthsMap[month].push(date)
    })
    
    return monthsMap
  }, [year])

  const handleCellClick = (date: Date) => {
    const dateStr = formatDate(date)
    setSelectedDate(dateStr)
    onCellClick?.(dateStr)
  }

  const handleMoodSelect = useCallback((mood: Mood) => {
    if (selectedDate) {
      setMood(selectedDate, mood)
      setSelectedDate(null)
      onCellClick?.(selectedDate, mood)
    }
  }, [selectedDate, setMood, onCellClick])

  // Keyboard shortcuts: Escape to close modal, 1-4 to select mood
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedDate) return

      if (e.key === 'Escape') {
        setSelectedDate(null)
      } else if (e.key >= '1' && e.key <= '4') {
        const moodIndex = parseInt(e.key) - 1
        if (moodIndex < MOOD_LABELS.length) {
          handleMoodSelect(MOOD_LABELS[moodIndex].value)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedDate, handleMoodSelect])

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {Object.entries(months).map(([monthIndex, days]) => {
          const monthNum = parseInt(monthIndex)
          const dateInfo = days[0] ? getDateInfo(days[0]) : null
          const monthAbbr = dateInfo?.monthAbbr ?? ''
          const monthFull = dateInfo?.monthName ?? ''
          
          return (
            <div key={monthNum} className={styles.monthColumn}>
              <div className={styles.monthHeader}>
                <span className={styles.monthFull} aria-hidden="true">{monthAbbr}</span>
                <span className={styles.monthShort} aria-hidden="true">{monthAbbr.charAt(0)}</span>
                <span className="sr-only">{monthFull}</span>
              </div>
              <div className={styles.daysColumn}>
                {Array.from({ length: 31 }, (_, i) => {
                  const dayNum = i + 1
                  const date = days.find((d) => d.getDate() === dayNum)
                  
                  if (!date) {
                    return <div key={dayNum} className={styles.emptyCell} />
                  }

                  const dateStr = formatDate(date)
                  const mood = getMood(dateStr)
                  const hasMoodLogged = hasMood(dateStr)
                  const isTodayCell = isToday(date)

                  return (
                    <GridCell
                      key={dayNum}
                      date={date}
                      mood={mood}
                      hasMood={hasMoodLogged}
                      isToday={isTodayCell}
                      onClick={() => handleCellClick(date)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mood selector modal for editing */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDate(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="modal-title" className={styles.modalTitle}>
              How did you feel on {selectedDate}?
              </h3>
              <MoodCircleCluster onSelect={handleMoodSelect} compact />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
