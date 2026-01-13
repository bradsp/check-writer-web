<objective>
Rebuild the CheckPreview screen preview component to fix overlapping text issues and remove all lovable.dev references from the project.

The current screen preview has overlapping text and incorrect positioning. Instead of trying to match percentage-based positioning, create a simpler approach using a placeholder background image that the user will replace with their actual check stock image.
</objective>

<context>
Read @CLAUDE.md for project conventions.

This is a React check-writing application. The CheckPreview component has two views:
- **Print view**: Uses inch-based absolute positioning for printing on physical check stock - DO NOT MODIFY
- **Screen preview**: Currently broken with overlapping text - NEEDS COMPLETE REBUILD

The project still contains lovable.dev references that need to be removed:
- Meta tags and images in index.html
- External script from cdn.gpteng.co
- lovable-tagger dependency in package.json/vite.config.ts
</context>

<requirements>

## Part 1: Rebuild Screen Preview

1. **Remove the existing screen preview** (the `block print:hidden` section in CheckPreview.tsx, approximately lines 115-191)

2. **Create a new screen preview** that:
   - Displays an 8.5in × 11in container (use aspect-ratio to maintain proportions)
   - Shows a placeholder background (gray with "Check Stock Preview - Add your check image" text)
   - Overlays the check data at the SAME positions as the print view
   - Uses the SAME inch-based positioning classes as the print view for consistency
   - Scales everything proportionally to fit the preview container

3. **Preview structure should be**:
   ```
   [Top Voucher Section - 3.5in equivalent]
   - Simple info display: Date, Payee, Amount, Memo

   [Check Section - 3.5in equivalent]
   - Placeholder background image area
   - Overlaid text using same positioning as print view
   - Date, Amount, Amount in words, Payee/Address

   [Bottom Voucher Section - 3.5in equivalent]
   - Simple info display: Date, Payee, Amount, Memo
   ```

4. **Use CSS transform: scale()** to fit the 8.5in×11in layout into the preview container while maintaining exact positioning

## Part 2: Remove lovable.dev References

1. **index.html** - Remove or replace:
   - Line 10: `<meta name="author" content="Lovable" />` → Remove or change to your name
   - Line 15: `<meta property="og:image" ...lovable.dev...>` → Remove entirely
   - Lines 18-19: Twitter meta tags with lovable references → Remove entirely
   - Line 25: `<script src="https://cdn.gpteng.co/gptengineer.js"...>` → Remove entirely (including the comment above it)

2. **package.json** - Remove:
   - Line 91: `"lovable-tagger": "^1.1.7"` from devDependencies

3. **vite.config.ts** - Remove:
   - Line 4: `import { componentTagger } from "lovable-tagger";`
   - Any usage of `componentTagger` in the plugins array

4. **After editing package.json**, run: `npm install` to update package-lock.json

</requirements>

<implementation>

### Screen Preview Approach

Use a scaled container approach:
```tsx
{/* Screen preview container */}
<div className="block print:hidden ...">
  <h3>Check Preview</h3>

  {/* Scaled wrapper - contains actual 8.5in×11in layout scaled to fit */}
  <div className="relative w-full max-w-[600px] mx-auto" style={{ aspectRatio: '8.5/11' }}>
    <div
      className="absolute inset-0 origin-top-left"
      style={{
        width: '8.5in',
        height: '11in',
        transform: 'scale(var(--preview-scale))',
        // Calculate scale based on container width
      }}
    >
      {/* Same structure as print view but visible on screen */}
      {/* Top voucher, Check section with placeholder, Bottom voucher */}
    </div>
  </div>
</div>
```

### Placeholder Image

Create a simple placeholder using CSS:
- Gray background (#f3f4f6)
- Centered text: "Check Stock Image Placeholder"
- Dashed border to indicate it's a placeholder
- Add a comment noting the user will provide their check image later

</implementation>

<output>
Modify these files:
- `./src/components/CheckPreview.tsx` - Rebuild screen preview section
- `./index.html` - Remove lovable.dev references and external scripts
- `./package.json` - Remove lovable-tagger dependency
- `./vite.config.ts` - Remove lovable-tagger import and usage

After changes, run:
- `npm install` to update dependencies
- `npm run build` to verify no build errors
</output>

<verification>
1. Run `npm run build` - should complete without errors
2. Run `npm run dev` and verify:
   - Screen preview displays without overlapping text
   - Preview shows placeholder for check section
   - Text positions in preview match the visual layout of print positions
3. Verify no network requests to lovable.dev or cdn.gpteng.co in browser dev tools
4. Grep for "lovable" in the codebase - should only find references in README.md, package-lock.json (after npm install), and analysis folder
</verification>

<success_criteria>
- Screen preview renders without overlapping text
- Preview clearly shows where check data will appear
- Placeholder is visible indicating where user's check image will go
- No lovable.dev external resources loaded
- No cdn.gpteng.co scripts loaded
- Build completes successfully
- Print functionality unchanged (print view not modified)
</success_criteria>
