<objective>
Fix the check preview so the sides are not cut off. The background image and content should be fully visible within the preview container.

Currently the preview is cutting off content on the left and right sides because the scaled content exceeds the container boundaries.
</objective>

<context>
Read @CLAUDE.md for project conventions.

In `src/components/CheckPreview.tsx`, the screen preview uses:
1. An outer wrapper with `overflow-hidden` and `max-w-[600px]` (line 120)
2. An inner container scaled using `transform: scale(calc(100cqw / 816))` (line 134)

The issue is that `100cqw` (container query width) requires the container to have `container-type: inline-size` set, and the scaling calculation may not properly fit the 8.5in content into the available width.
</context>

<requirements>
1. Add `container-type: inline-size` to the outer wrapper div (line 119-122) so container query units work correctly

2. Alternatively, use a simpler JavaScript-free approach: calculate the scale factor to fit 8.5in (816px) into the container width

3. Ensure the entire 8.5" width of the check image is visible without horizontal cutoff

4. The aspect ratio (8.5:11) should be maintained

5. All content (background image, voucher sections, check data) should fit within the visible preview area
</requirements>

<implementation>
Option A - Fix container queries (preferred):
Add the container-type to the wrapper div:
```tsx
<div
  className="relative w-full max-w-[600px] mx-auto border-2 border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white"
  style={{
    aspectRatio: '8.5 / 11',
    containerType: 'inline-size'  // Add this
  }}
>
```

Option B - Use percentage-based scaling:
Change the transform from container query units to a simple percentage:
```tsx
style={{
  width: '8.5in',
  height: '11in',
  transform: 'scale(calc(100% / 8.5in))',  // May not work
  // OR use a fixed scale that fits 600px: scale(0.735)
}}
```

Option C - Use width: 100% with aspect-ratio on inner container:
```tsx
<div
  className="w-full h-full origin-top-left"
  style={{
    backgroundImage: "url('/check_overlay.png')",
    backgroundSize: '100% 100%',
    backgroundPosition: 'top left',
  }}
>
```

The simplest fix is likely Option A - adding `containerType: 'inline-size'` to enable container query units.
</implementation>

<output>
Modify: `./src/components/CheckPreview.tsx`
- Fix the scaling/container setup so full width is visible
- Ensure no horizontal cutoff on the preview
</output>

<verification>
1. Run `npm run dev`
2. Verify:
   - The full check image is visible from left edge to right edge
   - No content is cut off on the sides
   - The aspect ratio is maintained (page looks like 8.5" x 11")
   - All three sections (top voucher, check, bottom voucher) are fully visible
</verification>

<success_criteria>
- Full 8.5" width visible in preview (no side cutoff)
- Background image spans edge to edge
- Aspect ratio maintained
- All text overlays visible and correctly positioned
</success_criteria>
