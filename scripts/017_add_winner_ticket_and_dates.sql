-- Add missing columns to raffles table

-- Add winner_ticket_id to store the winning ticket
ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS winner_ticket_id uuid REFERENCES public.tickets(id);

-- Add start_date and end_date for raffle scheduling
ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS start_date timestamp with time zone DEFAULT now();

ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS end_date timestamp with time zone;

-- Add min_tickets_per_purchase for purchase limits
ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS min_tickets_per_purchase integer DEFAULT 1;

-- Update existing raffles to have end_date if draw_date exists
UPDATE public.raffles 
SET end_date = draw_date 
WHERE end_date IS NULL AND draw_date IS NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_raffles_status ON public.raffles(status);
CREATE INDEX IF NOT EXISTS idx_raffles_dates ON public.raffles(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_raffles_winner_ticket ON public.raffles(winner_ticket_id);
