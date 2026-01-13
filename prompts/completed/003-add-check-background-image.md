<objective>
Add the user's check stock image (public/chk-img.jpg) as the background for the check section in the screen preview.

Replace the gray placeholder with the actual check image so users can see exactly how their data will overlay on their check stock.
</objective>

<context>
Read @CLAUDE.md for project conventions.

The CheckPreview component has a screen preview with a placeholder in the check section (lines 154-193 in src/components/CheckPreview.tsx). The placeholder currently shows:
- Gray background with dashed border
- Text: "Check Stock Image Placeholder - Add your check image here"

The user has added their check stock image at: `public/chk-img.jpg`
</context>

<requirements>
1. In the check section of the screen preview (the div with class containing `bg-gray-200 border-y-2 border-dashed`), replace the placeholder background with the check stock image

2. Use the image as a background:
   - Set `background-image: url('/chk-img.jpg')` (Vite serves public/ files from root)
   - Use `background-size: cover` or `contain` as appropriate
   - Use `background-position: center`
   - Remove the gray background color

3. Remove or hide the placeholder text ("Check Stock Image Placeholder - Add your check image here") since the actual image is now shown

4. Keep all the check data overlays (date, amount, payee, etc.) - they should display on top of the image

5. Keep the yellow highlights on the text fields so users can see where data will print
</requirements>

<implementation>
In `src/components/CheckPreview.tsx`, modify the check section div (around line 154):

Before:
```tsx
<div className="absolute top-[3.5in] left-0 right-0 h-[3.5in] bg-gray-200 border-y-2 border-dashed border-gray-400">
  {/* Placeholder indicator */}
  <div className="absolute inset-0 flex items-center justify-center">
    ...
  </div>
```

After:
```tsx
<div
  className="absolute top-[3.5in] left-0 right-0 h-[3.5in] border-y border-gray-300"
  style={{
    backgroundImage: "url('/chk-img.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  {/* Remove or comment out the placeholder text div */}
```
</implementation>

<output>
Modify: `./src/components/CheckPreview.tsx`
- Update the check section background to use the image
- Remove placeholder text
- Keep all data overlays intact
</output>

<verification>
1. Run `npm run dev`
2. Open the app in browser
3. Verify the check section shows the check stock image as background
4. Verify date, amount, amount in words, and payee fields still display with yellow highlights
5. Verify the image scales properly within the check section
</verification>

<success_criteria>
- Check stock image visible as background in screen preview
- Placeholder text removed
- All check data (date, amount, payee, etc.) displays on top of image
- Yellow highlights still visible on text fields
- Image properly contained/scaled within the check section
</success_criteria>
