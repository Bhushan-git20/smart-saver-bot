import React from 'react';

const { useState, useMemo } = React;
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useBudgetGoals } from '@/hooks/useBudgetGoals';
import { useQuery } from '@tanstack/react-query';
import { SupabaseService } from '@/services/supabase.service';
import { ValidationUtils } from '@/utils/validation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const categories = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Bills & Utilities', 'Healthcare', 'Travel', 'Education', 'Other'
];

export const BudgetGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { budgetGoals, isLoading: goalsLoading, createBudgetGoal, isCreating } = useBudgetGoals();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    monthly_limit: '',
    monthly_savings_target: ''
  });

  // Get current month date range
  const dateRange = useMemo(() => {
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    };
  }, []);

  // Fetch transactions using React Query
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['monthlyTransactions', user?.id, dateRange.startDate, dateRange.endDate],
    queryFn: () => SupabaseService.getTransactionsByDateRange(user!.id, dateRange.startDate, dateRange.endDate),
    enabled: !!user?.id,
    staleTime: 60000,
  });

  const loading = goalsLoading || transactionsLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (formData.monthly_limit && !ValidationUtils.isValidAmount(parseFloat(formData.monthly_limit))) {
      toast({ title: "Error", description: "Invalid monthly limit", variant: "destructive" });
      return;
    }
    if (formData.monthly_savings_target && !ValidationUtils.isValidAmount(parseFloat(formData.monthly_savings_target))) {
      toast({ title: "Error", description: "Invalid savings target", variant: "destructive" });
      return;
    }

    const currentDate = new Date();
    const periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    createBudgetGoal({
      user_id: user.id,
      category: formData.category || null,
      monthly_limit: formData.monthly_limit ? parseFloat(formData.monthly_limit) : null,
      monthly_savings_target: formData.monthly_savings_target ? parseFloat(formData.monthly_savings_target) : null,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      is_active: true
    });

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      category: '',
      monthly_limit: '',
      monthly_savings_target: ''
    });
  };

  const calculateCategorySpending = (category: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateSavings = () => {
    return calculateTotalIncome() - calculateTotalExpenses();
  };

  const getSavingsGoal = () => {
    const savingsGoal = budgetGoals.find(goal => goal.monthly_savings_target && !goal.category);
    return savingsGoal?.monthly_savings_target || 0;
  };

  const getSavingsProgress = () => {
    const savings = calculateSavings();
    const target = getSavingsGoal();
    return target > 0 ? Math.min((savings / target) * 100, 100) : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Savings Goal Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Monthly Savings Goal
              </CardTitle>
              <CardDescription>
                Track your progress towards your savings target
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} disabled={isCreating}>
                  <Plus className="w-4 h-4 mr-2" />
                  Set Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Set Budget Goal</DialogTitle>
                  <DialogDescription>
                    Set spending limits or savings targets
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category (Optional)</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category for spending limit" />
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

                  <div>
                    <Label htmlFor="monthly_limit">Monthly Spending Limit (₹)</Label>
                    <Input
                      id="monthly_limit"
                      type="number"
                      step="0.01"
                      value={formData.monthly_limit}
                      onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
                      placeholder="e.g., 5000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="monthly_savings_target">Monthly Savings Target (₹)</Label>
                    <Input
                      id="monthly_savings_target"
                      type="number"
                      step="0.01"
                      value={formData.monthly_savings_target}
                      onChange={(e) => setFormData({ ...formData, monthly_savings_target: e.target.value })}
                      placeholder="e.g., 10000"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Saving...' : 'Set Goal'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {getSavingsGoal() > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Savings Progress</span>
                <span className="text-sm text-muted-foreground">
                  ₹{calculateSavings().toLocaleString()} / ₹{getSavingsGoal().toLocaleString()}
                </span>
              </div>
              <Progress value={getSavingsProgress()} className="h-3" />
              <div className="flex justify-between items-center text-sm">
                <span className={`flex items-center gap-1 ${
                  calculateSavings() >= getSavingsGoal() ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {calculateSavings() >= getSavingsGoal() ? (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Goal achieved! 🎉
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      ₹{(getSavingsGoal() - calculateSavings()).toLocaleString()} to go
                    </>
                  )}
                </span>
                <span className="text-muted-foreground">
                  {getSavingsProgress().toFixed(1)}%
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">
              No savings goal set. Click "Set Goal" to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Category Budget Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Category Budget Limits</CardTitle>
          <CardDescription>
            Track spending against your budget limits by category
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {budgetGoals.filter(goal => goal.category && goal.monthly_limit).length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No category budget limits set.
            </p>
          ) : (
            <div className="space-y-4">
              {budgetGoals
                .filter(goal => goal.category && goal.monthly_limit)
                .map((goal) => {
                  const spent = calculateCategorySpending(goal.category!);
                  const limit = goal.monthly_limit!;
                  const percentage = Math.min((spent / limit) * 100, 100);
                  const isOverBudget = spent > limit;
                  
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{goal.category}</span>
                        <span className="text-sm text-muted-foreground">
                          ₹{spent.toLocaleString()} / ₹{limit.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${isOverBudget ? 'bg-red-100' : ''}`}
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span className={`flex items-center gap-1 ${
                          isOverBudget ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {isOverBudget ? (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              Over budget by ₹{(spent - limit).toLocaleString()}
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-3 h-3" />
                              ₹{(limit - spent).toLocaleString()} remaining
                            </>
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};