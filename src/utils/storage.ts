import type { StorageData, MoodData, Mood } from '@/types'

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
 * Get mood for a specific date
 */
export function getMoodForDate(moods: MoodData, date: string): Mood | null {
  return moods[date] || null
}

/**
 * Set mood for a specific date
 */
export function setMoodForDate(moods: MoodData, date: string, mood: Mood): MoodData {
  return {
    ...moods,
    [date]: mood,
  }
}

