-- Delete the malformed Jordan raffles
DELETE FROM raffles WHERE title LIKE 'Air Jordan%';

-- Insert Jordan raffles with correct array format for size_options
INSERT INTO raffles (
  id,
  title,
  description,
  image_url,
  ticket_price,
  total_tickets,
  tickets_sold,
  status,
  min_tickets_per_purchase,
  size_options,
  created_at,
  updated_at
) VALUES
(
  'ce31519f-c69c-45ba-ba2c-4f8c32e63b53',
  'Air Jordan 1 Retro High OG "Chicago"',
  'El icónico Air Jordan 1 Retro High en el colorway original Chicago. Uno de los zapatos más buscados del mundo del sneaker. Condición: Nuevo en caja.',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  89.99,
  100,
  25,
  'active',
  1,
  ARRAY['6', '7', '8', '9', '10', '11', '12', '13', '14'],
  NOW(),
  NOW()
),
(
  'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6',
  'Air Jordan 4 Retro "Bred"',
  'El legendario Air Jordan 4 en el color rojo y negro "Bred". Diseñado por Tinker Hatfield, es uno de los modelos más influyentes de la marca. Edición limitada.',
  'https://images.unsplash.com/photo-1460955807917-f1ead0c87b51?w=800&q=80',
  119.99,
  150,
  50,
  'active',
  1,
  ARRAY['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14'],
  NOW(),
  NOW()
),
(
  'p7q8r9s0-t1u2-v3w4-x5y6-z7a8b9c0d1e2',
  'Air Jordan 11 Retro Low "Bred"',
  'El clásico Air Jordan 11 Retro Low con su inconfundible patente en negro y rojo. Un zapato de lujo que define el baloncesto de los 90s. Stock limitado.',
  'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&q=80',
  109.99,
  120,
  35,
  'active',
  1,
  ARRAY['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
  NOW(),
  NOW()
);
