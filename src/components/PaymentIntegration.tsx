import React from 'react';

const { useState } = React;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Smartphone, CreditCard, Building2, Plus, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReceiptScanner } from './ReceiptScanner';

export const PaymentIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    bankName: ''
  });
  const [upiDetails, setUpiDetails] = useState({
    upiId: '',
    name: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleBankLinking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // This would typically connect to Open Banking APIs
      // For now, we'll show a placeholder message
      toast({
        title: 'Bank Integration',
        description: 'Bank account linking will be available once Open Banking APIs are integrated. Please use CSV import for now.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to link bank account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUPIConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // This would typically connect to UPI providers' APIs
      toast({
        title: 'UPI Integration',
        description: 'UPI integration requires official API access from payment providers. Please use manual transaction entry or CSV import.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect UPI',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Payment Integration
          </CardTitle>
          <CardDescription>
            Connect your payment accounts to automatically track transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ocr" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ocr" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Receipt OCR
              </TabsTrigger>
              <TabsTrigger value="bank" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Bank Account
              </TabsTrigger>
              <TabsTrigger value="upi" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                UPI/Digital Wallet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ocr" className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>💡 Import Bank Statements:</strong> To import CSV or Excel files, please go to the <strong>Expenses</strong> tab and click on <strong>Import Data</strong>. 
                  The import tool supports multiple formats including CSV, Excel, and complex bank statements.
                </p>
              </div>
              <ReceiptScanner />
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Link Bank Account</CardTitle>
                  <CardDescription>
                    Connect your bank account for automatic transaction sync (requires Open Banking API)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBankLinking} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Select value={bankDetails.bankName} onValueChange={(value) => setBankDetails({...bankDetails, bankName: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sbi">State Bank of India</SelectItem>
                            <SelectItem value="hdfc">HDFC Bank</SelectItem>
                            <SelectItem value="icici">ICICI Bank</SelectItem>
                            <SelectItem value="axis">Axis Bank</SelectItem>
                            <SelectItem value="pnb">Punjab National Bank</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={bankDetails.accountNumber}
                          onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                          placeholder="Enter account number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input
                          id="ifscCode"
                          value={bankDetails.ifscCode}
                          onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                          placeholder="Enter IFSC code"
                        />
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> Direct bank integration requires official Open Banking API access. 
                        This feature will be available once proper API partnerships are established with banks.
                      </p>
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Connecting...' : 'Link Bank Account'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upi" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connect UPI & Digital Wallets</CardTitle>
                  <CardDescription>
                    Link PhonePe, Google Pay, Paytm, and other digital wallets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUPIConnection} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        value={upiDetails.upiId}
                        onChange={(e) => setUpiDetails({...upiDetails, upiId: e.target.value})}
                        placeholder="your-id@paytm / your-id@oksbi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upiName">Account Holder Name</Label>
                      <Input
                        id="upiName"
                        value={upiDetails.name}
                        onChange={(e) => setUpiDetails({...upiDetails, name: e.target.value})}
                        placeholder="Enter your name as registered"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button type="button" variant="outline" className="h-20 flex flex-col gap-2">
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs">
                          PP
                        </div>
                        PhonePe
                      </Button>
                      <Button type="button" variant="outline" className="h-20 flex flex-col gap-2">
                        <div className="w-8 h-8 bg-success rounded flex items-center justify-center text-success-foreground font-bold text-xs">
                          GP
                        </div>
                        Google Pay
                      </Button>
                      <Button type="button" variant="outline" className="h-20 flex flex-col gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                          PT
                        </div>
                        Paytm
                      </Button>
                      <Button type="button" variant="outline" className="h-20 flex flex-col gap-2">
                        <Plus className="w-4 h-4" />
                        Add More
                      </Button>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> UPI transaction sync requires official API access from payment providers. 
                        Currently, most UPI apps don't provide third-party access to transaction history. 
                        Please use the CSV import feature with exported transaction data from your UPI app.
                      </p>
                    </div>
                    
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Connecting...' : 'Connect UPI Account'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
