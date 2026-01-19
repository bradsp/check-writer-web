
import React, { forwardRef, useMemo, useState, useEffect, useRef } from 'react';
import { sanitizeText } from '@/utils/validation';
import { formatCheckDate } from '@/utils/dateHelpers';
import { padWithAsterisks } from '@/utils/checkFormatting';

interface CheckPreviewProps {
  date: string;
  payee: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  amount: string;
  amountInWords: string;
  memo: string;
}

/*
 * LAYOUT CONSTANTS
 * ================
 *
 * Standard US Letter page: 8.5" x 11"
 * At 96 DPI (CSS standard): 816px x 1056px
 *
 * The check stock is divided into three sections:
 * - Top voucher: 0 to 3.5" (336px)
 * - Check: 3.5" to 7" (336px to 672px)
 * - Bottom voucher: 7" to 11" (672px to 1056px)
 *
 * The background image (check_overlay.png) is 1270x1654 pixels at 150 DPI,
 * which represents the same 8.5" x 11" page. We scale it to fit our CSS-inch
 * based layout using background-size: 100% 100%.
 */
const PAGE_WIDTH_INCHES = 8.5;
const PAGE_HEIGHT_INCHES = 11;
const CSS_DPI = 96;
const PAGE_WIDTH_PX = PAGE_WIDTH_INCHES * CSS_DPI; // 816px
const PAGE_HEIGHT_PX = PAGE_HEIGHT_INCHES * CSS_DPI; // 1056px

const CheckPreview = forwardRef<HTMLDivElement, CheckPreviewProps>(
  ({ date, payee, address, city, state, zipCode, amount, amountInWords, memo }, ref) => {
    // Memoize sanitized text values to avoid re-sanitizing on every render
    const sanitizedPayee = useMemo(() => sanitizeText(payee), [payee]);
    const sanitizedAddress = useMemo(() => sanitizeText(address), [address]);
    const sanitizedCity = useMemo(() => sanitizeText(city), [city]);
    const sanitizedState = useMemo(() => sanitizeText(state), [state]);
    const sanitizedZipCode = useMemo(() => sanitizeText(zipCode), [zipCode]);
    const sanitizedMemo = useMemo(() => sanitizeText(memo), [memo]);

    // Memoize formatted date calculation
    const formattedDate = useMemo(() => formatCheckDate(date), [date]);

    // Memoize formatted amount calculation
    const formattedAmount = useMemo(() => {
      if (!amount) return '';
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) return '$0.00';
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parsedAmount);
    }, [amount]);

    // Memoize address formatting
    const fullAddress = useMemo(() => sanitizedAddress ? `${sanitizedAddress}` : '', [sanitizedAddress]);
    const cityStateZip = useMemo(() => [
      sanitizedCity,
      (sanitizedCity && sanitizedState) ? ', ' : '',
      sanitizedState,
      (sanitizedZipCode && (sanitizedCity || sanitizedState)) ? ' ' : '',
      sanitizedZipCode
    ].join(''), [sanitizedCity, sanitizedState, sanitizedZipCode]);

    // Memoize padded amount in words
    const paddedAmountInWords = useMemo(
      () => amountInWords ? padWithAsterisks(amountInWords) : '',
      [amountInWords]
    );

    // Screen preview scaling - dynamically calculated based on container width
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.5); // Initial scale, will be recalculated

    useEffect(() => {
      const updateScale = () => {
        if (previewContainerRef.current) {
          const containerWidth = previewContainerRef.current.clientWidth;
          // Calculate scale to fit the 816px page into the container with some padding
          const newScale = Math.min(containerWidth / PAGE_WIDTH_PX, 1);
          setScale(newScale);
        }
      };

      updateScale();
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }, []);

    return (
      <div ref={ref} className="check-preview">
        {/* This is the hidden div that will be used for printing - contained to one page */}
        <div className="hidden print:block p-0 w-[8.5in] h-[11in] relative font-sans overflow-hidden">
          {/* Top Voucher section */}
          <div className="absolute top-0 left-0 right-0 h-[3.5in] p-4">
            <div className="absolute left-4 top-24">
              <div className="text-sm mb-1">Date: {formattedDate}</div>
              <div className="text-sm mb-1">Pay to the Order of: {sanitizedPayee}</div>
              <div className="text-sm mb-1 max-w-[70%]">{sanitizedMemo}</div>
              <div className="absolute right-0 top-0">
                <div className="text-sm">Amount: {formattedAmount}</div>
              </div>
            </div>
          </div>

          {/* Main check section (middle of page) - Only includes variable data */}
          <div className="absolute left-0 right-0 top-[3.5in] h-[3.5in]">
            {/* Date field - moved to the left by 1 inch and down .25 inch from previous position */}
            <div className="absolute right-[2.5in] top-[1.25in] text-sm">
              {formattedDate === 'Invalid Date' ? (
                <span className="text-red-500">Invalid Date</span>
              ) : (
                formattedDate
              )}
            </div>
            
            {/* Amount in numbers field - moved left .5 inch and down .25 inch from previous position */}
            <div className="absolute right-[0.5in] top-[1.25in] text-right text-sm font-bold">
              {formattedAmount}
            </div>
            
            {/* Amount in words line - moved down .25 inch from previous position */}
            <div className="absolute left-10 top-[1.75in] right-36 text-sm font-mono">
              {paddedAmountInWords}
            </div>
            
            {/* Payee section - moved down .25 inch from previous position */}
            <div className="absolute left-[1.1in] top-[2.05in] text-sm">
              <div>{sanitizedPayee}</div>
              {fullAddress && <div>{fullAddress}</div>}
              {cityStateZip && <div>{cityStateZip}</div>}
            </div>
          </div>

          {/* Bottom voucher section */}
          <div className="absolute left-0 right-0 top-[7in] bottom-0 p-4">
            <div className="absolute left-4 top-24">
              <div className="text-sm mb-1">Date: {formattedDate}</div>
              <div className="text-sm mb-1">Pay to the Order of: {sanitizedPayee}</div>
              <div className="text-sm mb-1 max-w-[70%]">{sanitizedMemo}</div>
              <div className="absolute right-0 top-0">
                <div className="text-sm">Amount: {formattedAmount}</div>
              </div>
            </div>
          </div>
        </div>

        {/*
          SCREEN PREVIEW
          ==============
          This preview uses the same positioning as the print view, scaled down to fit
          the screen. The approach:

          1. Create an outer container that measures available width
          2. Create an inner "page" at exactly 816px x 1056px (8.5" x 11" at 96 DPI)
          3. Apply transform: scale() to shrink it to fit the container
          4. Use IDENTICAL positioning to the print view for all text overlays

          This guarantees that what you see matches what will print.
        */}
        <div className="block print:hidden bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-md p-6 mt-4 mx-auto max-w-4xl">
          <h3 className="text-lg font-semibold text-center mb-4 text-blue-600 dark:text-blue-400">Check Preview</h3>

          {/* Container to measure available width and provide scaling reference */}
          <div
            ref={previewContainerRef}
            className="relative w-full max-w-[816px] mx-auto"
            style={{
              // Height must account for the scaled page height
              height: `${PAGE_HEIGHT_PX * scale}px`,
            }}
          >
            {/*
              Inner page container - exact 8.5" x 11" size, scaled to fit.
              Uses transform-origin: top left so scaling works predictably.
              The scale is calculated dynamically based on container width.
            */}
            <div
              className="absolute top-0 left-0 origin-top-left font-sans"
              style={{
                width: `${PAGE_WIDTH_PX}px`,
                height: `${PAGE_HEIGHT_PX}px`,
                transform: `scale(${scale})`,
                backgroundImage: "url('/check_overlay.png')",
                backgroundSize: '100% 100%',
                backgroundPosition: 'top left',
                backgroundRepeat: 'no-repeat',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
            >
              {/*
                TOP VOUCHER SECTION (0 - 3.5 inches)
                Same positioning as print view, with semi-transparent overlay
                to distinguish from check section while still showing background.
              */}
              <div className="absolute top-0 left-0 right-0 h-[3.5in] p-4">
                <div className="absolute left-4 top-24">
                  <div className="text-sm mb-1">Date: {formattedDate}</div>
                  <div className="text-sm mb-1">Pay to the Order of: {sanitizedPayee}</div>
                  <div className="text-sm mb-1 max-w-[70%]">{sanitizedMemo}</div>
                  <div className="absolute right-0 top-0">
                    <div className="text-sm">Amount: {formattedAmount}</div>
                  </div>
                </div>
              </div>

              {/*
                CHECK SECTION (3.5 - 7 inches)
                This is where the actual check fields are positioned.
                Uses IDENTICAL positioning values as the print view above.
              */}
              <div className="absolute left-0 right-0 top-[3.5in] h-[3.5in]">
                {/* Date field - matches print: right-[2.5in] top-[1.25in] relative to check section */}
                <div className="absolute right-[2.5in] top-[1.25in] text-sm">
                  {formattedDate === 'Invalid Date' ? (
                    <span className="text-red-500 bg-white/80 px-1">Invalid Date</span>
                  ) : (
                    <span className="bg-yellow-200/80 px-1">{formattedDate}</span>
                  )}
                </div>

                {/* Amount in numbers - matches print: right-[0.5in] top-[1.25in] */}
                <div className="absolute right-[0.5in] top-[1.25in] text-right text-sm font-bold">
                  <span className="bg-yellow-200/80 px-1">{formattedAmount}</span>
                </div>

                {/* Amount in words - matches print: left-10 top-[1.75in] right-36 */}
                <div className="absolute left-10 top-[1.75in] right-36 text-sm font-mono">
                  <span className="bg-yellow-200/80 px-1">{paddedAmountInWords}</span>
                </div>

                {/* Payee section - matches print: left-[1.1in] top-[2.05in] */}
                <div className="absolute left-[1.1in] top-[2.05in] text-sm">
                  <div className="bg-yellow-200/80 px-1 inline-block">{sanitizedPayee}</div>
                  {fullAddress && <div className="bg-yellow-200/80 px-1 inline-block mt-0.5">{fullAddress}</div>}
                  {cityStateZip && <div className="bg-yellow-200/80 px-1 inline-block mt-0.5">{cityStateZip}</div>}
                </div>
              </div>

              {/*
                BOTTOM VOUCHER SECTION (7 - 11 inches)
                Same positioning as print view.
              */}
              <div className="absolute left-0 right-0 top-[7in] bottom-0 p-4">
                <div className="absolute left-4 top-24">
                  <div className="text-sm mb-1">Date: {formattedDate}</div>
                  <div className="text-sm mb-1">Pay to the Order of: {sanitizedPayee}</div>
                  <div className="text-sm mb-1 max-w-[70%]">{sanitizedMemo}</div>
                  <div className="absolute right-0 top-0">
                    <div className="text-sm">Amount: {formattedAmount}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
            <p>For best results, place the check form in your printer with the top edge going in first.</p>
            <p className="text-xs mt-2 text-blue-600 dark:text-blue-400">
              Highlighted areas show where data will print on your pre-printed check stock.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

CheckPreview.displayName = 'CheckPreview';

// Wrap component with React.memo to prevent unnecessary re-renders
export default React.memo(CheckPreview);
