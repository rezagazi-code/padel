-- PadelPro backend v1 — schema, roles, RLS, triggers, functions
-- Run this in the Supabase SQL editor (or via psql with the service role).

-- ============ Extensions ============
create extension if not exists "pgcrypto";

-- ============ Enums ============
do $$ begin
  create type user_role as enum ('super_admin', 'club_admin', 'user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_payment_status as enum ('paid', 'pending', 'split_active');
exception when duplicate_object then null; end $$;

do $$ begin
  create type open_match_status as enum ('open', 'full', 'in_progress', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tournament_status as enum ('registration', 'ongoing', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type organizer_type as enum ('official', 'friendly');
exception when duplicate_object then null; end $$;

-- ============ Tables ============

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  avatar_url text not null default '',
  theme_color text not null default '#ff2d55',
  role user_role not null default 'user',
  level numeric(3,2) not null default 3.00 check (level >= 1 and level <= 7),
  hand text not null default 'right',
  preferred_side text not null default 'both',
  racket_brand text not null default '',
  racket_model text not null default '',
  province text not null default '',
  city text not null default '',
  phone text not null default '',
  bio text not null default '',
  reliability_score int not null default 100,
  ranking_points int not null default 0,
  is_free_agent boolean not null default false,
  free_agent_note text not null default '',
  available_days text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  province text not null default '',
  city text not null default '',
  address text not null default '',
  phone text not null default '',
  cover_image text not null default '',
  gallery_images text[] not null default '{}',
  rating numeric(2,1) not null default 5.0,
  review_count int not null default 0,
  amenities text[] not null default '{}',
  opening_hour text not null default '07:00',
  closing_hour text not null default '24:00',
  owner_name text not null default '',
  owner_phone text not null default '',
  -- exactly one admin per club: unique keeps an admin on at most one club
  admin_id uuid unique references profiles(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists courts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  name text not null,
  court_number int not null default 1,
  type text not null default 'panoramic',
  surface text not null default 'Mondo Supercourt 4NX',
  turf_color text not null default '',
  hourly_rate bigint not null default 0,
  peak_hourly_rate bigint not null default 0,
  is_available boolean not null default true,
  has_lighting boolean not null default false,
  has_cameras boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  court_id uuid not null references courts(id) on delete cascade,
  date date not null,
  time_slot text not null,
  duration_minutes int not null default 90,
  total_price bigint not null default 0,
  payment_status booking_payment_status not null default 'pending',
  booked_by uuid references profiles(id) on delete set null,
  players_needed int not null default 0,
  created_at timestamptz not null default now(),
  -- atomic double-booking protection
  unique (court_id, date, time_slot)
);
create index if not exists bookings_court_date_idx on bookings (court_id, date);

create table if not exists open_matches (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  club_id uuid references clubs(id) on delete set null,
  club_name text not null default '',
  court_name text not null default '',
  date date not null,
  time text not null default '',
  type text not null default 'friendly',
  min_level numeric(3,2) not null default 1,
  max_level numeric(3,2) not null default 7,
  price_per_player bigint not null default 0,
  gender text not null default 'all',
  creator_id uuid references profiles(id) on delete set null,
  status open_match_status not null default 'open',
  slots jsonb not null default '[]',
  result jsonb,
  created_at timestamptz not null default now()
);

create table if not exists need_player_posts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete set null,
  club_name text not null default '',
  province text not null default '',
  date date,
  time text not null default '',
  spots_needed int not null default 1,
  preferred_side text not null default 'both',
  min_level numeric(3,2) not null default 1,
  max_level numeric(3,2) not null default 7,
  cost_per_person bigint not null default 0,
  host_id uuid references profiles(id) on delete set null,
  note text not null default '',
  joined_players jsonb not null default '[]',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists coaches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  name text not null,
  avatar_url text not null default '',
  title text not null default '',
  fip_certification text not null default '',
  experience_years int not null default 0,
  rating numeric(2,1) not null default 5.0,
  reviews_count int not null default 0,
  province text not null default '',
  club_names text[] not null default '{}',
  hourly_rate bigint not null default 0,
  bio text not null default '',
  specialties text[] not null default '{}',
  available_days text[] not null default '{}',
  available_hours text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists coach_bookings (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id) on delete cascade,
  club_name text not null default '',
  date date not null,
  time text not null,
  session_type text not null default '1-on-1',
  price bigint not null default 0,
  player_id uuid references profiles(id) on delete set null,
  player_name text not null default '',
  player_phone text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  club_id uuid references clubs(id) on delete set null,
  club_name text not null default '',
  province text not null default '',
  category text not null default 'Open',
  format text not null default 'Knockout (تک‌حذفی)',
  start_date date,
  end_date date,
  registration_deadline date,
  entry_fee bigint not null default 0,
  prize_pool text not null default '',
  max_teams int not null default 16,
  level_range text not null default '',
  status tournament_status not null default 'registration',
  banner_image text not null default '',
  rules text[] not null default '{}',
  organizer_type organizer_type not null default 'friendly',
  organizer_id uuid references profiles(id) on delete set null,
  winner_team text not null default '',
  runner_up_team text not null default '',
  bracket jsonb,
  created_at timestamptz not null default now()
);

create table if not exists tournament_teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  team_name text not null,
  player1_id uuid references profiles(id) on delete set null,
  player1_name text not null default '',
  player1_level numeric(3,2) not null default 3,
  player2_id uuid references profiles(id) on delete set null,
  player2_name text not null default '',
  player2_level numeric(3,2) not null default 3,
  points_won int not null default 0,
  created_at timestamptz not null default now(),
  unique (tournament_id, team_name)
);
