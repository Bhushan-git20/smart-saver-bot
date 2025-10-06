/**
 * Supabase Service Layer
 * Centralized database operations with error handling
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row'];
type BudgetGoal = Database['public']['Tables']['budget_goals']['Row'];
type PortfolioHolding = Database['public']['Tables']['portfolio_holdings']['Row'];

export class SupabaseService {
  // Transactions
  static async getTransactions(userId: string, limit?: number) {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(`Failed to fetch transactions: ${error.message}`);
    return data;
  }

  static async getTransactionsByDateRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type, category, date')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw new Error(`Failed to fetch transactions: ${error.message}`);
    return data;
  }

  static async bulkInsertTransactions(transactions: TransactionInsert[]) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactions)
      .select();
    
    if (error) throw new Error(`Failed to insert transactions: ${error.message}`);
    return data;
  }

  static async createTransaction(transaction: TransactionInsert) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create transaction: ${error.message}`);
    return data;
  }

  static async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete transaction: ${error.message}`);
  }

  // Recurring Transactions
  static async getRecurringTransactions(userId: string) {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('next_due_date', { ascending: true });
    
    if (error) throw new Error(`Failed to fetch recurring transactions: ${error.message}`);
    return data;
  }

  // Budget Goals
  static async getBudgetGoals(userId: string) {
    const { data, error } = await supabase
      .from('budget_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (error) throw new Error(`Failed to fetch budget goals: ${error.message}`);
    return data;
  }

  static async createBudgetGoal(budgetGoal: Database['public']['Tables']['budget_goals']['Insert']) {
    const { data, error } = await supabase
      .from('budget_goals')
      .insert(budgetGoal)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create budget goal: ${error.message}`);
    return data;
  }

  // Portfolio
  static async getPortfolioHoldings(userId: string) {
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch portfolio holdings: ${error.message}`);
    return data;
  }

  // User Profile
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw new Error(`Failed to fetch user profile: ${error.message}`);
    return data;
  }

  // Categorization Rules
  static async getCategorizationRules(userId: string) {
    const { data, error } = await supabase
      .from('categorization_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('priority', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch categorization rules: ${error.message}`);
    return data || [];
  }
}
