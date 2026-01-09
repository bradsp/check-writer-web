import DOMPurify from 'dompurify';

// Validation rules constants
export const VALIDATION_RULES = {
  PAYEE_MAX_LENGTH: 150,
  ADDRESS_MAX_LENGTH: 200,
  CITY_MAX_LENGTH: 50,
  STATE_MAX_LENGTH: 2,
  ZIP_MAX_LENGTH: 10,
  MEMO_MAX_LENGTH: 100,
  AMOUNT_MAX: 999999.99,
  AMOUNT_MIN: 0.01,
} as const;

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Sanitizes text by removing all HTML tags and encoding special characters
 * @param text The text to sanitize
 * @returns Sanitized text string
 */
export function sanitizeText(text: string): string {
  if (!text) return '';

  // Configure DOMPurify to strip all HTML tags
  const sanitized = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  return sanitized;
}

/**
 * Validates and normalizes monetary amounts
 * @param amount The amount string to validate
 * @returns ValidationResult with normalized amount if valid
 */
export function validateAmount(amount: string): ValidationResult {
  const trimmed = amount.trim();

  // Reject empty strings
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Amount is required',
    };
  }

  // Validate format: digits with optional decimal (up to 2 places)
  const amountRegex = /^[0-9]+(\.[0-9]{0,2})?$/;
  if (!amountRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Amount must be a valid number with up to 2 decimal places',
    };
  }

  // Parse and check range
  const numericAmount = parseFloat(trimmed);

  if (isNaN(numericAmount)) {
    return {
      isValid: false,
      error: 'Amount must be a valid number',
    };
  }

  if (numericAmount < VALIDATION_RULES.AMOUNT_MIN) {
    return {
      isValid: false,
      error: `Amount must be at least $${VALIDATION_RULES.AMOUNT_MIN.toFixed(2)}`,
    };
  }

  if (numericAmount > VALIDATION_RULES.AMOUNT_MAX) {
    return {
      isValid: false,
      error: `Amount cannot exceed $${VALIDATION_RULES.AMOUNT_MAX.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    };
  }

  // Normalize to 2 decimal places
  const normalized = numericAmount.toFixed(2);

  return {
    isValid: true,
    normalized,
  };
}

/**
 * Validates date input
 * @param dateString The date string to validate
 * @returns ValidationResult
 */
export function validateDate(dateString: string): ValidationResult {
  // Reject empty strings
  if (!dateString || !dateString.trim()) {
    return {
      isValid: false,
      error: 'Date is required',
    };
  }

  // Check for valid date object
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: 'Invalid date format',
    };
  }

  // Enforce range: within 1 year past/future from today
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const oneYearFuture = new Date(today);
  oneYearFuture.setFullYear(today.getFullYear() + 1);

  if (date < oneYearAgo) {
    return {
      isValid: false,
      error: 'Date cannot be more than 1 year in the past',
    };
  }

  if (date > oneYearFuture) {
    return {
      isValid: false,
      error: 'Date cannot be more than 1 year in the future',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validates payee input
 * @param payee The payee string to validate
 * @returns ValidationResult
 */
export function validatePayee(payee: string): ValidationResult {
  const trimmed = payee.trim();

  // Reject empty strings
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Payee name is required',
    };
  }

  // Check max length
  if (trimmed.length > VALIDATION_RULES.PAYEE_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Payee name cannot exceed ${VALIDATION_RULES.PAYEE_MAX_LENGTH} characters`,
    };
  }

  // Reject suspicious patterns (case-insensitive)
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /<iframe/i,
    /<img/i,
    /on\w+=/i, // Catches onclick=, onload=, etc.
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Payee name contains invalid characters or patterns',
      };
    }
  }

  return {
    isValid: true,
  };
}
