-- Update all raffle images with real product photos
UPDATE public.raffles 
SET image_url = CASE 
  WHEN title LIKE '%iPhone%' THEN 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800&h=600&fit=crop'
  WHEN title LIKE '%MacBook%' THEN 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop'
  WHEN title LIKE '%PlayStation%' THEN 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&h=600&fit=crop'
  WHEN title LIKE '%Tesla%' THEN 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop'
  WHEN title LIKE '%Apple Watch%' THEN 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=600&fit=crop'
  WHEN title LIKE '%Dubái%' OR title LIKE '%Viaje%' THEN 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop'
  ELSE image_url
END
WHERE image_url LIKE '%placeholder%';
