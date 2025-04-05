
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { numberToWords, formatCurrency } from "@/utils/numberToWords";

interface CheckFormValues {
  date: string;
  payee: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  amount: string;
  memo: string;
}

interface CheckFormProps {
  onPrint: (values: CheckFormValues) => void;
  initialValues?: CheckFormValues;
}

const CheckForm: React.FC<CheckFormProps> = ({ onPrint, initialValues = {} }) => {
  const { toast } = useToast();
  const [date, setDate] = useState<string>(initialValues.date || new Date().toISOString().split('T')[0]);
  const [payee, setPayee] = useState<string>(initialValues.payee || '');
  const [address, setAddress] = useState<string>(initialValues.address || '');
  const [city, setCity] = useState<string>(initialValues.city || '');
  const [state, setState] = useState<string>(initialValues.state || '');
  const [zipCode, setZipCode] = useState<string>(initialValues.zipCode || '');
  const [amount, setAmount] = useState<string>(initialValues.amount || '');
  const [memo, setMemo] = useState<string>(initialValues.memo || '');
  const [amountInWords, setAmountInWords] = useState<string>('');
  const amountInputRef = useRef<HTMLInputElement>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and a single decimal point
    if (/^$|^[0-9]+(\.[0-9]*)?$/.test(value)) {
      setAmount(value);
      
      // Update the amount in words when a valid number is entered
      if (value && !isNaN(parseFloat(value))) {
        setAmountInWords(numberToWords(parseFloat(value)));
      } else {
        setAmountInWords('');
      }
    }
  };

  const validateForm = (): boolean => {
    if (!date) {
      toast({ 
        title: "Date Required", 
        description: "Please enter a valid date for the check.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!payee.trim()) {
      toast({ 
        title: "Payee Required", 
        description: "Please enter the payee name.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({ 
        title: "Valid Amount Required", 
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive"
      });
      if (amountInputRef.current) {
        amountInputRef.current.focus();
      }
      return false;
    }
    
    return true;
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
    setDate(new Date().toISOString().split('T')[0]);
    setPayee('');
    setAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setAmount('');
    setMemo('');
    setAmountInWords('');
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
            />
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
              className="font-medium"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="payee">Pay to the Order of</Label>
          <Input
            id="payee"
            type="text"
            placeholder="Recipient or Company Name"
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
          />
        </div>
        
        {/* Address Fields */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            placeholder="Street Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              type="text"
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              type="text"
              placeholder="Zip Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amountWords">Amount in Words</Label>
          <div className="p-2 border rounded-md bg-gray-50 min-h-10">
            {amountInWords ? (
              <p className="font-medium text-gray-700">{amountInWords}</p>
            ) : (
              <p className="text-gray-400 italic">Amount will appear here in words</p>
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
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleClear}>Clear Form</Button>
        <Button 
          onClick={handlePrintClick} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          Print Check
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CheckForm;
