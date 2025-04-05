
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

    // Split memo into lines for multi-line rendering
    const memoLines = memo ? memo.split('\n') : [];

    return (
      <div ref={ref} className="check-preview">
        {/* This is the hidden div that will be used for printing */}
        <div className="hidden print:block p-0 w-[8.5in] h-[11in] relative font-sans">
          {/* Top Voucher section */}
          <div className="absolute top-0 left-0 right-0 h-[3.5in] p-4 border-b border-gray-300">
            <div className="absolute left-6 top-20">
              <div className="font-semibold">Bradley or Suzan Powers</div>
            </div>
            <div className="absolute right-6 top-20">
              <div className="font-semibold">4016</div>
            </div>
            <div className="ml-6 mt-24">
              <div className="text-sm mb-1">Date: {formattedDate}</div>
              <div className="text-sm mb-1">Pay to the Order of: {payee}</div>
              <div className="text-sm mb-1 max-w-[70%]">{memo}</div>
              <div className="absolute right-8 top-24">
                <div className="text-sm">Amount: {formattedAmount}</div>
              </div>
            </div>
          </div>

          {/* Main check section (middle of page) */}
          <div className="absolute left-0 right-0 top-[3.5in] h-[3.5in] border-y border-blue-400 bg-blue-50">
            {/* Check header - sender info */}
            <div className="absolute left-6 top-8 text-xs">
              <div className="font-semibold">Bradley or Suzan Powers</div>
              <div>21 Broadmoor</div>
              <div>Jackson, TN 38305</div>
            </div>

            {/* Bank info - right side */}
            <div className="absolute right-6 top-8 text-right text-xs">
              <div className="font-semibold">Leaders Credit Union</div>
              <div>211 Oil Well Rd</div>
              <div>Jackson, TN 38305</div>
              <div>www.leaderscu.com</div>
            </div>

            {/* Check number */}
            <div className="absolute right-6 top-2 text-xs font-semibold">
              4016
            </div>

            {/* Date field - moved to align with the DATE label on check */}
            <div className="absolute right-[3.5in] top-[1.4in] text-sm">
              {formattedDate}
            </div>
            
            {/* Amount in numbers field - moved to align with AMOUNT label */}
            <div className="absolute right-6 top-[1.4in] text-right text-sm font-bold">
              {formattedAmount}
            </div>
            
            {/* Amount in words line - adjusted position */}
            <div className="absolute left-10 top-[1.7in] right-10 text-sm border-b border-gray-400">
              {amountInWords}
            </div>
            
            {/* Payee section - adjusted to match the Pay to the Order label */}
            <div className="absolute left-10 top-[2.0in] text-sm">
              <div>{payee}</div>
              {fullAddress && <div>{fullAddress}</div>}
              {cityStateZip && <div>{cityStateZip}</div>}
            </div>

            {/* Signature line */}
            <div className="absolute right-6 bottom-6 w-[2in] border-t border-gray-500">
              <div className="text-xs text-center mt-1">AUTHORIZED SIGNATURE</div>
            </div>

            {/* MICR line (check bottom line with numbers) */}
            <div className="absolute bottom-4 left-6 right-6 text-xs font-mono tracking-wider">
              c⁕040416⁕c c⁕284283864⁕c c⁕00005750⁕c
            </div>
          </div>

          {/* Bottom voucher section */}
          <div className="absolute left-0 right-0 top-[7in] bottom-0 p-4">
            <div className="absolute left-6 top-20">
              <div className="font-semibold">Bradley or Suzan Powers</div>
            </div>
            <div className="absolute right-6 top-20">
              <div className="font-semibold">4016</div>
            </div>
            <div className="ml-6 mt-24">
              <div className="text-sm mb-1">Date: {formattedDate}</div>
              <div className="text-sm mb-1">Pay to the Order of: {payee}</div>
              <div className="text-sm mb-1 max-w-[70%]">{memo}</div>
              <div className="absolute right-8 top-24">
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
              <div className="text-[10px] absolute left-2 top-4 font-semibold">
                Bradley or Suzan Powers
              </div>
              <div className="text-[10px] absolute right-2 top-4 font-semibold">
                4016
              </div>
              <div className="absolute left-2 top-12">
                <div className="text-xs mb-1">Date: {formattedDate}</div>
                <div className="text-xs mb-1">Pay to the Order of: {payee}</div>
                <div className="text-xs">{memo}</div>
              </div>
              <div className="absolute right-2 top-12">
                <div className="text-xs">Amount: {formattedAmount}</div>
              </div>
            </div>
            
            {/* Check Preview */}
            <div className="bg-blue-50 p-4 border-y border-blue-400 h-[30%] relative">
              <div className="text-[8px] absolute left-2 top-2">
                <div className="font-semibold">Bradley or Suzan Powers</div>
                <div>21 Broadmoor</div>
                <div>Jackson, TN 38305</div>
              </div>
              
              <div className="text-[8px] absolute right-2 top-2 text-right">
                <div className="font-semibold">Leaders Credit Union</div>
                <div>211 Oil Well Rd</div>
                <div>Jackson, TN 38305</div>
                <div>www.leaderscu.com</div>
                <div className="font-bold">4016</div>
              </div>
              
              <div className="absolute right-16 top-14 text-[8px]">
                {formattedDate}
              </div>
              
              <div className="absolute right-2 top-14 text-[8px] font-bold">
                {formattedAmount}
              </div>
              
              <div className="absolute left-4 top-18 right-4 text-[8px] border-b border-gray-400">
                {amountInWords}
              </div>
              
              <div className="absolute left-4 top-22 text-[8px]">
                {payee}<br />
                {fullAddress && <span>{fullAddress}<br /></span>}
                {cityStateZip && <span>{cityStateZip}</span>}
              </div>
              
              <div className="absolute right-2 bottom-2 w-16 border-t border-gray-500">
                <div className="text-[6px] text-center">SIGNATURE</div>
              </div>
            </div>
            
            {/* Bottom Voucher Preview */}
            <div className="bg-gray-50 p-4 flex-1 relative">
              <div className="text-[10px] absolute left-2 top-4 font-semibold">
                Bradley or Suzan Powers
              </div>
              <div className="text-[10px] absolute right-2 top-4 font-semibold">
                4016
              </div>
              <div className="absolute left-2 top-12">
                <div className="text-xs mb-1">Date: {formattedDate}</div>
                <div className="text-xs mb-1">Pay to the Order of: {payee}</div>
                <div className="text-xs">{memo}</div>
              </div>
              <div className="absolute right-2 top-12">
                <div className="text-xs">Amount: {formattedAmount}</div>
              </div>
            </div>
          </div>
          
          {/* Bottom Note */}
          <div className="text-sm text-center text-gray-600 mt-4">
            <p>For best results, place the check form in your printer with the top edge going in first.</p>
            <p className="text-xs mt-1 text-blue-600">Note: Preview is scaled down. Actual printout will fit standard 8.5" x 11" check stock.</p>
          </div>
        </div>
      </div>
    );
  }
);

CheckPreview.displayName = 'CheckPreview';

export default CheckPreview;
