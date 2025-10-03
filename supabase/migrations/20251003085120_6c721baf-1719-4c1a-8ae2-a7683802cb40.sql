-- Remove precision limits on numeric columns in transactions table
ALTER TABLE public.transactions 
ALTER COLUMN amount TYPE numeric,
ALTER COLUMN balance TYPE numeric;