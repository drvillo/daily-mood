import { useViewMode } from '@/hooks/useViewMode'
import { exportMoodData, importMoodData } from '@/utils/exportImport'
import { useMoodData } from '@/hooks/useMoodData'
import styles from './SidebarActions.module.css'

export function SidebarActions() {
  const { switchToLog } = useViewMode()
  const { moods } = useMoodData()

  const handleExport = () => {
    exportMoodData({ moods, version: '1.0' })
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const shouldReplace = window.confirm(
          'This will replace your current mood data. Are you sure?'
        )
        if (shouldReplace) {
          try {
            await importMoodData(file)
            window.location.reload()
          } catch (error) {
            alert('Failed to import data: ' + (error instanceof Error ? error.message : 'Unknown error'))
          }
        }
      }
    }
    input.click()
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.logButton}
        onClick={switchToLog}
        aria-label="Log today's mood"
      >
        Log Today's Mood
      </button>
      <div className={styles.linkActions}>
        <button
          className={styles.linkButton}
          onClick={handleExport}
          aria-label="Export mood data"
        >
          Export →
        </button>
        <span className={styles.separator}>·</span>
        <button
          className={styles.linkButton}
          onClick={handleImport}
          aria-label="Import mood data"
        >
          Import →
        </button>
      </div>
    </div>
  )
}
