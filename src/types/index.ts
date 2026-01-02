export type Mood = 2 | 3 | 4 | 5

export type MoodData = { [date: string]: Mood }

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

