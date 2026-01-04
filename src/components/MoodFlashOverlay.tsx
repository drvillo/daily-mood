import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { getMoodColor } from '@/utils/colorUtils'
import type { Mood } from '@/types'
import styles from './MoodFlashOverlay.module.css'

interface MoodFlashOverlayProps {
  flashMood: Mood | null
  className?: string
}

/**
 * Reusable component for mood flash overlay effect
 * Displays an animated background flash when a mood is selected
 */
export function MoodFlashOverlay({ flashMood, className }: MoodFlashOverlayProps) {
  const { theme } = useTheme()

  return (
    <AnimatePresence>
      {flashMood && (
        <motion.div
          className={`${styles.flashOverlay} ${className || ''}`}
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
  )
}

