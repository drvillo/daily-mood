import { useMoodData } from '@/hooks/useMoodData'
import { getDayOfYear, getDaysInYear, getYearProgress, getToday } from '@/utils/dateUtils'
import styles from './ProgressIndicator.module.css'

export function ProgressIndicator() {
  const { moods } = useMoodData()
  const today = new Date()
  const year = today.getFullYear()
  const dayOfYear = getDayOfYear(today)
  const totalDays = getDaysInYear(year)
  const progress = getYearProgress(year)

  // Calculate current streak (consecutive days with mood logged)
  const calculateStreak = (): number => {
    let streak = 0
    const todayStr = getToday()
    const todayDate = new Date(todayStr + 'T00:00:00')
    
    // Check if today is logged
    if (!(todayStr in moods)) {
      return 0
    }

    streak = 1
    let checkDate = new Date(todayDate)
    checkDate.setDate(checkDate.getDate() - 1)

    while (checkDate.getFullYear() === year) {
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
      if (dateStr in moods) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const streak = calculateStreak()
  const daysLogged = Object.keys(moods).length

  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <span className={styles.label}>Year Progress</span>
        <span className={styles.value}>
          Day {dayOfYear} of {totalDays} ({progress}%)
        </span>
      </div>
      {streak > 0 && (
        <div className={styles.item}>
          <span className={styles.label}>Current Streak</span>
          <span className={styles.value}>
            {streak} {streak === 1 ? 'day' : 'days'}
          </span>
        </div>
      )}
      <div className={styles.item}>
        <span className={styles.label}>Days Logged</span>
        <span className={styles.value}>
          {daysLogged} {daysLogged === 1 ? 'day' : 'days'}
        </span>
      </div>
    </div>
  )
}

