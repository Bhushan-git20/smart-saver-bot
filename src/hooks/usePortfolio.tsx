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

  const queryKey = ['portfolio', user?.id];

  const portfolioQuery = useQuery({
    queryKey,
    queryFn: () => SupabaseService.getPortfolioHoldings(user!.id),
    enabled: !!user?.id,
    staleTime: 60000,
  });

  const createHoldingMutation = useMutation({
    mutationFn: (holding: PortfolioHoldingInsert) => 
      SupabaseService.createPortfolioHolding(holding),
    onMutate: async (newHolding) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PortfolioHolding[]>(queryKey);
      
      queryClient.setQueryData<PortfolioHolding[]>(queryKey, (old = []) => [
        {
          ...newHolding,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as PortfolioHolding,
        ...old,
      ]);
      
      return { previous };
    },
    onError: (err, newHolding, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast({
        title: 'Error',
        description: 'Failed to add portfolio holding',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Portfolio holding added',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteHoldingMutation = useMutation({
    mutationFn: (id: string) => SupabaseService.deletePortfolioHolding(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PortfolioHolding[]>(queryKey);
      
      queryClient.setQueryData<PortfolioHolding[]>(queryKey, (old = []) =>
        old.filter((item) => item.id !== deletedId)
      );
      
      return { previous };
    },
    onError: (err, deletedId, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast({
        title: 'Error',
        description: 'Failed to delete portfolio holding',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Portfolio holding deleted',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    holdings: portfolioQuery.data ?? [],
    isLoading: portfolioQuery.isLoading,
    isError: portfolioQuery.isError,
    createHolding: createHoldingMutation.mutate,
    deleteHolding: deleteHoldingMutation.mutate,
    isCreating: createHoldingMutation.isPending,
    isDeleting: deleteHoldingMutation.isPending,
  };
};
