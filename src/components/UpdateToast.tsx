import { motion, AnimatePresence } from 'framer-motion'
import { FiRefreshCw } from 'react-icons/fi'
import styles from './UpdateToast.module.css'

interface UpdateToastProps {
  visible: boolean
  onUpdate: () => void
}

export function UpdateToast({ visible, onUpdate }: UpdateToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.toast}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          role="alert"
          aria-live="polite"
        >
          <FiRefreshCw className={styles.icon} aria-hidden="true" />
          <span className={styles.message}>New version available!</span>
          <button 
            className={styles.updateButton} 
            onClick={onUpdate}
            type="button"
          >
            Update
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

