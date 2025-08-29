import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { ChatBot } from '@/components/ChatBot';
import { InvestmentModule } from '@/components/InvestmentModule';
import { LogOut, DollarSign, MessageCircle, TrendingUp } from 'lucide-react';

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
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Expense Tracker
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Investments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-6">
            <ExpenseTracker />
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
            <InvestmentModule />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;