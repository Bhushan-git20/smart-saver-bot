import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Filter } from 'lucide-react';
import { ExpenseCharts } from '@/components/ExpenseCharts';
import { TransactionList } from '@/components/TransactionList';

interface Transaction {
  id: string;
  date: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
}

const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Salary',
  'Freelance',
  'Investment',
  'Other'
];

export const ExpenseTracker = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch transactions',
        variant: 'destructive',
      });
    } else {
      setTransactions((data || []).map(item => ({
        id: item.id,
        date: item.date,
        category: item.category,
        type: item.type as 'income' | 'expense',
        amount: item.amount,
        description: item.description
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: user.id,
          date: formData.date,
          category: formData.category,
          type: formData.type,
          amount: parseFloat(formData.amount),
          description: formData.description || null,
        },
      ]);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add transaction',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        type: 'expense',
        amount: '',
        description: ''
      });
      setShowAddForm(false);
      fetchTransactions();
    }
    setLoading(false);
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

      {/* Add Transaction Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transactions</h2>
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

      {/* Charts */}
      <ExpenseCharts transactions={transactions} />

      {/* Transactions List */}
      <TransactionList transactions={transactions} onRefresh={fetchTransactions} />
    </div>
  );
};