import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { getMoodColor, getEmptyCellColor, getTodayHighlightColor } from '@/utils/colorUtils'
import { formatDate } from '@/utils/dateUtils'
import { MOOD_LABELS } from '@/types'
import type { Mood } from '@/types'
import styles from './GridCell.module.css'

interface GridCellProps {
  date: Date
  mood: Mood | null
  hasMood: boolean
  isToday: boolean
  isHovered: boolean
  isSelected: boolean
  onClick: () => void
  onHover: () => void
  onLeave: () => void
}

export function GridCell({
  date,
  mood,
  hasMood,
  isToday,
  isHovered,
  isSelected,
  onClick,
  onHover,
  onLeave,
}: GridCellProps) {
  const { theme } = useTheme()
  const dateStr = formatDate(date)
  const moodLabel = mood ? MOOD_LABELS.find((m) => m.value === mood)?.label : null

  const backgroundColor = hasMood && mood
    ? getMoodColor(mood, theme)
    : getEmptyCellColor(theme)

  const borderColor = isToday
    ? getTodayHighlightColor(theme)
    : 'transparent'

  return (
    <motion.button
      className={styles.cell}
      style={{
        backgroundColor,
        borderColor,
        borderWidth: isToday ? '2px' : '1px',
        borderStyle: 'solid',
      }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.2,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      aria-label={
        hasMood && moodLabel
          ? `${dateStr}: ${moodLabel}`
          : `${dateStr}: No mood logged`
      }
      title={hasMood && moodLabel ? `${dateStr} - ${moodLabel}` : dateStr}
    >
      {isHovered && (
        <motion.div
          className={styles.tooltip}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className={styles.tooltipDate}>{dateStr}</div>
          {moodLabel && (
            <div className={styles.tooltipMood}>{moodLabel}</div>
          )}
        </motion.div>
      )}
      {isToday && (
        <motion.div
          className={styles.todayIndicator}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  )
}

