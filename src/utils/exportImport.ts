import type { StorageData, ExportData } from '@/types'
import { saveMoodData } from './storage'
import { isMoodEntry } from '@/types'

/**
 * Export mood data as JSON file
 * @param data - Storage data to export
 * @param excludePhotos - If true, exclude photos from export (for smaller file size)
 */
export function exportMoodData(data: StorageData, excludePhotos: boolean = false): void {
  let exportData: ExportData = {
    ...data,
    exportDate: new Date().toISOString(),
  }

  // If excluding photos, create a copy without photos
  if (excludePhotos) {
    const moodsWithoutPhotos: StorageData['moods'] = {}
    for (const [date, entry] of Object.entries(data.moods)) {
      if (isMoodEntry(entry)) {
        const { photo, ...entryWithoutPhoto } = entry
        moodsWithoutPhotos[date] = entryWithoutPhoto.comment || entryWithoutPhoto.timestamp
          ? entryWithoutPhoto
          : entryWithoutPhoto.mood
      } else {
        moodsWithoutPhotos[date] = entry
      }
    }
    exportData = {
      ...exportData,
      moods: moodsWithoutPhotos,
    }
  }

  const json = JSON.stringify(exportData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const sizeMB = blob.size / (1024 * 1024)
  
  // Warn if file is large (over 5MB)
  if (sizeMB > 5 && !excludePhotos) {
    const shouldContinue = window.confirm(
      `Export file will be ${sizeMB.toFixed(2)}MB. This may be slow to download. ` +
      `Would you like to exclude photos to reduce file size?`
    )
    if (!shouldContinue) {
      return
    }
    // Retry with photos excluded
    return exportMoodData(data, true)
  }

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
  for (const [date, entry] of Object.entries(moods)) {
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false
    }

    // Validate entry - can be Mood (number) or MoodEntry (object)
    if (typeof entry === 'number') {
      // Old format: simple mood value (2-5)
      if (entry < 2 || entry > 5 || !Number.isInteger(entry)) {
        return false
      }
    } else if (typeof entry === 'object' && entry !== null) {
      // New format: MoodEntry object
      const moodEntry = entry as Record<string, unknown>
      
      // Must have mood property
      if (typeof moodEntry.mood !== 'number' || moodEntry.mood < 2 || moodEntry.mood > 5 || !Number.isInteger(moodEntry.mood)) {
        return false
      }

      // Optional comment (string)
      if ('comment' in moodEntry && typeof moodEntry.comment !== 'string') {
        return false
      }

      // Optional photo (string, base64)
      if ('photo' in moodEntry && typeof moodEntry.photo !== 'string') {
        return false
      }

      // Optional timestamp (number)
      if ('timestamp' in moodEntry && typeof moodEntry.timestamp !== 'number') {
        return false
      }
    } else {
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

