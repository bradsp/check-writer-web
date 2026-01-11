
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { numberToWords } from "@/utils/numberToWords";
import { sanitizeText, validateAmount, validateDate, validatePayee, VALIDATION_RULES } from "@/utils/validation";
import { getTodayLocalISO } from '@/utils/dateHelpers';
import { padWithAsterisks } from '@/utils/checkFormatting';
import { CheckData } from '@/types/check';

interface CheckFormProps {
  onPrint: (values: CheckData) => void | Promise<void>;
  initialValues?: Partial<CheckData>;
  isLoading?: boolean;
}

const CheckForm: React.FC<CheckFormProps> = ({ onPrint, initialValues = {}, isLoading = false }) => {
  const { toast } = useToast();

  // Use local state for the form (allows real-time input without affecting parent state)
  const [date, setDate] = useState<string>(initialValues.date || getTodayLocalISO());
  const [payee, setPayee] = useState<string>(initialValues.payee || '');
  const [address, setAddress] = useState<string>(initialValues.address || '');
  const [city, setCity] = useState<string>(initialValues.city || '');
  const [state, setState] = useState<string>(initialValues.state || '');
  const [zipCode, setZipCode] = useState<string>(initialValues.zipCode || '');
  const [amount, setAmount] = useState<string>(initialValues.amount || '');
  const [memo, setMemo] = useState<string>(initialValues.memo || '');
  const [amountInWords, setAmountInWords] = useState<string>('');
  const [paddedAmountInWords, setPaddedAmountInWords] = useState<string>('');
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Field-specific error states
  const [dateError, setDateError] = useState<string>('');
  const [payeeError, setPayeeError] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and a single decimal point during typing
    if (/^$|^[0-9]+(\.[0-9]*)?$/.test(value)) {
      setAmount(value);

      // Validate and update the amount in words when a valid number is entered
      if (value) {
        const validation = validateAmount(value);
        if (validation.isValid && validation.normalized) {
          const words = numberToWords(parseFloat(validation.normalized));
          setAmountInWords(words);
          setPaddedAmountInWords(padWithAsterisks(words));
        } else {
          setAmountInWords('');
          setPaddedAmountInWords('');
        }
      } else {
        setAmountInWords('');
        setPaddedAmountInWords('');
      }
    }
  };

  const validateForm = (): boolean => {
    // Clear all errors first
    setDateError('');
    setPayeeError('');
    setAmountError('');

    let hasErrors = false;

    // Validate date
    const dateValidation = validateDate(date);
    if (!dateValidation.isValid) {
      setDateError(dateValidation.error || 'Please enter a valid date.');
      hasErrors = true;
    }

    // Validate payee
    const payeeValidation = validatePayee(payee);
    if (!payeeValidation.isValid) {
      setPayeeError(payeeValidation.error || 'Please enter a valid payee name.');
      hasErrors = true;
    }

    // Validate amount
    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
      setAmountError(amountValidation.error || 'Please enter a valid amount.');
      hasErrors = true;
      if (amountInputRef.current) {
        amountInputRef.current.focus();
      }
    }

    // Show toast for overall validation failure
    if (hasErrors) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors below.",
        variant: "destructive"
      });
    }

    return !hasErrors;
  };

  const handlePrintClick = () => {
    if (validateForm()) {
      onPrint({
        date,
        payee,
        address,
        city,
        state,
        zipCode,
        amount,
        memo
      });
    }
  };

  const handleClear = () => {
    setDate(getTodayLocalISO());
    setPayee('');
    setAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setAmount('');
    setMemo('');
    setAmountInWords('');
    setPaddedAmountInWords('');
    // Clear all errors
    setDateError('');
    setPayeeError('');
    setAmountError('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold">Check Writer</CardTitle>
        <CardDescription className="text-gray-100">Enter check details below</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={dateError ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {dateError && (
              <p className="text-sm text-red-600 mt-1">{dateError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="text"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              ref={amountInputRef}
              className={amountError ? 'border-red-500 focus:ring-red-500 font-medium' : 'font-medium'}
            />
            {amountError && (
              <p className="text-sm text-red-600 mt-1">{amountError}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="payee">Pay to the Order of</Label>
          <Input
            id="payee"
            type="text"
            placeholder="Recipient or Company Name"
            value={payee}
            onChange={(e) => setPayee(sanitizeText(e.target.value))}
            maxLength={VALIDATION_RULES.PAYEE_MAX_LENGTH}
            className={payeeError ? 'border-red-500 focus:ring-red-500' : ''}
          />
          {payeeError && (
            <p className="text-sm text-red-600 mt-1">{payeeError}</p>
          )}
        </div>
        
        {/* Address Fields */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            placeholder="Street Address"
            value={address}
            onChange={(e) => setAddress(sanitizeText(e.target.value))}
            maxLength={VALIDATION_RULES.ADDRESS_MAX_LENGTH}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(sanitizeText(e.target.value))}
              maxLength={VALIDATION_RULES.CITY_MAX_LENGTH}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              type="text"
              placeholder="State"
              value={state}
              onChange={(e) => setState(sanitizeText(e.target.value))}
              maxLength={VALIDATION_RULES.STATE_MAX_LENGTH}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              type="text"
              placeholder="Zip Code"
              value={zipCode}
              onChange={(e) => setZipCode(sanitizeText(e.target.value))}
              maxLength={VALIDATION_RULES.ZIP_MAX_LENGTH}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amountWords">Amount in Words</Label>
          <div className="p-2 border rounded-md bg-gray-50 min-h-10 font-mono">
            {paddedAmountInWords ? (
              <p className="font-medium text-gray-700">{paddedAmountInWords}</p>
            ) : (
              <p className="text-gray-400 italic">Amount will appear here in words with security padding</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="memo">Memo (Optional)</Label>
          <Input
            id="memo"
            type="text"
            placeholder="For invoice #1234, etc."
            value={memo}
            onChange={(e) => setMemo(sanitizeText(e.target.value))}
            maxLength={VALIDATION_RULES.MEMO_MAX_LENGTH}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleClear} disabled={isLoading}>
          Clear Form
        </Button>
        <Button
          onClick={handlePrintClick}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Preparing...' : 'Print Check'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CheckForm;
