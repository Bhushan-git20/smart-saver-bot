-- Create categorization rules table
CREATE TABLE public.categorization_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  category TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categorization_rules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own categorization rules" 
ON public.categorization_rules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categorization rules" 
ON public.categorization_rules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categorization rules" 
ON public.categorization_rules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categorization rules" 
ON public.categorization_rules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for timestamps
CREATE TRIGGER update_categorization_rules_updated_at
BEFORE UPDATE ON public.categorization_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_categorization_rules_user_id ON public.categorization_rules(user_id);
CREATE INDEX idx_categorization_rules_keyword ON public.categorization_rules(keyword);