import { describe, it, expect } from 'vitest';
import { numberToWords } from './numberToWords';

describe('numberToWords', () => {
  it('handles zero', () => {
    expect(numberToWords(0)).toBe('Zero and 00/100 Dollars');
  });

  it('handles ones', () => {
    expect(numberToWords(1)).toBe('One and 00/100 Dollars');
    expect(numberToWords(9)).toBe('Nine and 00/100 Dollars');
  });

  it('handles teens', () => {
    expect(numberToWords(10)).toBe('Ten and 00/100 Dollars');
    expect(numberToWords(15)).toBe('Fifteen and 00/100 Dollars');
    expect(numberToWords(19)).toBe('Nineteen and 00/100 Dollars');
  });

  it('handles tens', () => {
    expect(numberToWords(20)).toBe('Twenty and 00/100 Dollars');
    expect(numberToWords(99)).toBe('Ninety-nine and 00/100 Dollars');
  });

  it('handles hundreds with "and"', () => {
    expect(numberToWords(100)).toBe('One hundred and 00/100 Dollars');
    expect(numberToWords(102)).toBe('One hundred two and 00/100 Dollars');
    expect(numberToWords(120)).toBe('One hundred twenty and 00/100 Dollars');
  });

  it('handles thousands', () => {
    expect(numberToWords(1000)).toBe('One thousand and 00/100 Dollars');
    expect(numberToWords(1234.56)).toBe('One thousand two hundred thirty-four and 56/100 Dollars');
  });

  it('handles cents correctly', () => {
    expect(numberToWords(0.01)).toBe('Zero and 01/100 Dollars');
    expect(numberToWords(0.99)).toBe('Zero and 99/100 Dollars');
    expect(numberToWords(100.50)).toBe('One hundred and 50/100 Dollars');
  });

  it('rejects negative numbers', () => {
    expect(() => numberToWords(-1)).toThrow('Negative amounts are not allowed');
  });

  it('rejects amounts over limit', () => {
    expect(() => numberToWords(10000000)).toThrow('Amount exceeds maximum');
  });

  it('rejects NaN', () => {
    expect(() => numberToWords(NaN)).toThrow('Input must be a valid number');
  });

  it('handles floating point precision', () => {
    expect(numberToWords(0.1 + 0.2)).toBe('Zero and 30/100 Dollars');
  });

  it('handles large amounts', () => {
    expect(numberToWords(999999.99)).toBe('Nine hundred ninety-nine thousand nine hundred ninety-nine and 99/100 Dollars');
  });
});
