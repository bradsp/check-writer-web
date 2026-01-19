<objective>
Perform a complete audit of the CheckPreview component to identify the root cause of layout issues and develop a clean, working solution.

The check preview has had multiple fixes applied but is still not displaying correctly. We need to step back, thoroughly analyze the current implementation, identify all bugs and invalid logic, and implement a robust solution.
</objective>

<context>
Read @CLAUDE.md for project conventions.

This is a React check-writing application. The CheckPreview component (`src/components/CheckPreview.tsx`) renders:
1. A **print view** (hidden on screen, shown when printing) - This works correctly
2. A **screen preview** (shown on screen, hidden when printing) - This has layout issues

The screen preview should show users exactly how their check will look when printed on 8.5" x 11" pre-printed check stock. The background image (`public/check_overlay.png`) is a full 8.5" x 11" page with:
- Top voucher section (top third)
- Check section (middle third) - blue marbled pattern
- Bottom voucher section (bottom third)

**Known issues from screenshot:**
- Layout proportions may be off
- Scaling/positioning inconsistencies between background and text overlays
- Multiple incremental fixes have been applied without a cohesive solution
</context>

<research>
Thoroughly analyze these files before making changes:

1. `src/components/CheckPreview.tsx` - The main component
   - Examine the print view structure (the working reference)
   - Examine the screen preview structure (the broken implementation)
   - Identify differences in positioning logic between the two

2. `public/check_overlay.png` - View the background image dimensions
   - Determine actual pixel dimensions
   - Understand the layout (where each section is positioned)

3. `src/pages/Index.tsx` - How the component is used
   - Check what props are passed
   - Understand the data flow
</research>

<analysis_requirements>
Deeply consider and document:

1. **Current State Audit**
   - What CSS approach is being used for scaling? (transform, container queries, etc.)
   - What are the exact dimensions specified? (inches, pixels, percentages)
   - How is the background image being applied and sized?
   - How are the text overlays positioned?

2. **Root Cause Analysis**
   - Why doesn't the screen preview match the print view?
   - Are there conflicting CSS properties?
   - Is the scaling calculation correct?
   - Is container-type properly enabling container queries?
   - Are there z-index or overflow issues?

3. **Print View Reference**
   - The print view WORKS correctly - use it as the reference implementation
   - What positioning system does it use?
   - How does it achieve correct alignment?

4. **Comparison**
   - List every difference between print view and screen preview CSS
   - Identify which differences are causing the problem
</analysis_requirements>

<solution_requirements>
Design a clean solution that:

1. **Uses the print view as the source of truth** - The print view works, so the screen preview should mirror it as closely as possible

2. **Simple scaling approach** - Use one clear scaling mechanism, not multiple competing approaches

3. **Consistent positioning** - Text overlays should use the same positioning values as the print view

4. **Background image handling** - The 8.5" x 11" image should scale proportionally with the container

5. **No magic numbers** - All dimensions should be clearly derived from the 8.5" x 11" page size
</solution_requirements>

<implementation_approach>
Consider these approaches (choose the best one):

**Option A: Clone print view with CSS transform**
- Duplicate the print view structure for screen preview
- Wrap in a container that scales everything down using `transform: scale()`
- Pro: Guarantees identical positioning
- Con: May need to handle transform-origin carefully

**Option B: Percentage-based positioning**
- Convert all inch-based positions to percentages
- Use a container with the correct aspect ratio
- Background sized to 100% 100%
- Pro: Responsive
- Con: Requires careful calculation

**Option C: CSS Container Queries (current approach - debug it)**
- Fix the container query implementation
- Ensure containerType is correctly applied
- Verify the scale calculation is correct
- Pro: Modern CSS
- Con: Browser support, complexity

Recommend: Option A is most reliable since it reuses the working print view.
</implementation_approach>

<output>
After analysis, modify: `./src/components/CheckPreview.tsx`

The solution should:
1. Remove any broken/conflicting CSS
2. Implement a clean, single approach to scaling
3. Ensure the screen preview matches print positioning exactly
4. Include clear comments explaining the approach

Document your findings and solution in code comments.
</output>

<verification>
Before declaring complete:
1. Run `npm run dev` and test with sample data
2. Verify the full background image is visible (no cutoff)
3. Verify text overlays (date, amount, payee) align with the check fields on the image
4. Verify all three sections are visible in correct proportions
5. Compare screen preview positioning to print preview (Ctrl+P) - they should match
6. Run `npm run build` to ensure no build errors
</verification>

<success_criteria>
- Screen preview displays the full 8.5" x 11" page without cutoff
- Background image is correctly proportioned (not stretched or compressed)
- Text overlays align with the check fields on the background image
- Date appears where "DATE" label is on the check
- Amount appears in the amount box on the check
- Payee appears on the "PAY TO THE ORDER OF" line
- Screen preview positioning matches print output
- Clean, maintainable code with clear comments
</success_criteria>
