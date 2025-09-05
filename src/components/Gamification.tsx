import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Target, TrendingUp, Award, Flame, Star, Crown, Medal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'budget' | 'savings' | 'investment' | 'streak';
}

interface StreakData {
  savingsStreak: number;
  budgetStreak: number;
  expenseTrackingStreak: number;
}

export const Gamification = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({
    savingsStreak: 0,
    budgetStreak: 0,
    expenseTrackingStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

  const defaultAchievements: Achievement[] = [
    {
      id: 'first_transaction',
      title: 'Getting Started',
      description: 'Log your first transaction',
      icon: <Star className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      category: 'budget'
    },
    {
      id: 'budget_master',
      title: t('game.budgetMaster'),
      description: t('game.budgetMasterDesc'),
      icon: <Trophy className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 3,
      category: 'budget'
    },
    {
      id: 'save_hero',
      title: t('game.saveHero'),
      description: t('game.saveHeroDesc'),
      icon: <Target className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 7,
      category: 'streak'
    },
    {
      id: 'investor',
      title: t('game.investor'),
      description: t('game.investorDesc'),
      icon: <TrendingUp className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      category: 'investment'
    },
    {
      id: 'expense_tracker',
      title: 'Expense Tracker',
      description: 'Track expenses for 30 days',
      icon: <Medal className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 30,
      category: 'streak'
    },
    {
      id: 'savings_champion',
      title: 'Savings Champion',
      description: 'Save money for 30 days straight',
      icon: <Crown className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 30,
      category: 'savings'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchAchievements();
      calculateStreaks();
    }
  }, [user]);

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      // Get user's transaction data to calculate achievements
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      const { data: budgetGoals } = await supabase
        .from('budget_goals')
        .select('*')
        .eq('user_id', user.id);

      const { data: portfolioHoldings } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id);

      // Calculate achievement progress
      const updatedAchievements = defaultAchievements.map(achievement => {
        let progress = 0;
        let unlocked = false;

        switch (achievement.id) {
          case 'first_transaction':
            progress = transactions && transactions.length > 0 ? 1 : 0;
            unlocked = progress >= achievement.maxProgress;
            break;
            
          case 'budget_master':
            // Check if user stayed under budget for 3 months (simplified)
            progress = budgetGoals && budgetGoals.length > 0 ? Math.min(budgetGoals.length, 3) : 0;
            unlocked = progress >= achievement.maxProgress;
            break;
            
          case 'investor':
            progress = portfolioHoldings && portfolioHoldings.length > 0 ? 1 : 0;
            unlocked = progress >= achievement.maxProgress;
            break;
            
          case 'save_hero':
            // Calculate based on streak data (will be updated when streak calculation is ready)
            progress = Math.min(streakData.savingsStreak, achievement.maxProgress);
            unlocked = progress >= achievement.maxProgress;
            break;
            
          case 'expense_tracker':
            // Count days with transactions in the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentTransactions = transactions?.filter(t => 
              new Date(t.date) >= thirtyDaysAgo
            ) || [];
            const uniqueDays = new Set(recentTransactions.map(t => t.date)).size;
            progress = Math.min(uniqueDays, achievement.maxProgress);
            unlocked = progress >= achievement.maxProgress;
            break;
            
          case 'savings_champion':
            progress = Math.min(streakData.savingsStreak, achievement.maxProgress);
            unlocked = progress >= achievement.maxProgress;
            break;
        }

        return { ...achievement, progress, unlocked };
      });

      setAchievements(updatedAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreaks = async () => {
    if (!user) return;

    try {
      // Get recent transactions to calculate streaks
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(100);

      if (!transactions) return;

      // Calculate savings streak (days with positive net balance)
      const dailyNetBalance = new Map();
      transactions.forEach(t => {
        const date = t.date;
        const current = dailyNetBalance.get(date) || 0;
        dailyNetBalance.set(date, current + (t.type === 'income' ? t.amount : -t.amount));
      });

      // Calculate consecutive days with positive balance
      let savingsStreak = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (dailyNetBalance.get(dateStr) > 0) {
          savingsStreak++;
        } else {
          break;
        }
      }

      // Calculate expense tracking streak (days with any transactions)
      const transactionDates = new Set(transactions.map(t => t.date));
      let expenseTrackingStreak = 0;
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (transactionDates.has(dateStr)) {
          expenseTrackingStreak++;
        } else {
          break;
        }
      }

      setStreakData({
        savingsStreak,
        budgetStreak: 0, // This would require budget goal analysis
        expenseTrackingStreak
      });

    } catch (error) {
      console.error('Error calculating streaks:', error);
    }
  };

  const getAchievementsByCategory = (category: string) => {
    return achievements.filter(a => a.category === category);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading achievements...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="w-5 h-5 text-orange-500" />
              {t('game.streakTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {streakData.savingsStreak}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('game.streakDays', { count: streakData.savingsStreak })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-blue-500" />
              Budget Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {streakData.budgetStreak}
            </div>
            <p className="text-sm text-muted-foreground">
              Days under budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-green-500" />
              Tracking Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {streakData.expenseTrackingStreak}
            </div>
            <p className="text-sm text-muted-foreground">
              Days with transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {t('game.badges')}
          </CardTitle>
          <CardDescription>
            Complete challenges to unlock badges and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'border-success bg-success/5'
                    : 'border-border bg-card hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.unlocked 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      {achievement.unlocked && (
                        <Badge variant="secondary" className="text-xs">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};