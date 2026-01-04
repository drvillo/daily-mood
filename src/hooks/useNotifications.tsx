import { useState, useEffect, useCallback } from 'react'
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
} from '@/utils/storage'
import type { NotificationPreferences } from '@/types'
import type { MoodData } from '@/types'

interface UseNotificationsReturn {
  permission: NotificationPermission
  isEnabled: boolean
  requestPermission: () => Promise<boolean>
  toggleNotifications: (enabled: boolean) => void
}

/**
 * Hook to manage notification permissions and preferences
 * Handles communication with Service Worker for daily reminders
 */
export function useNotifications(): UseNotificationsReturn {
  const [prefs, setPrefs] = useState<NotificationPreferences>(() =>
    loadNotificationPreferences()
  )
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

  // Update permission state when it changes
  useEffect(() => {
    if (typeof Notification === 'undefined') {
      return
    }

    // Check permission initially
    setPermission(Notification.permission)

    // Update preferences if permission changed externally
    const currentPermission = Notification.permission
    if (currentPermission !== prefs.permission) {
      const updatedPrefs: NotificationPreferences = {
        ...prefs,
        permission: currentPermission,
      }
      setPrefs(updatedPrefs)
      saveNotificationPreferences(updatedPrefs)
    }
  }, [prefs])

  /**
   * Request notification permission from the user
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') {
      console.warn('Notifications not supported in this browser')
      return false
    }

    if (Notification.permission === 'granted') {
      const updatedPrefs: NotificationPreferences = {
        enabled: true,
        permission: 'granted',
      }
      setPrefs(updatedPrefs)
      saveNotificationPreferences(updatedPrefs)
      syncWithServiceWorker(updatedPrefs.enabled)
      return true
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission was previously denied')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      const granted = result === 'granted'
      
      const updatedPrefs: NotificationPreferences = {
        enabled: granted,
        permission: result,
      }
      setPrefs(updatedPrefs)
      setPermission(result)
      saveNotificationPreferences(updatedPrefs)
      
      if (granted) {
        syncWithServiceWorker(true)
      }
      
      return granted
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }, [])

  /**
   * Toggle notifications on/off
   */
  const toggleNotifications = useCallback(
    (enabled: boolean) => {
      if (enabled && permission !== 'granted') {
        // If trying to enable but permission not granted, request it
        requestPermission()
        return
      }

      const updatedPrefs: NotificationPreferences = {
        ...prefs,
        enabled: enabled && permission === 'granted',
      }
      setPrefs(updatedPrefs)
      saveNotificationPreferences(updatedPrefs)
      syncWithServiceWorker(updatedPrefs.enabled)
    },
    [prefs, permission, requestPermission]
  )

  return {
    permission,
    isEnabled: prefs.enabled && permission === 'granted',
    requestPermission,
    toggleNotifications,
  }
}

/**
 * Send message to service worker to sync notification settings
 */
function syncWithServiceWorker(enabled: boolean): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.ready.then((registration) => {
    if (registration.active) {
      registration.active.postMessage({
        type: 'NOTIFICATION_SETTINGS',
        data: { enabled },
      })
    }
  })
}

/**
 * Sync mood data with service worker for notification checks
 */
export function syncMoodDataWithServiceWorker(moods: MoodData): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.ready.then((registration) => {
    if (registration.active) {
      registration.active.postMessage({
        type: 'MOOD_DATA_SYNC',
        data: { moods },
      })
    }
  })
}

