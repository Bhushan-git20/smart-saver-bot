import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Download, Upload, FileJson, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const DataBackup = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  const exportUserData = async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      // Fetch all user data
      const [transactionsRes, budgetGoalsRes, portfolioRes, recurringRes, achievementsRes, streaksRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('budget_goals').select('*').eq('user_id', user.id),
        supabase.from('portfolio_holdings').select('*').eq('user_id', user.id),
        supabase.from('recurring_transactions').select('*').eq('user_id', user.id),
        supabase.from('user_achievements').select('*').eq('user_id', user.id),
        supabase.from('user_streaks').select('*').eq('user_id', user.id)
      ]);

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        userId: user.id,
        data: {
          transactions: transactionsRes.data || [],
          budgetGoals: budgetGoalsRes.data || [],
          portfolioHoldings: portfolioRes.data || [],
          recurringTransactions: recurringRes.data || [],
          achievements: achievementsRes.data || [],
          streaks: streaksRes.data || []
        }
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart-saver-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: t('common.success'),
        description: 'Data exported successfully!',
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importUserData = async () => {
    if (!user || !importData.trim()) return;

    setIsImporting(true);
    try {
      const parsedData = JSON.parse(importData);
      
      if (!parsedData.data || !parsedData.version) {
        throw new Error('Invalid backup format');
      }

      // Clear existing data (with user confirmation)
      const confirmClear = window.confirm(
        'This will replace all your existing data. Are you sure you want to continue?'
      );
      if (!confirmClear) {
        setIsImporting(false);
        return;
      }

      // Import transactions
      if (parsedData.data.transactions?.length > 0) {
        const transactions = parsedData.data.transactions.map((t: any) => ({
          ...t,
          user_id: user.id,
          id: undefined // Let Supabase generate new IDs
        }));
        await supabase.from('transactions').insert(transactions);
      }

      // Import budget goals
      if (parsedData.data.budgetGoals?.length > 0) {
        const budgetGoals = parsedData.data.budgetGoals.map((bg: any) => ({
          ...bg,
          user_id: user.id,
          id: undefined
        }));
        await supabase.from('budget_goals').insert(budgetGoals);
      }

      // Import portfolio holdings
      if (parsedData.data.portfolioHoldings?.length > 0) {
        const portfolioHoldings = parsedData.data.portfolioHoldings.map((ph: any) => ({
          ...ph,
          user_id: user.id,
          id: undefined
        }));
        await supabase.from('portfolio_holdings').insert(portfolioHoldings);
      }

      // Import recurring transactions
      if (parsedData.data.recurringTransactions?.length > 0) {
        const recurringTransactions = parsedData.data.recurringTransactions.map((rt: any) => ({
          ...rt,
          user_id: user.id,
          id: undefined
        }));
        await supabase.from('recurring_transactions').insert(recurringTransactions);
      }

      toast({
        title: t('common.success'),
        description: 'Data imported successfully!',
      });
      setImportData('');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to import data. Please check the format.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {t('settings.dataExport')}
          </CardTitle>
          <CardDescription>
            Download a complete backup of all your financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Export includes:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All transactions and categorizations</li>
                <li>• Budget goals and recurring transactions</li>
                <li>• Portfolio holdings and investment data</li>
                <li>• Achievements and streak data</li>
                <li>• All preferences and settings</li>
              </ul>
            </div>
            <Button onClick={exportUserData} disabled={isExporting} className="w-full">
              {isExporting ? (
                <>
                  <Database className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {t('settings.dataImport')}
          </CardTitle>
          <CardDescription>
            Restore your data from a previous backup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="importData">Backup Data (JSON)</Label>
              <Textarea
                id="importData"
                placeholder="Paste your backup JSON data here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={6}
              />
            </div>
            
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <p className="text-sm text-destructive font-medium mb-1">
                ⚠️ Warning
              </p>
              <p className="text-sm text-muted-foreground">
                Importing data will replace all your existing data. Please export your current data first as a backup.
              </p>
            </div>
            
            <Button 
              onClick={importUserData} 
              disabled={isImporting || !importData.trim()} 
              variant="outline"
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <FileJson className="w-4 h-4 mr-2" />
                  Import Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};