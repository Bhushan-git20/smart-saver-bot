import React from 'react';

const { useState, useEffect } = React;
import { useAuth } from '@/hooks/useAuth';
import { SupabaseService } from '@/services/supabase.service';
import { ValidationUtils } from '@/utils/validation';
import { MonitoringService } from '@/services/monitoring.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecurringTransaction {
  id: string;
  name: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  next_due_date: string;
  is_active: boolean;
  description?: string;
}

const categories = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Bills & Utilities', 'Healthcare', 'Travel', 'Education',
  'Salary', 'Freelance', 'Investment Returns', 'Other'
];

export const RecurringTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    amount: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    if (user) {
      fetchRecurringTransactions();
    }
  }, [user]);

  const fetchRecurringTransactions = async () => {
    if (!user) return;
    try {
      const data = await SupabaseService.getRecurringTransactions(user.id);
      setRecurringTransactions(data as RecurringTransaction[]);
    } catch (error) {
      MonitoringService.captureError(error as Error, { component: 'RecurringTransactions', action: 'fetchRecurringTransactions' });
      toast({
        title: "Error",
        description: "Failed to fetch recurring transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateNextDueDate = (startDate: string, frequency: string): string => {
    const start = new Date(startDate);
    const today = new Date();
    
    if (start > today) return startDate;
    
    const diff = today.getTime() - start.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    let nextDate = new Date(start);
    
    switch (frequency) {
      case 'daily':
        nextDate.setDate(start.getDate() + days + 1);
        break;
      case 'weekly':
        const weeks = Math.floor(days / 7) + 1;
        nextDate.setDate(start.getDate() + weeks * 7);
        break;
      case 'monthly':
        const months = Math.floor(days / 30) + 1;
        nextDate.setMonth(start.getMonth() + months);
        break;
      case 'yearly':
        const years = Math.floor(days / 365) + 1;
        nextDate.setFullYear(start.getFullYear() + years);
        break;
    }
    
    return nextDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate inputs
    const sanitizedName = ValidationUtils.sanitizeString(formData.name);
    const sanitizedDesc = ValidationUtils.sanitizeString(formData.description);
    
    if (!sanitizedName || sanitizedName.length > 200) {
      toast({ title: "Error", description: "Invalid name", variant: "destructive" });
      return;
    }
    if (!ValidationUtils.isValidAmount(parseFloat(formData.amount))) {
      toast({ title: "Error", description: "Invalid amount", variant: "destructive" });
      return;
    }

    try {
      const nextDueDate = calculateNextDueDate(formData.start_date, formData.frequency);
      
      const transactionData = {
        user_id: user.id,
        name: sanitizedName.substring(0, 200),
        category: formData.category,
        type: formData.type,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        next_due_date: nextDueDate,
        description: sanitizedDesc ? sanitizedDesc.substring(0, 500) : null,
        is_active: formData.is_active
      };

      if (editingTransaction) {
        await SupabaseService.updateRecurringTransaction(editingTransaction.id, transactionData);
        toast({
          title: "Success",
          description: "Recurring transaction updated successfully",
        });
      } else {
        await SupabaseService.createRecurringTransaction(transactionData);
        toast({
          title: "Success",
          description: "Recurring transaction created successfully",
        });
      }

      setDialogOpen(false);
      setEditingTransaction(null);
      resetForm();
      fetchRecurringTransactions();
    } catch (error) {
      MonitoringService.captureError(error as Error, { component: 'RecurringTransactions', action: 'saveTransaction' });
      toast({
        title: "Error",
        description: "Failed to save recurring transaction",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await SupabaseService.deleteRecurringTransaction(id);
      toast({
        title: "Success",
        description: "Recurring transaction deleted successfully",
      });
      fetchRecurringTransactions();
    } catch (error) {
      MonitoringService.captureError(error as Error, { component: 'RecurringTransactions', action: 'deleteTransaction' });
      toast({
        title: "Error",
        description: "Failed to delete recurring transaction",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      name: transaction.name,
      category: transaction.category,
      type: transaction.type,
      amount: transaction.amount.toString(),
      frequency: transaction.frequency,
      start_date: transaction.start_date,
      end_date: transaction.end_date || '',
      description: transaction.description || '',
      is_active: transaction.is_active
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      type: 'expense',
      amount: '',
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      description: '',
      is_active: true
    });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
    resetForm();
  };

  if (loading) {
    return <div className="text-center">Loading recurring transactions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recurring Transactions</CardTitle>
            <CardDescription>
              Set up automatic income and expense entries
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingTransaction(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Recurring
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? 'Edit' : 'Add'} Recurring Transaction
                </DialogTitle>
                <DialogDescription>
                  Set up transactions that occur regularly
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Monthly Salary, Netflix Subscription"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTransaction ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {recurringTransactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">
            No recurring transactions set up yet.
          </p>
        ) : (
          <div className="space-y-4">
            {recurringTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{transaction.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {transaction.type}
                    </span>
                    {!transaction.is_active && (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {transaction.category} • Every {transaction.frequency}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Next: {new Date(transaction.next_due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(transaction)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};