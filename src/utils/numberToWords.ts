
/**
 * Converts a number to its word representation
 * @param num The number to convert
 * @returns The number in words
 */
export function numberToWords(num: number): string {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const convertLessThanOneThousand = (num: number): string => {
    if (num === 0) {
      return '';
    }
    if (num < 20) {
      return ones[num];
    }
    
    const digit = num % 10;
    if (num < 100) {
      return tens[Math.floor(num / 10)] + (digit !== 0 ? '-' + ones[digit] : '');
    }
    
    return ones[Math.floor(num / 100)] + ' hundred' + 
           (num % 100 !== 0 ? ' ' + convertLessThanOneThousand(num % 100) : '');
  };

  if (num === 0) return 'zero';
  
  // Handle negative numbers
  if (num < 0) return 'negative ' + numberToWords(Math.abs(num));

  // Split into whole and decimal parts
  const parts = num.toString().split('.');
  const wholeNum = parseInt(parts[0], 10);
  const cents = parts.length > 1 ? parseInt(parts[1].padEnd(2, '0').substring(0, 2), 10) : 0;

  let result = '';
  
  if (wholeNum >= 1000000000) {
    result += convertLessThanOneThousand(Math.floor(wholeNum / 1000000000)) + ' billion ';
    num %= 1000000000;
  }
  
  if (wholeNum >= 1000000) {
    result += convertLessThanOneThousand(Math.floor(wholeNum / 1000000)) + ' million ';
    num %= 1000000;
  }
  
  if (wholeNum >= 1000) {
    result += convertLessThanOneThousand(Math.floor(wholeNum / 1000)) + ' thousand ';
    num %= 1000;
  }
  
  result += convertLessThanOneThousand(wholeNum % 1000);
  
  // Format the result - First letter capitalized
  result = result.trim();
  if (result) result = result.charAt(0).toUpperCase() + result.slice(1);
  
  // Format cents exactly like the Python code
  if (cents > 0) {
    result += ' and ' + cents + '/100';
  } else {
    result += ' and 00/100';
  }
  
  // Add "Dollars" to match typical check format
  result += ' Dollars';
  
  return result;
}

/**
 * Formats a number as currency
 * @param amount The amount to format
 * @returns Formatted amount as string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}
