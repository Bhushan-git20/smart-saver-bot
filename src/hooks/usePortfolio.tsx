import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { SupabaseService } from '@/services/supabase.service';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type PortfolioHolding = Database['public']['Tables']['portfolio_holdings']['Row'];
type PortfolioHoldingInsert = Database['public']['Tables']['portfolio_holdings']['Insert'];

export const usePortfolio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const portfolioQuery = useQuery({
    queryKey: ['portfolio', user?.id],
    queryFn: () => SupabaseService.getPortfolioHoldings(user!.id),
    enabled: !!user?.id,
    staleTime: 60000, // 1 minute
  });

  const createHoldingMutation = useMutation({
    mutationFn: (holding: PortfolioHoldingInsert) => 
      SupabaseService.createPortfolioHolding(holding),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] });
      toast({
        title: 'Success',
        description: 'Portfolio holding added successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add portfolio holding',
        variant: 'destructive',
      });
    },
  });

  return {
    holdings: portfolioQuery.data ?? [],
    isLoading: portfolioQuery.isLoading,
    isError: portfolioQuery.isError,
    createHolding: createHoldingMutation.mutate,
    isCreating: createHoldingMutation.isPending,
  };
};
