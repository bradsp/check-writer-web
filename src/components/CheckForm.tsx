
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { numberToWords, formatCurrency } from "@/utils/numberToWords";

interface CheckFormProps {
  onPrint: () => void;
}

const CheckForm: React.FC<CheckFormProps> = ({ onPrint }) => {
  const { toast } = useToast();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payee, setPayee] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
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
      onPrint();
    }
  };

  const handleClear = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setPayee('');
    setAmount('');
    setMemo('');
    setAmountInWords('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-check-blue text-white rounded-t-lg">
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
          className="bg-check-blue hover:bg-check-darkBlue"
        >
          Print Check
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CheckForm;
