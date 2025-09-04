-- Check existing tables and add missing ones
-- Add budget_goals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.budget_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT,
  monthly_limit NUMERIC,
  monthly_savings_target NUMERIC,
  period_start DATE NOT NULL DEFAULT DATE_TRUNC('month', CURRENT_DATE),
  period_end DATE NOT NULL DEFAULT (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add portfolio_holdings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stock', 'mutual_fund', 'fd', 'bond')),
  quantity NUMERIC NOT NULL,
  purchase_price NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  current_price NUMERIC DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add chat_conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  ai_provider TEXT NOT NULL DEFAULT 'huggingface' CHECK (ai_provider IN ('huggingface', 'openai', 'gemini')),
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  budget_alerts BOOLEAN NOT NULL DEFAULT true,
  weekly_reports BOOLEAN NOT NULL DEFAULT false,
  monthly_reports BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.budget_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budget_goals
DROP POLICY IF EXISTS "Users can view their own budget goals" ON public.budget_goals;
DROP POLICY IF EXISTS "Users can create their own budget goals" ON public.budget_goals;
DROP POLICY IF EXISTS "Users can update their own budget goals" ON public.budget_goals;
DROP POLICY IF EXISTS "Users can delete their own budget goals" ON public.budget_goals;

CREATE POLICY "Users can view their own budget goals" 
ON public.budget_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget goals" 
ON public.budget_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget goals" 
ON public.budget_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget goals" 
ON public.budget_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for portfolio_holdings
DROP POLICY IF EXISTS "Users can view their own portfolio holdings" ON public.portfolio_holdings;
DROP POLICY IF EXISTS "Users can create their own portfolio holdings" ON public.portfolio_holdings;
DROP POLICY IF EXISTS "Users can update their own portfolio holdings" ON public.portfolio_holdings;
DROP POLICY IF EXISTS "Users can delete their own portfolio holdings" ON public.portfolio_holdings;

CREATE POLICY "Users can view their own portfolio holdings" 
ON public.portfolio_holdings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio holdings" 
ON public.portfolio_holdings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio holdings" 
ON public.portfolio_holdings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio holdings" 
ON public.portfolio_holdings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for chat_conversations
DROP POLICY IF EXISTS "Users can view their own chat conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can create their own chat conversations" ON public.chat_conversations;

CREATE POLICY "Users can view their own chat conversations" 
ON public.chat_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat conversations" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can create their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);