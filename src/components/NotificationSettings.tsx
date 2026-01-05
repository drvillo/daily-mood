import { useNotifications } from '@/hooks/useNotifications'
import styles from './NotificationSettings.module.css'

export function NotificationSettings() {
  const { permission, isEnabled, requestPermission, toggleNotifications } =
    useNotifications()

  const handleToggle = () => {
    if (!isEnabled && permission !== 'granted') {
      // If trying to enable but permission not granted, request it
      requestPermission()
    } else {
      toggleNotifications(!isEnabled)
    }
  }

  const handleRequestPermission = async () => {
    await requestPermission()
  }

  const getPermissionStatusText = () => {
    switch (permission) {
      case 'granted':
        return 'Permission granted'
      case 'denied':
        return 'Permission denied'
      case 'default':
        return 'Permission not requested'
      default:
        return ''
    }
  }

  const isNotificationSupported = typeof Notification !== 'undefined'

  if (!isNotificationSupported) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    return (
      <div className={styles.container}>
        <p className={styles.unsupported}>
        {isIOS 
          ? 'To enable notifications on iOS, add this app to your Home Screen first. Tap the Share button, then "Add to Home Screen".'
          : 'Notifications are not supported in this browser.'}
        </p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Daily Reminders</h3>
        <p className={styles.description}>
          Get reminded to log your mood at 7:00 PM
        </p>
      </div>

      <div className={styles.controls}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            className={styles.toggle}
            checked={isEnabled}
            onChange={handleToggle}
            disabled={permission === 'denied'}
            aria-label="Enable daily mood reminders"
          />
          <span className={styles.toggleText}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>

        {permission !== 'granted' && (
          <div className={styles.permissionSection}>
            <p className={styles.permissionStatus}>
              {getPermissionStatusText()}
            </p>
            {permission === 'default' && (
              <button
                className={styles.requestButton}
                onClick={handleRequestPermission}
                aria-label="Request notification permission"
              >
                Enable Notifications
              </button>
            )}
            {permission === 'denied' && (
              <p className={styles.deniedHelp}>
                Notification permission was denied. Please enable it in your
                browser settings to use reminders.
              </p>
            )}
          </div>
        )}

        {isEnabled && permission === 'granted' && (
          <p className={styles.activeStatus}>
            You'll receive a reminder every day at 7:00 PM if you haven't logged
            your mood yet.
          </p>
        )}
      </div>
    </div>
  )
}

