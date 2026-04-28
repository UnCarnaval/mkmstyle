-- Drop existing problematic policies
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can insert raffles" on public.raffles;
drop policy if exists "Admins can update raffles" on public.raffles;
drop policy if exists "Admins can delete raffles" on public.raffles;
drop policy if exists "Admins can view all tickets" on public.tickets;
drop policy if exists "Admins can manage payment settings" on public.payment_settings;

-- Create a security definer function to check admin role
-- This breaks the recursion by using SECURITY DEFINER
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$;

-- Grant execute permission
grant execute on function public.is_admin() to authenticated;

-- Recreate profiles policies without recursion
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin());

-- Raffles policies for admin
create policy "Admins can insert raffles"
  on public.raffles for insert
  with check (public.is_admin());

create policy "Admins can update raffles"
  on public.raffles for update
  using (public.is_admin());

create policy "Admins can delete raffles"
  on public.raffles for delete
  using (public.is_admin());

-- Tickets policies for admin
create policy "Users can view own tickets"
  on public.tickets for select
  using (auth.uid() = user_id);

create policy "Admins can view all tickets"
  on public.tickets for select
  using (public.is_admin());

-- Payment settings policies
create policy "Admins can manage payment settings"
  on public.payment_settings for all
  using (public.is_admin());

create policy "Everyone can view payment settings"
  on public.payment_settings for select
  using (true);
