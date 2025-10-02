import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface FileUploaderProps {
  onUploadComplete: () => void;
}

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const categorizeTransaction = async (description: string): Promise<string> => {
    // Get categorization rules
    const { data: rules } = await supabase
      .from('categorization_rules')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (rules) {
      for (const rule of rules) {
        if (description.toLowerCase().includes(rule.keyword.toLowerCase())) {
          return rule.category;
        }
      }
    }

    // Default categorization logic
    const desc = description.toLowerCase();
    if (desc.includes('food') || desc.includes('restaurant') || desc.includes('zomato') || desc.includes('swiggy')) {
      return 'Food';
    } else if (desc.includes('uber') || desc.includes('ola') || desc.includes('transport') || desc.includes('fuel')) {
      return 'Transportation';
    } else if (desc.includes('shopping') || desc.includes('amazon') || desc.includes('flipkart')) {
      return 'Shopping';
    } else if (desc.includes('salary') || desc.includes('bonus') || desc.includes('income')) {
      return 'Income';
    } else if (desc.includes('rent') || desc.includes('maintenance')) {
      return 'Housing';
    } else if (desc.includes('electricity') || desc.includes('water') || desc.includes('gas') || desc.includes('internet')) {
      return 'Utilities';
    }
    
    return 'Other';
  };

  const parseCSV = (content: string): ParsedTransaction[] => {
    // First, try to detect if this is a bank statement with header rows
    const lines = content.split('\n');
    let headerRowIndex = -1;
    
    // Find the header row (look for common column names)
    for (let i = 0; i < Math.min(30, lines.length); i++) {
      const line = lines[i].toLowerCase();
      if ((line.includes('date') || line.includes('post date')) && 
          (line.includes('debit') || line.includes('credit') || line.includes('amount'))) {
        headerRowIndex = i;
        break;
      }
    }

    let csvContent = content;
    if (headerRowIndex > 0) {
      // Skip header rows and keep only data rows
      csvContent = lines.slice(headerRowIndex).join('\n');
      console.log(`Detected bank statement format, skipping ${headerRowIndex} header rows`);
    }

    const result = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    
    if (result.errors.length > 0) {
      console.error('CSV parsing errors:', result.errors);
    }

    const transactions = result.data.map((row: any, index: number) => {
      // Case-insensitive column matching
      const rowKeys = Object.keys(row);
      const getColumn = (names: string[]) => {
        for (const name of names) {
          const key = rowKeys.find(k => k.toLowerCase().includes(name.toLowerCase()));
          if (key && row[key]) return row[key];
        }
        return '';
      };

      const dateValue = getColumn(['post date', 'date', 'transaction date', 'value date', 'posting date', 'txn date']);
      const description = getColumn(['narration', 'description', 'transaction details', 'particulars', 'remarks', 'details']);
      const debitAmount = getColumn(['debit', 'withdrawal', 'withdrawal amt', 'debit amt']);
      const creditAmount = getColumn(['credit', 'deposit', 'deposit amt', 'credit amt']);
      const amount = getColumn(['amount', 'transaction amount', 'txn amount']);

      let finalAmount = 0;
      let transactionType: 'income' | 'expense' = 'expense';

      // Clean and parse amounts (remove commas, currency symbols, etc.)
      const cleanAmount = (val: string) => {
        if (!val) return 0;
        return parseFloat(String(val).replace(/[^0-9.-]/g, ''));
      };

      if (debitAmount) {
        const debitVal = cleanAmount(debitAmount);
        if (debitVal > 0) {
          finalAmount = debitVal;
          transactionType = 'expense';
        }
      }
      
      if (creditAmount) {
        const creditVal = cleanAmount(creditAmount);
        if (creditVal > 0) {
          finalAmount = creditVal;
          transactionType = 'income';
        }
      }
      
      if (finalAmount === 0 && amount) {
        const parsedAmount = cleanAmount(amount);
        finalAmount = Math.abs(parsedAmount);
        transactionType = parsedAmount < 0 ? 'expense' : 'income';
      }

      return {
        date: String(dateValue).trim(),
        description: String(description).trim(),
        amount: finalAmount,
        type: transactionType,
        category: 'Other'
      };
    }).filter(t => {
      const isValid = t.date && t.description && t.amount > 0;
      if (!isValid) {
        console.log('Filtered out invalid transaction:', t);
      }
      return isValid;
    });

    console.log(`Parsed ${transactions.length} valid transactions from CSV`);
    return transactions;
  };

  const parseExcelDate = (value: any): string => {
    if (!value) return '';
    
    // If it's already a string date, return it
    if (typeof value === 'string') return value;
    
    // If it's an Excel serial date number
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
    }
    
    // Try to parse as date object
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    return String(value);
  };

  const parseExcel = (file: File): Promise<ParsedTransaction[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true, cellText: false });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });
          
          console.log('Excel columns found:', jsonData.length > 0 ? Object.keys(jsonData[0]) : 'No data');
          
          const transactions = jsonData.map((row: any, index: number) => {
            // Case-insensitive column matching
            const rowKeys = Object.keys(row);
            const getColumn = (names: string[]) => {
              for (const name of names) {
                const key = rowKeys.find(k => k.toLowerCase() === name.toLowerCase());
                if (key && row[key]) return row[key];
              }
              return '';
            };

            const dateValue = getColumn(['date', 'transaction date', 'value date', 'posting date', 'txn date', 'transaction_date']);
            const description = getColumn(['description', 'narration', 'transaction details', 'particulars', 'remarks', 'details', 'transaction_details']);
            const debitAmount = getColumn(['debit', 'debit amount', 'withdrawal', 'withdrawal amt', 'debit amt', 'debit_amount']);
            const creditAmount = getColumn(['credit', 'credit amount', 'deposit', 'deposit amt', 'credit amt', 'credit_amount']);
            const amount = getColumn(['amount', 'transaction amount', 'txn amount', 'transaction_amount']);

            let finalAmount = 0;
            let transactionType: 'income' | 'expense' = 'expense';

            if (debitAmount) {
              finalAmount = Math.abs(parseFloat(String(debitAmount).replace(/[^0-9.-]/g, '')));
              transactionType = 'expense';
            } else if (creditAmount) {
              finalAmount = Math.abs(parseFloat(String(creditAmount).replace(/[^0-9.-]/g, '')));
              transactionType = 'income';
            } else if (amount) {
              const parsedAmount = parseFloat(String(amount).replace(/[^0-9.-]/g, ''));
              finalAmount = Math.abs(parsedAmount);
              transactionType = parsedAmount < 0 ? 'expense' : 'income';
            }

            const parsedDate = parseExcelDate(dateValue);
            const parsedDescription = String(description).trim();

            return {
              date: parsedDate,
              description: parsedDescription,
              amount: finalAmount,
              type: transactionType,
              category: 'Other'
            };
          }).filter(t => {
            const isValid = t.date && t.description && t.amount > 0;
            if (!isValid) {
              console.log('Filtered out invalid Excel transaction:', t);
            }
            return isValid;
          });
          
          console.log(`Parsed ${transactions.length} valid transactions from Excel`);
          resolve(transactions);
        } catch (error) {
          console.error('Excel parsing error:', error);
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      toast.error('Please select a file');
      return;
    }

    setSelectedFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      let transactions: ParsedTransaction[] = [];
      
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const content = await file.text();
        transactions = parseCSV(content);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        transactions = await parseExcel(file);
      } else {
        throw new Error('Unsupported file format. Please upload CSV or Excel files.');
      }

      if (transactions.length === 0) {
        throw new Error('No valid transactions found in the file. Please check the file format.');
      }

      setUploadProgress(50);

      // Auto-categorize transactions
      for (let i = 0; i < transactions.length; i++) {
        transactions[i].category = await categorizeTransaction(transactions[i].description);
        setUploadProgress(50 + (i / transactions.length) * 30);
      }

      setParsedTransactions(transactions);
      setShowPreview(true);
      setUploadProgress(100);
      toast.success(`Successfully parsed ${transactions.length} transactions from ${file.name}`);
      
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to parse file. Please check the format.');
      setSelectedFileName('');
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  }, [user]);

  const confirmUpload = async () => {
    if (!user || parsedTransactions.length === 0) return;

    setIsUploading(true);
    try {
      const transactionsToInsert = parsedTransactions.map(t => ({
        user_id: user.id,
        date: new Date(t.date).toISOString().split('T')[0],
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category
      }));

      const { error } = await supabase
        .from('transactions')
        .insert(transactionsToInsert);

      if (error) throw error;

      toast.success(`Successfully imported ${parsedTransactions.length} transactions`);
      setShowPreview(false);
      setParsedTransactions([]);
      setSelectedFileName('');
      onUploadComplete();
    } catch (error) {
      console.error('Error saving transactions:', error);
      toast.error('Failed to save transactions');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Bank Statements
        </CardTitle>
        <CardDescription>
          Upload CSV or Excel files from your bank or UPI app to automatically import transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showPreview ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {selectedFileName ? `Selected: ${selectedFileName}` : 'Drop your bank statement file here or click to browse'}
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <label htmlFor="file-upload">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="cursor-pointer" 
                    disabled={isUploading}
                    asChild
                  >
                    <span>{selectedFileName ? 'Choose Different File' : 'Choose File'}</span>
                  </Button>
                </label>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  Processing file... {uploadProgress}%
                </p>
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Supported formats: CSV, Excel (.xlsx, .xls). Make sure your file contains columns for Date, Description, and Amount.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Found {parsedTransactions.length} transactions. Review and confirm to import.
              </AlertDescription>
            </Alert>

            <div className="max-h-60 overflow-y-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">Amount</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedTransactions.slice(0, 10).map((transaction, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="p-2 truncate max-w-[200px]">{transaction.description}</td>
                      <td className="p-2">₹{transaction.amount.toFixed(2)}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="p-2">{transaction.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedTransactions.length > 10 && (
                <p className="p-2 text-center text-muted-foreground text-xs">
                  ...and {parsedTransactions.length - 10} more transactions
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={confirmUpload} disabled={isUploading}>
                Confirm Import ({parsedTransactions.length} transactions)
              </Button>
              <Button variant="outline" onClick={() => {
                setShowPreview(false);
                setSelectedFileName('');
              }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};