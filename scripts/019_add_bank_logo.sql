-- Add bank_logo column to bank_accounts table
ALTER TABLE bank_accounts 
ADD COLUMN IF NOT EXISTS bank_logo TEXT;

-- Add some default logos for popular Dominican banks
UPDATE bank_accounts 
SET bank_logo = CASE 
  WHEN bank_name ILIKE '%popular%' THEN 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Banco_Popular_Dominicano_logo.svg/320px-Banco_Popular_Dominicano_logo.svg.png'
  WHEN bank_name ILIKE '%banreservas%' OR bank_name ILIKE '%reservas%' THEN 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Banreservas_logo.svg/320px-Banreservas_logo.svg.png'
  WHEN bank_name ILIKE '%bhd%' THEN 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/BHD_Le%C3%B3n_logo.svg/320px-BHD_Le%C3%B3n_logo.svg.png'
  ELSE bank_logo
END
WHERE bank_logo IS NULL;

COMMENT ON COLUMN bank_accounts.bank_logo IS 'URL of the bank logo image';
