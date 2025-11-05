import React from 'react';

const { useState, useEffect } = React;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Plus, BarChart3, Upload, Settings as SettingsIcon } from 'lucide-react';
import { SupabaseService } from '@/services/supabase.service';
import { ValidationUtils } from '@/utils/validation';
import { MonitoringService } from '@/services/monitoring.service';
import { EnhancedExpenseCharts } from '@/components/EnhancedExpenseCharts';
import { TransactionList } from '@/components/TransactionList';
import { FileUploader } from '@/components/FileUploader';
import { AutoCategorizationManager } from '@/components/AutoCategorizationManager';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  date: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
}

const categories = [
  'Food', 'Transportation', 'Shopping', 'Entertainment', 
  'Utilities', 'Healthcare', 'Education', 'Travel',
  'Housing', 'Income', 'Investments', 'Other'
];

export const ExpenseTracker = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: ''
  });

  const fetchTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await SupabaseService.getTransactions(user.id);
      setTransactions(data.map(item => ({
        id: item.id,
        date: item.date,
        category: item.category,
        type: item.type as 'income' | 'expense',
        amount: item.amount,
        description: item.description || ''
      })));
    } catch (error) {
      toast.error('Failed to fetch transactions');
      MonitoringService.captureError(error as Error, { component: 'ExpenseTracker', action: 'fetchTransactions' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate inputs
    const sanitizedDesc = ValidationUtils.sanitizeString(formData.description);
    if (formData.description && sanitizedDesc.length > 500) {
      toast.error('Description too long');
      return;
    }
    if (!ValidationUtils.isValidAmount(parseFloat(formData.amount))) {
      toast.error('Invalid amount');
      return;
    }
    if (!ValidationUtils.isValidDate(formData.date)) {
      toast.error('Invalid date');
      return;
    }

    setLoading(true);
    try {
      await SupabaseService.createTransaction({
        user_id: user.id,
        date: formData.date,
        category: formData.category,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
      });

      toast.success('Transaction added successfully');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        type: 'expense',
        amount: '',
        description: ''
      });
      setShowAddForm(false);
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to add transaction');
      MonitoringService.captureError(error as Error, { component: 'ExpenseTracker', action: 'createTransaction' });
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{(totalIncome - totalExpenses).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Interface */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="upload">Import Data</TabsTrigger>
          <TabsTrigger value="settings">Auto-Rules</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>

          {/* Add Transaction Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Transaction</CardTitle>
                <CardDescription>
                  Manually add a new income or expense transaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: 'income' | 'expense') =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter transaction details..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading || !formData.category}>
                      {loading ? 'Adding...' : 'Add Transaction'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Transactions List */}
          <TransactionList transactions={transactions} onRefresh={fetchTransactions} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <EnhancedExpenseCharts transactions={transactions} />
        </TabsContent>

        {/* File Upload Tab */}
        <TabsContent value="upload">
          <FileUploader onUploadComplete={fetchTransactions} />
        </TabsContent>

        {/* Auto-Categorization Settings Tab */}
        <TabsContent value="settings">
          <AutoCategorizationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};