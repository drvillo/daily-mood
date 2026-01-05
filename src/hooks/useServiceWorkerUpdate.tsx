import { useState, useEffect, useCallback } from 'react'
import { Workbox } from 'workbox-window'

interface UpdateState {
  updateAvailable: boolean
  applyUpdate: () => void
}

/**
 * Hook to handle service worker updates with user notification.
 * Returns state about update availability and a function to apply the update.
 */
export function useServiceWorkerUpdate(): UpdateState {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [workbox, setWorkbox] = useState<Workbox | null>(null)

  const applyUpdate = useCallback(() => {
    if (workbox) {
      console.log('[SW] User requested update, activating new version...')
      workbox.messageSkipWaiting()
    }
  }, [workbox])

  useEffect(() => {
    // Only run in production and if service workers are supported
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      import.meta.env.DEV
    ) {
      return
    }

    let wb: Workbox | null = null

    try {
      // Initialize Workbox with the service worker file
      wb = new Workbox('/sw.js')
      setWorkbox(wb)

      // Listen for when a new service worker is waiting
      wb.addEventListener('waiting', () => {
        console.log('[SW] New version available and waiting!')
        setUpdateAvailable(true)
      })

      // Listen for when the new service worker has taken control
      wb.addEventListener('controlling', () => {
        console.log('[SW] New version activated, reloading...')
        window.location.reload()
      })

      // Register the service worker
      wb.register().catch((error) => {
        console.warn('Service worker registration failed:', error)
      })
    } catch (error) {
      console.warn('Failed to initialize service worker update handler:', error)
    }

    // Cleanup - we don't unregister the service worker as it should persist
    return () => {
      // No cleanup needed for service worker
    }
  }, [])

  return { updateAvailable, applyUpdate }
}
