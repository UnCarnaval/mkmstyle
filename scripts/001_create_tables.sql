-- Create users profile table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create raffles table
create table if not exists public.raffles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text not null,
  ticket_price numeric(10, 2) not null,
  total_tickets integer not null default 10000,
  tickets_sold integer not null default 0,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  draw_date timestamp with time zone,
  winner_id uuid references public.profiles(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on raffles
alter table public.raffles enable row level security;

-- Raffles policies - everyone can view active raffles
create policy "Anyone can view active raffles"
  on public.raffles for select
  using (status = 'active' or auth.uid() is not null);

-- Create tickets table
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  ticket_number integer not null,
  payment_method text not null check (payment_method in ('card', 'transfer', 'crypto')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'completed', 'failed')),
  purchased_at timestamp with time zone default now(),
  unique(raffle_id, ticket_number)
);

-- Enable RLS on tickets
alter table public.tickets enable row level security;

-- Tickets policies
create policy "Users can view their own tickets"
  on public.tickets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tickets"
  on public.tickets for insert
  with check (auth.uid() = user_id);

-- Create function to check ticket availability
create or replace function public.check_ticket_availability(p_raffle_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_total_tickets integer;
  v_tickets_sold integer;
begin
  select total_tickets, tickets_sold
  into v_total_tickets, v_tickets_sold
  from public.raffles
  where id = p_raffle_id and status = 'active';
  
  return v_tickets_sold < v_total_tickets;
end;
$$;

-- Create function to update tickets_sold count
create or replace function public.update_raffle_tickets_sold()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.raffles
  set tickets_sold = tickets_sold + 1,
      updated_at = now()
  where id = new.raffle_id;
  
  return new;
end;
$$;

-- Create trigger to update tickets_sold
drop trigger if exists on_ticket_purchased on public.tickets;
create trigger on_ticket_purchased
  after insert on public.tickets
  for each row
  execute function public.update_raffle_tickets_sold();

-- Create function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;

-- Create trigger for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
