-- Delete existing Jordan raffles
DELETE FROM raffles WHERE title ILIKE '%Jordan%';

-- Insert Jordan raffles with proper size_options as TEXT[] arrays
INSERT INTO raffles (
  id,
  title,
  description,
  image_url,
  ticket_price,
  total_tickets,
  tickets_sold,
  status,
  size_options,
  created_at,
  updated_at
) VALUES
(
  gen_random_uuid(),
  'Air Jordan 1 Retro High OG "Chicago"',
  'El modelo más icónico de Jordan. Diseño clásico rojo y negro que define a la marca. Edición retro auténtica con detalles premium.',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  89.99,
  100,
  0,
  'active',
  ARRAY['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Air Jordan 4 Retro "Bred"',
  'Leyenda del baloncesto. Diseño negro y rojo con la icónica ventilación lateral. Comodidad y estilo sin compromisos.',
  'https://images.unsplash.com/photo-1556821552-23665ba6defd?w=800&q=80',
  119.99,
  150,
  0,
  'active',
  ARRAY['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14'],
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Air Jordan 11 Retro Low "Bred"',
  'Elegancia pura. Versión baja del modelo que usó Jordan en sus años de gloria. Material premium con acabados de lujo.',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',
  109.99,
  120,
  0,
  'active',
  ARRAY['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
  NOW(),
  NOW()
);

SELECT 'Jordan raffles inserted successfully' as result;
