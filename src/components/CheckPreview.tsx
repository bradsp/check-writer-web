
import React, { forwardRef } from 'react';

interface CheckPreviewProps {
  date: string;
  payee: string;
  amount: string;
  amountInWords: string;
  memo: string;
}

const CheckPreview = forwardRef<HTMLDivElement, CheckPreviewProps>(
  ({ date, payee, amount, amountInWords, memo }, ref) => {
    // Format date to MM/DD/YYYY
    const formattedDate = date ? new Date(date).toLocaleDateString('en-US') : '';
    
    // Format amount with dollar sign and 2 decimal places
    const formattedAmount = amount 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount))
      : '';

    // Split memo into lines for multi-line rendering
    const memoLines = memo ? memo.split('\n') : [];

    return (
      <div ref={ref} className="check-preview">
        {/* This is the hidden div that will be used for printing */}
        <div className="hidden print:block p-4 w-[8.5in] h-[11in] relative font-sans">
          {/* Main check section (middle of page) */}
          <div className="absolute inset-0 flex flex-col">
            {/* Payee section */}
            <div className="absolute left-[1in] top-[5.75in]">
              <span className="text-base font-medium">{payee}</span>
            </div>
            
            {/* Date position */}
            <div className="absolute right-[3.15in] top-[4.9in]">
              <span className="text-base font-medium">{formattedDate}</span>
            </div>
            
            {/* Amount in words position */}
            <div className="absolute left-[0.5in] top-[5.3in] right-[0.5in]">
              <span className="text-base font-medium">{amountInWords}</span>
            </div>
            
            {/* Amount in numbers position - right-aligned */}
            <div className="absolute right-[0.5in] top-[4.9in]">
              <span className="text-base font-bold">{formattedAmount}</span>
            </div>
            
            {/* Memo position */}
            <div className="absolute left-[1in] top-[6in]">
              {memoLines.map((line, index) => (
                <div key={index} className="text-sm">{line}</div>
              ))}
            </div>
            
            {/* Top voucher section */}
            <div className="absolute left-[1in] top-[1in]">
              <div>Date: {formattedDate}</div>
              <div className="mt-[20px]">Pay to the Order of: {payee}</div>
              <div className="mt-[40px]">
                {memoLines.map((line, index) => (
                  <div key={`top-${index}`} className="text-sm">{line}</div>
                ))}
              </div>
            </div>
            <div className="absolute right-[2in] top-[1in]">
              <div className="mt-[20px]">Amount: {formattedAmount}</div>
            </div>
            
            {/* Bottom voucher section */}
            <div className="absolute left-[1in] top-[7.5in]">
              <div>Date: {formattedDate}</div>
              <div className="mt-[20px]">Pay to the Order of: {payee}</div>
              <div className="mt-[40px]">
                {memoLines.map((line, index) => (
                  <div key={`bottom-${index}`} className="text-sm">{line}</div>
                ))}
              </div>
            </div>
            <div className="absolute right-[2in] top-[7.5in]">
              <div className="mt-[20px]">Amount: {formattedAmount}</div>
            </div>
          </div>
        </div>

        {/* This is the preview that is shown on screen */}
        <div className="block print:hidden bg-white border rounded-md p-6 mt-4 mx-auto max-w-2xl">
          <h3 className="text-lg font-semibold text-center mb-4 text-check-blue">Check Preview</h3>
          <div className="bg-gray-50 p-4 rounded-md border-2 border-dashed border-gray-300 aspect-[2.43/1] relative">
            <div className="absolute right-14 top-6">
              <div className="text-sm text-gray-500">Date:</div>
              <span className="text-base font-medium">{formattedDate}</span>
            </div>
            
            <div className="absolute left-14 top-16">
              <div className="text-sm text-gray-500">Pay to the order of:</div>
              <span className="text-base font-medium">{payee || '____________'}</span>
            </div>
            
            <div className="absolute left-14 top-28 right-14">
              <div className="text-sm text-gray-500">Amount in words:</div>
              <span className="text-base font-medium">{amountInWords || '____________'}</span>
            </div>
            
            <div className="absolute right-6 top-16">
              <div className="text-sm text-gray-500">Amount:</div>
              <span className="text-base font-bold">{formattedAmount || '$____.__'}</span>
            </div>
            
            <div className="absolute left-6 bottom-12">
              <div className="text-sm text-gray-500">Memo:</div>
              <span className="text-sm">{memo || '____________'}</span>
            </div>

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-400">
              This is a preview. Actual print layout may vary.
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CheckPreview.displayName = 'CheckPreview';

export default CheckPreview;
