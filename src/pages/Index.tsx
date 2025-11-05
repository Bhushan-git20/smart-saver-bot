import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  DollarSign, 
  MessageCircle, 
  TrendingUp, 
  Shield, 
  Sparkles,
  BarChart3,
  Wallet,
  Target,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe
} from 'lucide-react';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text">FinanceAI</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button variant="gradient" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float delay-200"></div>
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-scale-in">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Financial Intelligence</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="gradient-text">Transform</span> Your
                <br />
                Financial Future
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Experience the next generation of personal finance management with AI-driven insights, 
                real-time tracking, and intelligent investment recommendations.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="gradient" onClick={() => navigate('/auth')} className="group">
                  Start Free Today
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">Free forever plan</span>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="relative animate-fade-in-up delay-200">
              <div className="grid grid-cols-2 gap-4">
                <Card className="animate-slide-in-left delay-300 hover:shadow-xl transition-shadow border-2 hover:border-primary/20">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-2">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Smart Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">AI-powered insights into your spending patterns</p>
                  </CardContent>
                </Card>

                <Card className="animate-slide-in-right delay-400 hover:shadow-xl transition-shadow mt-8 border-2 hover:border-accent/20">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center mb-2">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Budget Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Achieve financial targets with smart planning</p>
                  </CardContent>
                </Card>

                <Card className="animate-slide-in-left delay-500 hover:shadow-xl transition-shadow border-2 hover:border-secondary/20">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center mb-2">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Investment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Grow wealth with personalized recommendations</p>
                  </CardContent>
                </Card>

                <Card className="animate-slide-in-right delay-600 hover:shadow-xl transition-shadow mt-8 border-2 hover:border-primary/20">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center mb-2">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">AI Assistant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Get instant answers to financial questions</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need in <span className="gradient-text">One Place</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive financial tools designed to help you succeed
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                title: "Expense Tracking",
                description: "Monitor every transaction with automatic categorization and real-time updates",
                features: ["Smart categorization", "Receipt scanning", "Recurring transactions", "Export reports"],
                gradient: "from-primary to-primary/50"
              },
              {
                icon: MessageCircle,
                title: "AI Financial Assistant",
                description: "Get personalized advice and instant answers powered by advanced AI",
                features: ["Natural conversations", "Budget recommendations", "Spending insights", "Goal planning"],
                gradient: "from-secondary to-secondary/50"
              },
              {
                icon: TrendingUp,
                title: "Investment Guidance",
                description: "Make informed investment decisions with AI-powered market analysis",
                features: ["Live market data", "Risk assessment", "Portfolio tracking", "FD comparisons"],
                gradient: "from-accent to-accent/50"
              },
              {
                icon: BarChart3,
                title: "Visual Analytics",
                description: "Beautiful charts and graphs that make your data easy to understand",
                features: ["Interactive dashboards", "Trend analysis", "Category breakdown", "Monthly reports"],
                gradient: "from-primary via-secondary to-accent"
              },
              {
                icon: Shield,
                title: "Bank-Level Security",
                description: "Your financial data is protected with enterprise-grade encryption",
                features: ["256-bit encryption", "Secure authentication", "Privacy focused", "Regular backups"],
                gradient: "from-secondary to-primary"
              },
              {
                icon: Globe,
                title: "Multi-Platform",
                description: "Access your finances anywhere, anytime on any device",
                features: ["Web app", "Mobile responsive", "Real-time sync", "Offline mode"],
                gradient: "from-accent to-secondary"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="animate-fade-in-up hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/20 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "$50M+", label: "Money Managed" },
              { value: "99.9%", label: "Uptime" },
              { value: "4.9/5", label: "User Rating" }
            ].map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-4xl lg:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto max-w-4xl text-center animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Take Control of Your <span className="gradient-text">Finances?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already achieving their financial goals with FinanceAI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="premium" onClick={() => navigate('/auth')} className="group">
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-card">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold gradient-text text-lg">FinanceAI</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Bank-level security • Your data is encrypted and protected</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 FinanceAI. Built with passion.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
