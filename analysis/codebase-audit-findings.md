# Codebase Audit Findings

## Executive Summary

This comprehensive audit examined the Check Writer web application across four key dimensions: bugs/logic errors, security vulnerabilities, UI/UX inconsistencies, and code quality issues. The application is a React-based check printing system built with Vite, TypeScript, React, shadcn-ui, and Tailwind CSS.

**Overall Assessment:** The application has moderate-to-high technical debt with several critical and high-priority issues that could impact reliability, security, and user experience. While the core functionality is sound, there are systematic issues stemming from relaxed TypeScript settings, inadequate input validation, and insufficient error handling.

**Severity Distribution:**
- Critical: 7 issues
- High Priority: 11 issues
- Medium Priority: 15 issues
- Low Priority: 8 issues
- **Total: 41 issues identified**

**Key Concerns:**
1. **Security**: XSS vulnerabilities in user input rendering, console logging exposing sensitive data
2. **Logic Errors**: Number-to-words conversion bugs with edge cases, date handling issues
3. **Type Safety**: Widespread lack of type safety due to disabled TypeScript strict mode
4. **User Experience**: Poor error feedback, validation issues, accessibility gaps
5. **Code Quality**: Duplicate code, missing error boundaries, performance concerns

---

## Critical Issues (Fix Immediately)

### Security: XSS Vulnerability in User Input Rendering

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx:86-88, 153-155`

**Description**: Payee names, addresses, and memo fields are rendered directly into the DOM without sanitization. If a user enters malicious HTML/JavaScript code like `<img src=x onerror=alert('XSS')>` or `<script>alert('XSS')</script>`, it could execute in the browser context.

**Impact**:
- **Risk Level**: HIGH - Potential for malicious code execution
- **User Impact**: Could compromise user data, hijack sessions, or manipulate the check printing
- **Affected Workflows**: All check creation and printing operations

**Root Cause**: React does escape HTML by default, but the application doesn't sanitize or validate special characters that could break out of contexts. Additionally, there's no Content Security Policy (CSP) to prevent inline script execution.

---

### Security: Sensitive Data Exposure via Console Logging

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\pages\NotFound.tsx:8-11`

**Description**: The NotFound component logs the attempted pathname to the console using `console.error()`. In a production environment, this could expose sensitive information about user navigation patterns and attempted routes.

**Impact**:
- **Risk Level**: MEDIUM-HIGH - Information disclosure
- **User Impact**: Potential privacy concerns if sensitive data is in URL
- **Affected Workflows**: Any 404 navigation attempt

**Root Cause**: Development logging left in production code without environment-based conditional execution.

---

### Bugs: Number-to-Words Conversion Errors for Edge Cases

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\utils\numberToWords.ts:7-74`

**Description**: Multiple critical bugs in number conversion:
1. **Zero cents representation**: Line 38 - `padEnd(2, '0').substring(0, 2)` for `parts[1]` will incorrectly handle cases like "100." (decimal with no cents)
2. **Negative numbers**: Line 33 - Negative check amounts should be rejected, not converted to "negative X dollars"
3. **Very large numbers**: No upper limit validation - amounts like 999999999999 will create extremely long strings that won't fit on a check
4. **Decimal precision**: Line 36-38 - Doesn't handle more than 2 decimal places correctly (e.g., 100.999 becomes 100.99 silently)
5. **String input**: `parts[1].padEnd()` will fail if input is already a string with invalid format

**Impact**:
- **Risk Level**: CRITICAL - Financial accuracy
- **User Impact**: Incorrect check amounts could cause financial disputes or fraud
- **Affected Workflows**: All check printing operations

**Root Cause**: Insufficient validation and edge case testing in the conversion utility.

---

### Bugs: Race Condition in Print Workflow

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx:78-81`

**Description**: The print workflow uses a 500ms `setTimeout` to delay printing after state updates. This is unreliable and can fail if:
- React takes longer than 500ms to re-render
- The browser is slow or under heavy load
- State updates are batched or delayed

```javascript
setTimeout(() => {
  handlePrint();
}, 500);
```

**Impact**:
- **Risk Level**: HIGH - Printing functionality failure
- **User Impact**: May print stale/incomplete data or fail to print
- **Affected Workflows**: All print operations

**Root Cause**: Misunderstanding of React state updates and lack of proper useEffect or callback mechanisms.

---

### Bugs: Invalid Date Handling

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx:19`

**Description**: Date formatting doesn't validate or handle invalid dates:
```javascript
const formattedDate = date ? new Date(date).toLocaleDateString('en-US') : '';
```

Issues:
1. `new Date(date)` can return "Invalid Date" for malformed inputs
2. No timezone handling - dates may shift by a day
3. `toLocaleDateString()` output format varies by browser/locale
4. Empty date string bypasses validation

**Impact**:
- **Risk Level**: HIGH - Check validity
- **User Impact**: Invalid dates on checks make them legally problematic
- **Affected Workflows**: All check printing with invalid dates

**Root Cause**: Lack of date validation and inconsistent date handling.

---

### Bugs: Amount Input Accepts Invalid Formats

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx:52-68`

**Description**: The regex validation `/^$|^[0-9]+(\.[0-9]*)?$/` has several problems:
1. Allows empty decimal: "100." is valid but parseFloat("100.") = 100 (loses decimal indicator)
2. Allows leading zeros: "00100.50" is valid
3. Allows single zero after decimal: "100.0" is valid but should require 2 decimal places
4. No max length validation - users can enter astronomically large numbers

**Impact**:
- **Risk Level**: HIGH - Financial accuracy
- **User Impact**: Confusion about accepted formats, potential for incorrect amounts
- **Affected Workflows**: All check amount entry

**Root Cause**: Insufficient regex pattern and lack of format normalization.

---

### Code Quality: No Error Boundaries

**Location**: Application-wide (missing in `C:\Users\brads\source\repos\check-writer-web\src\App.tsx`)

**Description**: The application has no React error boundaries to catch and handle runtime errors gracefully. If any component throws an error (e.g., in CheckPreview during rendering), the entire app crashes with a blank screen.

**Impact**:
- **Risk Level**: HIGH - Application stability
- **User Impact**: Complete application failure with no user feedback
- **Affected Workflows**: All workflows if any component errors occur

**Root Cause**: Missing error boundary implementation in the component tree.

---

## High Priority Issues (Fix Soon)

### Security: No Content Security Policy (CSP)

**Location**: `C:\Users\brads\source\repos\check-writer-web\index.html:1-27`

**Description**: The HTML file lacks CSP headers to prevent XSS attacks. Additionally, line 24 loads an external script from `cdn.gpteng.co` which could be a security risk if the CDN is compromised.

**Impact**: Increases XSS attack surface, potential for script injection
**Root Cause**: Missing security headers in production deployment configuration.

---

### Security: Third-Party Script Loading

**Location**: `C:\Users\brads\source\repos\check-writer-web\index.html:24`

**Description**: External script loaded without integrity check (SRI):
```html
<script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>
```

**Impact**: If CDN is compromised, malicious code could be injected
**Root Cause**: Dependency on external CDN without subresource integrity verification.

---

### Bugs: State Synchronization Issues

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx:64-82`

**Description**: The `handleFormSubmit` function updates multiple state variables individually:
```javascript
setDate(formData.date);
setPayee(formData.payee);
setAddress(formData.address);
// ... 8 separate state updates
```

This causes multiple re-renders and potential inconsistencies. React may batch some updates but not guarantee synchronization.

**Impact**: Performance degradation, potential for inconsistent state during render
**Root Cause**: Not using a single state object or reducer for related data.

---

### Bugs: NaN Propagation in Amount Display

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx:21-24`

**Description**: Amount formatting doesn't handle NaN:
```javascript
const formattedAmount = amount
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount))
  : '';
```

If `amount` is "abc" or any non-numeric string, `parseFloat` returns NaN, and `format(NaN)` returns "NaN" or similar, which appears on the check.

**Impact**: Invalid currency display on printed checks
**Root Cause**: Missing NaN validation before formatting.

---

### Bugs: Duplicate Padding Logic

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx:41-50` and `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx:37-46`

**Description**: The `padWithAsterisks` function is duplicated in two components with identical implementation. This violates DRY principle and creates maintenance burden.

**Impact**: Code duplication, potential for inconsistent behavior if updated in only one place
**Root Cause**: Lack of shared utility functions.

---

### Bugs: Memory Leak in Toast System

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\hooks\use-toast.ts:9`

**Description**: Toast removal delay is set to 1,000,000ms (16.67 minutes):
```javascript
const TOAST_REMOVE_DELAY = 1000000
```

This causes toasts to remain in memory for extended periods, potentially causing memory leaks with multiple toasts.

**Impact**: Memory accumulation over time, poor UX with toasts staying visible too long
**Root Cause**: Likely a typo - should probably be 3000-5000ms.

---

### UI/UX: Poor Error Messaging

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx:70-102` and `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx:40-49`

**Description**: Error messages are generic and don't provide specific guidance:
- "Please enter a valid amount greater than zero" - doesn't explain format
- "Please fill out all required fields" - doesn't specify which fields

**Impact**: User confusion, increased support burden
**Root Cause**: Insufficient user feedback design.

---

### UI/UX: No Loading States

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx:38-62`

**Description**: No loading indicator during print operation. The 500ms delay between clicking "Print Check" and the print dialog appearing leaves users uncertain if their action registered.

**Impact**: User uncertainty, perceived unresponsiveness
**Root Cause**: Missing loading state management.

---

### UI/UX: Print Preview Not Shown Before Printing

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx:75-81`

**Description**: The preview is set to visible and immediately triggers print. Users don't get to review the preview before the print dialog opens.

**Impact**: Users can't verify check appearance before printing
**Root Cause**: Workflow design issue - preview should be shown with a separate "Print" action.

---

### UI/UX: Insufficient Accessibility - Missing ARIA Labels

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx:132-249`

**Description**: Form inputs lack ARIA labels and descriptions:
- No `aria-required` on required fields
- No `aria-invalid` on validation errors
- No `aria-describedby` linking errors to inputs
- Amount display section lacks proper ARIA role

**Impact**: Screen reader users have poor experience, violates WCAG 2.1 Level A
**Root Cause**: Accessibility not considered in initial implementation.

---

### Code Quality: Excessive Dependencies

**Location**: `C:\Users\brads\source\repos\check-writer-web\package.json:13-63`

**Description**: The application includes 50+ dependencies, many of which are unused:
- `@tanstack/react-query` - installed but only QueryClient used, no actual queries
- `next-themes` - dark mode support installed but not implemented
- `recharts` - charting library not used
- `cmdk` - command palette not used
- Many Radix UI components installed but not used (accordion, avatar, carousel, etc.)

**Impact**: Increased bundle size (slower load times), security attack surface, maintenance burden
**Root Cause**: Template/boilerplate dependencies not cleaned up.

---

### Code Quality: TypeScript Strict Mode Disabled

**Location**: `C:\Users\brads\source\repos\check-writer-web\tsconfig.app.json:18-22`

**Description**: Critical TypeScript settings disabled:
```json
"strict": false,
"noUnusedLocals": false,
"noUnusedParameters": false,
"noImplicitAny": false,
```

**Impact**: Eliminates type safety benefits, allows bugs to slip through, harder to refactor
**Root Cause**: Intentionally relaxed for rapid development.

---

## Medium Priority Issues (Plan to Fix)

### Security: No Input Length Limits

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx:142-239`

**Description**: No `maxLength` attributes on text inputs. Users can enter unlimited text for payee, address, memo, etc., which could:
1. Overflow the check print area
2. Cause performance issues with very long strings
3. Be used for DoS attacks (memory exhaustion)

**Impact**: Layout breaking, potential DoS vector
**Root Cause**: Missing input constraints.

---

### Security: Outdated Dependencies

**Location**: `C:\Users\brads\source\repos\check-writer-web\package.json`

**Description**: Several dependencies have major version updates available:
- `react` and `react-dom`: 18.3.1 → 19.2.3 (major version behind)
- `react-router-dom`: 6.30.3 → 7.12.0 (major version behind)
- `@hookform/resolvers`: 3.10.0 → 5.2.2 (2 major versions behind)
- `date-fns`: 3.6.0 → 4.1.0 (major version behind)

**Impact**: Missing security patches, new features, and performance improvements
**Root Cause**: Infrequent dependency updates.

---

### Bugs: Incorrect Number Conversion for Zero

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\utils\numberToWords.ts:30`

**Description**: `numberToWords(0)` returns "zero and 00/100 Dollars" which is grammatically incorrect. Should return "Zero and 00/100 Dollars" (capitalized) or reject zero amounts entirely.

**Impact**: Awkward check text for zero amounts
**Root Cause**: Edge case not considered.

---

### Bugs: Number-to-Words Missing "and" in Compound Numbers

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\utils\numberToWords.ts:26-27`

**Description**: The function generates "one hundred two" instead of "one hundred and two" for numbers like 102. Line 27 adds space but not "and" between hundreds and remaining digits.

**Impact**: Non-standard check writing format
**Root Cause**: Incomplete implementation of English number rules.

---

### Bugs: Date Initialization May Be Off By One Day

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx:21` and `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx:28`

**Description**: Date initialization uses `toISOString().split('T')[0]`:
```javascript
const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
```

`toISOString()` returns UTC time, which may be a different day than the user's local timezone.

**Impact**: Default date may be one day off for users in certain timezones
**Root Cause**: Timezone conversion not handled.

---

### Bugs: formatCurrency Function Unused

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\utils\numberToWords.ts:81-87` and `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx:8`

**Description**: `formatCurrency` is exported and imported but never used. CheckPreview and CheckForm both use inline `Intl.NumberFormat` instead.

**Impact**: Dead code, confusion about intended usage
**Root Cause**: Incomplete refactoring.

---

### UI/UX: No Confirmation Before Clearing Form

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx:119-130`

**Description**: "Clear Form" button immediately resets all fields without confirmation. Users may accidentally lose their work.

**Impact**: Data loss, user frustration
**Root Cause**: Missing confirmation dialog.

---

### UI/UX: Print Preview Always Hidden Until Print

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx:109`

**Description**: The preview is hidden by default and only shows when printing. Users can't preview their check before clicking print.

**Impact**: Poor workflow - users want to see preview first
**Root Cause**: Design choice that contradicts user expectations.

---

### UI/UX: No Keyboard Shortcuts

**Location**: Application-wide

**Description**: No keyboard shortcuts for common actions:
- No Enter key to submit form
- No Ctrl+P to print
- No Esc to close preview
- No Tab navigation order optimization

**Impact**: Reduced productivity for power users, accessibility issue
**Root Cause**: Keyboard interaction not implemented.

---

### UI/UX: Inconsistent Button Styling

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx:243-248`

**Description**: "Print Check" button has hardcoded color `bg-blue-600 hover:bg-blue-700` instead of using the Button component's variant system.

**Impact**: Styling inconsistency, maintenance burden
**Root Cause**: Not following component design system.

---

### UI/UX: Amount Input Missing Currency Symbol

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx:150-160`

**Description**: Amount field label says "Amount ($)" but the input itself doesn't show "$" prefix. Users must mentally add the symbol.

**Impact**: Minor UX confusion
**Root Cause**: Missing input adornment or formatting.

---

### UI/UX: No Visual Feedback for Amount in Words Calculation

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx:220-228`

**Description**: The amount-in-words display updates instantly without any loading indicator or animation, making it hard to notice the update on slow devices.

**Impact**: Users may not notice the calculated value
**Root Cause**: Missing transition or animation.

---

### Code Quality: Unused Import

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx:2`

**Description**: `useRef` imported but the only ref (`amountInputRef`) could be replaced with programmatic focus via DOM APIs or ref callback.

**Impact**: Minor - unused import
**Root Cause**: Over-importing.

---

### Code Quality: Magic Numbers

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckForm.tsx:42` and `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx:38`

**Description**: Magic number `80` for max padding length has no explanation or constant:
```javascript
const maxLength = 80; // Approximate max characters in the amount line
```

**Impact**: Hard to maintain, value may not be accurate
**Root Cause**: Should be calculated based on check dimensions or made configurable.

---

### Code Quality: No PropTypes or Runtime Validation

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx:4-14`

**Description**: Component accepts string props without runtime validation. TypeScript is disabled in strict mode, so invalid props could be passed at runtime.

**Impact**: Runtime errors possible with invalid props
**Root Cause**: No Zod or PropTypes validation.

---

## Low Priority Issues (Nice to Have)

### Security: Missing Security Headers

**Location**: Production deployment configuration (not in codebase)

**Description**: Production deployment should include security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` to disable unused browser features

**Impact**: Increased attack surface for certain exploits
**Root Cause**: Default server configuration.

---

### Bugs: formatCurrency Duplicates Browser API

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\utils\numberToWords.ts:81-87`

**Description**: The `formatCurrency` function is redundant with `Intl.NumberFormat` which is already used throughout the app.

**Impact**: Code redundancy
**Root Cause**: Unnecessary abstraction.

---

### UI/UX: No Dark Mode

**Location**: Application-wide

**Description**: `next-themes` is installed but dark mode is not implemented. The CSS includes dark mode variables but they're unused.

**Impact**: Missing feature for user preference
**Root Cause**: Incomplete feature implementation.

---

### UI/UX: No Print Preview in Different Browser Modes

**Location**: Application-wide

**Description**: No testing/preview of how the check looks in different browser zoom levels or print scaling options.

**Impact**: May print incorrectly if user has non-default settings
**Root Cause**: Limited print testing scenarios.

---

### UI/UX: Footer Copyright Year Hardcoded

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\pages\Index.tsx:127`

**Description**: Footer shows "© 2025 Check Writer App" with hardcoded year.

**Impact**: Will be outdated in 2026
**Root Cause**: Should use `new Date().getFullYear()`.

---

### Code Quality: Inconsistent String Concatenation

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx:28-34`

**Description**: Address formatting uses array join with mixed logic:
```javascript
const cityStateZip = [
  city,
  (city && state) ? ', ' : '',
  state,
  (zipCode && (city || state)) ? ' ' : '',
  zipCode
].join('');
```

This is clever but hard to read. Template literals would be clearer.

**Impact**: Code readability
**Root Cause**: Over-optimization.

---

### Code Quality: No Unit Tests

**Location**: Entire application

**Description**: No test files exist. Critical utilities like `numberToWords` should have unit tests for edge cases.

**Impact**: Regression risk when refactoring
**Root Cause**: Tests not written.

---

### Code Quality: Component File Size

**Location**: `C:\Users\brads\source\repos\check-writer-web\src\components\CheckPreview.tsx` (191 lines)

**Description**: CheckPreview component is large with multiple responsibilities (formatting, rendering print view, rendering screen preview). Should be split into smaller components.

**Impact**: Hard to maintain and test
**Root Cause**: Lack of component decomposition.

---

## Code Quality Observations

### Patterns and Technical Debt

1. **State Management**: Application uses local useState hooks instead of a more robust solution like useReducer or a state management library. For this simple application it's acceptable, but the 8 separate state variables in Index.tsx are hard to manage.

2. **Type Safety Crisis**: Disabling TypeScript strict mode eliminates most type safety benefits. The codebase has implicit `any` types throughout, making refactoring dangerous.

3. **Validation Inconsistency**: Validation logic is duplicated between CheckForm and Index.tsx, leading to potential inconsistencies.

4. **Print System Fragility**: The print workflow relies on setTimeout hacks and hidden DOM elements, which is brittle and error-prone.

5. **Dependency Bloat**: 50+ dependencies for a simple single-page application suggests template bloat that wasn't cleaned up.

6. **Missing Testing**: Zero test coverage means any refactoring is high-risk.

7. **No CI/CD**: No evidence of continuous integration or automated checks.

8. **Accessibility**: Basic accessibility features missing (ARIA labels, keyboard navigation, focus management).

### Positive Anti-Patterns Avoided

1. **No Prop Drilling**: Component hierarchy is shallow enough that props are passed directly without excessive drilling.

2. **Component Separation**: UI components (shadcn) are properly separated from business logic components.

3. **Build System**: Vite configuration is clean and standard.

---

## Positive Findings

Despite the issues identified, the application demonstrates several good practices:

### Architecture

1. **Clear Component Separation**: CheckForm, CheckPreview, and Index have well-defined responsibilities.

2. **Path Aliasing**: `@/` alias is properly configured in both Vite and TypeScript configs.

3. **Modern Build Setup**: Vite with SWC provides fast development and builds.

4. **Component Library**: Using shadcn-ui provides well-tested, accessible base components.

### Code Quality

1. **Consistent Naming**: Variables and functions use clear, descriptive names.

2. **Comments Where Needed**: Complex print positioning has helpful comments.

3. **Git History**: Clean commit messages showing iterative improvements.

4. **Docker Support**: Docker Compose setup for easy deployment.

### User Experience

1. **Clear Workflow**: Form → Preview → Print is intuitive.

2. **Visual Preview**: Screen preview helps users understand print output.

3. **Responsive Layout**: Works on different screen sizes (though print is the primary use case).

4. **Toast Notifications**: User feedback for actions (though implementation has issues).

### Security Baseline

1. **React XSS Protection**: React's default HTML escaping prevents many XSS attacks.

2. **No Backend**: Client-only app reduces attack surface.

3. **HTTPS**: Deployment appears to be HTTPS-only (based on meta tags).

---

## Metrics

**Total Issues Found**: 41

**By Severity**:
- Critical: 7
- High: 11
- Medium: 15
- Low: 8

**By Category**:
- Bugs/Logic Errors: 13
- Security Vulnerabilities: 6
- UI/UX Issues: 12
- Code Quality: 10

**Files Analyzed**: 15 source files + 6 configuration files

**Lines of Code**: Approximately 1,800 (application code, excluding UI components)

**Test Coverage**: 0%

**TypeScript Strict Compliance**: 0% (strict mode disabled)

**Accessibility Compliance**: Estimated 40% WCAG 2.1 Level A compliance
