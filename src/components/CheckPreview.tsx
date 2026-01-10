
import React, { forwardRef } from 'react';
import { sanitizeText } from '@/utils/validation';
import { formatCheckDate } from '@/utils/dateHelpers';

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
    // Sanitize all text inputs (defense in depth)
    const sanitizedPayee = sanitizeText(payee);
    const sanitizedAddress = sanitizeText(address);
    const sanitizedCity = sanitizeText(city);
    const sanitizedState = sanitizeText(state);
    const sanitizedZipCode = sanitizeText(zipCode);
    const sanitizedMemo = sanitizeText(memo);

    // Format date to MM/DD/YYYY
    const formattedDate = formatCheckDate(date);

    // Format amount with dollar sign and 2 decimal places, handling NaN gracefully
    const formattedAmount = (() => {
      if (!amount) return '';
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) return '$0.00';
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parsedAmount);
    })();

    // Full address formatted using sanitized values
    const fullAddress = sanitizedAddress ? `${sanitizedAddress}` : '';
    const cityStateZip = [
      sanitizedCity,
      (sanitizedCity && sanitizedState) ? ', ' : '',
      sanitizedState,
      (sanitizedZipCode && (sanitizedCity || sanitizedState)) ? ' ' : '',
      sanitizedZipCode
    ].join('');

    // Pad the amount in words with asterisks for security
    const padWithAsterisks = (text: string): string => {
      const maxLength = 80; // Approximate max characters in the amount line
      if (!text) return '';

      const padLength = maxLength - text.length;
      if (padLength <= 0) return text;

      const padding = '*'.repeat(padLength);
      return `${text} ${padding}`;
    };

    // Padded amount in words - handle undefined/null gracefully
    const paddedAmountInWords = amountInWords ? padWithAsterisks(amountInWords) : '';

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

        {/* This is the preview that is shown on screen */}
        <div className="block print:hidden bg-white border rounded-md p-6 mt-4 mx-auto max-w-4xl">
          <h3 className="text-lg font-semibold text-center mb-4 text-blue-600">Check Preview</h3>
          
          {/* Preview of full check page */}
          <div className="bg-white border-2 border-gray-300 rounded-md overflow-hidden w-full aspect-[8.5/11] flex flex-col">
            {/* Top Voucher Preview */}
            <div className="bg-gray-50 p-4 border-b border-gray-300 flex-1 relative">
              <div className="absolute left-4 top-16">
                <div className="text-xs mb-1">Date: {formattedDate}</div>
                <div className="text-xs mb-1">Pay to the Order of: {sanitizedPayee}</div>
                <div className="text-xs">{sanitizedMemo}</div>
                <div className="absolute right-0 top-0">
                  <div className="text-xs">Amount: {formattedAmount}</div>
                </div>
              </div>
            </div>
            
            {/* Check Preview - Shows only the variable data that will be printed */}
            <div className="bg-blue-50 p-4 border-y border-blue-400 h-[30%] relative">
              {/* Background elements representing pre-printed check (for visual reference only) */}
              <div className="text-[6px] opacity-30 absolute left-2 top-2">
                <div>Pre-printed sender info</div>
              </div>
              
              <div className="text-[6px] opacity-30 absolute right-2 top-2 text-right">
                <div>Pre-printed bank info</div>
                <div>Pre-printed check number</div>
              </div>
              
              {/* Date - moved to the left by 1 inch and down .25 inch from previous position */}
              <div className="absolute right-[40%] top-[25%] text-[7px]">
                {formattedDate}
              </div>
              
              {/* Amount - moved left .5 inch and down .25 inch from previous position */}
              <div className="absolute right-[10%] top-[25%] text-[7px] font-bold">
                {formattedAmount}
              </div>
              
              {/* Amount in words - moved down .25 inch from previous position */}
              <div className="absolute left-4 right-8 top-[40%] text-[7px] font-mono">
                {paddedAmountInWords}
                <div className="absolute top-[1px] left-[50%] right-0 border-b border-dotted border-gray-400 h-[1px]"></div>
              </div>
              
              {/* Payee - moved down .25 inch from previous position */}
              <div className="absolute left-[25%] top-[50%] text-[7px]">
                {sanitizedPayee}<br />
                {fullAddress && <span>{fullAddress}<br /></span>}
                {cityStateZip && <span>{cityStateZip}</span>}
              </div>
              
              {/* Pre-printed signature area indicator (visual reference only) */}
              <div className="text-[5px] opacity-30 absolute right-2 bottom-2">
                Pre-printed signature line
              </div>
            </div>
            
            {/* Bottom Voucher Preview */}
            <div className="bg-gray-50 p-4 flex-1 relative">
              <div className="absolute left-4 top-16">
                <div className="text-xs mb-1">Date: {formattedDate}</div>
                <div className="text-xs mb-1">Pay to the Order of: {sanitizedPayee}</div>
                <div className="text-xs">{sanitizedMemo}</div>
                <div className="absolute right-0 top-0">
                  <div className="text-xs">Amount: {formattedAmount}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Note */}
          <div className="text-sm text-center text-gray-600 mt-4">
            <p>For best results, place the check form in your printer with the top edge going in first.</p>
            <p className="text-xs mt-1 text-blue-600">Note: This preview shows only the data that will be printed on your pre-printed check stock.</p>
          </div>
        </div>
      </div>
    );
  }
);

CheckPreview.displayName = 'CheckPreview';

export default CheckPreview;
