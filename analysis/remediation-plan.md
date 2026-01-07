# Remediation Plan

## Overview

This remediation plan addresses the 41 issues identified in the codebase audit, organized into four phases based on severity and dependencies. Each phase includes specific implementation steps, testing guidance, and effort estimates.

**Estimated Total Effort**: 80-120 developer hours across 4 phases

**Recommended Approach**: Execute phases sequentially, as later phases depend on infrastructure established in earlier phases.

---

## Phase 1: Critical Fixes (Do First)

**Objective**: Address critical security vulnerabilities, data integrity issues, and application stability problems that could cause financial errors or security breaches.

**Duration**: 2-3 weeks (30-40 hours)

**Priority**: IMMEDIATE - These issues pose security risks and could cause incorrect check printing.

---

### Fix 1.1: Implement Comprehensive Input Validation and Sanitization

**Effort**: Large

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\utils\validation.ts` (NEW)
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx`
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx`
- `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx`

**Implementation Approach**:

1. **Create validation utility** (`src/utils/validation.ts`):
```typescript
import DOMPurify from 'dompurify';

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

export function sanitizeText(input: string): string {
  // Remove HTML tags and encode special characters
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

export function validateAmount(amount: string): {
  isValid: boolean;
  error?: string;
  normalized?: string;
} {
  const trimmed = amount.trim();

  // Reject empty
  if (!trimmed) {
    return { isValid: false, error: 'Amount is required' };
  }

  // Reject non-numeric (except decimal point)
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) {
    return { isValid: false, error: 'Amount must be a number with up to 2 decimal places' };
  }

  // Parse and validate range
  const parsed = parseFloat(trimmed);
  if (isNaN(parsed)) {
    return { isValid: false, error: 'Invalid number format' };
  }

  if (parsed < VALIDATION_RULES.AMOUNT_MIN) {
    return { isValid: false, error: `Amount must be at least $${VALIDATION_RULES.AMOUNT_MIN}` };
  }

  if (parsed > VALIDATION_RULES.AMOUNT_MAX) {
    return { isValid: false, error: `Amount cannot exceed $${VALIDATION_RULES.AMOUNT_MAX.toLocaleString()}` };
  }

  // Normalize to 2 decimal places
  const normalized = parsed.toFixed(2);
  return { isValid: true, normalized };
}

export function validateDate(dateString: string): {
  isValid: boolean;
  error?: string;
} {
  if (!dateString) {
    return { isValid: false, error: 'Date is required' };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  // Reject dates too far in past/future
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const oneYearFuture = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  if (date < oneYearAgo || date > oneYearFuture) {
    return { isValid: false, error: 'Date must be within one year of today' };
  }

  return { isValid: true };
}

export function validatePayee(payee: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = payee.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Payee name is required' };
  }

  if (trimmed.length > VALIDATION_RULES.PAYEE_MAX_LENGTH) {
    return { isValid: false, error: `Payee name cannot exceed ${VALIDATION_RULES.PAYEE_MAX_LENGTH} characters` };
  }

  // Reject suspicious patterns
  if (/<script|javascript:|onerror=/i.test(trimmed)) {
    return { isValid: false, error: 'Invalid characters in payee name' };
  }

  return { isValid: true };
}
```

2. **Update CheckForm to use validation**:
   - Add maxLength attributes to all inputs
   - Replace regex validation with `validateAmount()`
   - Sanitize all text inputs before state updates
   - Show specific field-level error messages

3. **Update Index.tsx validation**:
   - Use validation utilities in `onBeforePrint`
   - Provide specific error messages for each validation failure

4. **Install DOMPurify dependency**:
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

**Testing**:
- [ ] Test XSS attempts: `<script>alert('XSS')</script>`, `<img src=x onerror=alert(1)>`
- [ ] Test SQL injection patterns (though no backend, good practice): `'; DROP TABLE--`
- [ ] Test amount edge cases: 0, 0.001, 999999999, -100, empty, "abc", "100.", ".50"
- [ ] Test invalid dates: "2020-02-30", "invalid", empty string
- [ ] Test max length: Enter 200 characters in each field
- [ ] Test special characters: quotes, apostrophes, accented characters
- [ ] Verify error messages are clear and actionable

**Dependencies**: None

---

### Fix 1.2: Fix Number-to-Words Conversion

**Effort**: Medium

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\utils\numberToWords.ts`
- `C:\Users\brads\source\repos\check-writer-web\src\utils\numberToWords.test.ts` (NEW)

**Implementation Approach**:

1. **Rewrite numberToWords function**:
```typescript
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
  result = result.charAt(0).toUpperCase() + result.slice(1);

  // Add cents
  const centsStr = cents.toString().padStart(2, '0');
  result += ` and ${centsStr}/100 Dollars`;

  return result;
}
```

2. **Create comprehensive test suite**:
```typescript
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
    expect(numberToWords(102)).toBe('One hundred and two and 00/100 Dollars');
    expect(numberToWords(120)).toBe('One hundred and twenty and 00/100 Dollars');
  });

  it('handles thousands', () => {
    expect(numberToWords(1000)).toBe('One thousand and 00/100 Dollars');
    expect(numberToWords(1234.56)).toBe('One thousand two hundred and thirty-four and 56/100 Dollars');
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
});
```

3. **Install Vitest for testing**:
```bash
npm install --save-dev vitest
```

4. **Add test script to package.json**:
```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

**Testing**:
- [ ] Run all unit tests and ensure 100% pass rate
- [ ] Manual test with actual check printing for: 0, 0.01, 100, 1234.56, 999999.99
- [ ] Verify "and" appears correctly between hundreds and remainder
- [ ] Verify cents always show as XX/100 format
- [ ] Test error cases throw appropriate errors

**Dependencies**: None

---

### Fix 1.3: Replace setTimeout with useEffect

**Effort**: Small

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx`

**Implementation Approach**:

1. **Remove setTimeout hack**:

Replace lines 64-82 with:
```typescript
const [formData, setFormData] = useState<CheckFormData | null>(null);
const [shouldPrint, setShouldPrint] = useState(false);

useEffect(() => {
  if (shouldPrint && formData) {
    // State has been updated, trigger print
    handlePrint();
    setShouldPrint(false);
  }
}, [shouldPrint, formData]);

const handleFormSubmit = (newFormData: CheckFormData) => {
  // Update all state at once
  setFormData(newFormData);
  setDate(newFormData.date);
  setPayee(newFormData.payee);
  setAddress(newFormData.address);
  setCity(newFormData.city);
  setState(newFormData.state);
  setZipCode(newFormData.zipCode);
  setAmount(newFormData.amount);
  setMemo(newFormData.memo);

  // Show preview
  setShowPreview(true);

  // Trigger print on next render
  setShouldPrint(true);
};
```

2. **Add useEffect import**:
```typescript
import React, { useState, useRef, useEffect } from 'react';
```

**Testing**:
- [ ] Verify print dialog appears immediately after form submission
- [ ] Verify all check data is correctly populated in print view
- [ ] Test rapid double-clicking "Print Check" button doesn't cause issues
- [ ] Test on slow devices/throttled CPU

**Dependencies**: None

---

### Fix 1.4: Fix Date Handling and Validation

**Effort**: Medium

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\utils\dateHelpers.ts` (NEW)
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx`
- `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx`
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx`

**Implementation Approach**:

1. **Create date utility** (`src/utils/dateHelpers.ts`):
```typescript
import { format, isValid, parseISO } from 'date-fns';

export function getTodayLocalISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

export function isValidCheckDate(isoDateString: string): boolean {
  try {
    const date = parseISO(isoDateString);
    return isValid(date);
  } catch {
    return false;
  }
}
```

2. **Update CheckPreview.tsx**:
   - Replace line 19 with: `const formattedDate = formatCheckDate(date);`
   - Add error display if date is "Invalid Date"

3. **Update Index.tsx and CheckForm.tsx**:
   - Replace `new Date().toISOString().split('T')[0]` with `getTodayLocalISO()`

4. **Add date-fns if not already installed** (it is, but ensure it's used):
```bash
npm install date-fns
```

**Testing**:
- [ ] Verify default date matches local timezone date
- [ ] Test date formatting consistency across browsers
- [ ] Test invalid dates show "Invalid Date" instead of crashing
- [ ] Test leap year dates: 2024-02-29
- [ ] Test timezone boundaries: Set computer to different timezones and verify date

**Dependencies**: Fix 1.1 (validation utilities)

---

### Fix 1.5: Implement Error Boundary

**Effort**: Small

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\components\ErrorBoundary.tsx` (NEW)
- `C:\Users\brads\source\repos\check-writer-web\src\App.tsx`

**Implementation Approach**:

1. **Create ErrorBoundary component**:
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-600 text-5xl mb-4">⚠</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="text-left mb-4 p-3 bg-gray-50 rounded text-sm">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <Button onClick={this.handleReset} className="w-full">
              Return to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

2. **Wrap App in ErrorBoundary** (App.tsx):
```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      {/* ... rest of app */}
    </QueryClientProvider>
  </ErrorBoundary>
);
```

**Testing**:
- [ ] Trigger error by temporarily adding `throw new Error('test')` in CheckPreview
- [ ] Verify error boundary catches error and shows fallback UI
- [ ] Verify "Return to Home" button works
- [ ] Verify error is logged to console
- [ ] Test error in different components

**Dependencies**: None

---

### Fix 1.6: Remove Console Logging in Production

**Effort**: Small

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\pages\NotFound.tsx`
- `C:\Users\brads\source\repos\check-writer-web\vite.config.ts`

**Implementation Approach**:

1. **Remove or conditionalize console.error** (NotFound.tsx):
```typescript
useEffect(() => {
  if (import.meta.env.DEV) {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }
}, [location.pathname]);
```

2. **Add Vite plugin to strip console in production** (vite.config.ts):
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
  },
}));
```

3. **Install terser if needed**:
```bash
npm install --save-dev terser
```

**Testing**:
- [ ] Build production bundle: `npm run build`
- [ ] Check dist files don't contain console.log statements
- [ ] Verify development mode still shows console logs
- [ ] Test 404 page in both dev and prod builds

**Dependencies**: None

---

### Fix 1.7: Add Content Security Policy

**Effort**: Small

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\index.html`
- Production server configuration (Nginx/Apache)

**Implementation Approach**:

1. **Add CSP meta tag to index.html**:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://cdn.gpteng.co;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self';
  frame-ancestors 'none';
">
```

2. **Consider removing external script** (line 24):
   - Evaluate if `gptengineer.js` is necessary
   - If it's just analytics/tracking, consider removing or using async loading

3. **Document server-side CSP headers** for production:
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.gpteng.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Testing**:
- [ ] Test app loads correctly with CSP
- [ ] Check browser console for CSP violations
- [ ] Verify all fonts, images, and styles load
- [ ] Test print functionality works
- [ ] Use CSP Evaluator tool: https://csp-evaluator.withgoogle.com/

**Dependencies**: None

---

## Phase 2: High Priority Fixes

**Objective**: Address significant bugs, improve user experience, and resolve major code quality issues.

**Duration**: 2-3 weeks (25-35 hours)

---

### Fix 2.1: Consolidate State Management

**Effort**: Medium

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx`
- `C:\Users\brads\source\repos\check-writer-web\src\types\check.ts` (NEW)

**Implementation Approach**:

1. **Create type definition**:
```typescript
export interface CheckData {
  date: string;
  payee: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  amount: string;
  memo: string;
}
```

2. **Replace 8 useState with single state**:
```typescript
const [checkData, setCheckData] = useState<CheckData>({
  date: getTodayLocalISO(),
  payee: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  amount: '',
  memo: '',
});

const updateCheckData = (updates: Partial<CheckData>) => {
  setCheckData(prev => ({ ...prev, ...updates }));
};
```

3. **Update CheckForm to use consolidated state**
4. **Update CheckPreview to destructure from single object**

**Testing**:
- [ ] Verify all form updates work correctly
- [ ] Test form submission and printing
- [ ] Verify no regression in functionality

**Dependencies**: Phase 1 completion

---

### Fix 2.2: Improve Print Workflow UX

**Effort**: Medium

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx`
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx`

**Implementation Approach**:

1. **Add preview step before print**:
   - Change "Print Check" button to "Preview Check"
   - Show CheckPreview on screen
   - Add "Print" and "Edit" buttons in preview

2. **Add loading state**:
```typescript
const [isPrinting, setIsPrinting] = useState(false);

const handlePrint = useReactToPrint({
  // ... existing config
  onBeforeGetContent: () => {
    setIsPrinting(true);
    return Promise.resolve();
  },
  onAfterPrint: () => {
    setIsPrinting(false);
    toast({
      title: "Check Printed",
      description: "The check was sent to your printer successfully.",
    });
  },
});
```

3. **Update button to show loading**:
```typescript
<Button onClick={handlePrint} disabled={isPrinting}>
  {isPrinting ? 'Printing...' : 'Print Check'}
</Button>
```

**Testing**:
- [ ] Verify preview shows before print dialog
- [ ] Test "Edit" returns to form with data preserved
- [ ] Verify loading state shows during print
- [ ] Test ESC key dismisses preview

**Dependencies**: Fix 2.1

---

### Fix 2.3: Fix NaN Handling in Amount Display

**Effort**: Small

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx`

**Implementation Approach**:

1. **Add NaN check**:
```typescript
const formattedAmount = (() => {
  if (!amount) return '';
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return 'Invalid Amount';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(parsed);
})();
```

2. **Add visual indicator for invalid amounts**:
```typescript
<div className={cn(
  "absolute right-[0.5in] top-[1.25in] text-right text-sm font-bold",
  isNaN(parseFloat(amount)) && "text-red-600"
)}>
  {formattedAmount}
</div>
```

**Testing**:
- [ ] Test with invalid amount inputs
- [ ] Verify "Invalid Amount" shows instead of "NaN"
- [ ] Verify validation prevents printing with invalid amount

**Dependencies**: Fix 1.1 (validation should prevent this, but defense in depth)

---

### Fix 2.4: Extract Shared Utility Functions

**Effort**: Small

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\utils\checkFormatting.ts` (NEW)
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx`
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx`

**Implementation Approach**:

1. **Create shared utility**:
```typescript
export const CHECK_CONSTANTS = {
  AMOUNT_LINE_MAX_LENGTH: 80,
} as const;

export function padWithAsterisks(text: string, maxLength: number = CHECK_CONSTANTS.AMOUNT_LINE_MAX_LENGTH): string {
  if (!text) return '';

  const padLength = maxLength - text.length;
  if (padLength <= 0) return text;

  const padding = '*'.repeat(padLength);
  return `${text} ${padding}`;
}
```

2. **Replace duplicate implementations** in both components

**Testing**:
- [ ] Verify asterisk padding works in both form and preview
- [ ] Test with various amount lengths

**Dependencies**: None

---

### Fix 2.5: Fix Toast Removal Delay

**Effort**: Small

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\hooks\use-toast.ts`

**Implementation Approach**:

1. **Change TOAST_REMOVE_DELAY**:
```typescript
const TOAST_REMOVE_DELAY = 5000 // 5 seconds
```

2. **Make it configurable per toast**:
```typescript
function toast({ duration = 5000, ...props }: Toast & { duration?: number }) {
  // ... existing code

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, duration)

  // ...
}
```

**Testing**:
- [ ] Verify toasts dismiss after 5 seconds
- [ ] Test custom duration toasts
- [ ] Verify no memory leaks with multiple toasts

**Dependencies**: None

---

### Fix 2.6: Improve Error Messages

**Effort**: Small

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx`
- `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx`

**Implementation Approach**:

1. **Add field-specific errors**:
```typescript
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

const validateForm = (): boolean => {
  const errors: Record<string, string> = {};

  const dateValidation = validateDate(date);
  if (!dateValidation.isValid) {
    errors.date = dateValidation.error!;
  }

  const payeeValidation = validatePayee(payee);
  if (!payeeValidation.isValid) {
    errors.payee = payeeValidation.error!;
  }

  const amountValidation = validateAmount(amount);
  if (!amountValidation.isValid) {
    errors.amount = amountValidation.error!;
  }

  setFieldErrors(errors);

  if (Object.keys(errors).length > 0) {
    toast({
      title: "Validation Failed",
      description: "Please correct the errors in the form",
      variant: "destructive"
    });
    return false;
  }

  return true;
};
```

2. **Display errors under each field**:
```typescript
<Input
  id="amount"
  aria-invalid={!!fieldErrors.amount}
  aria-describedby={fieldErrors.amount ? "amount-error" : undefined}
  // ... other props
/>
{fieldErrors.amount && (
  <p id="amount-error" className="text-sm text-red-600 mt-1">
    {fieldErrors.amount}
  </p>
)}
```

**Testing**:
- [ ] Test each validation error shows under correct field
- [ ] Verify errors clear when field is corrected
- [ ] Test accessibility with screen reader

**Dependencies**: Fix 1.1 (validation utilities)

---

### Fix 2.7: Add Loading States

**Effort**: Small (covered in Fix 2.2)

---

### Fix 2.8: Improve Accessibility

**Effort**: Medium

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx`

**Implementation Approach**:

1. **Add ARIA attributes to all inputs**:
```typescript
<Input
  id="date"
  type="date"
  aria-required="true"
  aria-label="Check date"
  aria-describedby="date-help"
  // ...
/>
<span id="date-help" className="sr-only">
  Enter the date to appear on the check in MM/DD/YYYY format
</span>
```

2. **Add keyboard navigation**:
```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handlePrintClick();
  }
};

<form onKeyDown={handleKeyDown}>
  {/* form content */}
</form>
```

3. **Add focus management**:
```typescript
const firstInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  firstInputRef.current?.focus();
}, []);
```

4. **Add screen reader announcements**:
```typescript
<div role="status" aria-live="polite" className="sr-only">
  {amountInWords && `Amount in words: ${amountInWords}`}
</div>
```

**Testing**:
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Verify all form controls are keyboard accessible
- [ ] Test Enter key submits form
- [ ] Test Tab order is logical
- [ ] Run axe DevTools for WCAG compliance
- [ ] Verify focus is visible on all interactive elements

**Dependencies**: Fix 2.6 (error messages)

---

### Fix 2.9-2.11: Dependency Management

**Effort**: Medium

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\package.json`

**Implementation Approach**:

1. **Remove unused dependencies**:
```bash
npm uninstall @tanstack/react-query next-themes recharts cmdk embla-carousel-react input-otp react-resizable-panels vaul
```

2. **Update App.tsx** to remove QueryClientProvider:
```typescript
const App = () => (
  <ErrorBoundary>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ErrorBoundary>
);
```

3. **Update major dependencies**:
```bash
npm install react@19 react-dom@19
npm install react-router-dom@7
npm install date-fns@4
```

4. **Verify no breaking changes**:
   - Test all functionality after each major update
   - Read migration guides for React 19 and React Router 7

**Testing**:
- [ ] Build project: `npm run build`
- [ ] Test all features work after removals
- [ ] Verify bundle size decreased
- [ ] Check no console errors about missing dependencies
- [ ] Test print functionality thoroughly

**Dependencies**: None (but do carefully)

---

## Phase 3: Medium Priority Improvements

**Objective**: Improve code quality, fix minor bugs, and enhance user experience.

**Duration**: 2 weeks (20-25 hours)

---

### Fix 3.1: Add Input Length Limits

**Effort**: Small

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx`

**Implementation Approach**:

Add maxLength to all inputs based on VALIDATION_RULES:
```typescript
<Input
  id="payee"
  maxLength={VALIDATION_RULES.PAYEE_MAX_LENGTH}
  // ...
/>
```

**Testing**:
- [ ] Verify can't enter more than max length
- [ ] Test paste operation respects max length

**Dependencies**: Fix 1.1

---

### Fix 3.2: Fix Number-to-Words Grammar

**Effort**: Small (already fixed in Fix 1.2)

---

### Fix 3.3: Fix Date Timezone Issue

**Effort**: Small (already fixed in Fix 1.4)

---

### Fix 3.4: Remove Unused formatCurrency

**Effort**: Small

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\utils\numberToWords.ts`
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx`

**Implementation Approach**:

1. Delete `formatCurrency` function (lines 81-87 in numberToWords.ts)
2. Remove import from CheckForm.tsx

**Testing**:
- [ ] Verify no references to formatCurrency remain
- [ ] Build succeeds

**Dependencies**: None

---

### Fix 3.5: Add Clear Form Confirmation

**Effort**: Small

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx`

**Implementation Approach**:

```typescript
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const handleClear = () => {
  // Clear logic
};

// In render:
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="outline">Clear Form</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Clear Form?</AlertDialogTitle>
      <AlertDialogDescription>
        This will clear all fields. This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleClear}>Clear</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Testing**:
- [ ] Verify confirmation shows before clearing
- [ ] Test Cancel button preserves data
- [ ] Test Clear button removes all data

**Dependencies**: None

---

### Fix 3.6: Improve Preview Visibility

**Effort**: Medium

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx`
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx`

**Implementation Approach**:

Already covered in Fix 2.2 (Preview before print)

**Dependencies**: Fix 2.2

---

### Fix 3.7-3.12: UI/UX Polish

**Effort**: Small for each

Fixes to implement:
- Add keyboard shortcuts (Ctrl+P, Enter to submit)
- Fix button styling inconsistency (use variant system)
- Add $ symbol to amount input (use input adornment)
- Add animation to amount-in-words update
- Add currency symbol visual
- Add transition effects

**Dependencies**: Phase 2 completion

---

### Fix 3.13: Clean Up Magic Numbers

**Effort**: Small

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\utils\checkFormatting.ts`
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx`
- `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx`

**Implementation Approach**:

Create constants file and replace all magic numbers:
```typescript
export const CHECK_DIMENSIONS = {
  PAGE_WIDTH: '8.5in',
  PAGE_HEIGHT: '11in',
  CHECK_HEIGHT: '3.5in',
  DATE_RIGHT: '2.5in',
  DATE_TOP: '1.25in',
  AMOUNT_RIGHT: '0.5in',
  AMOUNT_TOP: '1.25in',
  AMOUNT_WORDS_LEFT: '10',
  AMOUNT_WORDS_TOP: '1.75in',
  PAYEE_LEFT: '1.1in',
  PAYEE_TOP: '2.05in',
  MAX_AMOUNT_LINE_LENGTH: 80,
} as const;
```

**Testing**:
- [ ] Verify print layout unchanged
- [ ] Check constants are used consistently

**Dependencies**: None

---

### Fix 3.14: Add PropTypes Validation

**Effort**: Small

**Files to Modify**:
- All component files

**Implementation Approach**:

Since TypeScript strict mode should be enabled eventually, focus on that instead of PropTypes.

**Dependencies**: Phase 4 (TypeScript strict mode)

---

## Phase 4: Low Priority Enhancements

**Objective**: Polish, optimization, and nice-to-have features.

**Duration**: 1 week (10-15 hours)

---

### Fix 4.1: Add Security Headers Documentation

**Effort**: Small

Create deployment guide with security header recommendations.

---

### Fix 4.2: Enable TypeScript Strict Mode

**Effort**: Large

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\tsconfig.app.json`
- All TypeScript files (fix type errors)

**Implementation Approach**:

1. **Enable strict mode gradually**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    // ...
  }
}
```

2. **Fix type errors file by file**:
   - Start with utilities (numberToWords.ts, validation.ts)
   - Then components (CheckForm, CheckPreview)
   - Finally pages (Index, NotFound)

3. **Add proper type annotations**:
```typescript
// Before:
const [amount, setAmount] = useState('');

// After:
const [amount, setAmount] = useState<string>('');
```

**Testing**:
- [ ] Fix all TypeScript errors
- [ ] Verify no runtime regressions
- [ ] Build succeeds with no warnings

**Dependencies**: All previous phases (easier to enable strict mode after refactoring)

---

### Fix 4.3: Implement Dark Mode

**Effort**: Medium

**Files to Modify**:
- `C:\Users\brads\source\repos\check-writer-web\src\App.tsx`
- `C:\Users\brads\source\repos\check-writer-web\src\components\ThemeToggle.tsx` (NEW)

**Implementation Approach**:

1. **Add ThemeProvider**:
```typescript
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="system">
  {/* app content */}
</ThemeProvider>
```

2. **Create toggle component**:
```typescript
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

3. **Install next-themes** (already installed)

**Testing**:
- [ ] Verify theme persists across page refreshes
- [ ] Test system theme detection
- [ ] Verify print view unaffected by theme

**Dependencies**: None

---

### Fix 4.4-4.8: Polish and Optimization

Fixes to implement:
- Dynamic copyright year
- Improved address formatting readability
- Add unit tests for all utilities
- Component decomposition (split CheckPreview)
- Performance optimization

**Dependencies**: Previous phases

---

## Recommended Development Practices

### 1. Code Review Process

- **Mandatory review** for all changes to numberToWords, validation, and print logic
- **Checklist**:
  - [ ] All tests pass
  - [ ] No new TypeScript errors
  - [ ] Bundle size impact reviewed
  - [ ] Accessibility tested
  - [ ] Print functionality manually tested

### 2. Testing Strategy

- **Unit tests**: All utility functions (numberToWords, validation, date helpers)
- **Integration tests**: Form submission, print workflow
- **E2E tests**: Full check printing scenario
- **Manual testing**: Actual print on check stock before each release

### 3. Dependency Management

- **Monthly**: Run `npm outdated` and review updates
- **Weekly**: Run `npm audit` and address vulnerabilities
- **Before updates**: Read changelogs and test thoroughly

### 4. TypeScript Hygiene

- **Goal**: Achieve 100% type coverage
- **Rule**: No `any` types without explicit justification comment
- **Enforcement**: Enable `@typescript-eslint/no-explicit-any` in ESLint

### 5. Accessibility First

- **Every new feature**: Test with keyboard and screen reader
- **CI check**: Run axe-core automated tests
- **Goal**: WCAG 2.1 Level AA compliance

### 6. Performance Monitoring

- **Lighthouse**: Target 95+ performance score
- **Bundle size**: Keep production bundle under 200KB
- **Monitor**: Use Webpack Bundle Analyzer

### 7. Security Practices

- **Input validation**: Every user input must be validated
- **Output encoding**: All dynamic content must be properly encoded
- **CSP**: Maintain strict Content Security Policy
- **Dependencies**: Keep dependencies updated, no known vulnerabilities

### 8. Documentation

- **Inline comments**: For complex logic (especially number conversion, print positioning)
- **JSDoc**: For all public functions and components
- **CLAUDE.md**: Keep updated with architecture changes
- **Changelog**: Document all user-facing changes

### 9. Version Control

- **Branch strategy**: feature/fix/refactor branches off main
- **Commit messages**: Follow Conventional Commits format
- **PR template**: Include testing checklist
- **Squash merges**: Keep main branch history clean

### 10. Deployment

- **Staging environment**: Test all changes in production-like environment
- **Blue-green deployment**: Zero-downtime deployments
- **Rollback plan**: Document how to revert to previous version
- **Monitoring**: Set up error tracking (e.g., Sentry)

---

## Estimated Timeline

### Phase 1: Critical Fixes
- **Duration**: 2-3 weeks
- **Effort**: 30-40 hours
- **Blockers**: None
- **Target completion**: Week 3

### Phase 2: High Priority
- **Duration**: 2-3 weeks
- **Effort**: 25-35 hours
- **Blockers**: Requires Phase 1 completion
- **Target completion**: Week 6

### Phase 3: Medium Priority
- **Duration**: 2 weeks
- **Effort**: 20-25 hours
- **Blockers**: Requires Phase 2 completion
- **Target completion**: Week 8

### Phase 4: Low Priority
- **Duration**: 1 week
- **Effort**: 10-15 hours
- **Blockers**: Requires Phase 3 completion
- **Target completion**: Week 9

### Total Timeline: 9 weeks (2-3 months)

### Parallel Work Opportunities

Some fixes can be done in parallel:
- Phase 1.5 (Error Boundary) can be done anytime
- Phase 1.6 (Console logging) independent
- Phase 1.7 (CSP) independent
- Phase 2.9-2.11 (Dependencies) can start during Phase 1
- Phase 4.1 (Documentation) can be done anytime

### Minimum Viable Product (MVP) Path

If time is constrained, prioritize:
1. Fix 1.1 (Validation)
2. Fix 1.2 (Number conversion)
3. Fix 1.3 (Print race condition)
4. Fix 1.4 (Date handling)
5. Fix 1.5 (Error boundary)
6. Fix 2.2 (Print UX)
7. Fix 2.6 (Error messages)
8. Fix 2.8 (Accessibility basics)

This MVP path addresses critical security and functionality issues (estimated 3-4 weeks).

---

## Success Metrics

Track these metrics to measure improvement:

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] 0 ESLint errors
- [ ] Test coverage > 80%
- [ ] Bundle size < 200KB

### Security
- [ ] 0 npm audit high/critical vulnerabilities
- [ ] CSP implemented
- [ ] No console logging in production
- [ ] Input validation on all fields

### User Experience
- [ ] WCAG 2.1 Level AA compliance
- [ ] <3s page load time
- [ ] 0 user-reported printing errors
- [ ] Clear error messages for all validation

### Reliability
- [ ] Error boundary implemented
- [ ] 0 unhandled promise rejections
- [ ] Proper error handling on all async operations
- [ ] Race conditions eliminated

### Maintainability
- [ ] <200 lines per component
- [ ] <10% code duplication
- [ ] All complex logic has comments
- [ ] Consistent code style (Prettier configured)
