import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { SupabaseService } from '@/services/supabase.service';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type BudgetGoal = Database['public']['Tables']['budget_goals']['Row'];
type BudgetGoalInsert = Database['public']['Tables']['budget_goals']['Insert'];

export const useBudgetGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const budgetGoalsQuery = useQuery({
    queryKey: ['budgetGoals', user?.id],
    queryFn: () => SupabaseService.getBudgetGoals(user!.id),
    enabled: !!user?.id,
    staleTime: 60000, // 1 minute
  });

  const createBudgetGoalMutation = useMutation({
    mutationFn: (budgetGoal: BudgetGoalInsert) => 
      SupabaseService.createBudgetGoal(budgetGoal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetGoals', user?.id] });
      toast({
        title: 'Success',
        description: 'Budget goal created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create budget goal',
        variant: 'destructive',
      });
    },
  });

  return {
    budgetGoals: budgetGoalsQuery.data ?? [],
    isLoading: budgetGoalsQuery.isLoading,
    isError: budgetGoalsQuery.isError,
    createBudgetGoal: createBudgetGoalMutation.mutate,
    isCreating: createBudgetGoalMutation.isPending,
  };
};
