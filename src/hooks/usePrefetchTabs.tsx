import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { SupabaseService } from '@/services/supabase.service';

/**
 * Hook to prefetch data for dashboard tabs immediately
 * Uses requestIdleCallback for non-blocking prefetching
 */
export const usePrefetchTabs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const prefetchAll = () => {
      // Prefetch all common data in parallel
      queryClient.prefetchQuery({
        queryKey: ['budgetGoals', user.id],
        queryFn: () => SupabaseService.getBudgetGoals(user.id),
        staleTime: 60000,
      });

      queryClient.prefetchQuery({
        queryKey: ['portfolio', user.id],
        queryFn: () => SupabaseService.getPortfolioHoldings(user.id),
        staleTime: 60000,
      });

      queryClient.prefetchQuery({
        queryKey: ['recurringTransactions', user.id],
        queryFn: () => SupabaseService.getRecurringTransactions(user.id),
        staleTime: 60000,
      });

      // Prefetch monthly transactions for budget calculations
      const currentDate = new Date();
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

      queryClient.prefetchQuery({
        queryKey: ['monthlyTransactions', user.id, startDate, endDate],
        queryFn: () => SupabaseService.getTransactionsByDateRange(user.id, startDate, endDate),
        staleTime: 60000,
      });
    };

    // Use requestIdleCallback for non-blocking prefetch, or immediate timeout fallback
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetchAll, { timeout: 500 });
      return () => cancelIdleCallback(id);
    } else {
      const timer = setTimeout(prefetchAll, 100);
      return () => clearTimeout(timer);
    }
  }, [user?.id, queryClient]);
};