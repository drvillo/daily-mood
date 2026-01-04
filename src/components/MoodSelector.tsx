import { useEffect, useCallback, useState, useRef } from 'react'
import { useMoodData } from '@/hooks/useMoodData'
import { getToday } from '@/utils/dateUtils'
import { MOOD_LABELS } from '@/types'
import type { Mood } from '@/types'
import { MoodCircleCluster } from './MoodCircleCluster'
import { MoodEntryOptions } from './MoodEntryOptions'
import styles from './MoodSelector.module.css'

interface MoodSelectorProps {
  onSelect?: (mood: Mood) => void
  onInteractionStart?: () => void
  onInteractionEnd?: () => void
  onSkip?: () => void
}

type PromptState = 'none' | 'prompt' | 'options'

export function MoodSelector({ onSelect, onInteractionStart, onInteractionEnd, onSkip }: MoodSelectorProps) {
  const { setMood } = useMoodData()
  const today = getToday()
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [promptState, setPromptState] = useState<PromptState>('none')
  const [entryData, setEntryData] = useState<{ comment?: string; photo?: string }>({})
  const [countdown, setCountdown] = useState<number>(4)
  const promptTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const promptStateRef = useRef<PromptState>('none')
  
  // Keep ref in sync with state
  useEffect(() => {
    promptStateRef.current = promptState
  }, [promptState])

  const handleSelect = useCallback((mood: Mood) => {
    // Save mood immediately
    setMood(today, mood)
    setSelectedMood(mood)
    setEntryData({})
    setPromptState('prompt')
    setCountdown(4) // Reset countdown to 4 seconds
    
    // Clear any existing timeout and interval
    if (promptTimeoutRef.current) {
      clearTimeout(promptTimeoutRef.current)
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }
    
    // Trigger callback immediately for flash effect
    onSelect?.(mood)
    
    // Show prompt for 4 seconds, then navigate to reflect mode if no response
    promptTimeoutRef.current = setTimeout(() => {
      if (promptStateRef.current === 'prompt') {
        // User didn't respond, navigate to reflect mode
        onSkip?.()
      }
    }, 4000)
  }, [setMood, today, onSelect, onSkip])

  const handleYesClick = useCallback(() => {
    // Clear timeout and countdown interval
    if (promptTimeoutRef.current) {
      clearTimeout(promptTimeoutRef.current)
      promptTimeoutRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    
    // Show options
    setPromptState('options')
    onInteractionStart?.()
  }, [onInteractionStart])

  const handleNoClick = useCallback(() => {
    // Clear timeout and countdown interval
    if (promptTimeoutRef.current) {
      clearTimeout(promptTimeoutRef.current)
      promptTimeoutRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    
    // Navigate to reflect mode immediately
    onSkip?.()
  }, [onSkip])

  const updateMoodEntry = useCallback(() => {
    if (selectedMood) {
      setMood(today, selectedMood, {
        comment: entryData.comment,
        photo: entryData.photo,
      })
    }
  }, [selectedMood, today, entryData.comment, entryData.photo, setMood])

  const handleCommentChange = useCallback((comment: string) => {
    setEntryData(prev => ({ ...prev, comment: comment || undefined }))
  }, [])

  const handleCommentFocus = useCallback(() => {
    onInteractionStart?.()
  }, [onInteractionStart])

  const handleCommentBlur = useCallback(() => {
    // Reset interacting state after a delay to allow for other interactions
    setTimeout(() => {
      onInteractionEnd?.()
    }, 500)
  }, [onInteractionEnd])

  const handlePhotoCapture = useCallback((photo: string) => {
    setEntryData(prev => ({ ...prev, photo }))
    onInteractionStart?.()
  }, [onInteractionStart])

  const handlePhotoRemove = useCallback(() => {
    setEntryData(prev => {
      const { photo, ...rest } = prev
      return rest
    })
  }, [])

  const handleCameraOpen = useCallback(() => {
    onInteractionStart?.()
  }, [onInteractionStart])

  // Update mood entry whenever entryData changes
  useEffect(() => {
    if (selectedMood && promptState === 'options') {
      updateMoodEntry()
    }
  }, [selectedMood, entryData, promptState, updateMoodEntry])

  // Start countdown when prompt state is active
  useEffect(() => {
    if (promptState === 'prompt') {
      // Reset countdown to 4
      setCountdown(4)
      
      // Start countdown interval
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current)
              countdownIntervalRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
          countdownIntervalRef.current = null
        }
      }
    } else {
      // Clear interval when not in prompt state
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }
  }, [promptState])

  // Cleanup timeout and interval on unmount
  useEffect(() => {
    return () => {
      if (promptTimeoutRef.current) {
        clearTimeout(promptTimeoutRef.current)
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [])

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
      {!selectedMood && (
        <h2 className={styles.title}>How are you feeling today?</h2>
      )}
      {!selectedMood ? (
        <MoodCircleCluster onSelect={handleSelect} />
      ) : promptState === 'prompt' ? (
        <div className={styles.promptContainer}>
          <p className={styles.promptQuestion}>Leave a note too?</p>
          <div className={styles.promptButtons}>
            <button
              onClick={handleYesClick}
              className={`${styles.promptButton} ${styles.promptButtonYes}`}
              aria-label="Yes, add a note"
            >
              Yes
            </button>
            <button
              onClick={handleNoClick}
              className={`${styles.promptButton} ${styles.promptButtonNo}`}
              aria-label={`No, skip (${countdown}s)`}
            >
              Skip {countdown > 0 && `(${countdown}s)`}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.selectedMood}>
            <p className={styles.selectedMoodText}>Mood logged!</p>
          </div>
          <MoodEntryOptions
            onCommentChange={handleCommentChange}
            onPhotoCapture={handlePhotoCapture}
            onPhotoRemove={handlePhotoRemove}
            onCommentFocus={handleCommentFocus}
            onCommentBlur={handleCommentBlur}
            onCameraOpen={handleCameraOpen}
            initialComment={entryData.comment}
            initialPhoto={entryData.photo}
          />
        </>
      )}
    </div>
  )
}
