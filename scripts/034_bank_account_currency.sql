-- Add is_usd flag to bank_accounts to mark USD accounts
ALTER TABLE bank_accounts
  ADD COLUMN IF NOT EXISTS is_usd BOOLEAN NOT NULL DEFAULT FALSE;
