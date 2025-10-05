-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_budget_goals_user_active ON public.budget_goals(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_active ON public.recurring_transactions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user ON public.portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_session ON public.chat_conversations(user_id, session_id);

-- Add rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, endpoint, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits FOR SELECT
USING (auth.uid() = user_id);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id UUID,
  _endpoint TEXT,
  _max_requests INTEGER,
  _window_minutes INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count INTEGER;
  _window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  _window_start := date_trunc('minute', now()) - (_window_minutes || ' minutes')::interval;
  
  SELECT COALESCE(SUM(request_count), 0) INTO _count
  FROM public.rate_limits
  WHERE user_id = _user_id
    AND endpoint = _endpoint
    AND window_start > _window_start;
  
  IF _count >= _max_requests THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO public.rate_limits (user_id, endpoint, request_count, window_start)
  VALUES (_user_id, _endpoint, 1, date_trunc('minute', now()))
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  RETURN TRUE;
END;
$$;