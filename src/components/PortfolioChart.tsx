import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const data = [
  { name: 'Fri', value: 15000 },
  { name: 'Sat', value: 14000 },
  { name: 'Sun', value: 16500 },
  { name: 'Mon', value: 15890 },
  { name: 'Tue', value: 14200 },
  { name: 'Wed', value: 16000 },
  { name: 'Thu', value: 15890 },
];

const timeFilters = ['1w', '2w', '1m', '6m', 'All'];

export const PortfolioChart = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-primary-foreground">MP</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">My Portfolio</h3>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold">$1,854.08</span>
            <span className="text-sm text-muted-foreground">↓</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-success flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              12.8% (11,398.84)
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </div>

        {/* Date Badge */}
        <div className="mb-4 inline-block">
          <div className="bg-muted px-3 py-1 rounded-full text-xs font-medium">
            Nov 2025
          </div>
        </div>

        {/* Chart */}
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(16 100% 66%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(16 100% 66%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(16 100% 66%)" 
                strokeWidth={2}
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Time Filters */}
        <div className="flex gap-2">
          {timeFilters.map((filter) => (
            <Button
              key={filter}
              variant={filter === '1w' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-full px-4"
            >
              {filter}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
