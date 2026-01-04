import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { FiChevronUp } from 'react-icons/fi'
import { ThemeToggle } from './ThemeToggle'
import { NotificationSettings } from './NotificationSettings'
import styles from './SettingsFooter.module.css'
import sharedStyles from '@/styles/shared.module.css'

export function SettingsFooter() {
  const [isOpen, setIsOpen] = useState(false)
  const [shouldBounce, setShouldBounce] = useState(true)
  const arrowControls = useAnimationControls()

  // Stop bounce animation after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldBounce(false)
    }, 15000)

    return () => clearTimeout(timer)
  }, [])

  // Bounce animation - pronounced, every 3 seconds
  useEffect(() => {
    if (!shouldBounce || isOpen) return

    const bounceInterval = setInterval(() => {
      arrowControls.start({
        y: [-10, 0],
        transition: {
          type: 'spring',
          stiffness: 180,
          damping: 8,
          mass: 1.0,
        },
      })
    }, 2000)

    return () => clearInterval(bounceInterval)
  }, [shouldBounce, isOpen, arrowControls])

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
    // Stop bounce when opened
    if (!isOpen) {
      setShouldBounce(false)
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <div className={styles.toggleButtonWrapper}>
        <motion.button
          className={`${sharedStyles.floatingButton} ${styles.toggleButton}`}
          onClick={handleToggle}
          aria-label={isOpen ? 'Close settings footer' : 'Open settings footer'}
          aria-expanded={isOpen}
          aria-controls="settings-footer"
          animate={arrowControls}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronUp size={20} aria-hidden="true" />
          </motion.div>
        </motion.button>
      </div>

      {/* Footer Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.footer
            id="settings-footer"
            className={styles.footer}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            role="region"
            aria-label="Settings"
          >
            <div className={styles.footerContent}>
              <div className={styles.footerSection}>
                <ThemeToggle variant="inline" />
              </div>
              <div className={styles.footerSection}>
                <NotificationSettings />
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </>
  )
}

