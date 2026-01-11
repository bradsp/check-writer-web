/**
 * Constants for check formatting and validation
 */

/**
 * Maximum length for amount in words field on a check
 * Used for padding with asterisks to prevent tampering
 */
export const CHECK_AMOUNT_LINE_MAX_LENGTH = 80;

/**
 * Threshold for large amount confirmation dialog
 * Amounts exceeding this value will trigger a confirmation prompt
 */
export const LARGE_AMOUNT_THRESHOLD = 10000;
