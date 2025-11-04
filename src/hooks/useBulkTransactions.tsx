import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { SupabaseService } from '@/services/supabase.service';
import { useToast } from './use-toast';

export const useBulkTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => SupabaseService.deleteTransaction(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      clearSelection();
      toast({
        title: 'Success',
        description: `${selectedIds.size} transactions deleted`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete transactions',
        variant: 'destructive',
      });
    },
  });

  return {
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkDelete: () => bulkDeleteMutation.mutate(Array.from(selectedIds)),
    isDeleting: bulkDeleteMutation.isPending,
  };
};
