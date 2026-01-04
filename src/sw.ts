/**
 * Service Worker for Daily Mood PWA
 * This file is used as a base template for Workbox's injectManifest strategy
 * Workbox will inject precaching code during build
 */

/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

/// <reference lib="webworker" />

// Workbox will inject precacheAndRoute and manifest here
import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope
declare const __WB_MANIFEST: Array<{ url: string; revision: string | null }>

// Store mood data synced from main app
let moodData: Record<string, unknown> = {}
let notificationEnabled = false
let checkInterval: number | null = null

// Check interval: every 15 minutes
const CHECK_INTERVAL_MS = 15 * 60 * 1000

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if current time is past 7:00 PM local time
 */
function isPastNotificationTime() {
  const now = new Date()
  const today = new Date()
  today.setHours(19, 0, 0, 0) // 7:00 PM today
  return now >= today
}

/**
 * Check if mood is logged for today
 */
function hasMoodLoggedToday() {
  const today = getTodayDateString()
  return today in moodData && moodData[today] !== undefined
}

/**
 * Show notification if conditions are met
 */
async function checkAndShowNotification() {
  // Only check if notifications are enabled
  if (!notificationEnabled) {
    return
  }

  // Check if it's past 7 PM
  if (!isPastNotificationTime()) {
    return
  }

  // Check if mood is already logged for today
  if (hasMoodLoggedToday()) {
    return
  }

  // Note: Permission is checked in main thread before enabling notifications
  // Service worker just shows the notification when requested
  const today = getTodayDateString()
  const notificationTag = `daily-mood-${today}`

  // Show notification
  try {
    const options: NotificationOptions = {
      body: "Don't forget to log how you're feeling today",
      icon: '/icons/manifest-icon-192.maskable.png',
      badge: '/icons/manifest-icon-192.maskable.png',
      tag: notificationTag,
      requireInteraction: false,
      data: {
        url: '/#/',
        date: today,
      },
    }
    
    // Add vibrate if supported (mobile browsers)
    if ('vibrate' in navigator) {
      // @ts-expect-error - vibrate is not in standard NotificationOptions but is supported
      options.vibrate = [200, 100, 200]
    }
    
    await self.registration.showNotification('Time to log your mood!', options)
  } catch (error) {
    console.error('Failed to show notification:', error)
  }
}

/**
 * Start periodic checking for notification time
 */
function startNotificationChecking() {
  // Clear existing interval if any
  if (checkInterval) {
    clearInterval(checkInterval)
  }

  // Check immediately
  checkAndShowNotification()

  // Then check periodically
  checkInterval = setInterval(() => {
    checkAndShowNotification()
  }, CHECK_INTERVAL_MS) as unknown as number
}

/**
 * Stop periodic checking
 */
function stopNotificationChecking() {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
}

/**
 * Handle messages from main app
 */
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {}

  switch (type) {
    case 'NOTIFICATION_SETTINGS':
      notificationEnabled = data?.enabled ?? false
      if (notificationEnabled) {
        startNotificationChecking()
      } else {
        stopNotificationChecking()
      }
      break

    case 'MOOD_DATA_SYNC':
      moodData = data?.moods ?? {}
      // Re-check notification after mood data update
      if (notificationEnabled) {
        checkAndShowNotification()
      }
      break

    default:
      break
  }

  // Acknowledge message
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({ success: true })
  }
})

/**
 * Handle notification click
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/#/'

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }

        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen)
        }
      })
  )
})

/**
 * Start checking when service worker activates
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clear old caches if needed
      if (notificationEnabled) {
        startNotificationChecking()
      }
    })()
  )
})

// Initialize Workbox precaching (manifest will be injected during build)
// Workbox will replace self.__WB_MANIFEST with the actual manifest array
precacheAndRoute(self.__WB_MANIFEST)

