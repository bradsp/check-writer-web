/**
 * Utility functions for formatting check-related data
 */

/**
 * Pads the given text with asterisks for security on checks.
 * Used to prevent tampering with the amount in words field.
 *
 * @param text - The text to pad (typically amount in words)
 * @returns The text padded with asterisks to fill the line
 */
export const padWithAsterisks = (text: string): string => {
  const maxLength = 80; // Approximate max characters in the amount line
  if (!text) return '';

  const padLength = maxLength - text.length;
  if (padLength <= 0) return text;

  const padding = '*'.repeat(padLength);
  return `${text} ${padding}`;
};
