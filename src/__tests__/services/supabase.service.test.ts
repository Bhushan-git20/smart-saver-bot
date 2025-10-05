import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseService } from '../../services/supabase.service';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

describe('SupabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTransactions', () => {
    it('should fetch transactions for a user', async () => {
      const mockTransactions = [
        { id: '1', amount: 100, category: 'Food' },
        { id: '2', amount: 200, category: 'Transport' },
      ];

      const { supabase } = await import('@/integrations/supabase/client');
      const mockChain = supabase.from('transactions');
      vi.mocked(mockChain.select).mockResolvedValue({ 
        data: mockTransactions, 
        error: null 
      } as any);

      const result = await SupabaseService.getTransactions('user-123');
      
      expect(result).toEqual(mockTransactions);
      expect(supabase.from).toHaveBeenCalledWith('transactions');
    });

    it('should throw error on failure', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockChain = supabase.from('transactions');
      vi.mocked(mockChain.select).mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      } as any);

      await expect(
        SupabaseService.getTransactions('user-123')
      ).rejects.toThrow('Failed to fetch transactions: Database error');
    });
  });
});
