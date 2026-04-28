-- Add missing columns for bank transfers
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS bank_reference text,
ADD COLUMN IF NOT EXISTS screenshot_url text;

-- Update RLS policies to allow these fields
COMMENT ON COLUMN public.tickets.bank_reference IS 'Reference number from bank transfer';
COMMENT ON COLUMN public.tickets.screenshot_url IS 'URL to bank transfer screenshot stored in Vercel Blob';
