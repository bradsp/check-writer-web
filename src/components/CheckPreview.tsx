
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
    const fullAddress = address ? `${address}${city || state || zipCode ? '\n' : ''}` : '';
    const cityStateZip = [
      city, 
      (city && state) ? ', ' : '', 
      state, 
      (zipCode && (city || state)) ? ' ' : '', 
      zipCode
    ].join('');

    // Split memo into lines for multi-line rendering
    const memoLines = memo ? memo.split('\n') : [];

    return (
      <div ref={ref} className="check-preview">
        {/* This is the hidden div that will be used for printing */}
        <div className="hidden print:block p-4 w-[8.5in] h-[11in] relative font-sans">
          {/* Top Voucher section */}
          <div className="absolute top-[1.5in] left-[0.75in] right-[0.5in]">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm mb-2">Date: {formattedDate}</div>
                <div className="text-sm mb-2">Pay to the Order of: {payee}</div>
                {address && <div className="text-sm">{address}</div>}
                {cityStateZip && <div className="text-sm">{cityStateZip}</div>}
                <div className="mt-3">
                  {memoLines.map((line, index) => (
                    <div key={`top-${index}`} className="text-sm">{line}</div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm mt-4">Amount: {formattedAmount}</div>
              </div>
            </div>
          </div>

          {/* Main check section (middle of page) */}
          <div className="absolute left-0 right-0 top-[3.5in] bottom-[3.5in]">
            {/* Date position - right-aligned */}
            <div className="absolute right-[1.25in] top-[0.8in]">
              <span className="text-base">{formattedDate}</span>
            </div>
            
            {/* Amount in numbers position - right-aligned */}
            <div className="absolute right-[0.5in] top-[0.8in]">
              <span className="text-base font-bold">{formattedAmount}</span>
            </div>
            
            {/* Payee section */}
            <div className="absolute left-[1in] top-[1.6in] w-[4in]">
              <span className="text-base">{payee}</span>
              {address && <div className="text-sm mt-1">{address}</div>}
              {cityStateZip && <div className="text-sm">{cityStateZip}</div>}
            </div>
            
            {/* Amount in words position */}
            <div className="absolute left-[0.4in] top-[2.2in] right-[0.5in]">
              <span className="text-base">{amountInWords}</span>
            </div>
            
            {/* Memo position */}
            <div className="absolute left-[0.5in] bottom-[0.75in]">
              {memoLines.map((line, index) => (
                <div key={index} className="text-sm">{line}</div>
              ))}
            </div>
          </div>

          {/* Bottom voucher section */}
          <div className="absolute bottom-[1.5in] left-[0.75in] right-[0.5in]">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm mb-2">Date: {formattedDate}</div>
                <div className="text-sm mb-2">Pay to the Order of: {payee}</div>
                {address && <div className="text-sm">{address}</div>}
                {cityStateZip && <div className="text-sm">{cityStateZip}</div>}
                <div className="mt-3">
                  {memoLines.map((line, index) => (
                    <div key={`bottom-${index}`} className="text-sm">{line}</div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm mt-4">Amount: {formattedAmount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* This is the preview that is shown on screen */}
        <div className="block print:hidden bg-white border rounded-md p-6 mt-4 mx-auto max-w-2xl">
          <h3 className="text-lg font-semibold text-center mb-4 text-blue-600">Check Preview</h3>
          
          {/* Check Preview */}
          <div className="bg-gray-50 p-4 rounded-md border-2 border-dashed border-gray-300 aspect-[2.125/1] relative mb-4">
            <div className="absolute right-14 top-6">
              <div className="text-sm text-gray-500">Date:</div>
              <span className="text-sm font-medium">{formattedDate}</span>
            </div>
            
            <div className="absolute right-6 top-6">
              <div className="text-sm text-gray-500">Amount:</div>
              <span className="text-sm font-bold">{formattedAmount || '$____.__'}</span>
            </div>
            
            <div className="absolute left-14 top-16">
              <div className="text-sm text-gray-500">Pay to the order of:</div>
              <span className="text-sm font-medium">{payee || '____________'}</span>
              {address && <div className="text-xs mt-1">{address}</div>}
              {cityStateZip && <div className="text-xs">{cityStateZip}</div>}
            </div>
            
            <div className="absolute left-10 top-[5.5rem] right-10">
              <div className="text-sm text-gray-500">Amount in words:</div>
              <span className="text-sm font-medium">{amountInWords || '____________'}</span>
            </div>
            
            <div className="absolute left-6 bottom-8">
              <div className="text-sm text-gray-500">Memo:</div>
              <span className="text-xs">{memo || '____________'}</span>
            </div>

            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
              This is a preview. Actual print layout will match your pre-printed check form.
            </div>
          </div>
          
          {/* Bottom Note */}
          <div className="text-sm text-center text-gray-600 mt-2">
            <p>For best results, place the check form in your printer with the top edge going in first.</p>
          </div>
        </div>
      </div>
    );
  }
);

CheckPreview.displayName = 'CheckPreview';

export default CheckPreview;
