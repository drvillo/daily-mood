export type Mood = 2 | 3 | 4 | 5

export interface MoodEntry {
  mood: Mood
  comment?: string
  photo?: string
  timestamp?: number
}

// MoodData supports both old format (Mood) and new format (MoodEntry) for backward compatibility
export type MoodData = { [date: string]: Mood | MoodEntry }

export interface StorageData {
  moods: MoodData
  version: string
}

export interface ExportData extends StorageData {
  exportDate: string
}

export type Theme = 'light' | 'dark'

export type ViewMode = 'log' | 'reflect'

export interface MoodLabel {
  value: Mood
  label: string
}

export const MOOD_LABELS: MoodLabel[] = [
  { value: 5, label: 'Great / Fantastic' },
  { value: 4, label: 'Normal / Okay' },
  { value: 3, label: 'Meh / Bad' },
  { value: 2, label: 'Awful / Terrible' },
]

/**
 * Type guard to check if a value is a MoodEntry object
 */
export function isMoodEntry(value: Mood | MoodEntry): value is MoodEntry {
  return typeof value === 'object' && value !== null && 'mood' in value
}

/**
 * Extract mood value from either Mood or MoodEntry
 */
export function getMoodValue(value: Mood | MoodEntry): Mood {
  return isMoodEntry(value) ? value.mood : value
}

