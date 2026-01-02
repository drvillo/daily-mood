import type { StorageData, ExportData, MoodData } from '@/types'
import { saveMoodData } from './storage'

/**
 * Export mood data as JSON file
 */
export function exportMoodData(data: StorageData): void {
  const exportData: ExportData = {
    ...data,
    exportDate: new Date().toISOString(),
  }

  const json = JSON.stringify(exportData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const date = new Date().toISOString().split('T')[0]
  const filename = `mood-data-${date}.json`
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Validate imported data structure
 */
function validateImportData(data: unknown): data is StorageData {
  if (!data || typeof data !== 'object') {
    return false
  }

  const obj = data as Record<string, unknown>

  // Check for required fields
  if (!obj.moods || typeof obj.moods !== 'object') {
    return false
  }

  if (!obj.version || typeof obj.version !== 'string') {
    return false
  }

  // Validate moods structure
  const moods = obj.moods as Record<string, unknown>
  for (const [date, mood] of Object.entries(moods)) {
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false
    }

    // Validate mood value (1-5)
    if (typeof mood !== 'number' || mood < 1 || mood > 5 || !Number.isInteger(mood)) {
      return false
    }
  }

  return true
}

/**
 * Import mood data from JSON file
 */
export async function importMoodData(file: File): Promise<StorageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result
        if (typeof text !== 'string') {
          reject(new Error('Failed to read file'))
          return
        }

        const parsed = JSON.parse(text) as unknown

        // Validate structure
        if (!validateImportData(parsed)) {
          reject(new Error('Invalid file format. Expected mood data JSON.'))
          return
        }

        // Save to localStorage
        const success = saveMoodData(parsed)
        if (!success) {
          reject(new Error('Failed to save imported data'))
          return
        }

        resolve(parsed)
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error('Failed to parse JSON file')
        )
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

