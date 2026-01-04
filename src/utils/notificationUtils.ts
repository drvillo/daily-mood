/**
 * Utility functions for notification handling
 */

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Calculate the next 7:00 PM in local time
 */
export function getNextNotificationTime(): Date {
  const now = new Date()
  const target = new Date()
  target.setHours(19, 0, 0, 0) // 7:00 PM

  // If it's already past 7 PM today, schedule for tomorrow
  if (now >= target) {
    target.setDate(target.getDate() + 1)
  }

  return target
}

/**
 * Check if current time is past 7:00 PM local time
 */
export function isPastNotificationTime(): boolean {
  const now = new Date()
  const today = new Date()
  today.setHours(19, 0, 0, 0) // 7:00 PM today
  return now >= today
}

/**
 * Get notification tag for a specific date
 * Used to prevent duplicate notifications for the same day
 */
export function getNotificationTag(date: string): string {
  return `daily-mood-${date}`
}

