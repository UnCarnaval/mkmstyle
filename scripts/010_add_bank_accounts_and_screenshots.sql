-- Crear tabla de cuentas bancarias
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type TEXT DEFAULT 'Cuenta Corriente',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agregar columna para captura de pantalla en tickets
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS screenshot_url TEXT;

-- Políticas RLS para bank_accounts
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Admins pueden hacer todo
CREATE POLICY "Admins can do everything on bank_accounts"
  ON bank_accounts
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Todos pueden ver cuentas activas (para el checkout)
CREATE POLICY "Anyone can view active bank accounts"
  ON bank_accounts
  FOR SELECT
  USING (is_active = true);

-- Insertar cuenta bancaria de ejemplo
INSERT INTO bank_accounts (bank_name, account_holder, account_number, account_type)
VALUES ('Banco Ejemplo', 'Juan Pérez', '1234567890', 'Cuenta Corriente')
ON CONFLICT DO NOTHING;
