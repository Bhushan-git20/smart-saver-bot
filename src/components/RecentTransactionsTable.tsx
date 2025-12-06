import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransactions } from '@/hooks/useTransactions';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

const getCategoryIcon = (category: string, type: string) => {
  if (type === 'income') return { icon: '↓', bg: 'bg-primary/10 text-primary' };
  
  const icons: Record<string, { icon: string; bg: string }> = {
    'Food & Dining': { icon: '🍽️', bg: 'bg-orange-500/10' },
    'Transportation': { icon: '🚗', bg: 'bg-blue-500/10' },
    'Shopping': { icon: '🛍️', bg: 'bg-pink-500/10' },
    'Entertainment': { icon: '🎬', bg: 'bg-purple-500/10' },
    'Bills & Utilities': { icon: '💡', bg: 'bg-yellow-500/10' },
    'Healthcare': { icon: '🏥', bg: 'bg-red-500/10' },
    'Travel': { icon: '✈️', bg: 'bg-cyan-500/10' },
    'Education': { icon: '📚', bg: 'bg-indigo-500/10' },
    'Other': { icon: '📝', bg: 'bg-gray-500/10' },
  };
  
  return icons[category] || { icon: '↑', bg: 'bg-secondary/10' };
};

export const RecentTransactionsTable = () => {
  const { transactions, isLoading } = useTransactions(5);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter(t => 
      t.category?.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.id.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <h3 className="font-semibold text-lg">Recent Transactions</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search" 
              className="pl-10 w-64 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {transactions.length === 0 ? 'No transactions yet' : 'No matching transactions'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="text-muted-foreground font-medium">Transaction ID</TableHead>
                <TableHead className="text-muted-foreground font-medium">Name</TableHead>
                <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                <TableHead className="text-muted-foreground font-medium">Amount</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => {
                const { icon, bg } = getCategoryIcon(transaction.category, transaction.type);
                const isIncome = transaction.type === 'income';
                
                return (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-muted-foreground">
                      {transaction.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-lg`}>
                          {icon}
                        </div>
                        <div>
                          <span className="font-medium">{transaction.category}</span>
                          {transaction.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {transaction.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(transaction.date), 'MMMM d, yyyy')}
                    </TableCell>
                    <TableCell className={`font-semibold ${isIncome ? 'text-green-600' : ''}`}>
                      {isIncome ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className="bg-success/10 text-success border-0 font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                        Completed
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};