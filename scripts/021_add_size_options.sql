-- Add size options to raffles table
-- This allows raffles for clothing/footwear to have size selection

-- Add size_options column to raffles (nullable array of text)
ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS size_options text[] DEFAULT NULL;

-- Add selected_size column to tickets table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS selected_size text DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.raffles.size_options IS 'Optional array of sizes for clothing/footwear raffles (e.g., {S, M, L, XL} or {38, 39, 40, 41})';
COMMENT ON COLUMN public.tickets.selected_size IS 'The size selected by the buyer for clothing/footwear raffles';
