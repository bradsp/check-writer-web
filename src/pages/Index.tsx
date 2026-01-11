import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import CheckForm from '@/components/CheckForm';
import CheckPreview from '@/components/CheckPreview';
import { useToast } from "@/components/ui/use-toast";
import { numberToWords } from '@/utils/numberToWords';
import { validateDate, validatePayee, validateAmount } from '@/utils/validation';
import { getTodayLocalISO } from '@/utils/dateHelpers';
import { CheckData } from '@/types/check';

const Index = () => {
  const { toast } = useToast();

  // Consolidated state management - single state object instead of 8 individual hooks
  const [checkData, setCheckData] = useState<CheckData>({
    date: getTodayLocalISO(),
    payee: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    amount: '',
    memo: '',
  });

  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isPreparingPreview, setIsPreparingPreview] = useState<boolean>(false);

  const checkPrintRef = useRef<HTMLDivElement>(null);

  // Generate the amount in words
  const amountInWords = checkData.amount && !isNaN(parseFloat(checkData.amount))
    ? numberToWords(parseFloat(checkData.amount))
    : '';

  const handlePrint = useReactToPrint({
    documentTitle: 'Check Print',
    onBeforePrint: () => {
      setIsPrinting(true);

      const validationErrors: string[] = [];

      // Validate date
      const dateValidation = validateDate(checkData.date);
      if (!dateValidation.isValid) {
        validationErrors.push(`Date: ${dateValidation.error || 'Invalid date'}`);
      }

      // Validate payee
      const payeeValidation = validatePayee(checkData.payee);
      if (!payeeValidation.isValid) {
        validationErrors.push(`Payee: ${payeeValidation.error || 'Invalid payee name'}`);
      }

      // Validate amount
      const amountValidation = validateAmount(checkData.amount);
      if (!amountValidation.isValid) {
        validationErrors.push(`Amount: ${amountValidation.error || 'Invalid amount'}`);
      }

      // If there are validation errors, show all of them
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Failed",
          description: validationErrors.join(' | '),
          variant: "destructive"
        });
        setIsPrinting(false);
        return Promise.reject('Validation failed');
      }

      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      toast({
        title: "Check Printed",
        description: "The check was sent to your printer successfully.",
      });
    },
    // Specify print content
    contentRef: checkPrintRef,
    // Prevent multiple pages from being printed
    pageStyle: "@page { size: 8.5in 11in; margin: 0mm; } @page { page-break-after: avoid; }",
  });

  const handleFormSubmit = async (formData: CheckData) => {
    setIsPreparingPreview(true);

    // Simulate brief preparation time for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 300));

    // Update state with form data using single setState call
    setCheckData(formData);

    // Show preview (no longer auto-prints)
    setShowPreview(true);
    setIsPreparingPreview(false);
  };

  const handlePrintClick = () => {
    handlePrint();
  };

  const handleEditClick = () => {
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">Check Writer</h1>
          <p className="text-gray-600 mt-2">Print information on pre-printed check forms</p>
        </header>

        <main role="main" aria-label="Check writing application">
          <section className="grid grid-cols-1 gap-8" aria-label={showPreview ? "Check preview" : "Check form"}>
            {/* Form to collect check information - hide when preview is shown */}
            {!showPreview && (
              <CheckForm
                onPrint={handleFormSubmit}
                initialValues={checkData}
                isLoading={isPreparingPreview}
              />
            )}

            {/* Preview with Print/Edit buttons */}
            {showPreview && (
              <article aria-label="Check preview and actions">
                <CheckPreview
                  ref={checkPrintRef}
                  date={checkData.date}
                  payee={checkData.payee}
                  address={checkData.address}
                  city={checkData.city}
                  state={checkData.state}
                  zipCode={checkData.zipCode}
                  amount={checkData.amount}
                  amountInWords={amountInWords}
                  memo={checkData.memo}
                />

                {/* Action buttons for preview */}
                <nav className="flex justify-center gap-4 mt-6" aria-label="Preview actions">
                  <button
                    onClick={handleEditClick}
                    disabled={isPrinting}
                    className="px-6 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    aria-label="Edit check details"
                  >
                    Edit Check
                  </button>
                  <button
                    onClick={handlePrintClick}
                    disabled={isPrinting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    aria-label="Print check"
                  >
                    {isPrinting ? 'Printing...' : 'Print Check'}
                  </button>
                </nav>
              </article>
            )}
          </section>
        </main>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Position your pre-printed check form in the printer before printing</p>
          <p className="mt-1">© 2025 Check Writer App</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
