import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarDays, Download, Filter } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import jsPDF from 'jspdf';

interface Transaction {
  id: string;
  date: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
}

interface EnhancedExpenseChartsProps {
  transactions: Transaction[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

export const EnhancedExpenseCharts: React.FC<EnhancedExpenseChartsProps> = ({ transactions }) => {
  const [dateRange, setDateRange] = useState('3months');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [chartType, setChartType] = useState('all');

  const categories = useMemo(() => {
    const cats = [...new Set(transactions.map(t => t.category))];
    return cats.sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Date filtering
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case '1month':
          startDate = subMonths(now, 1);
          break;
        case '3months':
          startDate = subMonths(now, 3);
          break;
        case '6months':
          startDate = subMonths(now, 6);
          break;
        case '1year':
          startDate = subMonths(now, 12);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(t => new Date(t.date) >= startDate);
    }

    // Category filtering
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    return filtered;
  }, [transactions, dateRange, categoryFilter]);

  const categoryData = useMemo(() => {
    const expensesByCategory = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expensesByCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    const monthlyStats = filteredTransactions.reduce((acc, transaction) => {
      const monthYear = format(new Date(transaction.date), 'MMM yyyy');
      
      if (!acc[monthYear]) {
        acc[monthYear] = { month: monthYear, income: 0, expenses: 0, net: 0 };
      }
      
      if (transaction.type === 'income') {
        acc[monthYear].income += transaction.amount;
      } else {
        acc[monthYear].expenses += transaction.amount;
      }
      
      acc[monthYear].net = acc[monthYear].income - acc[monthYear].expenses;
      
      return acc;
    }, {} as Record<string, { month: string; income: number; expenses: number; net: number }>);

    return Object.values(monthlyStats).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
  }, [filteredTransactions]);

  const trendData = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTransactions = filteredTransactions.filter(t => 
        isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
      );
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      last6Months.push({
        month: format(date, 'MMM'),
        expenses,
        trend: expenses
      });
    }
    
    return last6Months;
  }, [filteredTransactions]);

  const exportToPDF = () => {
    const pdf = new jsPDF();
    
    // Title
    pdf.setFontSize(20);
    pdf.text('Expense Analysis Report', 20, 30);
    
    // Date range
    pdf.setFontSize(12);
    pdf.text(`Report Period: ${dateRange === 'all' ? 'All Time' : dateRange.toUpperCase()}`, 20, 50);
    pdf.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 60);
    
    // Summary statistics
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    pdf.text('Financial Summary:', 20, 80);
    pdf.text(`Total Income: ₹${totalIncome.toFixed(2)}`, 30, 95);
    pdf.text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`, 30, 105);
    pdf.text(`Net: ₹${(totalIncome - totalExpenses).toFixed(2)}`, 30, 115);
    
    // Category breakdown
    pdf.text('Top Expense Categories:', 20, 135);
    categoryData.slice(0, 10).forEach((item, index) => {
      pdf.text(`${index + 1}. ${item.category}: ₹${item.amount.toFixed(2)}`, 30, 150 + (index * 10));
    });
    
    // Footer
    pdf.setFontSize(10);
    pdf.text('Generated by Smart Expense Analyzer', 20, 280);
    
    pdf.save(`expense-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const summaryStats = useMemo(() => {
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const avgMonthlyExpense = monthlyData.length > 0 
      ? monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length 
      : 0;
    
    const topCategory = categoryData[0];
    
    return {
      totalExpenses,
      totalIncome,
      net: totalIncome - totalExpenses,
      avgMonthlyExpense,
      topCategory: topCategory ? topCategory.category : 'None',
      topCategoryAmount: topCategory ? topCategory.amount : 0
    };
  }, [filteredTransactions, monthlyData, categoryData]);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analytics Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              ₹{summaryStats.totalExpenses.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Expenses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ₹{summaryStats.totalIncome.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Income</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${summaryStats.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{summaryStats.net.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Net Balance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ₹{summaryStats.avgMonthlyExpense.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Avg Monthly Expense</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        {(chartType === 'all' || chartType === 'pie') && categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>
                Top category: {summaryStats.topCategory} (₹{summaryStats.topCategoryAmount.toFixed(0)})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {categoryData.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Monthly Income vs Expenses */}
        {(chartType === 'all' || chartType === 'bar') && monthlyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Income vs Expenses</CardTitle>
              <CardDescription>
                {monthlyData.length} month{monthlyData.length !== 1 ? 's' : ''} of data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="income" fill="#00C49F" name="Income" />
                    <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Expense Trend Line Chart */}
        {(chartType === 'all' || chartType === 'line') && trendData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>6-Month Expense Trend</CardTitle>
              <CardDescription>Monthly expense pattern analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Expenses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Categories Bar Chart */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Expense Categories</CardTitle>
              <CardDescription>Ranked by total amount spent</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData.slice(0, 8)} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="#0088FE" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};