import { useRef } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { MoodProvider } from '@/hooks/useMoodData'
import { ViewModeProvider, useViewMode } from '@/hooks/useViewMode'
import { useMoodFlash } from '@/hooks/useMoodFlash'
import { useNotifications } from '@/hooks/useNotifications'
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate'
import { ThemeToggle } from '@/components/ThemeToggle'
import { MoodSelector } from '@/components/MoodSelector'
import { YearlyGrid } from '@/components/YearlyGrid'
import { Legend } from '@/components/Legend'
import { ProgressIndicator } from '@/components/ProgressIndicator'
import { SidebarActions } from '@/components/SidebarActions'
import { DataActions } from '@/components/DataActions'
import { NotificationSettings } from '@/components/NotificationSettings'
import { MoodFlashOverlay } from '@/components/MoodFlashOverlay'
import type { Mood } from '@/types'
import styles from './App.module.css'

interface LogViewProps {
  onMoodSelect: (mood: Mood) => void
}

function LogView({ onMoodSelect }: LogViewProps) {
  const { switchToReflect } = useViewMode()
  const viewSwitchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInteractingRef = useRef(false)

  const handleMoodSelect = (mood: Mood) => {
    // Trigger flash effect in parent
    onMoodSelect(mood)

    // Clear any existing timeout
    if (viewSwitchTimeoutRef.current) {
      clearTimeout(viewSwitchTimeoutRef.current)
    }

    // The prompt timeout (4 seconds) is handled by MoodSelector
    // If user doesn't respond, we'll navigate after 4 seconds
    viewSwitchTimeoutRef.current = setTimeout(() => {
      if (!isInteractingRef.current) {
        switchToReflect()
      }
    }, 4000)
  }

  const handleInteractionStart = () => {
    isInteractingRef.current = true
    // Cancel any pending view switch
    if (viewSwitchTimeoutRef.current) {
      clearTimeout(viewSwitchTimeoutRef.current)
      viewSwitchTimeoutRef.current = null
    }
  }

  const handleInteractionEnd = () => {
    isInteractingRef.current = false
    // Schedule view switch after a delay when interaction ends
    viewSwitchTimeoutRef.current = setTimeout(() => {
      if (!isInteractingRef.current) {
        switchToReflect()
      }
    }, 2000)
  }

  const handleSkip = () => {
    // User clicked "Skip" - navigate immediately
    if (viewSwitchTimeoutRef.current) {
      clearTimeout(viewSwitchTimeoutRef.current)
      viewSwitchTimeoutRef.current = null
    }
    switchToReflect()
  }

  return (
    <div className={styles.logView}>
      <MoodSelector 
        onSelect={handleMoodSelect}
        onInteractionStart={handleInteractionStart}
        onInteractionEnd={handleInteractionEnd}
        onSkip={handleSkip}
      />
      <button
        className={styles.viewYearLink}
        onClick={switchToReflect}
        aria-label="View yearly grid"
      >
        View Year →
      </button>
    </div>
  )
}

function ReflectView() {
  const { switchToLog } = useViewMode()
  const handleCellClick = () => {
    // Mood selection is handled by YearlyGrid component
  }

  const scrollToProgress = () => {
    const progressElement = document.getElementById('progress-indicator')
    if (progressElement) {
      progressElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  return (
    <div className={styles.reflectView}>
      <div className={styles.mainContent}>
        <div className={styles.calendarHeader}>
          <button
            className={styles.calendarHeaderButton}
            onClick={switchToLog}
            aria-label="Log today's mood"
          >
            Log Today's Mood
          </button>
          <button
            className={styles.progressLink}
            onClick={scrollToProgress}
            aria-label="Stats"
          >
            View your stats ↓
          </button>
        </div>
        <YearlyGrid onCellClick={handleCellClick} />
      </div>
      <div className={styles.sidebar}>
        <SidebarActions />
        <NotificationSettings />
        <div id="progress-indicator">
          <ProgressIndicator />
        </div>
        <Legend />
        <DataActions />
      </div>
    </div>
  )
}

function AppContent() {
  const { viewMode } = useViewMode()
  const { flashMood, triggerFlash } = useMoodFlash()
  const { isEnabled } = useNotifications()

  // Initialize service worker update handler
  useServiceWorkerUpdate()

  // Sync notification settings with service worker on mount and when it changes
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'NOTIFICATION_SETTINGS',
            data: { enabled: isEnabled },
          })
        }
      })
    }
  }, [isEnabled])

  const handleMoodSelect = (mood: Mood) => {
    triggerFlash(mood)
  }

  return (
    <div className={styles.app}>
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          {viewMode === 'log' ? (
            <motion.div
              key="log"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={styles.logViewWrapper}
            >
              <LogView onMoodSelect={handleMoodSelect} />
            </motion.div>
          ) : (
            <motion.div
              key="reflect"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ReflectView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Floating theme toggle - visible on all views */}
      <ThemeToggle />
      
      {/* Flash overlay effect - persists across view changes */}
      <MoodFlashOverlay flashMood={flashMood} />
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <MoodProvider>
        <ViewModeProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<AppContent />} />
              <Route path="*" element={<AppContent />} />
            </Routes>
          </HashRouter>
        </ViewModeProvider>
      </MoodProvider>
    </ThemeProvider>
  )
}
