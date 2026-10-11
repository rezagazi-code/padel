-- =============================================================================
-- 0009_booking_overlap_guard.sql
-- رضا: این مایگریشن را یک‌بار در Supabase SQL Editor اجرا کنید (مثل 0008).
-- =============================================================================
-- Server-side guard against overlapping bookings.
-- The bookings table keys bookings on (court_id, date, time_slot text), where
-- time_slot looks like «۱۸:۰۰ - ۱۹:۳۰» with Persian digits. The unique
-- constraint only catches identical time_slot strings — it does NOT catch two
-- bookings whose intervals overlap (e.g. a 120-min booking «۱۸:۰۰ - ۲۰:۰۰»
-- and a 90-min booking «۱۹:۰۰ - ۲۰:۳۰» on the same court/day).
-- The v3.11.1 client-side guard can't catch two users booking concurrently,
-- so this BEFORE INSERT OR UPDATE trigger rejects overlaps server-side.
-- Intervals are half-open [start, end): exact adjacency is allowed.
-- =============================================================================

-- Convert Persian/Arabic digits to Latin in a text value.
create or replace function public.fa_digits_to_latin(s text)
returns text
language sql
immutable
as $$
  select translate(
    s,
    '۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩',
    '01234567890123456789'
  );
$$;

-- Parse the START of a time_slot (e.g. «۱۸:۰۰ - ۱۹:۳۰») to minutes since
-- midnight. Returns NULL when the slot cannot be parsed, so legacy or
-- hand-entered rows never block other writes.
create or replace function public.booking_slot_start_minutes(slot text)
returns int
language plpgsql
immutable
as $$
declare
  lat text;
  m text[];
begin
  lat := public.fa_digits_to_latin(slot);
  m := regexp_match(lat, '^\s*(\d{1,2})\s*:\s*(\d{2})');
  if m is null then
    return null;
  end if;
  if m[1]::int > 23 or m[2]::int > 59 then
    return null;
  end if;
  return m[1]::int * 60 + m[2]::int;
end;
$$;

create or replace function public.bookings_overlap_guard()
returns trigger
language plpgsql
as $$
declare
  new_start int;
  new_end int;
  conflict_id uuid;
begin
  new_start := public.booking_slot_start_minutes(NEW.time_slot);
  if new_start is null then
    -- Unparseable slot: keep the row writable; the client guard handles UI.
    return NEW;
  end if;
  new_end := new_start + coalesce(NEW.duration_minutes, 90);

  select b.id into conflict_id
  from public.bookings b
  where b.court_id = NEW.court_id
    and b.date = NEW.date
    and (TG_OP = 'INSERT' or b.id <> NEW.id)
    and public.booking_slot_start_minutes(b.time_slot) is not null
    and public.booking_slot_start_minutes(b.time_slot) < new_end
    and (public.booking_slot_start_minutes(b.time_slot)
         + coalesce(b.duration_minutes, 90)) > new_start
  limit 1;

  if conflict_id is not null then
    raise exception 'تداخل رزرو: این سانس با رزرو دیگری روی همین زمین هم‌پوشانی دارد.'
      using errcode = 'P0001';
  end if;

  return NEW;
end;
$$;

drop trigger if exists bookings_overlap_guard_trigger on public.bookings;

create trigger bookings_overlap_guard_trigger
  before insert or update of court_id, date, time_slot, duration_minutes
  on public.bookings
  for each row
  execute function public.bookings_overlap_guard();

-- =============================================================================
-- Data fix for 0008 rename (v3.11.3): club-teh-courtina was inserted as
-- «کورتیتا»; the canonical spelling (matching the club's own address listing
-- «مجموعه کورتینا» and IG @playatcourtina) is «کورتینا». 0008 itself is now
-- id-based so re-running it inserts «کورتینا»; this UPDATE repairs rows that
-- were inserted by the earlier name-based 0008, so the bundled club (id OR
-- name merge) doesn't appear twice.
-- =============================================================================
update public.clubs
set name = 'کورتینا',
    owner_name = 'مدیریت باشگاه کورتینا'
where name = 'کورتیتا';
