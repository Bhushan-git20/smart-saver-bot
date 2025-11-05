import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { SupabaseService } from '@/services/supabase.service';

const { useEffect } = React;

/**
 * Hook to prefetch data for dashboard tabs before user navigates
 * Improves perceived performance by loading data in advance
 */
export const usePrefetchTabs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    // Prefetch budget goals
    const prefetchBudgetGoals = () => {
      queryClient.prefetchQuery({
        queryKey: ['budgetGoals', user.id],
        queryFn: () => SupabaseService.getBudgetGoals(user.id),
        staleTime: 60000,
      });
    };

    // Prefetch portfolio holdings
    const prefetchPortfolio = () => {
      queryClient.prefetchQuery({
        queryKey: ['portfolio', user.id],
        queryFn: () => SupabaseService.getPortfolioHoldings(user.id),
        staleTime: 60000,
      });
    };

    // Prefetch recurring transactions
    const prefetchRecurring = () => {
      queryClient.prefetchQuery({
        queryKey: ['recurringTransactions', user.id],
        queryFn: () => SupabaseService.getRecurringTransactions(user.id),
        staleTime: 60000,
      });
    };

    // Prefetch with slight delays to not overwhelm on initial load
    const timer1 = setTimeout(prefetchBudgetGoals, 1000);
    const timer2 = setTimeout(prefetchPortfolio, 1500);
    const timer3 = setTimeout(prefetchRecurring, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [user?.id, queryClient]);
};
