import { format, isValid, parseISO } from 'date-fns';

/**
 * Get today's date in local timezone as ISO string (YYYY-MM-DD)
 * Avoids UTC conversion issues from Date.toISOString()
 */
export function getTodayLocalISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format ISO date string for check printing (MM/DD/YYYY)
 * Handles invalid dates gracefully
 */
export function formatCheckDate(isoDateString: string): string {
  try {
    const date = parseISO(isoDateString);
    if (!isValid(date)) {
      throw new Error('Invalid date');
    }
    // Use consistent MM/DD/YYYY format
    return format(date, 'MM/dd/yyyy');
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
}

/**
 * Validate that a date string is valid
 */
export function isValidCheckDate(isoDateString: string): boolean {
  try {
    const date = parseISO(isoDateString);
    return isValid(date);
  } catch {
    return false;
  }
}
