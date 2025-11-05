import React from 'react';

const { useState, lazy, Suspense, useCallback } = React;
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { TransactionListPaginated } from '@/components/TransactionListPaginated';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BudgetGoals } from '@/components/BudgetGoals';
import { LogOut, DollarSign, MessageCircle, TrendingUp, Smartphone, Repeat, Target, Trophy, Settings as SettingsIcon, List, Sparkles } from 'lucide-react';
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
      {/* Modern Navigation Header */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">FinanceAI</h1>
                <p className="text-xs text-muted-foreground">
                  Welcome back, {user?.user_metadata?.first_name || 'User'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button onClick={handleSignOut} variant="outline" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="expenses" className="space-y-6">
          {/* Modern Tab Navigation */}
          <div className="bg-card rounded-xl p-2 shadow-sm border">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2 bg-transparent h-auto p-0">
              <TabsTrigger 
                value="expenses" 
                className="flex flex-col sm:flex-row items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Expenses</span>
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="flex flex-col sm:flex-row items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-secondary data-[state=active]:to-secondary/80 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <List className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Transactions</span>
              </TabsTrigger>
              <TabsTrigger 
                value="recurring" 
                className="flex flex-col sm:flex-row items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-accent data-[state=active]:to-accent/80 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Repeat className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Recurring</span>
              </TabsTrigger>
              <TabsTrigger 
                value="budget" 
                className="flex flex-col sm:flex-row items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Target className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Budget</span>
              </TabsTrigger>
              <TabsTrigger 
                value="achievements" 
                className="flex flex-col sm:flex-row items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Trophy className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Achievements</span>
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="flex flex-col sm:flex-row items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs sm:text-sm">AI Assistant</span>
              </TabsTrigger>
              <TabsTrigger 
                value="investments" 
                className="flex flex-col sm:flex-row items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Investments</span>
              </TabsTrigger>
              <TabsTrigger 
                value="payments" 
                className="flex flex-col sm:flex-row items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-secondary data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Payments</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex flex-col sm:flex-row items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="expenses" className="space-y-6 animate-fade-in">
            <ExpenseTracker />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6 animate-fade-in">
            <Card className="shadow-lg border-2">
              <CardHeader className="bg-gradient-to-r from-secondary/10 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <List className="w-5 h-5 text-secondary" />
                  Transaction History
                </CardTitle>
                <CardDescription>
                  View and manage all your transactions with advanced filtering and pagination
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <TransactionListPaginated />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recurring" className="space-y-6 animate-fade-in">
            <Suspense fallback={<LoadingFallback />}>
              <RecurringTransactions />
            </Suspense>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6 animate-fade-in">
            <BudgetGoals />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6 animate-fade-in">
            <Suspense fallback={<LoadingFallback />}>
              <Gamification />
            </Suspense>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6 animate-fade-in">
            <Card className="shadow-lg border-2">
              <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  AI Financial Assistant
                </CardTitle>
                <CardDescription>
                  Get personalized financial advice with conversation memory and multi-provider AI support
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Suspense fallback={<LoadingFallback />}>
                  <ChatBotAdvanced />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investments" className="space-y-6 animate-fade-in">
            <Suspense fallback={<LoadingFallback />}>
              <PortfolioTracker />
              <InvestmentModule />
            </Suspense>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6 animate-fade-in">
            <Suspense fallback={<LoadingFallback />}>
              <PaymentIntegration />
            </Suspense>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 animate-fade-in">
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
