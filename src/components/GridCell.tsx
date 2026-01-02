import { memo, useMemo } from 'react'
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
  onClick: () => void
}

function GridCellBase({
  date,
  mood,
  hasMood,
  isToday,
  onClick,
}: GridCellProps) {
  const { theme } = useTheme()
  const dateStr = formatDate(date)
  const moodLabel = useMemo(
    () => (mood ? MOOD_LABELS.find((m) => m.value === mood)?.label : null),
    [mood]
  )

  const backgroundColor = hasMood && mood
    ? getMoodColor(mood, theme)
    : getEmptyCellColor(theme)

  const borderColor = isToday
    ? getTodayHighlightColor(theme)
    : 'transparent'

  return (
    <button
      className={styles.cell}
      style={{
        backgroundColor,
        borderColor,
        borderWidth: isToday ? '2px' : '1px',
        borderStyle: 'solid',
      }}
      onClick={onClick}
      aria-label={
        hasMood && moodLabel
          ? `${dateStr}: ${moodLabel}`
          : `${dateStr}: No mood logged`
      }
      title={hasMood && moodLabel ? `${dateStr} - ${moodLabel}` : dateStr}
    >
      {/* Tooltip shown via CSS :hover */}
      <div className={styles.tooltip}>
        <div className={styles.tooltipDate}>{dateStr}</div>
        {moodLabel && (
          <div className={styles.tooltipMood}>{moodLabel}</div>
        )}
      </div>
      {isToday && (
        <div className={styles.todayIndicator} />
      )}
    </button>
  )
}

// Memoize to prevent re-renders when parent state changes
export const GridCell = memo(GridCellBase, (prevProps, nextProps) => {
  // Only re-render if relevant props change
  return (
    prevProps.mood === nextProps.mood &&
    prevProps.hasMood === nextProps.hasMood &&
    prevProps.isToday === nextProps.isToday &&
    prevProps.date.getTime() === nextProps.date.getTime()
  )
})

