
import React, { forwardRef } from 'react';

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
    // Format date to MM/DD/YYYY
    const formattedDate = date ? new Date(date).toLocaleDateString('en-US') : '';
    
    // Format amount with dollar sign and 2 decimal places
    const formattedAmount = amount 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount))
      : '';

    // Full address formatted
    const fullAddress = address ? `${address}` : '';
    const cityStateZip = [
      city, 
      (city && state) ? ', ' : '', 
      state, 
      (zipCode && (city || state)) ? ' ' : '', 
      zipCode
    ].join('');

    return (
      <div ref={ref} className="check-preview">
        {/* This is the hidden div that will be used for printing */}
        <div className="hidden print:block p-0 w-[8.5in] h-[11in] relative font-sans">
          {/* Top Voucher section */}
          <div className="absolute top-0 left-0 right-0 h-[3.5in] p-4 border-b border-gray-300">
            <div className="absolute left-4 top-24">
              <div className="text-sm mb-1">Date: {formattedDate}</div>
              <div className="text-sm mb-1">Pay to the Order of: {payee}</div>
              <div className="text-sm mb-1 max-w-[70%]">{memo}</div>
              <div className="absolute right-0 top-0">
                <div className="text-sm">Amount: {formattedAmount}</div>
              </div>
            </div>
          </div>

          {/* Main check section (middle of page) - Only includes variable data */}
          <div className="absolute left-0 right-0 top-[3.5in] h-[3.5in] border-y border-blue-400 bg-blue-50">
            {/* Date field - positioned to align with DATE label on check */}
            <div className="absolute right-[1.5in] top-[1.5in] text-sm">
              {formattedDate}
            </div>
            
            {/* Amount in numbers field - positioned to align with AMOUNT label */}
            <div className="absolute right-6 top-[1.5in] text-right text-sm font-bold">
              {formattedAmount}
            </div>
            
            {/* Amount in words line - positioned to match reference image */}
            <div className="absolute left-10 top-[2.0in] right-36 text-sm">
              {amountInWords}
            </div>
            
            {/* Payee section - positioned to match "PAY TO THE ORDER OF" label */}
            <div className="absolute left-10 top-[2.3in] text-sm">
              <div>{payee}</div>
              {fullAddress && <div>{fullAddress}</div>}
              {cityStateZip && <div>{cityStateZip}</div>}
            </div>
          </div>

          {/* Bottom voucher section */}
          <div className="absolute left-0 right-0 top-[7in] bottom-0 p-4">
            <div className="absolute left-4 top-24">
              <div className="text-sm mb-1">Date: {formattedDate}</div>
              <div className="text-sm mb-1">Pay to the Order of: {payee}</div>
              <div className="text-sm mb-1 max-w-[70%]">{memo}</div>
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
                <div className="text-xs mb-1">Pay to the Order of: {payee}</div>
                <div className="text-xs">{memo}</div>
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
              
              {/* Date - positioned to match reference image */}
              <div className="absolute right-16 top-[30%] text-[7px]">
                {formattedDate}
              </div>
              
              {/* Amount - positioned to match reference image */}
              <div className="absolute right-2 top-[30%] text-[7px] font-bold">
                {formattedAmount}
              </div>
              
              {/* Amount in words - positioned to match reference image */}
              <div className="absolute left-4 right-8 top-[45%] text-[7px]">
                {amountInWords}
                <div className="absolute top-[1px] left-[50%] right-0 border-b border-dotted border-gray-400 h-[1px]"></div>
              </div>
              
              {/* Payee - positioned to match reference image */}
              <div className="absolute left-4 top-[55%] text-[7px]">
                {payee}<br />
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
                <div className="text-xs mb-1">Pay to the Order of: {payee}</div>
                <div className="text-xs">{memo}</div>
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
