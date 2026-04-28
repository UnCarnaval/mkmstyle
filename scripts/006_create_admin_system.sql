-- Add role column to profiles
alter table public.profiles add column if not exists role text not null default 'user' check (role in ('user', 'admin'));

-- Update RLS policies for admin access
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    auth.uid() = id or 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Raffles policies for admin
create policy "Admins can insert raffles"
  on public.raffles for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update raffles"
  on public.raffles for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete raffles"
  on public.raffles for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Tickets policies for admin
create policy "Admins can view all tickets"
  on public.tickets for select
  using (
    auth.uid() = user_id or 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Create payment settings table
create table if not exists public.payment_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('stripe', 'paypal', 'crypto')),
  is_enabled boolean not null default true,
  config jsonb not null default '{}',
  updated_at timestamp with time zone default now(),
  updated_by uuid references public.profiles(id),
  unique(provider)
);

-- Enable RLS on payment_settings
alter table public.payment_settings enable row level security;

-- Payment settings policies
create policy "Admins can manage payment settings"
  on public.payment_settings for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Insert default payment settings
insert into public.payment_settings (provider, is_enabled, config) values
  ('stripe', true, '{"currency": "USD"}'),
  ('paypal', true, '{"currency": "USD"}'),
  ('crypto', true, '{"currencies": ["BTC", "ETH", "USDT"]}')
on conflict (provider) do nothing;

-- Create admin stats view
create or replace view public.admin_stats as
select
  (select count(*) from public.raffles where status = 'active') as active_raffles,
  (select count(*) from public.tickets) as total_tickets_sold,
  (select sum(r.ticket_price) from public.tickets t join public.raffles r on t.raffle_id = r.id) as total_revenue,
  (select count(*) from public.profiles) as total_users;
