-- Update default site name to Dinamica Pro
UPDATE site_settings 
SET site_name = 'Dinamica Pro'
WHERE site_name = 'Sorteos Premium';

-- Update bank account names if they exist
UPDATE bank_accounts 
SET account_name = 'Dinamica Pro S.A.'
WHERE account_name = 'Sorteos Premium S.A.';
