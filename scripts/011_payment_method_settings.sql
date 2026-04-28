-- Create payment_method_settings table
CREATE TABLE IF NOT EXISTS public.payment_method_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT UNIQUE NOT NULL CHECK (provider IN ('stripe', 'paypal', 'crypto', 'bank_transfer')),
  is_enabled BOOLEAN DEFAULT true,
  display_name TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default payment methods
INSERT INTO public.payment_method_settings (provider, is_enabled, display_name, description)
VALUES 
  ('stripe', true, 'Stripe', 'Tarjeta de crédito/débito'),
  ('paypal', true, 'PayPal', 'Pago rápido y seguro'),
  ('crypto', true, 'Crypto', 'Bitcoin, USDT, ETH'),
  ('bank_transfer', true, 'Transferencia Bancaria', 'Verificación manual')
ON CONFLICT (provider) DO NOTHING;

-- Enable RLS
ALTER TABLE public.payment_method_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read payment methods
CREATE POLICY "Anyone can view payment methods"
  ON public.payment_method_settings
  FOR SELECT
  TO public
  USING (true);

-- Only admins can update payment methods
CREATE POLICY "Only admins can update payment methods"
  ON public.payment_method_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_payment_method_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_method_settings_updated_at
  BEFORE UPDATE ON public.payment_method_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_method_settings_updated_at();
