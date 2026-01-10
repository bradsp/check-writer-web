import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import CheckForm from '@/components/CheckForm';
import CheckPreview from '@/components/CheckPreview';
import { useToast } from "@/components/ui/use-toast";
import { numberToWords } from '@/utils/numberToWords';
import { validateDate, validatePayee, validateAmount } from '@/utils/validation';
import { getTodayLocalISO } from '@/utils/dateHelpers';

interface CheckFormData {
  date: string;
  payee: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  amount: string;
  memo: string;
}

const Index = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<string>(getTodayLocalISO());
  const [payee, setPayee] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [shouldPrint, setShouldPrint] = useState(false);

  const checkPrintRef = useRef<HTMLDivElement>(null);

  // Generate the amount in words
  const amountInWords = amount && !isNaN(parseFloat(amount))
    ? numberToWords(parseFloat(amount))
    : '';

  // useEffect to handle printing after state updates
  useEffect(() => {
    if (shouldPrint && showPreview) {
      // State has been updated, trigger print
      handlePrint();
      setShouldPrint(false);
    }
  }, [shouldPrint, showPreview]);

  const handlePrint = useReactToPrint({
    documentTitle: 'Check Print',
    onBeforePrint: () => {
      // Validate date
      const dateValidation = validateDate(date);
      if (!dateValidation.isValid) {
        toast({
          title: "Invalid Date",
          description: dateValidation.error || "Please enter a valid date.",
          variant: "destructive"
        });
        return Promise.reject('Invalid date');
      }

      // Validate payee
      const payeeValidation = validatePayee(payee);
      if (!payeeValidation.isValid) {
        toast({
          title: "Invalid Payee",
          description: payeeValidation.error || "Please enter a valid payee name.",
          variant: "destructive"
        });
        return Promise.reject('Invalid payee');
      }

      // Validate amount
      const amountValidation = validateAmount(amount);
      if (!amountValidation.isValid) {
        toast({
          title: "Invalid Amount",
          description: amountValidation.error || "Please enter a valid amount.",
          variant: "destructive"
        });
        return Promise.reject('Invalid amount');
      }

      return Promise.resolve();
    },
    onAfterPrint: () => {
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

  const handleFormSubmit = (formData: CheckFormData) => {
    // Update state with form data
    setDate(formData.date);
    setPayee(formData.payee);
    setAddress(formData.address);
    setCity(formData.city);
    setState(formData.state);
    setZipCode(formData.zipCode);
    setAmount(formData.amount);
    setMemo(formData.memo);

    // Show preview
    setShowPreview(true);

    // Trigger print on next render (via useEffect)
    setShouldPrint(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">Check Writer</h1>
          <p className="text-gray-600 mt-2">Print information on pre-printed check forms</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Form to collect check information */}
          <CheckForm 
            onPrint={handleFormSubmit}
            initialValues={{ 
              date, 
              payee, 
              address, 
              city, 
              state, 
              zipCode, 
              amount, 
              memo 
            }}
          />
          
          {/* Hidden element for printing */}
          <div className={showPreview ? 'block' : 'hidden'}>
            <CheckPreview
              ref={checkPrintRef}
              date={date}
              payee={payee}
              address={address}
              city={city}
              state={state}
              zipCode={zipCode}
              amount={amount}
              amountInWords={amountInWords}
              memo={memo}
            />
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Position your pre-printed check form in the printer before printing</p>
          <p className="mt-1">© 2025 Check Writer App</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
