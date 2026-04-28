-- Insert sample raffles (only if none exist)
insert into public.raffles (title, description, image_url, ticket_price, total_tickets, tickets_sold, status, draw_date)
select * from (
  values
    (
      'iPhone 15 Pro Max 256GB',
      'Sorteo de un iPhone 15 Pro Max completamente nuevo con 256GB de almacenamiento. Color Titanio Natural. Incluye cargador y audífonos originales.',
      '/placeholder.svg?height=600&width=800',
      25.00,
      10000,
      7543,
      'active',
      (now() + interval '15 days')::timestamp with time zone
    ),
    (
      'MacBook Pro M3 Max',
      'MacBook Pro 16" con chip M3 Max, 32GB RAM y 1TB SSD. Perfecta para profesionales creativos. Color Space Black.',
      '/placeholder.svg?height=600&width=800',
      50.00,
      10000,
      6234,
      'active',
      (now() + interval '20 days')::timestamp with time zone
    ),
    (
      'PlayStation 5 Pro + 3 Juegos',
      'PlayStation 5 Pro edición limitada con 3 juegos AAA a elegir. Incluye 2 controles DualSense y membresía PlayStation Plus por 1 año.',
      '/placeholder.svg?height=600&width=800',
      30.00,
      10000,
      8921,
      'active',
      (now() + interval '10 days')::timestamp with time zone
    ),
    (
      'Tesla Model 3 2024',
      'Tesla Model 3 Long Range 2024. Autonomía de 580km, piloto automático mejorado, color Pearl White. Completamente nuevo.',
      '/placeholder.svg?height=600&width=800',
      100.00,
      10000,
      4567,
      'active',
      (now() + interval '30 days')::timestamp with time zone
    ),
    (
      'Apple Watch Ultra 2',
      'Apple Watch Ultra 2 con GPS + Cellular. Caja de titanio, correa Alpine Loop. Resistencia extrema y batería de hasta 36 horas.',
      '/placeholder.svg?height=600&width=800',
      35.00,
      10000,
      5892,
      'active',
      (now() + interval '12 days')::timestamp with time zone
    ),
    (
      'Viaje a Dubái Todo Incluido',
      'Viaje para 2 personas a Dubái por 7 días. Incluye vuelos, hotel 5 estrellas, tours y $2000 USD en efectivo para gastos.',
      '/placeholder.svg?height=600&width=800',
      75.00,
      10000,
      3421,
      'active',
      (now() + interval '25 days')::timestamp with time zone
    )
) as data(title, description, image_url, ticket_price, total_tickets, tickets_sold, status, draw_date)
where not exists (select 1 from public.raffles limit 1);
