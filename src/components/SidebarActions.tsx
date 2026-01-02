import { useViewMode } from '@/hooks/useViewMode'
import styles from './SidebarActions.module.css'

export function SidebarActions() {
  const { switchToLog } = useViewMode()

  return (
    <div className={styles.container}>
      <button
        className={styles.logButton}
        onClick={switchToLog}
        aria-label="Log today's mood"
      >
        Log Today's Mood
      </button>
    </div>
  )
}
