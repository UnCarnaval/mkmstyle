-- Add min_tickets_per_purchase column to raffles table
ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS min_tickets_per_purchase INTEGER DEFAULT 1;

-- Update existing raffles to have min 1
UPDATE public.raffles SET min_tickets_per_purchase = 1 WHERE min_tickets_per_purchase IS NULL;
