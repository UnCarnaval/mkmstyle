-- Create test users
-- IMPORTANT: After running this script, you need to manually sign up these users through the app
-- or use Supabase Dashboard to create them with these emails:

-- 1. Admin User: admin@sorteos.com / Admin2024!Secure
-- 2. Normal User: user@sorteos.com / User2024!Secure

-- This script will set the admin role for the admin user
-- First, create the users through the Supabase Auth UI or Dashboard with the emails above

-- Then update the role to admin (run this after user signup)
-- You'll need to replace 'admin@sorteos.com' with the actual email after creation

-- Function to make a user admin by email
create or replace function public.make_user_admin(user_email text)
returns void as $$
begin
  update public.profiles
  set role = 'admin'
  where id in (
    select id from auth.users where email = user_email
  );
end;
$$ language plpgsql security definer;

-- Instructions for manual setup:
-- 1. Go to your app and sign up with: admin@sorteos.com / Admin2024!Secure
-- 2. Go to your app and sign up with: user@sorteos.com / User2024!Secure
-- 3. Then run in SQL editor: SELECT public.make_user_admin('admin@sorteos.com');

-- Alternatively, if you want to set admin role by user ID directly:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'your-admin-user-id-here';
