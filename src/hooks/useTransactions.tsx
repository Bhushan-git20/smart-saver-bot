import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { SupabaseService } from '@/services/supabase.service';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

export const useTransactions = (limit?: number) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ['transactions', user?.id, limit],
    queryFn: () => SupabaseService.getTransactions(user!.id, limit),
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });

  const createTransactionMutation = useMutation({
    mutationFn: (transaction: TransactionInsert) => 
      SupabaseService.createTransaction(transaction),
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: ['transactions', user?.id] });
      
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions', user?.id]);
      
      queryClient.setQueryData<Transaction[]>(['transactions', user?.id], (old = []) => [
        { ...newTransaction, id: 'temp-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Transaction,
        ...old,
      ]);
      
      return { previousTransactions };
    },
    onError: (err, newTransaction, context) => {
      queryClient.setQueryData(['transactions', user?.id], context?.previousTransactions);
      toast({
        title: 'Error',
        description: 'Failed to create transaction',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Transaction created successfully',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => SupabaseService.deleteTransaction(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['transactions', user?.id] });
      
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions', user?.id]);
      
      queryClient.setQueryData<Transaction[]>(['transactions', user?.id], (old = []) =>
        old.filter((transaction) => transaction.id !== deletedId)
      );
      
      return { previousTransactions };
    },
    onError: (err, deletedId, context) => {
      queryClient.setQueryData(['transactions', user?.id], context?.previousTransactions);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
  });

  return {
    transactions: transactionsQuery.data ?? [],
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    error: transactionsQuery.error,
    createTransaction: createTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    isCreating: createTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
  };
};
