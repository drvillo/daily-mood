import type { Mood, Theme } from '@/types'

/**
 * LCH color definitions for each mood in light and dark themes
 * Using LCH color space for perceptual uniformity
 */
const MOOD_COLORS: Record<Theme, Record<Mood, string>> = {
  light: {
    5: 'lch(80% 65 150)', // Great - Brighter, more vibrant teal/cyan
    4: 'lch(90% 35 90)',  // Normal - Brighter, more vibrant yellow
    3: 'lch(75% 55 60)',  // Meh - Brighter, more vibrant orange/amber
    2: 'lch(60% 65 30)',  // Awful - Brighter, more vibrant red/deep orange
  },
  dark: {
    5: 'lch(70% 60 150)', // Great - Brighter, more vibrant teal
    4: 'lch(75% 30 90)',  // Normal - Brighter, more vibrant yellow
    3: 'lch(65% 50 60)',  // Meh - Brighter, more vibrant orange
    2: 'lch(55% 60 30)',  // Awful - Brighter, more vibrant red
  },
}

/**
 * Convert LCH to RGB hex for CSS compatibility
 * Note: Modern browsers support LCH natively, but this provides fallback
 */
function lchToHex(lch: string): string {
  // For now, return LCH directly as modern browsers support it
  // If needed, we can add a proper LCH to RGB conversion
  return lch
}

/**
 * Get mood color for a given mood and theme
 */
export function getMoodColor(mood: Mood, theme: Theme): string {
  const lchColor = MOOD_COLORS[theme][mood]
  return lchToHex(lchColor)
}

/**
 * Get all mood colors for a theme
 */
export function getAllMoodColors(theme: Theme): Record<Mood, string> {
  return MOOD_COLORS[theme]
}

/**
 * Get empty cell color (for days without mood logged)
 */
export function getEmptyCellColor(theme: Theme): string {
  return theme === 'light' ? 'lch(90% 2 200)' : 'lch(20% 2 200)'
}

/**
 * Get today's cell highlight color
 */
export function getTodayHighlightColor(theme: Theme): string {
  return theme === 'light' ? 'lch(60% 30 250)' : 'lch(50% 25 250)'
}

