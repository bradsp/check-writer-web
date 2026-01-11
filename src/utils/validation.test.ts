import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  validateAmount,
  validateDate,
  validatePayee,
  VALIDATION_RULES,
} from './validation';

describe('sanitizeText', () => {
  it('should remove HTML tags', () => {
    // DOMPurify keeps content between tags but removes the tags themselves
    expect(sanitizeText('<script>alert("xss")</script>')).not.toContain('<script>');
    expect(sanitizeText('<b>bold</b> text')).not.toContain('<b>');
    expect(sanitizeText('<b>bold</b> text')).not.toContain('</b>');
    expect(sanitizeText('<img src="x" onerror="alert(1)">')).not.toContain('<img');
  });

  it('should handle empty strings', () => {
    expect(sanitizeText('')).toBe('');
    expect(sanitizeText('   ')).toBe('   ');
  });

  it('should preserve safe text', () => {
    expect(sanitizeText('John Doe')).toBe('John Doe');
    expect(sanitizeText('ACME Corp.')).toBe('ACME Corp.');
    expect(sanitizeText('123 Main St.')).toBe('123 Main St.');
  });

  it('should handle special characters', () => {
    expect(sanitizeText('A & B Company')).toBe('A & B Company');
    expect(sanitizeText('Price: $100')).toBe('Price: $100');
  });
});

describe('validateAmount', () => {
  it('should validate correct amounts', () => {
    expect(validateAmount('100')).toEqual({
      isValid: true,
      normalized: '100.00',
    });
    expect(validateAmount('100.50')).toEqual({
      isValid: true,
      normalized: '100.50',
    });
    expect(validateAmount('0.01')).toEqual({
      isValid: true,
      normalized: '0.01',
    });
  });

  it('should reject empty or invalid amounts', () => {
    expect(validateAmount('')).toEqual({
      isValid: false,
      error: 'Amount is required',
    });
    expect(validateAmount('   ')).toEqual({
      isValid: false,
      error: 'Amount is required',
    });
    expect(validateAmount('abc')).toEqual({
      isValid: false,
      error: 'Amount must be a valid number with up to 2 decimal places',
    });
  });

  it('should reject amounts with too many decimal places', () => {
    expect(validateAmount('100.123')).toEqual({
      isValid: false,
      error: 'Amount must be a valid number with up to 2 decimal places',
    });
  });

  it('should reject amounts below minimum', () => {
    expect(validateAmount('0')).toEqual({
      isValid: false,
      error: `Amount must be at least $${VALIDATION_RULES.AMOUNT_MIN.toFixed(2)}`,
    });
    expect(validateAmount('0.00')).toEqual({
      isValid: false,
      error: `Amount must be at least $${VALIDATION_RULES.AMOUNT_MIN.toFixed(2)}`,
    });
  });

  it('should reject amounts above maximum', () => {
    expect(validateAmount('1000000')).toEqual({
      isValid: false,
      error: `Amount cannot exceed $${VALIDATION_RULES.AMOUNT_MAX.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    });
  });

  it('should normalize amounts to 2 decimal places', () => {
    expect(validateAmount('100').normalized).toBe('100.00');
    expect(validateAmount('100.5').normalized).toBe('100.50');
    expect(validateAmount('100.99').normalized).toBe('100.99');
  });

  it('should handle edge cases at boundaries', () => {
    expect(validateAmount('0.01')).toEqual({
      isValid: true,
      normalized: '0.01',
    });
    expect(validateAmount('999999.99')).toEqual({
      isValid: true,
      normalized: '999999.99',
    });
  });
});

describe('validateDate', () => {
  it('should accept valid dates', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(validateDate(today)).toEqual({
      isValid: true,
    });
  });

  it('should reject empty dates', () => {
    expect(validateDate('')).toEqual({
      isValid: false,
      error: 'Date is required',
    });
    expect(validateDate('   ')).toEqual({
      isValid: false,
      error: 'Date is required',
    });
  });

  it('should reject invalid date formats', () => {
    expect(validateDate('not-a-date')).toEqual({
      isValid: false,
      error: 'Invalid date format',
    });
    expect(validateDate('2024-13-01')).toEqual({
      isValid: false,
      error: 'Invalid date format',
    });
  });

  it('should reject dates more than 1 year in the past', () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const dateString = twoYearsAgo.toISOString().split('T')[0];

    expect(validateDate(dateString)).toEqual({
      isValid: false,
      error: 'Date cannot be more than 1 year in the past',
    });
  });

  it('should reject dates more than 1 year in the future', () => {
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    const dateString = twoYearsFromNow.toISOString().split('T')[0];

    expect(validateDate(dateString)).toEqual({
      isValid: false,
      error: 'Date cannot be more than 1 year in the future',
    });
  });

  it('should accept dates within valid range', () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const pastDateString = sixMonthsAgo.toISOString().split('T')[0];

    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    const futureDateString = sixMonthsFromNow.toISOString().split('T')[0];

    expect(validateDate(pastDateString).isValid).toBe(true);
    expect(validateDate(futureDateString).isValid).toBe(true);
  });
});

describe('validatePayee', () => {
  it('should accept valid payee names', () => {
    expect(validatePayee('John Doe')).toEqual({
      isValid: true,
    });
    expect(validatePayee('ACME Corporation')).toEqual({
      isValid: true,
    });
    expect(validatePayee('Dr. Smith & Associates')).toEqual({
      isValid: true,
    });
  });

  it('should reject empty payee names', () => {
    expect(validatePayee('')).toEqual({
      isValid: false,
      error: 'Payee name is required',
    });
    expect(validatePayee('   ')).toEqual({
      isValid: false,
      error: 'Payee name is required',
    });
  });

  it('should reject payee names exceeding max length', () => {
    const longName = 'a'.repeat(VALIDATION_RULES.PAYEE_MAX_LENGTH + 1);
    expect(validatePayee(longName)).toEqual({
      isValid: false,
      error: `Payee name cannot exceed ${VALIDATION_RULES.PAYEE_MAX_LENGTH} characters`,
    });
  });

  it('should accept payee names at max length', () => {
    const maxLengthName = 'a'.repeat(VALIDATION_RULES.PAYEE_MAX_LENGTH);
    expect(validatePayee(maxLengthName)).toEqual({
      isValid: true,
    });
  });

  it('should reject suspicious patterns - script tags', () => {
    expect(validatePayee('<script>alert(1)</script>')).toEqual({
      isValid: false,
      error: 'Payee name contains invalid characters or patterns',
    });
    expect(validatePayee('Name<SCRIPT>bad</SCRIPT>')).toEqual({
      isValid: false,
      error: 'Payee name contains invalid characters or patterns',
    });
  });

  it('should reject suspicious patterns - javascript:', () => {
    expect(validatePayee('javascript:alert(1)')).toEqual({
      isValid: false,
      error: 'Payee name contains invalid characters or patterns',
    });
    expect(validatePayee('JAVASCRIPT:alert(1)')).toEqual({
      isValid: false,
      error: 'Payee name contains invalid characters or patterns',
    });
  });

  it('should reject suspicious patterns - event handlers', () => {
    expect(validatePayee('name onerror=alert(1)')).toEqual({
      isValid: false,
      error: 'Payee name contains invalid characters or patterns',
    });
    expect(validatePayee('name onclick=bad')).toEqual({
      isValid: false,
      error: 'Payee name contains invalid characters or patterns',
    });
    expect(validatePayee('name onload=bad')).toEqual({
      isValid: false,
      error: 'Payee name contains invalid characters or patterns',
    });
  });

  it('should reject suspicious patterns - iframe and img tags', () => {
    expect(validatePayee('<iframe src="bad">')).toEqual({
      isValid: false,
      error: 'Payee name contains invalid characters or patterns',
    });
    expect(validatePayee('<img src="x" onerror="bad">')).toEqual({
      isValid: false,
      error: 'Payee name contains invalid characters or patterns',
    });
  });

  it('should handle mixed case in suspicious patterns', () => {
    expect(validatePayee('<ScRiPt>bad</ScRiPt>')).toEqual({
      isValid: false,
      error: 'Payee name contains invalid characters or patterns',
    });
    expect(validatePayee('OnErRoR=alert(1)')).toEqual({
      isValid: false,
      error: 'Payee name contains invalid characters or patterns',
    });
  });
});
