import { memo, useMemo } from 'react';
// @ts-ignore - react-window types issue
import { FixedSizeList as List } from 'react-window';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface TransactionListVirtualProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  height?: number;
}

const TransactionRow = memo(({ data, index, style }: any) => {
  const { transactions, onDelete } = data;
  const transaction = transactions[index];

  return (
    <div style={style} className="px-2">
      <Card className="p-4 mb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}${Math.abs(Number(transaction.amount)).toFixed(2)}
              </span>
              <span className="text-sm bg-secondary px-2 py-1 rounded">
                {transaction.category}
              </span>
            </div>
            {transaction.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {transaction.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(transaction.date), 'MMM dd, yyyy')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(transaction.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
});

TransactionRow.displayName = 'TransactionRow';

/**
 * Virtual scrolling transaction list for optimal performance with large datasets
 */
export const TransactionListVirtual = memo(({ 
  transactions, 
  onDelete,
  height = 600 
}: TransactionListVirtualProps) => {
  const itemData = useMemo(() => ({ 
    transactions, 
    onDelete 
  }), [transactions, onDelete]);

  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No transactions found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <span className="text-sm text-muted-foreground">
          {transactions.length} total
        </span>
      </div>
      <List
        height={height}
        itemCount={transactions.length}
        itemSize={110}
        width="100%"
        itemData={itemData}
      >
        {TransactionRow}
      </List>
    </div>
  );
});

TransactionListVirtual.displayName = 'TransactionListVirtual';
