import React from 'react';

const { useState } = React;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Filter, Search } from 'lucide-react';
import { SupabaseService } from '@/services/supabase.service';
import { MonitoringService } from '@/services/monitoring.service';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  date: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export const TransactionList = ({ 
  transactions, 
  onRefresh,
}: TransactionListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { toast } = useToast();

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    try {
      await SupabaseService.deleteTransaction(id);
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
      onRefresh();
    } catch (error) {
      MonitoringService.captureError(error as Error, { component: 'TransactionList', action: 'deleteTransaction' });
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>View and manage your transaction history</CardDescription>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterType} onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {transactions.length === 0 ? 'No transactions yet' : 'No transactions match your filters'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                      {transaction.type}
                    </Badge>
                    <span className="font-medium">{transaction.category}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                  </div>
                  {transaction.description && (
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold text-lg ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(transaction.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};