import React from 'react';

const { useState, lazy, Suspense, useCallback } = React;
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { TransactionListPaginated } from '@/components/TransactionListPaginated';
import { BudgetGoals } from '@/components/BudgetGoals';
import { Skeleton } from '@/components/ui/skeleton';
import { usePrefetchTabs } from '@/hooks/usePrefetchTabs';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardGreeting } from '@/components/DashboardGreeting';
import { PaymentCards } from '@/components/PaymentCards';
import { PortfolioChart } from '@/components/PortfolioChart';
import { TotalBalanceChart } from '@/components/TotalBalanceChart';
import { QuickTransfer } from '@/components/QuickTransfer';
import { FinancialPerformance } from '@/components/FinancialPerformance';
import { RecentTransactionsTable } from '@/components/RecentTransactionsTable';

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
  const [activeTab, setActiveTab] = useState('dashboard');

  // Prefetch data for other tabs to improve perceived performance
  usePrefetchTabs();

  // Monitor dashboard render performance
  usePerformanceMonitor({ componentName: 'Dashboard', threshold: 200 });

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <DashboardGreeting />

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Cards and Chart */}
              <div className="lg:col-span-2 space-y-6">
                <PaymentCards />
                <PortfolioChart />
              </div>

              {/* Right Column - Balance and Quick Transfer */}
              <div className="space-y-6">
                <TotalBalanceChart />
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <QuickTransfer />
              <div className="lg:col-span-2">
                <FinancialPerformance />
              </div>
            </div>

            {/* Transactions Table */}
            <RecentTransactionsTable />
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="animate-fade-in">
            <ExpenseTracker />
          </div>
        )}

        {activeTab === 'accounts' && (
          <Tabs defaultValue="transactions" className="space-y-6 animate-fade-in">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="chat">AI Assistant</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions">
              <Card className="shadow-lg border-2">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    View and manage all your transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionListPaginated />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recurring">
              <Suspense fallback={<LoadingFallback />}>
                <RecurringTransactions />
              </Suspense>
            </TabsContent>

            <TabsContent value="budget">
              <BudgetGoals />
            </TabsContent>

            <TabsContent value="achievements">
              <Suspense fallback={<LoadingFallback />}>
                <Gamification />
              </Suspense>
            </TabsContent>

            <TabsContent value="chat">
              <Card className="shadow-lg border-2">
                <CardHeader>
                  <CardTitle>AI Financial Assistant</CardTitle>
                  <CardDescription>
                    Get personalized financial advice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<LoadingFallback />}>
                    <ChatBotAdvanced />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investments">
              <Suspense fallback={<LoadingFallback />}>
                <PortfolioTracker />
                <InvestmentModule />
              </Suspense>
            </TabsContent>

            <TabsContent value="settings">
              <Suspense fallback={<LoadingFallback />}>
                <Settings />
                <DataBackup />
              </Suspense>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
