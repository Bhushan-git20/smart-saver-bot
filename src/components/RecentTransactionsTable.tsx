import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const transactions = [
  {
    id: 'INV#0123456',
    name: 'Transfer In',
    icon: '↓',
    iconBg: 'bg-primary/10 text-primary',
    date: 'November 25, 2025',
    amount: '$351.02',
    status: 'Completed',
    statusColor: 'bg-success/10 text-success',
  },
  {
    id: 'INV#0123456',
    name: 'Spotify Premium',
    icon: '🎵',
    iconBg: 'bg-green-500/10',
    date: 'November 25, 2025',
    amount: '$854.08',
    status: 'Pending',
    statusColor: 'bg-destructive/10 text-destructive',
  },
  {
    id: 'INV#0123456',
    name: 'Transfer Out',
    icon: '↑',
    iconBg: 'bg-secondary/10',
    date: 'November 25, 2025',
    amount: '$275.43',
    status: 'Completed',
    statusColor: 'bg-success/10 text-success',
  },
  {
    id: 'INV#0123456',
    name: 'Hotel Booking',
    icon: '✈️',
    iconBg: 'bg-blue-500/10',
    date: 'November 25, 2025',
    amount: '$589.99',
    status: 'In Progress',
    statusColor: 'bg-warning/10 text-warning',
  },
  {
    id: 'INV#0123456',
    name: 'YouTube Premium',
    icon: '▶️',
    iconBg: 'bg-red-500/10',
    date: 'November 25, 2025',
    amount: '$219.78',
    status: 'Completed',
    statusColor: 'bg-success/10 text-success',
  },
];

export const RecentTransactionsTable = () => {
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
            />
          </div>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
            {transactions.map((transaction, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="font-medium text-muted-foreground">
                  {transaction.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${transaction.iconBg} flex items-center justify-center text-lg`}>
                      {transaction.icon}
                    </div>
                    <span className="font-medium">{transaction.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.date}
                </TableCell>
                <TableCell className="font-semibold">
                  {transaction.amount}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={`${transaction.statusColor} border-0 font-medium`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
