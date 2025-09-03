import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DollarSign, MessageCircle, TrendingUp, Shield } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-foreground">AI Financial Advisor</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Financial Advisor
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take control of your finances with our intelligent expense tracker, 
            personalized investment recommendations, and AI-powered financial guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Manage Your Money</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Expense Tracking</CardTitle>
              <CardDescription>
                Monitor your income and expenses with detailed categorization and beautiful charts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Real-time transaction tracking</li>
                <li>• Category-wise analysis</li>
                <li>• Monthly spending insights</li>
                <li>• Visual reports and charts</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Get personalized financial advice and instant answers to your money questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Natural language queries</li>
                <li>• Budget recommendations</li>
                <li>• Spending pattern analysis</li>
                <li>• Financial goal planning</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Investment Guidance</CardTitle>
              <CardDescription>
                Discover investment opportunities with risk-based portfolio recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Live market data</li>
                <li>• Risk-based portfolios</li>
                <li>• Mutual fund insights</li>
                <li>• FD rate comparisons</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Financial Future?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already making smarter financial decisions with our AI-powered platform.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Start Your Financial Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Your financial data is secure and encrypted</span>
          </div>
          <p className="text-sm">© 2024 AI Financial Advisor. Built with Lovable.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
