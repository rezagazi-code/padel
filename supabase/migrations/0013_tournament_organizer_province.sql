-- Migration 0013: add 'province' to organizer_type so province-admin
-- tournaments keep their «ادمین هیات استان» label after reload.
-- Reza: run in TWO steps in the Supabase SQL Editor (do NOT paste the whole
-- file at once). IMPORTANT: run AFTER migration 0011 (it uses the
-- public.is_province_admin_of() helper created there).
--
-- STEP 1 — run ONLY this one statement, alone:
--     alter type public.organizer_type add value if not exists 'province';
-- (ALTER TYPE ... ADD VALUE cannot run inside a transaction block, and the
-- SQL Editor wraps a pasted multi-statement script in one — so it must go
-- first, as a standalone statement. Safe to re-run.)
--
-- STEP 2 — after STEP 1 succeeds, paste everything BELOW the "STEP 2"
-- marker into the SQL Editor and run it. Safe to re-run (idempotent).
--
-- Background: TournamentsView passes organizerType 'province' for
-- province-admin creations, but the organizer_type enum only had
-- 'official'/'friendly' — so the insert fell back to 'official' and the
-- label vanished on reload. The app retries with 'official' while this
-- migration is still pending, so current behavior is preserved.

-- ============ STEP 2 starts here ============

-- (1) Rebuild the tournaments INSERT policy with the province-admin grant
--     (existing branches copied verbatim from 0002_rls.sql).
drop policy if exists "tournaments_insert_rules" on tournaments;
create policy "tournaments_insert_rules" on tournaments for insert
  with check (
    auth.uid() is not null
    and organizer_id = auth.uid()
    and (
      organizer_type = 'friendly'
      or (organizer_type = 'official'
          and club_id is not null
          and public.is_club_admin_of(club_id))
      or (organizer_type = 'province'
          and public.is_province_admin_of(province))
      or public.is_super_admin()
    )
  );
