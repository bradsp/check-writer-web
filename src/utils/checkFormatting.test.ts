import { describe, it, expect } from 'vitest';
import { padWithAsterisks } from './checkFormatting';
import { CHECK_AMOUNT_LINE_MAX_LENGTH } from '@/constants/checkConstants';

describe('padWithAsterisks', () => {
  it('should pad short text with asterisks', () => {
    const text = 'One hundred dollars';
    const result = padWithAsterisks(text);

    expect(result.startsWith(text)).toBe(true);
    expect(result.includes('*')).toBe(true);
    // Total length is text + space + asterisks
    expect(result.length).toBeGreaterThan(text.length);
  });

  it('should return empty string for empty input', () => {
    expect(padWithAsterisks('')).toBe('');
  });

  it('should return text as-is if it equals max length', () => {
    const text = 'a'.repeat(CHECK_AMOUNT_LINE_MAX_LENGTH);
    const result = padWithAsterisks(text);

    expect(result).toBe(text);
    expect(result.includes('*')).toBe(false);
  });

  it('should return text as-is if it exceeds max length', () => {
    const text = 'a'.repeat(CHECK_AMOUNT_LINE_MAX_LENGTH + 10);
    const result = padWithAsterisks(text);

    expect(result).toBe(text);
    expect(result.includes('*')).toBe(false);
  });

  it('should add space before asterisks', () => {
    const text = 'One hundred';
    const result = padWithAsterisks(text);

    expect(result).toMatch(/^One hundred \*+$/);
  });

  it('should pad with correct number of asterisks', () => {
    const text = 'Test';
    const result = padWithAsterisks(text);

    // Should have format: "Test ******..."
    expect(result).toMatch(/^Test \*+$/);

    const asteriskCount = (result.match(/\*/g) || []).length;
    // If padLength > 0, we add space + asterisks
    const expectedAsterisks = CHECK_AMOUNT_LINE_MAX_LENGTH - text.length;
    expect(asteriskCount).toBe(expectedAsterisks);
  });

  it('should handle various amount texts', () => {
    const testCases = [
      'One dollar and zero cents',
      'Five hundred twenty-three dollars and forty-five cents',
      'Nine thousand nine hundred ninety-nine dollars and ninety-nine cents',
    ];

    testCases.forEach(text => {
      const result = padWithAsterisks(text);
      expect(result.startsWith(text)).toBe(true);

      // If text is shorter than max, should have asterisks
      if (text.length < CHECK_AMOUNT_LINE_MAX_LENGTH) {
        expect(result.includes('*')).toBe(true);
      }
    });
  });

  it('should handle text with exactly one character less than max', () => {
    const text = 'a'.repeat(CHECK_AMOUNT_LINE_MAX_LENGTH - 1);
    const result = padWithAsterisks(text);

    // padLength = 80 - 79 = 1, which creates " *" (space + 1 asterisk)
    expect(result).toBe(`${text} *`);
  });

  it('should handle single character input', () => {
    const text = 'a';
    const result = padWithAsterisks(text);

    // padLength = 80 - 1 = 79
    // result = "a " + "*".repeat(79) = "a " + 79 asterisks = 81 chars total
    expect(result).toBe(`${text} ${'*'.repeat(CHECK_AMOUNT_LINE_MAX_LENGTH - text.length)}`);
  });

  it('should preserve the original text without modification', () => {
    const text = 'One thousand dollars and fifty cents';
    const result = padWithAsterisks(text);

    expect(result.substring(0, text.length)).toBe(text);
  });
});
