<objective>
Perform a comprehensive audit of the check writer web application codebase to identify and document bugs, security vulnerabilities, logic errors, UI/UX inconsistencies, and code quality issues.

This analysis will be used to create a prioritized remediation plan to improve application reliability, security, user experience, and maintainability. The findings will guide future development work to ensure the application meets production-grade standards.
</objective>

<context>
This is a React-based web application for printing checks on pre-printed check stock. Users fill out check details (payee, amount, date, memo) and print only variable data onto pre-printed checks.

Tech stack: Vite, TypeScript, React, shadcn-ui, Tailwind CSS, react-to-print

Key architectural components:
- CheckForm: User input collection and validation
- CheckPreview: Dual-view component (screen preview + print layout)
- Index page: State orchestration and print workflow
- numberToWords utility: Numeric to text conversion for checks

Before beginning, read CLAUDE.md for project conventions and architecture understanding.

The application has relaxed TypeScript settings (noImplicitAny: false, strictNullChecks: false) which may contribute to type-related issues.
</context>

<analysis_scope>
Thoroughly analyze the entire codebase across these dimensions:

1. **Bugs and Logic Errors**
   - Incorrect behavior in number-to-words conversion
   - State management issues and race conditions
   - Form validation edge cases
   - Print functionality reliability
   - Date handling and formatting
   - Amount calculation and display
   - Edge cases in user input handling

2. **Security Vulnerabilities**
   - XSS risks in user input rendering
   - Injection vulnerabilities (even without backend)
   - Data exposure in browser (console logs, storage)
   - Print dialog information leakage
   - Client-side validation bypasses
   - Insecure dependencies or configurations

3. **UI/UX Inconsistencies**
   - Visual bugs and layout issues
   - Responsive design problems
   - Accessibility violations (WCAG compliance)
   - Inconsistent styling or component usage
   - Poor error messaging and user feedback
   - Confusing workflows or interactions
   - Print preview accuracy vs actual print output
   - Cross-browser compatibility concerns

4. **Code Quality Issues**
   - TypeScript type safety problems
   - Unused code or dependencies
   - Performance bottlenecks
   - Poor error handling
   - Inconsistent code patterns
   - Missing or inadequate comments for complex logic
   - Prop drilling or inefficient state management
   - Violation of React best practices
   - Build configuration issues
</analysis_scope>

<methodology>
For maximum efficiency, when performing multiple independent file reads or analyses, invoke all relevant tools simultaneously rather than sequentially.

1. **Initial Survey**
   - Read CLAUDE.md for architectural context
   - Examine package.json for dependency vulnerabilities
   - Review all core source files in src/

2. **Deep Analysis by Category**
   - Systematically review each file for issues in all four categories
   - Test edge cases mentally (empty strings, null values, extreme numbers, special characters)
   - Consider user workflows and interaction patterns
   - Examine print positioning calculations for accuracy
   - Review TypeScript usage and type safety
   - Analyze component lifecycle and re-rendering behavior

3. **Cross-Cutting Concerns**
   - Consistency across components (styling, patterns, naming)
   - Integration points between components
   - Error propagation and handling
   - Performance implications of current implementation

After receiving tool results, carefully reflect on the findings to identify patterns, root causes, and systemic issues before documenting.
</methodology>

<research>
Files to examine (read in parallel when possible):
- @src/App.tsx
- @src/pages/Index.tsx
- @src/components/CheckForm.tsx
- @src/components/CheckPreview.tsx
- @src/utils/numberToWords.ts
- @package.json (check for outdated or vulnerable dependencies)
- @tailwind.config.ts
- @vite.config.ts
- @tsconfig.json
- @src/index.css (for global styles and print styles)

Consider examining:
- Any hooks in @src/hooks/
- UI components that are actively used
- Build and configuration files for potential issues
</research>

<output_format>
Create TWO files:

1. **Analysis Report**: `./analysis/codebase-audit-findings.md`

Structure:
```markdown
# Codebase Audit Findings

## Executive Summary
[High-level overview of findings, severity distribution, key concerns]

## Critical Issues (Fix Immediately)
### [Issue Category]: [Specific Issue Title]
- **Location**: [File:Line or Component]
- **Description**: [What's wrong and why it matters]
- **Impact**: [User impact, risk level, affected workflows]
- **Root Cause**: [Why this issue exists]

## High Priority Issues (Fix Soon)
[Same structure as Critical]

## Medium Priority Issues (Plan to Fix)
[Same structure as Critical]

## Low Priority Issues (Nice to Have)
[Same structure as Critical]

## Code Quality Observations
[Patterns, technical debt, architectural concerns]

## Positive Findings
[What's working well, good patterns to preserve]

## Metrics
- Total issues found: X
- Critical: X | High: X | Medium: X | Low: X
- By category: Bugs: X | Security: X | UI/UX: X | Code Quality: X
```

2. **Action Plan**: `./analysis/remediation-plan.md`

Structure:
```markdown
# Remediation Plan

## Phase 1: Critical Fixes (Do First)
### Fix 1: [Issue Title]
- **Effort**: [Small/Medium/Large]
- **Files to modify**: [List]
- **Implementation approach**: [Specific steps]
- **Testing**: [How to verify the fix]
- **Dependencies**: [Blocks or requires other fixes]

## Phase 2: High Priority Fixes
[Same structure]

## Phase 3: Medium Priority Improvements
[Same structure]

## Phase 4: Low Priority Enhancements
[Same structure]

## Recommended Development Practices
[Process improvements, tools, or patterns to adopt going forward]

## Estimated Timeline
[Rough effort estimate by phase]
```
</output_format>

<evaluation_criteria>
When assessing severity:
- **Critical**: Security vulnerabilities, data loss risks, broken core functionality, accessibility blockers
- **High**: Significant bugs, poor UX, incorrect calculations, print misalignment
- **Medium**: Minor bugs, inconsistencies, code quality issues, performance concerns
- **Low**: Style inconsistencies, minor optimizations, nice-to-have improvements

Be specific and actionable:
- ✗ Bad: "The code has type issues"
- ✓ Good: "CheckForm.tsx:52 - amount state typed as string but parsed as number without null check, causing NaN when empty"

Consider real-world usage:
- What happens if user enters "$1,000.00" instead of "1000"?
- What if payee name contains special characters like quotes or apostrophes?
- What if amount is 0.001 or 999999999999?
- What if browser is zoomed or using non-standard fonts?
</evaluation_criteria>

<verification>
Before declaring the analysis complete, verify:

1. **Coverage**: All files in src/ have been examined
2. **Depth**: Each of the four analysis dimensions thoroughly explored
3. **Specificity**: Every issue includes file location and concrete description
4. **Actionability**: Remediation plan provides clear implementation guidance
5. **Prioritization**: Issues are correctly categorized by severity
6. **Completeness**: Both output files created and properly structured
7. **Balance**: Positive findings documented alongside issues

Run a mental checklist:
- Did I test edge cases for number conversion? (0, negatives, very large numbers, decimals)
- Did I check for XSS in all user input fields?
- Did I verify print positioning calculations?
- Did I consider accessibility (keyboard nav, screen readers, color contrast)?
- Did I check for React anti-patterns (missing keys, improper effects, stale closures)?
- Did I examine error boundaries and error handling?
</verification>

<success_criteria>
- Comprehensive analysis report saved to ./analysis/codebase-audit-findings.md
- Actionable remediation plan saved to ./analysis/remediation-plan.md
- All four analysis dimensions thoroughly covered
- Issues properly categorized by severity with clear justification
- Each issue includes location, description, impact, and root cause
- Remediation plan provides specific implementation steps
- Findings are specific, actionable, and verified through code examination
- Both critical/high issues and positive patterns documented
</success_criteria>
