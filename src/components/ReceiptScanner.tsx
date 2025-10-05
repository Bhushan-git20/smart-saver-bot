import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { SecurityUtils } from '@/utils/security';
import { ValidationUtils } from '@/utils/validation';

interface ExtractedData {
  amount: string;
  date: string;
  description: string;
  category: string;
}

export const ReceiptScanner = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  const extractTextFromImage = async (imageFile: File): Promise<string> => {
    // Validate file
    const validation = SecurityUtils.validateFileUpload(imageFile, {
      maxSizeMB: 10,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Convert file to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          
          // Call Edge Function for OCR processing
          const { data, error } = await supabase.functions.invoke('process-receipt', {
            body: { image: base64 },
          });

          if (error) throw error;
          
          resolve(data.text);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(imageFile);
    });
  };

  const parseReceiptText = (text: string): ExtractedData => {
    // Parse OCR text to extract transaction details
    
    // Extract amount (look for currency patterns)
    const amountPatterns = [
      /(?:rs\.?|₹|inr)\s*(\d+(?:\.\d{2})?)/i,
      /(\d+(?:\.\d{2})?)\s*(?:rs\.?|₹|inr)/i,
      /total[:\s]*(?:rs\.?|₹)?\s*(\d+(?:\.\d{2})?)/i,
      /amount[:\s]*(?:rs\.?|₹)?\s*(\d+(?:\.\d{2})?)/i
    ];
    
    let amount = '';
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        amount = match[1];
        break;
      }
    }

    // Extract date (various formats)
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
      /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{2,4})/i
    ];
    
    let date = new Date().toISOString().split('T')[0];
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const parsedDate = new Date(match[1]);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0];
            break;
          }
        } catch (e) {
          // Continue to next pattern
        }
      }
    }

    // Extract description/merchant name (first few words or store name)
    const lines = text.split('\n').filter(line => line.trim().length > 2);
    let description = 'Receipt expense';
    
    // Look for common merchant indicators
    for (const line of lines.slice(0, 5)) {
      if (line.toLowerCase().includes('store') || 
          line.toLowerCase().includes('mart') ||
          line.toLowerCase().includes('shop') ||
          line.length > 5 && line.length < 30 && /^[a-zA-Z\s&]+$/.test(line)) {
        description = line.trim();
        break;
      }
    }

    // Determine category based on content
    const lowerText = text.toLowerCase();
    let category = 'Other';
    
    if (lowerText.includes('food') || lowerText.includes('restaurant') || lowerText.includes('cafe')) {
      category = 'Food';
    } else if (lowerText.includes('fuel') || lowerText.includes('petrol') || lowerText.includes('gas')) {
      category = 'Transportation';
    } else if (lowerText.includes('medical') || lowerText.includes('pharmacy') || lowerText.includes('hospital')) {
      category = 'Healthcare';
    } else if (lowerText.includes('grocery') || lowerText.includes('supermarket') || lowerText.includes('mart')) {
      category = 'Groceries';
    } else if (lowerText.includes('shopping') || lowerText.includes('mall') || lowerText.includes('store')) {
      category = 'Shopping';
    }

    return {
      amount: amount || '0',
      date,
      description,
      category
    };
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Show image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsProcessing(true);
    try {
      const extractedText = await extractTextFromImage(file);
      const parsedData = parseReceiptText(extractedText);
      setExtractedData(parsedData);
      
      toast({
        title: t('common.success'),
        description: t('ocr.extractedData'),
      });
    } catch (error: any) {
      console.error('OCR Error:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to process receipt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleAddTransaction = async () => {
    if (!extractedData || !user) return;

    try {
      // Validate inputs
      const sanitizedDescription = ValidationUtils.sanitizeString(extractedData.description);
      const amount = parseFloat(extractedData.amount);
      
      if (!ValidationUtils.isValidAmount(amount)) {
        throw new Error('Invalid amount');
      }
      
      if (!ValidationUtils.isValidDate(extractedData.date)) {
        throw new Error('Invalid date');
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          date: extractedData.date,
          category: extractedData.category,
          type: 'expense',
          amount,
          description: ValidationUtils.limitLength(`Receipt: ${sanitizedDescription}`, 200)
        });

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: 'Transaction added successfully from receipt!',
      });

      // Reset form
      setExtractedData(null);
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to add transaction',
        variant: 'destructive',
      });
    }
  };

  const updateExtractedData = (field: keyof ExtractedData, value: string) => {
    if (extractedData) {
      setExtractedData({ ...extractedData, [field]: value });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          {t('ocr.title')}
        </CardTitle>
        <CardDescription>
          Upload a photo of your receipt and we'll automatically extract the transaction details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-4">
          <Label>{t('ocr.uploadReceipt')}</Label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isProcessing}
            >
              <Upload className="w-4 h-4" />
              Choose Image
            </Button>
            
            {/* Camera capture for mobile */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              id="camera-input"
            />
            <Button
              onClick={() => document.getElementById('camera-input')?.click()}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isProcessing}
            >
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('ocr.processing')}</span>
          </div>
        )}

        {/* Image Preview */}
        {previewImage && (
          <div className="space-y-2">
            <Label>Uploaded Receipt</Label>
            <img 
              src={previewImage} 
              alt="Receipt preview" 
              className="max-w-full max-h-64 object-contain rounded-lg border"
            />
          </div>
        )}

        {/* Extracted Data Form */}
        {extractedData && (
          <div className="space-y-4 p-4 bg-success/5 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-success" />
              <h3 className="font-semibold">{t('ocr.extractedData')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('expense.amount')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={extractedData.amount}
                  onChange={(e) => updateExtractedData('amount', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('expense.date')}</Label>
                <Input
                  type="date"
                  value={extractedData.date}
                  onChange={(e) => updateExtractedData('date', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('expense.description')}</Label>
                <Input
                  value={extractedData.description}
                  onChange={(e) => updateExtractedData('description', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('expense.category')}</Label>
                <Select 
                  value={extractedData.category} 
                  onValueChange={(value) => updateExtractedData('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Groceries">Groceries</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button onClick={handleAddTransaction} className="w-full">
              {t('ocr.verify')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};