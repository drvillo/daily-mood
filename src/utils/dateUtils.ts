/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse YYYY-MM-DD string to Date
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00')
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getToday(): string {
  return formatDate(new Date())
}

/**
 * Get day of year (1-366)
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Get total days in year (365 or 366)
 */
export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365
}

/**
 * Check if year is leap year
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * Get year progress percentage
 */
export function getYearProgress(year: number = new Date().getFullYear()): number {
  const today = new Date()
  const currentYear = today.getFullYear()
  
  if (year !== currentYear) {
    return year < currentYear ? 100 : 0
  }

  const dayOfYear = getDayOfYear(today)
  const totalDays = getDaysInYear(year)
  return Math.round((dayOfYear / totalDays) * 100)
}

/**
 * Generate array of all valid dates in a year
 */
export function generateYearDays(year: number): Date[] {
  const dates: Date[] = []

  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day))
    }
  }

  return dates
}

/**
 * Get month name from date
 */
export function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long' })
}

/**
 * Get month abbreviation (Jan, Feb, etc.)
 */
export function getMonthAbbr(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' })
}

/**
 * Get date info for grid positioning
 */
export function getDateInfo(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth(), // 0-11
    day: date.getDate(),
    monthName: getMonthName(date),
    monthAbbr: getMonthAbbr(date),
    dayOfYear: getDayOfYear(date),
  }
}

