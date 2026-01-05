import { HashRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { MoodProvider } from '@/hooks/useMoodData'
import { ViewModeProvider, useViewMode } from '@/hooks/useViewMode'
import { useMoodFlash } from '@/hooks/useMoodFlash'
import { useNotifications } from '@/hooks/useNotifications'
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate'
import { MoodSelector } from '@/components/MoodSelector'
import { YearlyGrid } from '@/components/YearlyGrid'
import { Legend } from '@/components/Legend'
import { ProgressIndicator } from '@/components/ProgressIndicator'
import { SidebarActions } from '@/components/SidebarActions'
import { DataActions } from '@/components/DataActions'
import { SettingsFooter } from '@/components/SettingsFooter'
import { MoodFlashOverlay } from '@/components/MoodFlashOverlay'
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
  }

  return (
    <div className={styles.logView}>
      <MoodSelector 
        onSelect={handleMoodSelect}
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

  // #region agent log - Debug iOS PWA safe area
  useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    const bodyStyle = getComputedStyle(document.body);
    const rootEl = document.getElementById('root');
    const rootStyle = rootEl ? getComputedStyle(rootEl) : null;
    const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    const displayMode = window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser';
    const viewportMeta = document.querySelector('meta[name="viewport"]')?.getAttribute('content') || 'not-found';
    const statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.getAttribute('content') || 'not-found';
    
    // Get actual computed safe area values by creating a test element
    const testEl = document.createElement('div');
    testEl.style.cssText = 'position:fixed;top:0;left:0;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);visibility:hidden;';
    document.body.appendChild(testEl);
    const testStyle = getComputedStyle(testEl);
    const actualSafeTop = testStyle.paddingTop;
    const actualSafeBottom = testStyle.paddingBottom;
    document.body.removeChild(testEl);

    fetch('http://127.0.0.1:7243/ingest/89541bf6-c0b4-472a-abdd-3cba9f911754',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:debug',message:'iOS PWA Debug Info',data:{hypothesisA_statusBarMeta:statusBarMeta,hypothesisB_actualSafeAreaTop:actualSafeTop,hypothesisB_actualSafeAreaBottom:actualSafeBottom,hypothesisB_viewportMeta:viewportMeta,hypothesisC_isStandalone:isStandalone,hypothesisC_displayMode:displayMode,hypothesisD_bodyHeight:bodyStyle.height,hypothesisD_rootHeight:rootStyle?.minHeight,hypothesisD_htmlBgColor:computedStyle.backgroundColor,hypothesisD_bodyBgColor:bodyStyle.backgroundColor,windowInnerHeight:window.innerHeight,windowOuterHeight:window.outerHeight,screenHeight:window.screen.height,userAgent:navigator.userAgent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1'})}).catch(()=>{});
  }, []);
  // #endregion

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
      
      {/* Settings footer - visible on all views */}
      <SettingsFooter />
      
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
