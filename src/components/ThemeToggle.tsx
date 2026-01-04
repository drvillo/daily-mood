import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import styles from './ThemeToggle.module.css'
import sharedStyles from '@/styles/shared.module.css'

interface ThemeToggleProps {
  variant?: 'floating' | 'inline'
}

export function ThemeToggle({ variant = 'floating' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  // Floating variant - single button toggle
  if (variant === 'floating') {
    return (
      <motion.button
        className={`${sharedStyles.floatingButton} ${styles.toggle}`}
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </motion.button>
    )
  }

  // Inline variant - show both options
  return (
    <div className={styles.themeSelector}>
      <div className={styles.header}>
        <h3 className={styles.title}>Theme</h3>
      </div>
      <div className={styles.options}>
        <motion.button
          className={`${styles.option} ${theme === 'light' ? styles.optionActive : ''}`}
          onClick={() => theme !== 'light' && toggleTheme()}
          disabled={theme === 'light'}
          aria-label="Light theme"
          aria-pressed={theme === 'light'}
          whileHover={theme !== 'light' ? { scale: 1.02 } : {}}
          whileTap={theme !== 'light' ? { scale: 0.98 } : {}}
        >
          <span className={styles.optionIcon}>☀️</span>
          <span className={styles.optionLabel}>Light</span>
        </motion.button>
        <motion.button
          className={`${styles.option} ${theme === 'dark' ? styles.optionActive : ''}`}
          onClick={() => theme !== 'dark' && toggleTheme()}
          disabled={theme === 'dark'}
          aria-label="Dark theme"
          aria-pressed={theme === 'dark'}
          whileHover={theme !== 'dark' ? { scale: 1.02 } : {}}
          whileTap={theme !== 'dark' ? { scale: 0.98 } : {}}
        >
          <span className={styles.optionIcon}>🌙</span>
          <span className={styles.optionLabel}>Dark</span>
        </motion.button>
      </div>
    </div>
  )
}


