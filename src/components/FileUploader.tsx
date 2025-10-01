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
    const result = Papa.parse(content, { header: true, skipEmptyLines: true });
    return result.data.map((row: any) => ({
      date: row.Date || row.date || row['Transaction Date'] || '',
      description: row.Description || row.description || row.Narration || row['Transaction Details'] || '',
      amount: Math.abs(parseFloat(row.Amount || row.amount || row['Debit Amount'] || row['Credit Amount'] || '0')),
      type: (parseFloat(row.Amount || row.amount || '0') < 0 || row['Debit Amount']) ? 'expense' as const : 'income' as const,
      category: 'Other'
    })).filter(t => t.date && t.description && t.amount > 0);
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
          
          const transactions = jsonData.map((row: any) => {
            const dateValue = row.Date || row.date || row['Transaction Date'] || row['Date'] || row['VALUE DATE'] || row['TRANSACTION DATE'];
            const description = String(row.Description || row.description || row.Narration || row['Transaction Details'] || row['DESCRIPTION'] || row['PARTICULARS'] || '').trim();
            const amountValue = row.Amount || row.amount || row['Debit Amount'] || row['Credit Amount'] || row['AMOUNT'] || row['WITHDRAWAL AMT'] || row['DEPOSIT AMT'] || '0';
            
            return {
              date: parseExcelDate(dateValue),
              description: description,
              amount: Math.abs(parseFloat(String(amountValue).replace(/[^0-9.-]/g, ''))),
              type: (parseFloat(String(row.Amount || row.amount || '0').replace(/[^0-9.-]/g, '')) < 0 || row['Debit Amount'] || row['WITHDRAWAL AMT']) ? 'expense' as const : 'income' as const,
              category: 'Other'
            };
          }).filter(t => t.date && t.description && t.amount > 0);
          
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

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

      setUploadProgress(50);

      // Auto-categorize transactions
      for (let i = 0; i < transactions.length; i++) {
        transactions[i].category = await categorizeTransaction(transactions[i].description);
        setUploadProgress(50 + (i / transactions.length) * 30);
      }

      setParsedTransactions(transactions);
      setShowPreview(true);
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse file. Please check the format.');
    } finally {
      setIsUploading(false);
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
                  Drop your bank statement file here or click to browse
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
                  <Button variant="outline" className="cursor-pointer" disabled={isUploading}>
                    Choose File
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
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};