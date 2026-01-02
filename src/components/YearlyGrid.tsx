import { useState, useEffect, useCallback } from 'react'
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
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  // Generate year days
  const yearDays: Date[] = []
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    yearDays.push(new Date(date))
  }
  
  // Group days by month for grid layout
  const months: { [month: number]: Date[] } = {}
  yearDays.forEach((date) => {
    const month = date.getMonth()
    if (!months[month]) {
      months[month] = []
    }
    months[month].push(date)
  })

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
          const monthName = days[0] ? getDateInfo(days[0]).monthAbbr : ''
          
          return (
            <div key={monthNum} className={styles.monthColumn}>
              <div className={styles.monthHeader}>{monthName}</div>
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
                  const isHovered = hoveredDate === dateStr

                  return (
                    <GridCell
                      key={dayNum}
                      date={date}
                      mood={mood}
                      hasMood={hasMoodLogged}
                      isToday={isTodayCell}
                      isHovered={isHovered}
                      onClick={() => handleCellClick(date)}
                      onHover={() => setHoveredDate(dateStr)}
                      onLeave={() => setHoveredDate(null)}
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
