-- Migration 0011: let province admins update tournaments in their province.
-- Reza: run once in Supabase SQL Editor. Safe to re-run (idempotent).
--
-- Background: the app gives a province_admin the manage UI for any
-- tournament in their own province, but the RLS UPDATE policy only allowed
-- organizer_id / super_admin / linked club_admin — so finalize and bracket
-- results were silently denied server-side (local UI showed success, the
-- next reload reverted the data). This grants UPDATE on tournaments in
-- the admin's own province.

-- (1) Extend the role enum.
alter type public.user_role add value if not exists 'province_admin';

-- (2) Record which province a province admin manages.
alter table public.profiles add column if not exists admin_province text not null default '';

-- (3) Helper: is the caller a province admin of this province?
create or replace function public.is_province_admin_of(p_province text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'province_admin'
      and admin_province = p_province
  );
$$;

-- (4) Rebuild the tournaments UPDATE policy with the province-admin grant.
drop policy if exists "tournaments_update_organizer" on tournaments;
create policy "tournaments_update_organizer" on tournaments for update
  using (
    organizer_id = auth.uid()
    or public.is_super_admin()
    or (organizer_type = 'official' and club_id is not null and public.is_club_admin_of(club_id))
    or public.is_province_admin_of(province)
  );
