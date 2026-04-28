-- Script para corregir las políticas de tickets para admins
-- El problema es que el admin no puede actualizar ni eliminar tickets

-- Eliminar políticas existentes de tickets
drop policy if exists "Users can view own tickets" on public.tickets;
drop policy if exists "Admins can view all tickets" on public.tickets;
drop policy if exists "Users can insert tickets" on public.tickets;
drop policy if exists "Admins can update tickets" on public.tickets;
drop policy if exists "Admins can delete tickets" on public.tickets;
drop policy if exists "Anyone can insert tickets" on public.tickets;
drop policy if exists "Service role can manage tickets" on public.tickets;

-- Recrear políticas de tickets correctamente
-- Política para ver tickets
create policy "Users can view own tickets"
  on public.tickets for select
  using (auth.uid() = user_id OR guest_email IS NOT NULL);

create policy "Admins can view all tickets"
  on public.tickets for select
  using (public.is_admin());

-- Política para insertar tickets (cualquiera puede comprar)
create policy "Anyone can insert tickets"
  on public.tickets for insert
  with check (true);

-- Política para que admins puedan ACTUALIZAR tickets
create policy "Admins can update tickets"
  on public.tickets for update
  using (public.is_admin());

-- Política para que admins puedan ELIMINAR tickets
create policy "Admins can delete tickets"
  on public.tickets for delete
  using (public.is_admin());

-- También asegurar que el admin pueda manejar bank_accounts
drop policy if exists "Admins can manage bank accounts" on public.bank_accounts;
drop policy if exists "Everyone can view active bank accounts" on public.bank_accounts;

create policy "Admins can manage bank accounts"
  on public.bank_accounts for all
  using (public.is_admin());

create policy "Everyone can view active bank accounts"
  on public.bank_accounts for select
  using (is_active = true);
