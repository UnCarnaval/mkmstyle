-- Delete the malformed Jordan raffles
DELETE FROM raffles WHERE title LIKE '%Jordan%';

-- Insert new Jordan raffles with proper TEXT format for size_options
INSERT INTO raffles (
  title,
  description,
  ticket_price,
  total_tickets,
  image_url,
  status,
  size_options,
  min_tickets_per_purchase
) VALUES
(
  'Air Jordan 1 Retro High OG "Chicago"',
  'El icónico Air Jordan 1 Retro High OG en la combinación de colores rojo y negro "Chicago". Diseño clásico que revolucionó el baloncesto.',
  89.99,
  100,
  'https://images.unsplash.com/photo-1543163521-9efcc062b893?w=800&q=80',
  'active',
  '7, 8, 9, 10, 11, 12, 13',
  1
),
(
  'Air Jordan 4 Retro "Bred"',
  'Los Air Jordan 4 Retro en el clásico colorway "Bred". Featuring the iconic design que define una era del baloncesto profesional.',
  119.99,
  150,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  'active',
  '6, 7, 8, 9, 10, 11, 12, 13, 14',
  1
),
(
  'Air Jordan 11 Retro Low "Bred"',
  'Los legendarios Air Jordan 11 Retro Low en el colorway rojo y negro. Diseñado para máxima comodidad y estilo premium.',
  109.99,
  120,
  'https://images.unsplash.com/photo-1518894917744-24d100186fbb?w=800&q=80',
  'active',
  '7, 8, 9, 10, 11, 12, 13',
  1
);
