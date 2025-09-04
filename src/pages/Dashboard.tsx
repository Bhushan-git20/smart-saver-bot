import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { ChatBot } from '@/components/ChatBot';
import { InvestmentModule } from '@/components/InvestmentModule';
import { PaymentIntegration } from '@/components/PaymentIntegration';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RecurringTransactions } from '@/components/RecurringTransactions';
import { BudgetGoals } from '@/components/BudgetGoals';
import { PortfolioTracker } from '@/components/PortfolioTracker';
import { LogOut, DollarSign, MessageCircle, TrendingUp, Smartphone, Repeat, Target } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="recurring" className="flex items-center gap-2">
              <Repeat className="w-4 h-4" />
              Recurring
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Budget
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
          </TabsList>

          <TabsContent value="expenses" className="space-y-6">
            <ExpenseTracker />
          </TabsContent>

          <TabsContent value="recurring" className="space-y-6">
            <RecurringTransactions />
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <BudgetGoals />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Financial Assistant</CardTitle>
                <CardDescription>
                  Ask questions about your finances, get budget suggestions, and receive personalized advice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChatBot />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investments" className="space-y-6">
            <PortfolioTracker />
            <InvestmentModule />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentIntegration />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;