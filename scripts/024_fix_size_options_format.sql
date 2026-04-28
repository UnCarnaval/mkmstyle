-- Update Jordan raffles with correct size_options format (comma-separated string)

UPDATE raffles 
SET size_options = '6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14'
WHERE title ILIKE '%Air Jordan Retro 1 High OG%' AND title NOT ILIKE '%Dior%';

UPDATE raffles 
SET size_options = '6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 14, 15'
WHERE title ILIKE '%Air Jordan 4 Retro SE%';

UPDATE raffles 
SET size_options = '7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12'
WHERE title ILIKE '%Air Jordan 1 Retro High OG x Dior%';
