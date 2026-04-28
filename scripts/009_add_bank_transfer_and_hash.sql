-- Add ticket hash and update payment methods
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ticket_hash text UNIQUE;
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_payment_method_check;
ALTER TABLE public.tickets ADD CONSTRAINT tickets_payment_method_check 
  CHECK (payment_method IN ('card', 'bank_transfer', 'crypto', 'paypal'));

-- Function to generate short hash for ticket
CREATE OR REPLACE FUNCTION generate_ticket_hash()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Trigger to auto-generate ticket hash
CREATE OR REPLACE FUNCTION set_ticket_hash()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ticket_hash IS NULL THEN
    NEW.ticket_hash := generate_ticket_hash();
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.tickets WHERE ticket_hash = NEW.ticket_hash) LOOP
      NEW.ticket_hash := generate_ticket_hash();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_ticket_hash_trigger ON public.tickets;
CREATE TRIGGER set_ticket_hash_trigger
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_hash();

-- Generate hashes for existing tickets
UPDATE public.tickets 
SET ticket_hash = generate_ticket_hash()
WHERE ticket_hash IS NULL;

-- Create bank accounts table for transfer info
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null,
  account_holder text not null,
  account_number text not null,
  account_type text not null,
  swift_code text,
  routing_number text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Enable RLS on bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Bank accounts policies - everyone can view active accounts
CREATE POLICY "Anyone can view active bank accounts"
  ON public.bank_accounts FOR SELECT
  USING (is_active = true);

-- Admins can manage bank accounts
CREATE POLICY "Admins can manage bank accounts"
  ON public.bank_accounts FOR ALL
  USING (public.is_admin());

-- Insert default bank account
INSERT INTO public.bank_accounts (bank_name, account_holder, account_number, account_type)
VALUES 
  ('Banco Nacional', 'Sorteos Premium S.A.', '1234567890', 'Cuenta Corriente'),
  ('Banco Internacional', 'Sorteos Premium S.A.', '0987654321', 'Cuenta de Ahorros')
ON CONFLICT DO NOTHING;
