import { useState, lazy, Suspense, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { TransactionListPaginated } from '@/components/TransactionListPaginated';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BudgetGoals } from '@/components/BudgetGoals';
import { LogOut, DollarSign, MessageCircle, TrendingUp, Smartphone, Repeat, Target, Trophy, Settings as SettingsIcon, List } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePrefetchTabs } from '@/hooks/usePrefetchTabs';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

// Lazy load heavy components
const ChatBotAdvanced = lazy(() => import('@/components/ChatBotAdvanced').then(module => ({ default: module.ChatBotAdvanced })));
const InvestmentModule = lazy(() => import('@/components/InvestmentModule').then(module => ({ default: module.InvestmentModule })));
const PaymentIntegration = lazy(() => import('@/components/PaymentIntegration').then(module => ({ default: module.PaymentIntegration })));
const RecurringTransactions = lazy(() => import('@/components/RecurringTransactions').then(module => ({ default: module.RecurringTransactions })));
const PortfolioTracker = lazy(() => import('@/components/PortfolioTracker').then(module => ({ default: module.PortfolioTracker })));
const Gamification = lazy(() => import('@/components/Gamification').then(module => ({ default: module.Gamification })));
const DataBackup = lazy(() => import('@/components/DataBackup').then(module => ({ default: module.DataBackup })));
const Settings = lazy(() => import('@/components/Settings').then(module => ({ default: module.Settings })));

const LoadingFallback = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-64 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

const Dashboard = () => {
  const { user, signOut } = useAuth();

  // Prefetch data for other tabs to improve perceived performance
  usePrefetchTabs();

  // Monitor dashboard render performance
  usePerformanceMonitor({ componentName: 'Dashboard', threshold: 200 });

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Financial Advisor</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.user_metadata?.first_name || 'User'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 gap-1">
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="recurring" className="flex items-center gap-2">
              <Repeat className="w-4 h-4" />
              Recurring
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Investments
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-6">
            <ExpenseTracker />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View and manage all your transactions with pagination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionListPaginated />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recurring" className="space-y-6">
            <Suspense fallback={<LoadingFallback />}>
              <RecurringTransactions />
            </Suspense>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <BudgetGoals />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Suspense fallback={<LoadingFallback />}>
              <Gamification />
            </Suspense>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Financial Assistant</CardTitle>
                <CardDescription>
                  Advanced AI assistant with multiple providers, conversation memory, and personalized advice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<LoadingFallback />}>
                  <ChatBotAdvanced />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investments" className="space-y-6">
            <Suspense fallback={<LoadingFallback />}>
              <PortfolioTracker />
              <InvestmentModule />
            </Suspense>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Suspense fallback={<LoadingFallback />}>
              <PaymentIntegration />
            </Suspense>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Suspense fallback={<LoadingFallback />}>
              <Settings />
              <DataBackup />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;