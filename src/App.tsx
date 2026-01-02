import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from '@/components/ThemeProvider'
import { MoodProvider } from '@/hooks/useMoodData'
import { ViewModeProvider, useViewMode } from '@/hooks/useViewMode'
import { useTheme } from '@/hooks/useTheme'
import { ThemeToggle } from '@/components/ThemeToggle'
import { MoodSelector } from '@/components/MoodSelector'
import { YearlyGrid } from '@/components/YearlyGrid'
import { Legend } from '@/components/Legend'
import { ProgressIndicator } from '@/components/ProgressIndicator'
import { SidebarActions } from '@/components/SidebarActions'
import { DataActions } from '@/components/DataActions'
import { getMoodColor } from '@/utils/colorUtils'
import type { Mood } from '@/types'
import styles from './App.module.css'

interface LogViewProps {
  onMoodSelect: (mood: Mood) => void
}

function LogView({ onMoodSelect }: LogViewProps) {
  const { switchToReflect } = useViewMode()

  const handleMoodSelect = (mood: Mood) => {
    // Trigger flash effect in parent
    onMoodSelect(mood)

    // Small delay to show success animation before switching
    setTimeout(() => {
      switchToReflect()
    }, 300)
  }

  return (
    <div className={styles.logView}>
      <MoodSelector onSelect={handleMoodSelect} />
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
  const handleCellClick = () => {
    // Mood selection is handled by YearlyGrid component
  }

  return (
    <div className={styles.reflectView}>
      <div className={styles.mainContent}>
        <YearlyGrid onCellClick={handleCellClick} />
      </div>
      <div className={styles.sidebar}>
        <SidebarActions />
        <ProgressIndicator />
        <Legend />
        <DataActions />
      </div>
    </div>
  )
}

function AppContent() {
  const { viewMode } = useViewMode()
  const { theme } = useTheme()
  const [flashMood, setFlashMood] = useState<Mood | null>(null)

  const handleMoodSelect = (mood: Mood) => {
    // Trigger flash effect
    setFlashMood(mood)
    
    // Clear flash after 2 seconds
    setTimeout(() => {
      setFlashMood(null)
    }, 2000)
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
      <AnimatePresence>
        {flashMood && (
          <motion.div
            className={styles.flashOverlay}
            style={{
              backgroundColor: getMoodColor(flashMood, theme),
            }}
            initial={{ opacity: 0, scale: 0.98, y: 0 }}
            animate={{
              opacity: [0, 0.25, 0.2, 0],
              scale: [0.98, 1.02, 1.01, 1],
              y: [0, -5, 0, 0],
            }}
            transition={{
              duration: 2,
              times: [0, 0.1, 0.3, 1],
              ease: ['easeOut', 'easeInOut', 'easeIn'],
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
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
