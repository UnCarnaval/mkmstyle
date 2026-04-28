-- Add purchase_group_id to group tickets from same transaction
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS purchase_group_id UUID DEFAULT gen_random_uuid();

-- Create index for faster grouping queries
CREATE INDEX IF NOT EXISTS idx_tickets_purchase_group ON tickets(purchase_group_id);
