<objective>
Fix the screen preview layout in CheckPreview.tsx so it accurately reflects the final printed check positioning.

The screen preview currently shows the payee name and address in the wrong position with incorrect sizing. The print layout is correct; the screen preview CSS positioning needs to be updated to match proportionally.
</objective>

<context>
Read @CLAUDE.md for project conventions.

This is a React check-writing application where users fill out check details and print onto pre-printed check stock. The CheckPreview component has two views:
- **Print view** (`.hidden.print:block`): Uses inch-based absolute positioning - this is CORRECT
- **Screen preview** (`.block.print:hidden`): Uses percentage-based positioning - this is INCORRECT

The check section is 3.5 inches tall in the print layout. All positions should be proportionally equivalent.
</context>

<problem_analysis>
In `src/components/CheckPreview.tsx`, compare the print view (lines 72-99) to the screen preview (lines 132-171):

**Print view positions (CORRECT - do not modify):**
- Date: `right-[2.5in] top-[1.25in]`
- Amount: `right-[0.5in] top-[1.25in]`
- Amount in words: `left-10 top-[1.75in]`
- Payee/Address: `left-[1.1in] top-[2.05in]`

**Screen preview positions (INCORRECT - needs fixing):**
- Date: `right-[40%] top-[25%]`
- Amount: `right-[10%] top-[25%]`
- Amount in words: `left-4 right-8 top-[40%]`
- Payee/Address: `left-[25%] top-[50%]` ← Most visibly wrong

The screen preview check section has `h-[30%]` height. Positioning should be recalculated to match print proportions.
</problem_analysis>

<requirements>
1. Update the screen preview's check section (lines 133-171) positioning to accurately reflect the print layout
2. Convert the print view's inch-based positions to proportional percentages for the screen preview:
   - Check section is 3.5in tall, so top-[1.25in] = ~36% from top
   - Check section is ~8.5in wide (full page), so left-[1.1in] = ~13% from left
3. Match font sizes proportionally between print and preview
4. Ensure the payee name/address appears in the same relative position as the print output
5. Do NOT modify the print view (lines 59-112) - it is correct
</requirements>

<implementation>
1. Read the CheckPreview.tsx file
2. Calculate correct percentage equivalents:
   - For a 3.5in check height: top-[1.25in] ≈ 36%, top-[1.75in] ≈ 50%, top-[2.05in] ≈ 59%
   - For 8.5in page width: left-[1.1in] ≈ 13%, right-[2.5in] ≈ 29%, right-[0.5in] ≈ 6%
3. Update the screen preview section (around lines 144-165) with corrected positioning
4. Test by running `npm run dev` and comparing preview to the reference screenshot
</implementation>

<output>
Modify: `./src/components/CheckPreview.tsx`
- Update only the screen preview section CSS classes (lines ~144-165)
- Preserve all print view positioning exactly as-is
</output>

<verification>
After making changes:
1. Run `npm run dev` to start the development server
2. Enter test data: payee "Testing Vendor", address "66 King David Dr", city "Jackson", state "TN", zip "38305", amount "$100.00"
3. Compare the screen preview to the middle (check) section - payee/address should appear at approximately the same relative position in both
4. The date, amount, and amount-in-words should also align proportionally
</verification>

<success_criteria>
- Screen preview payee/address position matches print layout proportionally
- Date and amount fields align proportionally between preview and print
- Amount in words line position is consistent
- No changes to the print view functionality
- Visual comparison shows preview accurately represents final printed output
</success_criteria>
