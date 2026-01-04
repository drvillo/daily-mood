import { useViewMode } from '@/hooks/useViewMode'
import { exportMoodData, importMoodData } from '@/utils/exportImport'
import { useMoodData } from '@/hooks/useMoodData'
import styles from './Header.module.css'

export function Header() {
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
            // Data will be saved by useMoodData hook
            window.location.reload() // Reload to refresh state
          } catch (error) {
            alert('Failed to import data: ' + (error instanceof Error ? error.message : 'Unknown error'))
          }
        }
      }
    }
    input.click()
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>Mood in pixels</h1>
        <div className={styles.actions}>
          <button
            className={styles.button}
            onClick={switchToLog}
            aria-label="Log today's mood"
          >
            Log Today
          </button>
          <button
            className={styles.button}
            onClick={handleExport}
            aria-label="Export mood data"
          >
            Export
          </button>
          <button
            className={styles.button}
            onClick={handleImport}
            aria-label="Import mood data"
          >
            Import
          </button>
        </div>
      </div>
    </header>
  )
}
