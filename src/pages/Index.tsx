
import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import CheckForm from '@/components/CheckForm';
import CheckPreview from '@/components/CheckPreview';
import { useToast } from "@/components/ui/use-toast";
import { numberToWords } from '@/utils/numberToWords';

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
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payee, setPayee] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  
  const checkPrintRef = useRef<HTMLDivElement>(null);

  const amountInWords = amount && !isNaN(parseFloat(amount)) 
    ? numberToWords(parseFloat(amount)) 
    : '';

  const handlePrint = useReactToPrint({
    documentTitle: 'Check Print',
    onBeforePrint: () => {
      // Validate before printing
      if (!date || !payee.trim() || !amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        toast({
          title: "Invalid Input",
          description: "Please fill out all required fields with valid information.",
          variant: "destructive"
        });
        return Promise.reject('Invalid check information');
      }
      return Promise.resolve();
    },
    onAfterPrint: () => {
      toast({
        title: "Check Printed",
        description: "The check was sent to your printer successfully.",
      });
    },
    // The correct way to specify print content according to react-to-print
    contentRef: checkPrintRef,
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
    
    // Show preview first
    setShowPreview(true);
    
    // Then trigger print after a longer delay to ensure state is updated
    setTimeout(() => {
      handlePrint();
    }, 500);
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
