-- Fix security issues: Update functions to set proper search_path
CREATE OR REPLACE FUNCTION public.process_recurring_transactions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Insert new transactions for recurring ones that are due
  INSERT INTO public.transactions (user_id, date, category, type, amount, description)
  SELECT 
    user_id,
    next_due_date,
    category,
    type,
    amount,
    CONCAT('Recurring: ', name)
  FROM public.recurring_transactions
  WHERE is_active = true 
    AND next_due_date <= CURRENT_DATE
    AND (last_processed IS NULL OR last_processed < next_due_date);
  
  -- Update recurring transactions with new next_due_date and last_processed
  UPDATE public.recurring_transactions
  SET 
    last_processed = next_due_date,
    next_due_date = CASE 
      WHEN frequency = 'daily' THEN next_due_date + INTERVAL '1 day'
      WHEN frequency = 'weekly' THEN next_due_date + INTERVAL '1 week'
      WHEN frequency = 'monthly' THEN next_due_date + INTERVAL '1 month'
      WHEN frequency = 'yearly' THEN next_due_date + INTERVAL '1 year'
    END,
    updated_at = now()
  WHERE is_active = true 
    AND next_due_date <= CURRENT_DATE
    AND (last_processed IS NULL OR last_processed < next_due_date);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$function$;