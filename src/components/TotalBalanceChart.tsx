import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'May', value: 8000 },
  { name: 'Jun', value: 12000 },
  { name: 'Jul', value: 10000 },
  { name: 'Aug', value: 14000 },
  { name: 'Sep', value: 15890 },
  { name: 'Oct', value: 13000 },
];

const currencies = ['USD', 'IDR', 'EUR', 'GBP', 'More'];

export const TotalBalanceChart = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <h3 className="font-semibold">Total Balance</h3>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold">12,710.82</span>
            <span className="text-sm text-muted-foreground">USD</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-success">
              53.4% (2,782.01)
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </div>

        {/* Currency Filters */}
        <div className="flex gap-2 mb-6">
          {currencies.map((currency) => (
            <Button
              key={currency}
              variant={currency === 'USD' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-full"
            >
              {currency}
            </Button>
          ))}
        </div>

        {/* Month Badge */}
        <div className="mb-4">
          <div className="inline-block bg-muted px-3 py-1 rounded-full text-xs font-medium">
            Nov 2025 · $15,890.00
          </div>
        </div>

        {/* Chart */}
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `${value/1000}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Balance']}
              />
              <Bar 
                dataKey="value" 
                fill="hsl(16 100% 66%)" 
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
