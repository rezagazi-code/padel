-- PadelPro backend v1 — Row Level Security, helper functions, triggers
-- Roles: super_admin (Lucka only — set manually), club_admin (one per club), user.

alter table profiles enable row level security;
alter table clubs enable row level security;
alter table courts enable row level security;
alter table bookings enable row level security;
alter table open_matches enable row level security;
alter table need_player_posts enable row level security;
alter table coaches enable row level security;
alter table coach_bookings enable row level security;
alter table tournaments enable row level security;
alter table tournament_teams enable row level security;

-- ============ Helper functions (SECURITY DEFINER, no RLS recursion) ============

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin');
$$;

create or replace function public.is_club_admin_of(p_club_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.clubs where id = p_club_id and admin_id = auth.uid());
$$;

-- ============ Auto-create profile on signup ============

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ Prevent role self-escalation ============

create or replace function public.protect_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_super_admin() then
    raise exception 'Only a super admin can change user roles.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_role_change_trg on public.profiles;
create trigger protect_role_change_trg
  before update of role on public.profiles
  for each row execute function public.protect_role_change();

-- ============ updated_at ============

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ============ profiles ============
-- Everyone can read (matchmaking needs discovery). Users manage only their own row.

drop policy if exists "profiles_select_all" on profiles;
create policy "profiles_select_all" on profiles for select using (true);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles for insert
  with check (id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on profiles;
create policy "profiles_update_own_or_admin" on profiles for update
  using (id = auth.uid() or public.is_super_admin())
  with check (id = auth.uid() or public.is_super_admin());

drop policy if exists "profiles_delete_admin" on profiles;
create policy "profiles_delete_admin" on profiles for delete
  using (public.is_super_admin());

-- ============ clubs ============
-- Public read. Only super_admin creates clubs and assigns the club admin.

drop policy if exists "clubs_select_all" on clubs;
create policy "clubs_select_all" on clubs for select using (true);

drop policy if exists "clubs_insert_admin" on clubs;
create policy "clubs_insert_admin" on clubs for insert
  with check (public.is_super_admin());

drop policy if exists "clubs_update_admin_or_owner" on clubs;
create policy "clubs_update_admin_or_owner" on clubs for update
  using (public.is_super_admin() or admin_id = auth.uid());

drop policy if exists "clubs_delete_admin" on clubs;
create policy "clubs_delete_admin" on clubs for delete
  using (public.is_super_admin());

-- ============ courts ============

drop policy if exists "courts_select_all" on courts;
create policy "courts_select_all" on courts for select using (true);

drop policy if exists "courts_write_club_admin" on courts;
create policy "courts_write_club_admin" on courts for all
  using (public.is_super_admin() or public.is_club_admin_of(club_id))
  with check (public.is_super_admin() or public.is_club_admin_of(club_id));

-- ============ bookings ============
-- Public read (availability). Authenticated users book for themselves.
-- The UNIQUE(court_id, date, time_slot) constraint blocks double booking atomically.

drop policy if exists "bookings_select_all" on bookings;
create policy "bookings_select_all" on bookings for select using (true);

drop policy if exists "bookings_insert_self" on bookings;
create policy "bookings_insert_self" on bookings for insert
  with check (auth.uid() is not null and booked_by = auth.uid());

drop policy if exists "bookings_update_owner_or_club" on bookings;
create policy "bookings_update_owner_or_club" on bookings for update
  using (booked_by = auth.uid() or public.is_super_admin() or public.is_club_admin_of(club_id));

drop policy if exists "bookings_delete_owner_or_club" on bookings;
create policy "bookings_delete_owner_or_club" on bookings for delete
  using (booked_by = auth.uid() or public.is_super_admin() or public.is_club_admin_of(club_id));

-- ============ open_matches ============
-- Public read. Creator manages; joining/leaving goes through secure functions.

drop policy if exists "open_matches_select_all" on open_matches;
create policy "open_matches_select_all" on open_matches for select using (true);

drop policy if exists "open_matches_insert_creator" on open_matches;
create policy "open_matches_insert_creator" on open_matches for insert
  with check (auth.uid() is not null and creator_id = auth.uid());

drop policy if exists "open_matches_update_creator" on open_matches;
create policy "open_matches_update_creator" on open_matches for update
  using (creator_id = auth.uid() or public.is_super_admin());

drop policy if exists "open_matches_delete_creator" on open_matches;
create policy "open_matches_delete_creator" on open_matches for delete
  using (creator_id = auth.uid() or public.is_super_admin());

-- Secure join/leave: atomic slot claim, no griefing.

create or replace function public.join_open_match(p_match_id uuid, p_slot int)
returns void language plpgsql security definer set search_path = public as $$
declare
  m record; s jsonb; me record;
begin
  select * into m from public.open_matches where id = p_match_id for update;
  if not found then raise exception 'Match not found.'; end if;
  if m.status <> 'open' then raise exception 'Match is not open.'; end if;
  select * into me from public.profiles where id = auth.uid();
  if not found then raise exception 'Profile not found.'; end if;
  if me.level < m.min_level or me.level > m.max_level then
    raise exception 'Your level is outside this match range.';
  end if;
  for s in select jsonb_array_elements(m.slots) loop
    if (s ->> 'slotNumber')::int = p_slot then
      if s ? 'playerId' and (s ->> 'playerId') <> '' then
        raise exception 'Slot already taken.';
      end if;
    end if;
    if s ->> 'playerId' = auth.uid()::text then
      raise exception 'You already joined this match.';
    end if;
  end loop;
  update public.open_matches
  set slots = (
    select jsonb_agg(
      case when (s ->> 'slotNumber')::int = p_slot then
        s || jsonb_build_object(
          'playerId', auth.uid()::text,
          'playerName', me.name,
          'playerAvatar', me.avatar_url,
          'playerLevel', me.level)
      else s end)
    from jsonb_array_elements(m.slots) s)
  where id = p_match_id;
end;
$$;

create or replace function public.leave_open_match(p_match_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare m record;
begin
  select * into m from public.open_matches where id = p_match_id for update;
  if not found then raise exception 'Match not found.'; end if;
  if m.status <> 'open' then raise exception 'Match is not open.'; end if;
  update public.open_matches
  set slots = (
    select jsonb_agg(
      case when s ->> 'playerId' = auth.uid()::text then
        s - 'playerId' - 'playerName' - 'playerAvatar' - 'playerLevel'
      else s end)
    from jsonb_array_elements(m.slots) s)
  where id = p_match_id;
end;
$$;

-- ============ need_player_posts ============

drop policy if exists "need_posts_select_all" on need_player_posts;
create policy "need_posts_select_all" on need_player_posts for select using (true);

drop policy if exists "need_posts_insert_host" on need_player_posts;
create policy "need_posts_insert_host" on need_player_posts for insert
  with check (auth.uid() is not null and host_id = auth.uid());

drop policy if exists "need_posts_update_host" on need_player_posts;
create policy "need_posts_update_host" on need_player_posts for update
  using (host_id = auth.uid() or public.is_super_admin());

drop policy if exists "need_posts_delete_host" on need_player_posts;
create policy "need_posts_delete_host" on need_player_posts for delete
  using (host_id = auth.uid() or public.is_super_admin());

create or replace function public.join_need_post(p_post_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare p record; me record;
begin
  select * into p from public.need_player_posts where id = p_post_id for update;
  if not found then raise exception 'Post not found.'; end if;
  if p.status <> 'active' then raise exception 'Post is not active.'; end if;
  if jsonb_array_length(p.joined_players) >= p.spots_needed then
    raise exception 'No spots left.';
  end if;
  select * into me from public.profiles where id = auth.uid();
  update public.need_player_posts
  set joined_players = p.joined_players || jsonb_build_object(
      'playerId', auth.uid()::text,
      'playerName', me.name,
      'avatar', me.avatar_url,
      'level', me.level,
      'side', me.preferred_side),
    status = case when jsonb_array_length(p.joined_players) + 1 >= p.spots_needed
      then 'filled' else 'active' end
  where id = p_post_id;
end;
$$;

-- ============ coaches ============

drop policy if exists "coaches_select_all" on coaches;
create policy "coaches_select_all" on coaches for select using (true);

drop policy if exists "coaches_write_admin_or_self" on coaches;
create policy "coaches_write_admin_or_self" on coaches for all
  using (public.is_super_admin() or profile_id = auth.uid())
  with check (public.is_super_admin() or profile_id = auth.uid());

-- ============ coach_bookings ============

drop policy if exists "coach_bookings_select_parties" on coach_bookings;
create policy "coach_bookings_select_parties" on coach_bookings for select
  using (player_id = auth.uid()
    or public.is_super_admin()
    or exists (select 1 from public.coaches c where c.id = coach_id and c.profile_id = auth.uid()));

drop policy if exists "coach_bookings_insert_player" on coach_bookings;
create policy "coach_bookings_insert_player" on coach_bookings for insert
  with check (auth.uid() is not null and player_id = auth.uid());

drop policy if exists "coach_bookings_update_parties" on coach_bookings;
create policy "coach_bookings_update_parties" on coach_bookings for update
  using (player_id = auth.uid()
    or public.is_super_admin()
    or exists (select 1 from public.coaches c where c.id = coach_id and c.profile_id = auth.uid()));

-- ============ tournaments ============
-- Public read. Official tournaments: only a club_admin for THEIR club.
-- Friendly (matchmaking) tournaments: any signed-in user.

drop policy if exists "tournaments_select_all" on tournaments;
create policy "tournaments_select_all" on tournaments for select using (true);

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
      or public.is_super_admin()
    )
  );

drop policy if exists "tournaments_update_organizer" on tournaments;
create policy "tournaments_update_organizer" on tournaments for update
  using (organizer_id = auth.uid()
    or public.is_super_admin()
    or (organizer_type = 'official' and club_id is not null and public.is_club_admin_of(club_id)));

drop policy if exists "tournaments_delete_organizer" on tournaments;
create policy "tournaments_delete_organizer" on tournaments for delete
  using (organizer_id = auth.uid() or public.is_super_admin());

-- ============ tournament_teams ============

drop policy if exists "tournament_teams_select_all" on tournament_teams;
create policy "tournament_teams_select_all" on tournament_teams for select using (true);

drop policy if exists "tournament_teams_insert_open" on tournament_teams;
create policy "tournament_teams_insert_open" on tournament_teams for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from public.tournaments t
                where t.id = tournament_id and t.status = 'registration')
  );

drop policy if exists "tournament_teams_delete_parties" on tournament_teams;
create policy "tournament_teams_delete_parties" on tournament_teams for delete
  using (player1_id = auth.uid() or player2_id = auth.uid()
    or public.is_super_admin()
    or exists (select 1 from public.tournaments t
                where t.id = tournament_id and t.organizer_id = auth.uid()));
