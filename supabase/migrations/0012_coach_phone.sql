-- Migration 0012: add coach contact phone number.
-- Reza: paste into the Supabase SQL Editor and press Run. Safe to re-run
-- (idempotent). Until this runs, the app retries coach inserts without the
-- phone column, so nothing breaks — the phone just isn't persisted remotely.
alter table public.coaches
  add column if not exists phone text not null default '';
