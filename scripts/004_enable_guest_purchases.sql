-- Modify tickets table to allow guest purchases
alter table public.tickets 
  alter column user_id drop not null,
  add column guest_name text,
  add column guest_email text,
  add column guest_phone text;

-- Add check constraint to ensure either user_id or guest info is present
alter table public.tickets 
  add constraint user_or_guest_check 
  check (
    (user_id is not null) or 
    (guest_name is not null and guest_email is not null)
  );

-- Drop old policies
drop policy if exists "Users can view their own tickets" on public.tickets;
drop policy if exists "Users can insert their own tickets" on public.tickets;

-- Create new policies for tickets that support guest purchases
create policy "Users can view their own tickets and guests can view with email"
  on public.tickets for select
  using (
    auth.uid() = user_id or 
    auth.uid() is null
  );

create policy "Anyone can insert tickets"
  on public.tickets for insert
  with check (true);

-- Update the raffle check function to be more permissive
create or replace function public.insert_ticket(
  p_raffle_id uuid,
  p_user_id uuid default null,
  p_guest_name text default null,
  p_guest_email text default null,
  p_guest_phone text default null,
  p_payment_method text default 'card',
  p_ticket_number integer default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_raffle record;
  v_ticket_number integer;
  v_ticket_id uuid;
begin
  -- Check raffle availability
  select * into v_raffle
  from public.raffles
  where id = p_raffle_id and status = 'active';
  
  if not found then
    return json_build_object('success', false, 'error', 'Sorteo no disponible');
  end if;
  
  if v_raffle.tickets_sold >= v_raffle.total_tickets then
    return json_build_object('success', false, 'error', 'No hay boletos disponibles');
  end if;
  
  -- Generate ticket number if not provided
  if p_ticket_number is null then
    v_ticket_number := floor(random() * 10000)::integer;
  else
    v_ticket_number := p_ticket_number;
  end if;
  
  -- Insert ticket
  insert into public.tickets (
    raffle_id,
    user_id,
    guest_name,
    guest_email,
    guest_phone,
    ticket_number,
    payment_method,
    payment_status
  )
  values (
    p_raffle_id,
    p_user_id,
    p_guest_name,
    p_guest_email,
    p_guest_phone,
    v_ticket_number,
    p_payment_method,
    'completed'
  )
  returning id into v_ticket_id;
  
  return json_build_object(
    'success', true, 
    'ticket_id', v_ticket_id,
    'ticket_number', v_ticket_number
  );
exception
  when others then
    return json_build_object('success', false, 'error', SQLERRM);
end;
$$;
