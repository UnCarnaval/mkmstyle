-- Fix size_options format for Jordan raffles
-- Convert from array format to simple comma-separated strings

UPDATE raffles
SET size_options = '6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14'
WHERE title = 'Air Jordan 1 Retro High OG "Chicago"';

UPDATE raffles
SET size_options = '6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14'
WHERE title = 'Air Jordan 4 Retro "Bred"';

UPDATE raffles
SET size_options = '6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14'
WHERE title = 'Air Jordan 11 Retro Low "Bred"';
