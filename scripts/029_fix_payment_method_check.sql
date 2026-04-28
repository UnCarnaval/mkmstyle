-- Ensure tickets.payment_method CHECK allows the full set of supported methods.
-- Idempotent: drops the existing constraint (if any) and recreates it.
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_payment_method_check;
ALTER TABLE public.tickets ADD CONSTRAINT tickets_payment_method_check
  CHECK (payment_method IN ('card', 'bank_transfer', 'crypto', 'paypal'));
