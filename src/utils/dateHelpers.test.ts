import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTodayLocalISO,
  formatCheckDate,
  isValidCheckDate,
} from './dateHelpers';

describe('getTodayLocalISO', () => {
  it('should return date in YYYY-MM-DD format', () => {
    const result = getTodayLocalISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should return current date', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(getTodayLocalISO()).toBe(expected);
  });

  it('should pad single-digit months and days with zeros', () => {
    // Just test that the format is correct for single digits
    // We can't reliably mock the date, so just verify format logic
    const result = getTodayLocalISO();
    const parts = result.split('-');

    expect(parts).toHaveLength(3);
    expect(parts[0]).toHaveLength(4); // Year
    expect(parts[1]).toHaveLength(2); // Month (padded)
    expect(parts[2]).toHaveLength(2); // Day (padded)
  });
});

describe('formatCheckDate', () => {
  it('should format valid ISO dates to MM/dd/yyyy', () => {
    expect(formatCheckDate('2024-01-15')).toBe('01/15/2024');
    expect(formatCheckDate('2024-12-31')).toBe('12/31/2024');
    expect(formatCheckDate('2024-07-04')).toBe('07/04/2024');
  });

  it('should handle single-digit months and days', () => {
    expect(formatCheckDate('2024-01-01')).toBe('01/01/2024');
    expect(formatCheckDate('2024-09-09')).toBe('09/09/2024');
  });

  it('should return "Invalid Date" for invalid dates', () => {
    expect(formatCheckDate('not-a-date')).toBe('Invalid Date');
    expect(formatCheckDate('2024-13-01')).toBe('Invalid Date');
    expect(formatCheckDate('2024-00-01')).toBe('Invalid Date');
    expect(formatCheckDate('')).toBe('Invalid Date');
  });

  it('should handle leap years correctly', () => {
    expect(formatCheckDate('2024-02-29')).toBe('02/29/2024'); // Leap year
  });

  it('should handle various date formats that parseISO accepts', () => {
    expect(formatCheckDate('2024-12-25')).toBe('12/25/2024');
    expect(formatCheckDate('2024-12-25T00:00:00')).toBe('12/25/2024');
  });

  it('should handle edge case dates', () => {
    expect(formatCheckDate('1900-01-01')).toBe('01/01/1900');
    expect(formatCheckDate('2099-12-31')).toBe('12/31/2099');
  });
});

describe('isValidCheckDate', () => {
  it('should return true for valid ISO dates', () => {
    expect(isValidCheckDate('2024-01-15')).toBe(true);
    expect(isValidCheckDate('2024-12-31')).toBe(true);
    expect(isValidCheckDate('2024-02-29')).toBe(true); // Leap year
  });

  it('should return false for invalid dates', () => {
    expect(isValidCheckDate('not-a-date')).toBe(false);
    expect(isValidCheckDate('2024-13-01')).toBe(false);
    expect(isValidCheckDate('2024-00-01')).toBe(false);
    expect(isValidCheckDate('')).toBe(false);
  });

  it('should return false for malformed date strings', () => {
    expect(isValidCheckDate('2024/01/15')).toBe(false);
    expect(isValidCheckDate('01-15-2024')).toBe(false);
    expect(isValidCheckDate('15-01-2024')).toBe(false);
  });

  it('should handle invalid February dates in non-leap years', () => {
    expect(isValidCheckDate('2023-02-29')).toBe(false); // Not a leap year
    expect(isValidCheckDate('2023-02-28')).toBe(true);
  });

  it('should validate month boundaries', () => {
    expect(isValidCheckDate('2024-01-32')).toBe(false); // Jan has 31 days
    expect(isValidCheckDate('2024-04-31')).toBe(false); // Apr has 30 days
    expect(isValidCheckDate('2024-04-30')).toBe(true);
  });
});
