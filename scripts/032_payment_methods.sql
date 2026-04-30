-- Agrega soporte para entradas tipo "payment_link" (PayPal, Stripe Link, etc.)
-- y campos opcionales (cedula, currency) para cuentas bancarias.

ALTER TABLE bank_accounts
  ADD COLUMN IF NOT EXISTS entry_type TEXT NOT NULL DEFAULT 'bank'
    CHECK (entry_type IN ('bank','payment_link')),
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS cedula TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS payment_link TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

ALTER TABLE bank_accounts
  ALTER COLUMN account_number DROP NOT NULL,
  ALTER COLUMN account_holder DROP NOT NULL,
  ALTER COLUMN account_type DROP NOT NULL;
