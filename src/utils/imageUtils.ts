/**
 * Image utility functions for compression and manipulation
 */

const MAX_WIDTH = 1920
const MAX_HEIGHT = 1920
const MAX_SIZE_KB = 500
const COMPRESSION_QUALITY = 0.8

/**
 * Compress an image file to a base64 data URL
 * @param file - The image file to compress
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1920)
 * @param quality - Compression quality 0-1 (default: 0.8)
 * @returns Promise resolving to base64 data URL
 */
export async function compressImage(
  file: File,
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT,
  quality: number = COMPRESSION_QUALITY
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to base64 with compression
        const base64 = canvas.toDataURL('image/jpeg', quality)

        // Check if compressed size is acceptable
        const sizeKB = estimateBase64Size(base64)
        if (sizeKB > MAX_SIZE_KB) {
          // Try with lower quality
          const lowerQuality = Math.max(0.3, quality - 0.2)
          const retryBase64 = canvas.toDataURL('image/jpeg', lowerQuality)
          const retrySizeKB = estimateBase64Size(retryBase64)
          
          if (retrySizeKB <= MAX_SIZE_KB) {
            resolve(retryBase64)
          } else {
            // If still too large, resize more aggressively
            const aggressiveRatio = Math.sqrt(MAX_SIZE_KB / sizeKB)
            const newWidth = Math.floor(width * aggressiveRatio)
            const newHeight = Math.floor(height * aggressiveRatio)
            
            canvas.width = newWidth
            canvas.height = newHeight
            ctx.drawImage(img, 0, 0, newWidth, newHeight)
            resolve(canvas.toDataURL('image/jpeg', 0.7))
          }
        } else {
          resolve(base64)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      if (typeof e.target?.result === 'string') {
        img.src = e.target.result
      } else {
        reject(new Error('Failed to read file'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Get image dimensions from base64 data URL
 * @param base64 - Base64 data URL
 * @returns Object with width and height
 */
export function getImageSize(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    img.src = base64
  })
}

/**
 * Validate if base64 image size is within limit
 * @param base64 - Base64 data URL
 * @param maxSizeKB - Maximum size in KB (default: 500)
 * @returns True if size is acceptable
 */
export function validateImageSize(base64: string, maxSizeKB: number = MAX_SIZE_KB): boolean {
  const sizeKB = estimateBase64Size(base64)
  return sizeKB <= maxSizeKB
}

/**
 * Estimate the size of a base64 string in KB
 * @param base64 - Base64 data URL
 * @returns Estimated size in KB
 */
export function estimateBase64Size(base64: string): number {
  // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64
  // Base64 encoding increases size by ~33%, so divide by 1.33
  // Then convert bytes to KB
  const sizeInBytes = (base64Data.length * 3) / 4
  return sizeInBytes / 1024
}

