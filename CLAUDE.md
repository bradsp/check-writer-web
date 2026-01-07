# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based web application for printing checks on pre-printed check stock. The app allows users to fill out check details (payee, amount, date, memo) and then print only the variable data onto pre-printed checks. Built with Vite, TypeScript, React, shadcn-ui, and Tailwind CSS.

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server on http://localhost:8080
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Docker Commands
```bash
docker-compose up -d          # Start containerized app on http://localhost:8080
docker-compose down           # Stop container
docker-compose build          # Rebuild image after changes
docker-compose logs -f        # View container logs
docker-compose restart        # Restart container
```

## Architecture

### Core Application Flow

The application uses a single-page architecture with three main components:

1. **CheckForm** (`src/components/CheckForm.tsx`): Collects user input for all check fields. Validates required fields (date, payee, amount) and displays real-time amount-in-words conversion with asterisk padding for security.

2. **CheckPreview** (`src/components/CheckPreview.tsx`): A `forwardRef` component that renders two views:
   - **Print View** (`.hidden.print:block`): Positions variable data at exact coordinates on an 8.5"x11" page to align with pre-printed check stock. The page is divided into three sections (top voucher, check, bottom voucher).
   - **Screen Preview**: Shows users how their check will look before printing.

3. **Index Page** (`src/pages/Index.tsx`): Orchestrates the workflow. Manages state for all check fields, uses `react-to-print` to handle printing, and coordinates between the form and preview components.

### Print Layout System

The CheckPreview component uses absolute positioning to place data at precise locations:
- **Date**: `right-[2.5in] top-[1.25in]` on the check section
- **Amount (numeric)**: `right-[0.5in] top-[1.25in]`
- **Amount (words)**: `left-10 top-[1.75in]` with asterisk padding
- **Payee/Address**: `left-[1.1in] top-[2.05in]`

All measurements are calibrated for standard 8.5"x11" pre-printed check stock with the check centered in the middle third of the page.

### Number-to-Words Conversion

The `numberToWords` utility (`src/utils/numberToWords.ts`) converts numeric amounts to check-formatted text:
- Handles numbers up to billions
- Outputs format: "One thousand two hundred and 34/100 Dollars"
- Includes fractional cents representation (e.g., "34/100")
- Asterisk padding is applied separately in the components for security

### Path Aliasing

The project uses `@/` as an alias for `src/`:
```typescript
import { Button } from "@/components/ui/button";
```

This is configured in both `vite.config.ts` and `tsconfig.json`.

### UI Component Library

The project uses shadcn-ui components located in `src/components/ui/`. These are Radix UI primitives styled with Tailwind CSS and are fully customizable. The components follow the shadcn-ui pattern where they're copied into the project rather than imported from a package.

### TypeScript Configuration

The project has relaxed TypeScript settings for rapid development:
- `noImplicitAny: false`
- `strictNullChecks: false`
- `noUnusedLocals: false`
- `noUnusedParameters: false`

## Key Implementation Details

### Print Functionality

The app uses `react-to-print` with specific configuration:
- `contentRef`: Points to the CheckPreview ref
- `pageStyle`: Ensures single-page printing with no margins
- Validation runs in `onBeforePrint` hook
- Success toast displays in `onAfterPrint` hook

### Form Validation

Required fields enforced by CheckForm:
- Date must be provided
- Payee must be non-empty
- Amount must be a valid positive number

Optional fields:
- Address, City, State, Zip Code
- Memo

### State Management

The Index page manages all state locally using React hooks. No global state management is used. State flows from Index → CheckForm (via initialValues) and Index → CheckPreview (via props).

### Styling

- Tailwind CSS for all styling
- Print-specific styles use `print:` modifier
- Form uses blue accent color (#2563eb / blue-600)
- Responsive layout with mobile-first approach

## Project Structure

```
src/
├── components/
│   ├── CheckForm.tsx           # User input form
│   ├── CheckPreview.tsx        # Print/preview component
│   └── ui/                     # shadcn-ui components
├── pages/
│   ├── Index.tsx               # Main application page
│   └── NotFound.tsx            # 404 page
├── utils/
│   └── numberToWords.ts        # Number conversion utility
├── hooks/                      # Custom React hooks
├── lib/
│   └── utils.ts                # General utilities (cn function)
└── App.tsx                     # React Router setup
```

## Testing Checks

When testing the print functionality:
1. Fill out the form with sample data
2. Check the preview to ensure alignment
3. Use "Save as PDF" in print dialog to verify positioning before printing on actual check stock
4. Pre-printed check stock should be fed top-edge-first into the printer
