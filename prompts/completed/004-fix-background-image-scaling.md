<objective>
Fix the check stock background image scaling so it fits exactly within the 3.5in check section, matching the scaled preview container.

The background image is currently larger than its container because `background-size: cover` doesn't account for the CSS transform scaling. The image needs to fill exactly the check section dimensions.
</objective>

<context>
Read @CLAUDE.md for project conventions.

The CheckPreview component uses a scaled container approach where an 8.5in × 11in layout is scaled down to fit a ~600px preview using `transform: scale()`. The check section is 3.5in tall within this layout.

Current issue: The background image uses `background-size: cover` which makes it overflow the visible area because the container is transformed/scaled.

File: `src/components/CheckPreview.tsx` (lines 151-158)
</context>

<requirements>
1. Change the background-size from `cover` to `100% 100%` so the image fills exactly the check section dimensions
2. This ensures the image scales proportionally with the CSS transform applied to the parent container
3. Keep all other styling (backgroundPosition, border) intact
4. The check data overlays should remain in the same positions
</requirements>

<implementation>
In `src/components/CheckPreview.tsx`, find the check section div (around line 151-158):

Change:
```tsx
style={{
  backgroundImage: "url('/chk-img.jpg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}}
```

To:
```tsx
style={{
  backgroundImage: "url('/chk-img.jpg')",
  backgroundSize: '100% 100%',
  backgroundPosition: 'top left',
}}
```

The `100% 100%` ensures the image stretches to exactly fill the 3.5in height of the check section, and the parent's CSS transform will scale everything proportionally.
</implementation>

<output>
Modify: `./src/components/CheckPreview.tsx`
- Update backgroundSize from 'cover' to '100% 100%'
- Update backgroundPosition from 'center' to 'top left'
</output>

<verification>
1. Run `npm run dev`
2. Open the app and verify:
   - The check stock image fits exactly within the check section
   - The entire 8.5in × 11in page preview is visible
   - All three sections (top voucher, check, bottom voucher) are visible without overflow
   - The check data (date, amount, payee) displays correctly on top of the image
</verification>

<success_criteria>
- Check stock image fills exactly the check section (3.5in equivalent)
- No image overflow beyond the check section boundaries
- Entire page preview visible (all three sections)
- Text overlays positioned correctly on the check image
</success_criteria>
