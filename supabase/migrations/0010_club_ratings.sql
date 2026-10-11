-- Migration 0010: player ratings for clubs.
-- Reza: run once in Supabase SQL Editor. Safe to re-run.
-- Players rate clubs 1-5 (one rating per player per club); a trigger keeps
-- clubs.rating (avg, 1 decimal) and clubs.review_count live, so the club
-- ranking shown in the app comes from real player votes.

create table if not exists public.club_ratings (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (club_id, user_id)
);

alter table public.club_ratings enable row level security;

drop policy if exists "club_ratings_select_all" on public.club_ratings;
create policy "club_ratings_select_all"
  on public.club_ratings for select using (true);

drop policy if exists "club_ratings_insert_own" on public.club_ratings;
create policy "club_ratings_insert_own"
  on public.club_ratings for insert
  with check (auth.uid() = user_id);

drop policy if exists "club_ratings_update_own" on public.club_ratings;
create policy "club_ratings_update_own"
  on public.club_ratings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep clubs.rating / clubs.review_count in sync with player votes.
create or replace function public.refresh_club_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_club uuid;
begin
  target_club := coalesce(new.club_id, old.club_id);
  update public.clubs
  set rating = coalesce(
      (select round(avg(rating)::numeric, 1) from public.club_ratings where club_id = target_club),
      5.0
    ),
    review_count = coalesce(
      (select count(*) from public.club_ratings where club_id = target_club),
      0
    )
  where id = target_club;
  return coalesce(new, old);
end;
$$;

drop trigger if exists club_ratings_refresh on public.club_ratings;
create trigger club_ratings_refresh
  after insert or update or delete on public.club_ratings
  for each row execute function public.refresh_club_rating();
