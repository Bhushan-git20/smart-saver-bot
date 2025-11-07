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
        {/* Dashboard Overview */}
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

            {/* Budget Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetGoals />
              <Suspense fallback={<LoadingFallback />}>
                <Gamification />
              </Suspense>
            </div>
          </div>
        )}

        {/* Revenue Tab - Same as Dashboard for now */}
        {activeTab === 'revenue' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Revenue Overview</h2>
                <p className="text-muted-foreground">Track your income streams and revenue performance</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PortfolioChart />
              <TotalBalanceChart />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Detailed breakdown of your income sources</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseTracker />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Expense Management</h2>
                <p className="text-muted-foreground">Track and analyze your spending patterns</p>
              </div>
            </div>
            
            <ExpenseTracker />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<LoadingFallback />}>
                <RecurringTransactions />
              </Suspense>
              <BudgetGoals />
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Account Management</h2>
                <p className="text-muted-foreground">Manage transactions, budgets, and financial goals</p>
              </div>
            </div>

            <Tabs defaultValue="transactions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 bg-card p-2 rounded-xl">
                <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="recurring" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                  Recurring
                </TabsTrigger>
                <TabsTrigger value="budget" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                  Budget
                </TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger value="investments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                  Investments
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions">
                <RecentTransactionsTable />
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>All Transactions</CardTitle>
                      <CardDescription>
                        Complete transaction history with advanced filtering
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TransactionListPaginated />
                    </CardContent>
                  </Card>
                </div>
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
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">💬</span>
                      AI Financial Assistant
                    </CardTitle>
                    <CardDescription>
                      Get personalized financial advice and insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Suspense fallback={<LoadingFallback />}>
                      <ChatBotAdvanced />
                    </Suspense>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="investments">
                <div className="space-y-6">
                  <Suspense fallback={<LoadingFallback />}>
                    <PortfolioTracker />
                    <InvestmentModule />
                  </Suspense>
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <Suspense fallback={<LoadingFallback />}>
                  <Settings />
                  <div className="mt-6">
                    <DataBackup />
                  </div>
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Financial Analytics</h2>
                <p className="text-muted-foreground">Deep insights into your financial performance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PortfolioChart />
              <TotalBalanceChart />
            </div>

            <FinancialPerformance />

            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>Comprehensive expense and income analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseTracker />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<LoadingFallback />}>
                <PortfolioTracker />
              </Suspense>
              <BudgetGoals />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
