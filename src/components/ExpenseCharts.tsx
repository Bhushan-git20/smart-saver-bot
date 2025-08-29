import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: string;
  date: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
}

interface ExpenseChartsProps {
  transactions: Transaction[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const ExpenseCharts = ({ transactions }: ExpenseChartsProps) => {
  // Category-wise expense data for pie chart
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const existing = acc.find(item => item.category === transaction.category);
      if (existing) {
        existing.amount += transaction.amount;
      } else {
        acc.push({ category: transaction.category, amount: transaction.amount });
      }
      return acc;
    }, [] as { category: string; amount: number }[])
    .sort((a, b) => b.amount - a.amount);

  // Monthly trend data for bar chart
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const existing = acc.find(item => item.month === month);
    
    if (existing) {
      if (transaction.type === 'income') {
        existing.income += transaction.amount;
      } else {
        existing.expense += transaction.amount;
      }
    } else {
      acc.push({
        month,
        income: transaction.type === 'income' ? transaction.amount : 0,
        expense: transaction.type === 'expense' ? transaction.amount : 0,
      });
    }
    return acc;
  }, [] as { month: string; income: number; expense: number }[])
    .sort((a, b) => new Date(`${a.month} 01`).getTime() - new Date(`${b.month} 01`).getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart - Category-wise Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Expense by Category</CardTitle>
          <CardDescription>Distribution of your expenses across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ChartContainer
              config={{}}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No expense data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart - Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
          <CardDescription>Income vs Expenses over time</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ChartContainer
              config={{
                income: {
                  label: "Income",
                  color: "#22c55e",
                },
                expense: {
                  label: "Expense",
                  color: "#ef4444",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="income" fill="#22c55e" name="Income" />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No transaction data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};