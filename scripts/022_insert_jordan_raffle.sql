-- Insert Jordan Retro 1 Raffle with size options
INSERT INTO raffles (
  title,
  description,
  ticket_price,
  total_tickets,
  tickets_sold,
  status,
  image_url,
  start_date,
  end_date,
  draw_date,
  min_tickets_per_purchase,
  size_options,
  created_at,
  updated_at
) VALUES (
  'Air Jordan Retro 1 High OG',
  'Los icónicos Air Jordan Retro 1 High OG en su versión negra y roja. Edición limitada de colección. Condición: Nuevos sin usar. Incluye caja original y papeles de autenticidad.',
  25.00,
  500,
  0,
  'active',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '31 days',
  1,
  ARRAY['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14'],
  NOW(),
  NOW()
);

-- Insert Air Jordan 4 Retro Raffle
INSERT INTO raffles (
  title,
  description,
  ticket_price,
  total_tickets,
  tickets_sold,
  status,
  image_url,
  start_date,
  end_date,
  draw_date,
  min_tickets_per_purchase,
  size_options,
  created_at,
  updated_at
) VALUES (
  'Air Jordan 4 Retro SE',
  'Air Jordan 4 Retro SE en color "Metallic Purple". Zapatilla legendaria con tecnología Air cushioning. Perfecto estado, nunca usado. Incluye caja y accesorios originales.',
  30.00,
  300,
  0,
  'active',
  'https://images.unsplash.com/photo-1600181551183-f0f4a5cef280?w=800&q=80',
  NOW(),
  NOW() + INTERVAL '28 days',
  NOW() + INTERVAL '29 days',
  2,
  ARRAY['6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '14', '15'],
  NOW(),
  NOW()
);

-- Insert Jordan Dior Collaboration
INSERT INTO raffles (
  title,
  description,
  ticket_price,
  total_tickets,
  tickets_sold,
  status,
  image_url,
  start_date,
  end_date,
  draw_date,
  min_tickets_per_purchase,
  size_options,
  created_at,
  updated_at
) VALUES (
  'Air Jordan 1 Retro High OG x Dior',
  'Colaboración exclusiva entre Air Jordan y Dior. Diseño premium con detalles en oro. Edición limitada con solo 10,000 pares producidos. Completamente nuevo con certificado de autenticidad.',
  45.00,
  200,
  0,
  'active',
  'https://images.unsplash.com/photo-1607522591413-b9b909d0ab0b?w=800&q=80',
  NOW(),
  NOW() + INTERVAL '35 days',
  NOW() + INTERVAL '36 days',
  3,
  ARRAY['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
  NOW(),
  NOW()
);
