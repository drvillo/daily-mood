import type { StorageData, MoodData, Mood, MoodEntry } from '@/types'
import { isMoodEntry, getMoodValue } from '@/types'

const STORAGE_KEY = 'mood-tracker-data'
const CURRENT_VERSION = '1.0'

const DEFAULT_DATA: StorageData = {
  moods: {},
  version: CURRENT_VERSION,
}

/**
 * Safely get item from localStorage with error handling
 */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.warn('localStorage access failed:', error)
    return null
  }
}

/**
 * Safely set item in localStorage with error handling
 */
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded')
      throw new Error('Storage quota exceeded. Please free up space or export your data.')
    }
    console.warn('localStorage write failed:', error)
    return false
  }
}

/**
 * Load mood data from localStorage
 */
export function loadMoodData(): StorageData {
  const stored = safeGetItem(STORAGE_KEY)
  
  if (!stored) {
    return DEFAULT_DATA
  }

  try {
    const parsed = JSON.parse(stored) as StorageData
    
    // Validate structure
    if (!parsed.moods || typeof parsed.moods !== 'object') {
      console.warn('Invalid mood data structure, using defaults')
      return DEFAULT_DATA
    }

    // Migrate if version mismatch (future-proofing)
    if (parsed.version !== CURRENT_VERSION) {
      // For now, just update version
      // In future, add migration logic here
      parsed.version = CURRENT_VERSION
      saveMoodData(parsed)
    }

    return parsed
  } catch (error) {
    console.error('Failed to parse mood data:', error)
    return DEFAULT_DATA
  }
}

/**
 * Save mood data to localStorage
 */
export function saveMoodData(data: StorageData): boolean {
  const serialized = JSON.stringify(data)
  return safeSetItem(STORAGE_KEY, serialized)
}

/**
 * Clear all mood data from localStorage
 */
export function clearMoodData(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.warn('Failed to clear mood data:', error)
    return false
  }
}

/**
 * Get mood for a specific date (backward compatible)
 */
export function getMoodForDate(moods: MoodData, date: string): Mood | null {
  const entry = moods[date]
  if (!entry) return null
  return getMoodValue(entry)
}

/**
 * Get full mood entry for a specific date
 */
export function getMoodEntry(moods: MoodData, date: string): MoodEntry | null {
  const entry = moods[date]
  if (!entry) return null
  
  if (isMoodEntry(entry)) {
    return entry
  }
  
  // Convert old format to new format
  return { mood: entry }
}

/**
 * Set mood for a specific date with optional comment and photo
 */
export function setMoodForDate(
  moods: MoodData,
  date: string,
  mood: Mood,
  options?: { comment?: string; photo?: string }
): MoodData {
  const entry: MoodEntry = {
    mood,
    ...(options?.comment && { comment: options.comment }),
    ...(options?.photo && { photo: options.photo }),
    timestamp: Date.now(),
  }

  // If no optional fields, store as simple Mood for backward compatibility
  const value: Mood | MoodEntry = 
    !options?.comment && !options?.photo ? mood : entry

  return {
    ...moods,
    [date]: value,
  }
}

/**
 * Check localStorage quota usage
 */
export function checkStorageQuota(): { used: number; quota: number; percentage: number } | null {
  if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
    return null
  }

  try {
    const storage = navigator.storage as StorageManager
    if (!storage.estimate) {
      return null
    }

    // This is async but we'll handle it synchronously for now
    // In practice, you'd want to await this
    return null
  } catch (error) {
    console.warn('Failed to check storage quota:', error)
    return null
  }
}

/**
 * Estimate storage usage for mood data
 */
export function estimateStorageUsage(data: StorageData): number {
  try {
    const serialized = JSON.stringify(data)
    return new Blob([serialized]).size
  } catch (error) {
    console.warn('Failed to estimate storage usage:', error)
    return 0
  }
}

/**
 * Check if we're near storage quota (synchronous check)
 */
export function warnIfNearQuota(data: StorageData, threshold: number = 0.8): boolean {
  try {
    const usage = estimateStorageUsage(data)
    // Typical localStorage quota is 5-10MB
    // We'll use 5MB as conservative estimate
    const estimatedQuota = 5 * 1024 * 1024 // 5MB in bytes
    const percentage = usage / estimatedQuota
    
    return percentage >= threshold
  } catch (error) {
    console.warn('Failed to check quota:', error)
    return false
  }
}

