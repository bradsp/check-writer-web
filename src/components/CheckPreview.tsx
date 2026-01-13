
import React, { forwardRef, useMemo } from 'react';
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

        {/* Screen Preview - Uses scaled container to match print positioning exactly */}
        <div className="block print:hidden bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-md p-6 mt-4 mx-auto max-w-4xl">
          <h3 className="text-lg font-semibold text-center mb-4 text-blue-600 dark:text-blue-400">Check Preview</h3>

          {/* Scaled wrapper - maintains 8.5:11 aspect ratio */}
          <div
            className="relative w-full max-w-[600px] mx-auto border-2 border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white"
            style={{ aspectRatio: '8.5 / 11' }}
          >
            {/*
              Inner container: actual 8.5in x 11in dimensions, scaled to fit.
              Uses CSS custom property for dynamic scaling based on container width.
              The scale is calculated as: containerWidth / 8.5in (where 1in = 96px)
              For a 600px container: 600 / (8.5 * 96) = 600 / 816 ≈ 0.735
            */}
            <div
              className="absolute inset-0 origin-top-left"
              style={{
                width: '8.5in',
                height: '11in',
                transform: 'scale(calc(100cqw / 816))',
              }}
            >
              {/* Top Voucher Section - 3.5in height */}
              <div className="absolute top-0 left-0 right-0 h-[3.5in] bg-gray-100 border-b border-gray-300">
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-2 font-semibold">TOP VOUCHER</div>
                  <div className="absolute left-4 top-16">
                    <div className="text-sm mb-1">Date: {formattedDate}</div>
                    <div className="text-sm mb-1">Pay to: {sanitizedPayee}</div>
                    <div className="text-sm mb-1">Amount: {formattedAmount}</div>
                    {sanitizedMemo && <div className="text-sm text-gray-600">Memo: {sanitizedMemo}</div>}
                  </div>
                </div>
              </div>

              {/* Check Section - 3.5in height (positioned at top-[3.5in]) */}
              {/*
                Placeholder background for check stock image.
                User will replace this with their actual check image later.
              */}
              <div className="absolute top-[3.5in] left-0 right-0 h-[3.5in] bg-gray-200 border-y-2 border-dashed border-gray-400">
                {/* Placeholder indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500 p-4">
                    <div className="text-lg font-medium mb-1">Check Stock Image Placeholder</div>
                    <div className="text-sm">Add your check image here</div>
                  </div>
                </div>

                {/*
                  Check data overlay - uses SAME positioning as print view.
                  These positions match exactly with the print view above.
                */}

                {/* Date field - matches print: right-[2.5in] top-[1.25in] */}
                <div className="absolute right-[2.5in] top-[1.25in] text-sm">
                  {formattedDate === 'Invalid Date' ? (
                    <span className="text-red-500">Invalid Date</span>
                  ) : (
                    <span className="bg-yellow-200/80 px-1">{formattedDate}</span>
                  )}
                </div>

                {/* Amount in numbers - matches print: right-[0.5in] top-[1.25in] */}
                <div className="absolute right-[0.5in] top-[1.25in] text-right text-sm font-bold">
                  <span className="bg-yellow-200/80 px-1">{formattedAmount}</span>
                </div>

                {/* Amount in words - matches print: left-10 top-[1.75in] */}
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

              {/* Bottom Voucher Section - 4in height (positioned at top-[7in]) */}
              <div className="absolute top-[7in] left-0 right-0 bottom-0 bg-gray-100 border-t border-gray-300">
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-2 font-semibold">BOTTOM VOUCHER</div>
                  <div className="absolute left-4 top-16">
                    <div className="text-sm mb-1">Date: {formattedDate}</div>
                    <div className="text-sm mb-1">Pay to: {sanitizedPayee}</div>
                    <div className="text-sm mb-1">Amount: {formattedAmount}</div>
                    {sanitizedMemo && <div className="text-sm text-gray-600">Memo: {sanitizedMemo}</div>}
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
