-- Enable bank transfer and crypto payment methods
-- First, ensure the payment methods exist and are enabled

-- Insert or update bank_transfer payment method
INSERT INTO payment_method_settings (id, provider, display_name, description, is_enabled, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'bank_transfer',
  'Transferencia Bancaria',
  'Pago mediante transferencia bancaria local. Verificacion manual requerida.',
  true,
  now(),
  now()
)
ON CONFLICT (provider) DO UPDATE SET
  is_enabled = true,
  display_name = 'Transferencia Bancaria',
  description = 'Pago mediante transferencia bancaria local. Verificacion manual requerida.',
  updated_at = now();

-- Insert or update crypto payment method
INSERT INTO payment_method_settings (id, provider, display_name, description, is_enabled, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'crypto',
  'Criptomonedas',
  'Pago con Bitcoin, USDT, Ethereum y otras criptomonedas.',
  true,
  now(),
  now()
)
ON CONFLICT (provider) DO UPDATE SET
  is_enabled = true,
  display_name = 'Criptomonedas',
  description = 'Pago con Bitcoin, USDT, Ethereum y otras criptomonedas.',
  updated_at = now();

-- Insert mock bank account for transfers
INSERT INTO bank_accounts (id, bank_name, account_holder, account_number, account_type, is_active, bank_logo, created_at)
VALUES (
  gen_random_uuid(),
  'Banco Popular Dominicano',
  'MakingMoney Style SRL',
  '123-456789-0-01',
  'Corriente',
  true,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Banco_Popular_Dominicano_logo.svg/200px-Banco_Popular_Dominicano_logo.svg.png',
  now()
),
(
  gen_random_uuid(),
  'Banreservas',
  'MakingMoney Style SRL',
  '987-654321-0-02',
  'Ahorros',
  true,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Banreservas_logo.svg/200px-Banreservas_logo.svg.png',
  now()
)
ON CONFLICT DO NOTHING;

-- Insert crypto payment settings with wallet addresses
INSERT INTO payment_settings (id, provider, is_enabled, config, updated_at)
VALUES (
  gen_random_uuid(),
  'crypto',
  true,
  '{
    "wallets": {
      "btc": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "eth": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      "usdt_trc20": "TN2HtWUcig3PJLdVJMn6Q8ZthJFkfvXVqA",
      "usdt_erc20": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
    },
    "network_names": {
      "btc": "Bitcoin Network",
      "eth": "Ethereum (ERC-20)",
      "usdt_trc20": "Tron (TRC-20)",
      "usdt_erc20": "Ethereum (ERC-20)"
    }
  }',
  now()
)
ON CONFLICT (provider) DO UPDATE SET
  is_enabled = true,
  config = '{
    "wallets": {
      "btc": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "eth": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      "usdt_trc20": "TN2HtWUcig3PJLdVJMn6Q8ZthJFkfvXVqA",
      "usdt_erc20": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
    },
    "network_names": {
      "btc": "Bitcoin Network",
      "eth": "Ethereum (ERC-20)",
      "usdt_trc20": "Tron (TRC-20)",
      "usdt_erc20": "Ethereum (ERC-20)"
    }
  }',
  updated_at = now();
