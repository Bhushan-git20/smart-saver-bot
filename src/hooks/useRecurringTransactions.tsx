import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { SupabaseService } from '@/services/supabase.service';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row'];
type RecurringTransactionInsert = Database['public']['Tables']['recurring_transactions']['Insert'];
type RecurringTransactionUpdate = Database['public']['Tables']['recurring_transactions']['Update'];

export const useRecurringTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey = ['recurringTransactions', user?.id];

  const recurringQuery = useQuery({
    queryKey,
    queryFn: () => SupabaseService.getRecurringTransactions(user!.id),
    enabled: !!user?.id,
    staleTime: 60000,
  });

  const createMutation = useMutation({
    mutationFn: (transaction: RecurringTransactionInsert) => 
      SupabaseService.createRecurringTransaction(transaction),
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<RecurringTransaction[]>(queryKey);
      
      queryClient.setQueryData<RecurringTransaction[]>(queryKey, (old = []) => [
        {
          ...newTransaction,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_processed: null,
        } as RecurringTransaction,
        ...old,
      ]);
      
      return { previous };
    },
    onError: (err, newTransaction, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast({
        title: 'Error',
        description: 'Failed to create recurring transaction',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Recurring transaction created',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: RecurringTransactionUpdate }) => 
      SupabaseService.updateRecurringTransaction(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<RecurringTransaction[]>(queryKey);
      
      queryClient.setQueryData<RecurringTransaction[]>(queryKey, (old = []) =>
        old.map((item) => 
          item.id === id 
            ? { ...item, ...updates, updated_at: new Date().toISOString() } 
            : item
        )
      );
      
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast({
        title: 'Error',
        description: 'Failed to update recurring transaction',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Recurring transaction updated',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => SupabaseService.deleteRecurringTransaction(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<RecurringTransaction[]>(queryKey);
      
      queryClient.setQueryData<RecurringTransaction[]>(queryKey, (old = []) =>
        old.filter((item) => item.id !== deletedId)
      );
      
      return { previous };
    },
    onError: (err, deletedId, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast({
        title: 'Error',
        description: 'Failed to delete recurring transaction',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Recurring transaction deleted',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    recurringTransactions: recurringQuery.data ?? [],
    isLoading: recurringQuery.isLoading,
    isError: recurringQuery.isError,
    createRecurringTransaction: createMutation.mutate,
    updateRecurringTransaction: (id: string, updates: RecurringTransactionUpdate) => 
      updateMutation.mutate({ id, updates }),
    deleteRecurringTransaction: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};