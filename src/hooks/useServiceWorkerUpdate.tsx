import { useEffect } from 'react'
import { Workbox } from 'workbox-window'

/**
 * Hook to handle service worker updates and automatically reload when a new version is available.
 * This ensures users always get the latest version of the PWA after deployments.
 */
export function useServiceWorkerUpdate() {
  useEffect(() => {
    // Only run in production and if service workers are supported
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      import.meta.env.DEV
    ) {
      return
    }

    let workbox: Workbox | null = null
    let reloadTimeout: NodeJS.Timeout | null = null
    let visibilityHandler: (() => void) | null = null

    const handleUpdate = () => {
      // Clear any existing timeout and handlers
      if (reloadTimeout) {
        clearTimeout(reloadTimeout)
        reloadTimeout = null
      }
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler)
        visibilityHandler = null
      }

      // Small delay to avoid interrupting user interactions
      // Reload after a brief delay to ensure the new service worker is ready
      reloadTimeout = setTimeout(() => {
        // Check if document is visible (user is actively using the app)
        if (document.visibilityState === 'visible') {
          // Reload immediately if user is active
          window.location.reload()
        } else {
          // If app is in background, reload when it becomes visible
          visibilityHandler = () => {
            if (document.visibilityState === 'visible') {
              window.location.reload()
            }
          }
          document.addEventListener('visibilitychange', visibilityHandler)
        }
      }, 1000)
    }

    try {
      // Initialize Workbox with the service worker file
      workbox = new Workbox('/sw.js')

      // Listen for when a new service worker is waiting
      workbox.addEventListener('waiting', () => {
        // A new service worker is available and waiting
        // Skip waiting to activate it immediately
        workbox?.messageSkipWaiting()
      })

      // Listen for when the new service worker has taken control
      workbox.addEventListener('controlling', () => {
        // New service worker is now controlling the page
        handleUpdate()
      })

      // Register the service worker
      workbox.register().catch((error) => {
        console.warn('Service worker registration failed:', error)
      })
    } catch (error) {
      console.warn('Failed to initialize service worker update handler:', error)
    }

    // Cleanup function
    return () => {
      if (reloadTimeout) {
        clearTimeout(reloadTimeout)
      }
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler)
      }
      // Note: We don't unregister the service worker as it should persist
    }
  }, [])
}

