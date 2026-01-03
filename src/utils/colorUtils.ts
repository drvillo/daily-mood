import type { Mood, Theme } from '@/types'

/**
 * Hex color definitions for each mood
 * Using the same vibrant colors for both light and dark themes
 */
const MOOD_COLORS: Record<Mood, string> = {
  5: '#34D399', // Great / Fantastic - Emerald 400
  4: '#86EFAC', // Normal / Okay - Green 300
  3: '#FDBA74', // Meh / Bad - Orange 300
  2: '#F87171', // Awful / Terrible - Red 400
}

/**
 * Get mood color for a given mood and theme
 */
export function getMoodColor(mood: Mood, _theme: Theme): string {
  return MOOD_COLORS[mood]
}

/**
 * Get all mood colors for a theme
 */
export function getAllMoodColors(_theme: Theme): Record<Mood, string> {
  return MOOD_COLORS
}

/**
 * Get empty cell color (for days without mood logged)
 * Uses CSS variable for theme support
 */
export function getEmptyCellColor(theme: Theme): string {
  // Return a value that CSS can use, but prefer CSS variable
  // The actual color is defined in themes.css as --color-empty-cell
  return theme === 'light' ? '#f3f4f6' : '#1F2937'
}

/**
 * Get today's cell highlight color
 * Uses primary color from theme
 */
export function getTodayHighlightColor(theme: Theme): string {
  return theme === 'light' ? '#4F46E5' : '#6366F1'
}

