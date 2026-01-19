<objective>
Fix the check preview to correctly display the full-page background image (check_overlay.png).

The background image is an 8.5"×11" full page containing all three sections (top voucher, check, bottom voucher). Currently it's placed only on the check section (3.5in), causing it to be compressed and misaligned. The image should be applied to the entire page container instead.
</objective>

<context>
Read @CLAUDE.md for project conventions.

The `public/check_overlay.png` is a full 8.5"×11" page image with:
- Top voucher section (top third)
- Check section (middle third) - blue marbled pattern with check fields
- Bottom voucher section (bottom third)

Currently in `src/components/CheckPreview.tsx`, the background image is applied only to the check section div (lines 152-159), which compresses the full-page image into 3.5 inches.

The fix requires moving the background image to the outer scaled container that represents the full 8.5"×11" page.
</context>

<requirements>
1. Move the background image from the check section div to the outer scaled container (the div with `width: '8.5in'` and `height: '11in'`)

2. Remove the background image styling from the check section div (around line 152-159)

3. Apply background image to the scaled container (around line 129-136):
   ```tsx
   style={{
     width: '8.5in',
     height: '11in',
     transform: 'scale(calc(100cqw / 816))',
     backgroundImage: "url('/check_overlay.png')",
     backgroundSize: '100% 100%',
     backgroundPosition: 'top left',
   }}
   ```

4. The voucher sections (top and bottom) should become transparent or semi-transparent so the background image shows through

5. Keep all text overlays in their current positions - they should now align correctly with the check image
</requirements>

<implementation>
1. In `src/components/CheckPreview.tsx`, find the scaled container div (around line 129):
   ```tsx
   <div
     className="absolute inset-0 origin-top-left"
     style={{
       width: '8.5in',
       height: '11in',
       transform: 'scale(calc(100cqw / 816))',
     }}
   >
   ```

2. Add the background image to this container's style object

3. Find the check section div (around line 152) and remove the backgroundImage, backgroundSize, and backgroundPosition from its style

4. Update the top voucher section (line 138) - change `bg-gray-100` to `bg-white/80` or `bg-transparent` so the background shows through

5. Update the bottom voucher section (line 193) - change `bg-gray-100` to `bg-white/80` or `bg-transparent`

6. The check section div can keep its border but remove the background styling
</implementation>

<output>
Modify: `./src/components/CheckPreview.tsx`
- Add background image to the outer scaled container
- Remove background image from check section
- Make voucher sections transparent/semi-transparent
</output>

<verification>
1. Run `npm run dev`
2. Verify:
   - The full check stock page image displays correctly across all three sections
   - The check section in the middle shows the blue marbled check pattern
   - The text overlays (date, amount, payee) align with the check fields on the image
   - Top and bottom voucher text is readable over the background
</verification>

<success_criteria>
- Background image spans the entire 8.5"×11" preview
- Check portion of image appears in the middle third
- Text overlays align correctly with check fields
- All three sections are visible and properly positioned
- No image compression or stretching artifacts
</success_criteria>
