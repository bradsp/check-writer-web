
/**
 * Converts a number to its word representation
 * @param num The number to convert
 * @returns The number in words
 */
export function numberToWords(num: number): string {
  // Validate input
  if (typeof num !== 'number' || isNaN(num)) {
    throw new Error('Input must be a valid number');
  }
  if (num < 0) {
    throw new Error('Negative amounts are not allowed on checks');
  }
  if (num > 999999.99) {
    throw new Error('Amount exceeds maximum check value');
  }

  // Round to 2 decimal places to avoid floating point issues
  num = Math.round(num * 100) / 100;

  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const convertLessThanOneThousand = (num: number): string => {
    if (num === 0) return '';
    if (num < 20) return ones[num];

    const digit = num % 10;
    if (num < 100) {
      return tens[Math.floor(num / 10)] + (digit !== 0 ? '-' + ones[digit] : '');
    }

    const remainder = num % 100;
    return ones[Math.floor(num / 100)] + ' hundred' +
           (remainder !== 0 ? ' and ' + convertLessThanOneThousand(remainder) : '');
  };

  if (num === 0) return 'Zero and 00/100 Dollars';

  // Split whole and cents
  const wholeNum = Math.floor(num);
  const cents = Math.round((num - wholeNum) * 100);

  let result = '';

  if (wholeNum >= 1000000) {
    result += convertLessThanOneThousand(Math.floor(wholeNum / 1000000)) + ' million ';
  }

  if (wholeNum >= 1000) {
    const thousands = Math.floor((wholeNum % 1000000) / 1000);
    if (thousands > 0) {
      result += convertLessThanOneThousand(thousands) + ' thousand ';
    }
  }

  const remainder = wholeNum % 1000;
  if (remainder > 0) {
    result += convertLessThanOneThousand(remainder);
  }

  // Capitalize first letter
  result = result.trim();
  if (result) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  } else {
    result = 'Zero';
  }

  // Add cents
  const centsStr = cents.toString().padStart(2, '0');
  result += ` and ${centsStr}/100 Dollars`;

  return result;
}
