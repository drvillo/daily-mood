import { memo, useMemo } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { getMoodColor, getEmptyCellColor, getTodayHighlightColor } from '@/utils/colorUtils'
import { formatDate, formatDateLong } from '@/utils/dateUtils'
import { MOOD_LABELS } from '@/types'
import type { Mood } from '@/types'
import styles from './GridCell.module.css'

interface GridCellProps {
  date: Date
  mood: Mood | null
  hasMood: boolean
  isToday: boolean
  hasComment?: boolean
  hasPhoto?: boolean
  isFuture?: boolean
  onClick: () => void
}

function GridCellBase({
  date,
  mood,
  hasMood,
  isToday,
  hasComment = false,
  hasPhoto = false,
  isFuture = false,
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

  const isEmpty = !hasMood || !mood
  const cellClassName = isEmpty 
    ? `${styles.cell} ${styles.empty} ${isFuture ? styles.future : ''}`
    : `${styles.cell} ${isFuture ? styles.future : ''}`

  const handleClick = () => {
    if (!isFuture) {
      onClick()
    }
  }

  return (
    <button
      className={cellClassName}
      style={{
        backgroundColor,
        borderColor,
        borderWidth: isToday ? '2px' : '1px',
        borderStyle: 'solid',
      }}
      onClick={handleClick}
      disabled={isFuture}
      aria-label={
        isFuture
          ? `${dateStr}: Future date (cannot log mood)`
          : hasMood && moodLabel
          ? `${dateStr}: ${moodLabel}`
          : `${dateStr}: No mood logged`
      }
      title={
        isFuture
          ? `${dateStr} - Future date (cannot log mood)`
          : hasMood && moodLabel
          ? `${dateStr} - ${moodLabel}`
          : dateStr
      }
    >
      {/* Tooltip shown via CSS :hover */}
      <div className={styles.tooltip}>
        <div className={styles.tooltipDate}>{formatDateLong(dateStr)}</div>
        {moodLabel && (
          <div className={styles.tooltipMood}>{moodLabel}</div>
        )}
      </div>
      {isToday && (
        <div className={styles.todayIndicator} />
      )}
      {(hasComment || hasPhoto) && (
        <div className={styles.indicators}>
          {hasComment && (
            <span className={styles.commentIndicator} aria-label="Has comment" title="Has comment">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
          )}
          {hasPhoto && (
            <span className={styles.photoIndicator} aria-label="Has photo" title="Has photo">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </span>
          )}
        </div>
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
    prevProps.hasComment === nextProps.hasComment &&
    prevProps.hasPhoto === nextProps.hasPhoto &&
    prevProps.isFuture === nextProps.isFuture &&
    prevProps.date.getTime() === nextProps.date.getTime()
  )
})

