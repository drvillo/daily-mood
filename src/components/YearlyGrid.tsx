import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMoodData } from '@/hooks/useMoodData'
import { useMoodFlash } from '@/hooks/useMoodFlash'
import { formatDate, formatDateLong, isToday, isFutureDate, getDateInfo } from '@/utils/dateUtils'
import { MOOD_LABELS } from '@/types'
import type { Mood } from '@/types'
import { GridCell } from './GridCell'
import { MoodCircleCluster, type PhysicsConfig } from './MoodCircleCluster'
import { MoodEntryOptions } from './MoodEntryOptions'
import { MoodFlashOverlay } from './MoodFlashOverlay'
import styles from './YearlyGrid.module.css'

interface YearlyGridProps {
  year?: number
  onCellClick?: (date: string, mood?: Mood) => void
}

export function YearlyGrid({ year = new Date().getFullYear(), onCellClick }: YearlyGridProps) {
  const { getMood, hasMood, setMood, getComment, getPhoto } = useMoodData()
  const { flashMood, triggerFlash } = useMoodFlash()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [entryData, setEntryData] = useState<{ comment?: string; photo?: string }>({})
  
  // Ref for constraining circle movement area in modal
  const circleAreaRef = useRef<HTMLDivElement>(null)
  
  // Calmer physics config for modal - slower, gentler movement
  const modalPhysicsConfig: PhysicsConfig = useMemo(() => ({
    baseSpeed: 0.3,          // Much slower drift
    damping: 0.98,           // More friction for smoother stops
    bounceDamping: 0.5,      // Less bouncy
    repulsionStrength: 0.08, // Gentler repulsion
    repulsionThreshold: 80,  // Smaller repulsion range
    margin: 10,              // Smaller margin for more space
  }), [])

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
    // Prevent clicking on future dates
    if (isFutureDate(date)) {
      return
    }
    
    const dateStr = formatDate(date)
    setSelectedDate(dateStr)
    
    // Load existing mood, comment and photo if any
    const existingMood = getMood(dateStr)
    const existingComment = getComment(dateStr)
    const existingPhoto = getPhoto(dateStr)
    setSelectedMood(existingMood || null)
    setEntryData({
      comment: existingComment || undefined,
      photo: existingPhoto || undefined,
    })
    
    onCellClick?.(dateStr)
  }

  const handleMoodSelect = useCallback((mood: Mood) => {
    setSelectedMood(mood)
    triggerFlash(mood)
  }, [triggerFlash])

  const handleConfirm = useCallback(() => {
    if (selectedDate && selectedMood) {
      // Safety check: prevent setting mood for future dates
      if (isFutureDate(selectedDate)) {
        console.warn('Cannot set mood for future date:', selectedDate)
        return
      }
      
      setMood(selectedDate, selectedMood, {
        comment: entryData.comment,
        photo: entryData.photo,
      })
      onCellClick?.(selectedDate, selectedMood)
      setSelectedDate(null)
      setSelectedMood(null)
      setEntryData({})
    }
  }, [selectedDate, selectedMood, setMood, entryData, onCellClick])

  const handleDiscard = useCallback(() => {
    setSelectedDate(null)
    setSelectedMood(null)
    setEntryData({})
  }, [])

  const handleCommentChange = useCallback((comment: string) => {
    setEntryData(prev => ({ ...prev, comment: comment || undefined }))
  }, [])

  const handlePhotoCapture = useCallback((photo: string) => {
    setEntryData(prev => ({ ...prev, photo }))
  }, [])

  const handlePhotoRemove = useCallback(() => {
    setEntryData(prev => {
      const { photo, ...rest } = prev
      return rest
    })
  }, [])

  // Keyboard shortcuts: Escape to close modal, 1-4 to select mood, Enter to confirm
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedDate) return

      if (e.key === 'Escape') {
        handleDiscard()
      } else if (e.key === 'Enter' && selectedMood) {
        handleConfirm()
      } else if (e.key >= '1' && e.key <= '4') {
        const moodIndex = parseInt(e.key) - 1
        if (moodIndex < MOOD_LABELS.length) {
          handleMoodSelect(MOOD_LABELS[moodIndex].value)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedDate, selectedMood, handleMoodSelect, handleConfirm, handleDiscard])

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
                  const isFutureCell = isFutureDate(date)
                  const hasComment = !!getComment(dateStr)
                  const hasPhoto = !!getPhoto(dateStr)

                  return (
                    <GridCell
                      key={dayNum}
                      date={date}
                      mood={mood}
                      hasMood={hasMoodLogged}
                      isToday={isTodayCell}
                      hasComment={hasComment}
                      hasPhoto={hasPhoto}
                      isFuture={isFutureCell}
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
            onClick={handleDiscard}
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
              How did you feel on {formatDateLong(selectedDate)}?
              </h3>
              <div ref={circleAreaRef} className={styles.circleArea}>
                <MoodCircleCluster 
                  onSelect={handleMoodSelect} 
                  compact 
                  selectedMood={selectedMood}
                  boundsRef={circleAreaRef}
                  physicsConfig={modalPhysicsConfig}
                />
              </div>
              <MoodEntryOptions
                onCommentChange={handleCommentChange}
                onPhotoCapture={handlePhotoCapture}
                onPhotoRemove={handlePhotoRemove}
                initialComment={entryData.comment}
                initialPhoto={entryData.photo}
              />
              <div className={styles.modalActions}>
                <motion.button
                  className={styles.discardButton}
                  onClick={handleDiscard}
                  aria-label="Discard changes"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✕
                </motion.button>
                <motion.button
                  className={styles.confirmButton}
                  onClick={handleConfirm}
                  disabled={!selectedMood}
                  aria-label="Confirm mood entry"
                  whileHover={selectedMood ? { scale: 1.1 } : {}}
                  whileTap={selectedMood ? { scale: 0.95 } : {}}
                >
                  ✓
                </motion.button>
              </div>
            </motion.div>
            {/* Flash overlay for modal - positioned behind modal content */}
            <MoodFlashOverlay flashMood={flashMood} className={styles.modalFlashOverlay} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
