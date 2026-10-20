// Data-access layer for the Supabase backend.
// Every function returns app-domain types (src/types.ts). The app keeps
// working on local mock data when Supabase is not configured.
import { getSupabase } from './supabase';
import type {
  Booking, Club, Coach, Court, Tournament, TournamentCategory, TournamentFormat,
} from '../types';

type Row = Record<string, any>;

function mapCourt(r: Row): Court {
  return {
    id: String(r.id),
    clubId: String(r.club_id),
    name: r.name ?? '',
    courtNumber: Number(r.court_number ?? 1),
    type: r.type ?? 'panoramic',
    surface: r.surface ?? 'Mondo Supercourt 4NX',
    turfColor: r.turf_color ?? '',
    hourlyRate: Number(r.hourly_rate ?? 0),
    peakHourlyRate: Number(r.peak_hourly_rate ?? 0),
    isAvailable: r.is_available !== false,
    hasLighting: !!r.has_lighting,
    hasCameras: !!r.has_cameras,
  };
}

function mapClub(r: Row, courts: Row[]): Club {
  return {
    id: String(r.id),
    name: r.name ?? '',
    province: r.province ?? '',
    city: r.city ?? '',
    address: r.address ?? '',
    phone: r.phone ?? '',
    coverImage: r.cover_image ?? '',
    galleryImages: r.gallery_images ?? [],
    rating: Number(r.rating ?? 5),
    reviewCount: Number(r.review_count ?? 0),
    courtsCount: courts.length,
    courts: courts.map(mapCourt),
    amenities: r.amenities ?? [],
    openingHour: r.opening_hour ?? '07:00',
    closingHour: r.closing_hour ?? '24:00',
    ownerName: r.owner_name ?? '',
    ownerPhone: r.owner_phone ?? '',
  };
}

export async function fetchClubs(): Promise<Club[]> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  const { data: clubs, error } = await sb.from('clubs').select('*').order('name');
  if (error) throw error;
  const { data: courts, error: cErr } = await sb.from('courts').select('*').order('court_number');
  if (cErr) throw cErr;
  const byClub = new Map<string, Row[]>();
  for (const c of courts ?? []) {
    const k = String(c.club_id);
    if (!byClub.has(k)) byClub.set(k, []);
    byClub.get(k)!.push(c);
  }
  return (clubs ?? []).map((r) => mapClub(r, byClub.get(String(r.id)) ?? []));
}

function mapBooking(r: Row): Booking {
  return {
    id: String(r.id),
    clubId: String(r.club_id),
    clubName: r.club_name ?? '',
    courtId: String(r.court_id),
    courtName: r.court_name ?? '',
    date: r.date ?? '',
    timeSlot: r.time_slot ?? '',
    durationMinutes: Number(r.duration_minutes ?? 90),
    totalPrice: Number(r.total_price ?? 0),
    splitPricePerPerson: Math.round(Number(r.total_price ?? 0) / 4),
    paymentStatus: r.payment_status ?? 'pending',
    bookedByPlayerId: r.booked_by ? String(r.booked_by) : '',
    bookedByPlayerName: '',
    playersNeeded: Number(r.players_needed ?? 0),
    createdAt: r.created_at ?? new Date().toISOString(),
  };
}

export async function fetchMyBookings(userId: string): Promise<Booking[]> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  // Join club/court names for display.
  const { data, error } = await sb
    .from('bookings')
    .select('*, clubs(name), courts(name)')
    .eq('booked_by', userId)
    .order('date', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map((r: Row) => ({
    ...mapBooking(r),
    clubName: r.clubs?.name ?? '',
    courtName: r.courts?.name ?? '',
  }));
}

// Public availability: time slots already booked for a court on a given date
// (YYYY-MM-DD). The bookings_select_all RLS policy permits public SELECT,
// so any visitor can see real availability without signing in.
export interface BookedInterval {
  timeSlot: string;
  durationMinutes: number;
}

// Bookings for a court+date, with their durations, so the caller can compute
// real availability from [start, start + durationMinutes) intervals instead
// of matching exact slot strings.
export async function fetchBookedIntervals(
  courtId: string,
  dateISO: string
): Promise<BookedInterval[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('bookings')
    .select('time_slot, duration_minutes')
    .eq('court_id', courtId)
    .eq('date', dateISO);
  if (error) throw error;
  return (data ?? []).map((r: Row) => ({
    timeSlot: String(r.time_slot),
    durationMinutes: Number(r.duration_minutes ?? 90) || 90,
  }));
}

// Patch for the signed-in user's own profiles row. Only non-privileged
// columns are allowed here (role changes are blocked by DB trigger/RLS).
export interface ProfilePatch {
  name?: string;
  avatar_url?: string;
  theme_color?: string;
  level?: number;
  hand?: string;
  preferred_side?: string;
  racket_brand?: string;
  racket_model?: string;
  province?: string;
  city?: string;
  phone?: string;
  bio?: string;
  is_free_agent?: boolean;
}

export async function updateMyProfile(userId: string, patch: ProfilePatch): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

export interface BookingInput {
  clubId: string;
  courtId: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  totalPrice: number;
  paymentStatus: 'paid' | 'pending' | 'split_active';
  playersNeeded: number;
}

export const DOUBLE_BOOKED = 'DOUBLE_BOOKED';

export async function insertBooking(input: BookingInput, userId: string): Promise<Booking> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  const { data, error } = await sb
    .from('bookings')
    .insert({
      club_id: input.clubId,
      court_id: input.courtId,
      date: input.date,
      time_slot: input.timeSlot,
      duration_minutes: input.durationMinutes,
      total_price: input.totalPrice,
      payment_status: input.paymentStatus,
      booked_by: userId,
      players_needed: input.playersNeeded,
    })
    .select('*, clubs!inner(name), courts!inner(name)')
    .single();
  if (error) {
    // 23505 = unique violation on (court_id, date, time_slot);
    // P0001 = booking-overlap-guard trigger (migration 0009) — both mean the
    // slot was taken by someone else in a concurrent race.
    if ((error as any).code === '23505' || (error as any).code === 'P0001') throw new Error(DOUBLE_BOOKED);
    throw error;
  }
  return {
    ...mapBooking(data),
    clubName: data.clubs?.name ?? '',
    courtName: data.courts?.name ?? '',
  };
}

function mapTournament(r: Row, teams: Row[]): Tournament {
  return {
    id: String(r.id),
    title: r.title ?? '',
    clubId: r.club_id ? String(r.club_id) : '',
    clubName: r.club_name ?? '',
    province: r.province ?? '',
    category: (r.category ?? 'Open') as TournamentCategory,
    format: (r.format ?? 'Knockout (تک‌حذفی)') as TournamentFormat,
    startDate: r.start_date ?? '',
    endDate: r.end_date ?? '',
    registrationDeadline: r.registration_deadline ?? '',
    entryFee: Number(r.entry_fee ?? 0),
    prizePool: r.prize_pool ?? '',
    maxTeams: Number(r.max_teams ?? 16),
    registeredTeamsCount: teams.length,
    levelRange: r.level_range ?? '',
    status: r.status ?? 'registration',
    bannerImage: r.banner_image ?? '',
    rules: r.rules ?? [],
    registeredTeams: teams.map((t) => ({
      id: String(t.id),
      teamName: t.team_name ?? '',
      player1Name: t.player1_name ?? '',
      player1Level: Number(t.player1_level ?? 3),
      player2Name: t.player2_name ?? '',
      player2Level: Number(t.player2_level ?? 3),
      pointsWon: Number(t.points_won ?? 0),
    })),
    winnerTeam: r.winner_team || undefined,
    runnerUpTeam: r.runner_up_team || undefined,
    organizerType: r.organizer_type === 'province' ? 'province' : r.organizer_type === 'official' ? 'club' : undefined,
    bracket: r.bracket ?? undefined,
  };
}

export async function fetchTournaments(): Promise<Tournament[]> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  const { data: tournaments, error } = await sb
    .from('tournaments')
    .select('*')
    .order('start_date', { ascending: true });
  if (error) throw error;
  const { data: teams, error: tErr } = await sb.from('tournament_teams').select('*');
  if (tErr) throw tErr;
  const byTournament = new Map<string, Row[]>();
  for (const t of teams ?? []) {
    const k = String(t.tournament_id);
    if (!byTournament.has(k)) byTournament.set(k, []);
    byTournament.get(k)!.push(t);
  }
  return (tournaments ?? []).map((r) => mapTournament(r, byTournament.get(String(r.id)) ?? []));
}

export interface TournamentTeamInput {
  tournamentId: string;
  teamName: string;
  player1Id: string | null;
  player1Name: string;
  player1Level: number;
  player2Id?: string | null;
  player2Name: string;
  player2Level: number;
}

export async function insertTournamentTeam(input: TournamentTeamInput): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  const { error } = await sb.from('tournament_teams').insert({
    tournament_id: input.tournamentId,
    team_name: input.teamName,
    player1_id: input.player1Id,
    player1_name: input.player1Name,
    player1_level: input.player1Level,
    player2_id: input.player2Id ?? null,
    player2_name: input.player2Name,
    player2_level: input.player2Level,
  });
  if (error) throw error;
}

// ============ Manager v2: clubs, courts, tournaments, booking admin ============
// RLS: clubs insert/update/delete = super_admin; courts write = super_admin or
// the club's own admin; tournaments insert/update/delete = super_admin (or the
// organizer); bookings delete = owner, super_admin or the club's admin.

export interface ClubInput {
  name: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  coverImage: string;
  galleryImages: string[];
  amenities: string[];
  openingHour: string;
  closingHour: string;
  ownerName: string;
  ownerPhone: string;
}

export async function insertClub(input: ClubInput, userId: string): Promise<Club> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  const { data, error } = await sb
    .from('clubs')
    .insert({
      name: input.name,
      province: input.province,
      city: input.city,
      address: input.address,
      phone: input.phone,
      cover_image: input.coverImage,
      gallery_images: input.galleryImages,
      amenities: input.amenities,
      opening_hour: input.openingHour,
      closing_hour: input.closingHour,
      owner_name: input.ownerName,
      owner_phone: input.ownerPhone,
      created_by: userId,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapClub(data, []);
}

export interface CourtInput {
  name: string;
  courtNumber: number;
  type: string;
  surface: string;
  turfColor: string;
  hourlyRate: number;
  peakHourlyRate: number;
  hasLighting: boolean;
  hasCameras: boolean;
}

export async function insertCourt(clubId: string, input: CourtInput): Promise<Court> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  const { data, error } = await sb
    .from('courts')
    .insert({
      club_id: clubId,
      name: input.name,
      court_number: input.courtNumber,
      type: input.type,
      surface: input.surface,
      turf_color: input.turfColor,
      hourly_rate: input.hourlyRate,
      peak_hourly_rate: input.peakHourlyRate,
      has_lighting: input.hasLighting,
      has_cameras: input.hasCameras,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapCourt(data);
}

export interface TournamentInput {
  title: string;
  clubId: string;
  clubName: string;
  province: string;
  category: string;
  format: string;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string; // ISO YYYY-MM-DD
  registrationDeadline: string; // ISO YYYY-MM-DD
  entryFee: number;
  prizePool: string;
  maxTeams: number;
  levelRange: string;
  bannerImage: string;
  rules: string[];
  official: boolean;
  organizerType?: 'club' | 'province'; // 'province' needs migration 0013 on the DB
}

export async function insertTournament(input: TournamentInput, userId: string): Promise<Tournament> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  // 'province' enum value only exists after migration 0013 is run — when it
  // is still pending, Postgres rejects the insert with 22P02 and we retry
  // once with 'official' so current behavior is preserved.
  const organizerType =
    input.organizerType === 'province' ? 'province' : input.official ? 'official' : 'friendly';
  const payload = {
    title: input.title,
    club_id: input.clubId || null,
    club_name: input.clubName,
    province: input.province,
    category: input.category,
    format: input.format,
    start_date: input.startDate || null,
    end_date: input.endDate || null,
    registration_deadline: input.registrationDeadline || null,
    entry_fee: input.entryFee,
    prize_pool: input.prizePool,
    max_teams: input.maxTeams,
    level_range: input.levelRange,
    banner_image: input.bannerImage,
    rules: input.rules,
    organizer_type: organizerType,
    organizer_id: userId,
  };
  try {
    const { data, error } = await sb.from('tournaments').insert(payload).select('*').single();
    if (error) throw error;
    return mapTournament(data, []);
  } catch (e: any) {
    if (organizerType === 'province' && String(e?.code) === '22P02') {
      const { data, error } = await sb
        .from('tournaments')
        .insert({ ...payload, organizer_type: 'official' })
        .select('*')
        .single();
      if (error) throw error;
      return mapTournament(data, []);
    }
    throw e;
  }
}

export interface TournamentPatch {
  status?: Tournament['status'];
  winnerTeam?: string;
  runnerUpTeam?: string;
  bracket?: Tournament['bracket'];
}

// Persist tournament result/bracket changes. RLS
// (`tournaments_update_organizer`) allows the organizer, a super_admin, or
// a club admin to update. Callers fire-and-forget: a failed persist must
// never block the UI — local state stays the optimistic source of truth.
export async function updateTournament(id: string, patch: TournamentPatch): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  const row: Row = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.winnerTeam !== undefined) row.winner_team = patch.winnerTeam;
  if (patch.runnerUpTeam !== undefined) row.runner_up_team = patch.runnerUpTeam;
  if (patch.bracket !== undefined) row.bracket = patch.bracket;
  if (Object.keys(row).length === 0) return;
  const { error } = await sb.from('tournaments').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteBookingById(bookingId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  const { error } = await sb.from('bookings').delete().eq('id', bookingId);
  if (error) throw error;
}

export async function deleteClubById(clubId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  // Cascades to courts and bookings (on delete cascade). RLS: super_admin only.
  const { error } = await sb.from('clubs').delete().eq('id', clubId);
  if (error) throw error;
}

export async function deleteTournamentById(tournamentId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  // Cascades to tournament_teams. RLS: organizer or super_admin.
  const { error } = await sb.from('tournaments').delete().eq('id', tournamentId);
  if (error) throw error;
}

export interface CoachInput {
  name: string;
  avatar: string;
  title: string;
  phone?: string;
  fipCertification: string;
  experienceYears: number;
  province: string;
  clubs: string[];
  hourlyRate: number;
  bio: string;
  specialties: string[];
  availableDays: string[];
  availableHours: string[];
}

function mapCoach(data: any): Coach {
  return {
    id: data.id,
    name: data.name,
    avatar: data.avatar_url || '',
    title: data.title || '',
    phone: data.phone ?? '',
    fipCertification: data.fip_certification || '',
    experienceYears: data.experience_years || 0,
    rating: Number(data.rating) || 5.0,
    reviewsCount: data.reviews_count || 0,
    province: data.province || '',
    clubs: data.club_names || [],
    hourlyRate: Number(data.hourly_rate) || 0,
    bio: data.bio || '',
    specialties: data.specialties || [],
    availableDays: data.available_days || [],
    availableHours: data.available_hours || [],
  };
}

export async function insertCoach(input: CoachInput): Promise<Coach> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  const base = {
    name: input.name,
    avatar_url: input.avatar,
    title: input.title,
    fip_certification: input.fipCertification,
    experience_years: input.experienceYears,
    province: input.province,
    club_names: input.clubs,
    hourly_rate: input.hourlyRate,
    bio: input.bio,
    specialties: input.specialties,
    available_days: input.availableDays,
    available_hours: input.availableHours,
  };
  // The `phone` column ships with migration 0012. Until it is run, an insert
  // carrying phone is rejected — retry without it so adding a coach never
  // breaks in the meantime.
  let res = await sb
    .from('coaches')
    .insert({ ...base, phone: input.phone || '' })
    .select('*')
    .single();
  if (res.error && /phone/i.test(res.error.message || '')) {
    console.warn('insertCoach: phone column missing (run migration 0012), retrying without it');
    res = await sb.from('coaches').insert(base).select('*').single();
  }
  if (res.error) throw res.error;
  return mapCoach(res.data);
}

export async function deleteCoachById(coachId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  const { error } = await sb.from('coaches').delete().eq('id', coachId);
  if (error) throw error;
}

export async function fetchCoaches(): Promise<Coach[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from('coaches').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapCoach);
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  province: string;
  city: string;
  managedClubId: string | null;
  adminProvince?: string | null;
}

export async function fetchAllProfiles(): Promise<UserProfile[]> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  // admin_province only exists after migration 0011 is run by Reza (still
  // pending) — fall back to a select without it so the user list keeps
  // working in the meantime.
  const cols = 'id, email, name, role, province, city, managed_club_id, admin_province';
  const first = await sb.from('profiles').select(cols).order('created_at', { ascending: false });
  let data: any[] | null = first.data;
  let error: any = first.error;
  if (error && /admin_province/i.test(String(error.message))) {
    const retry = await sb
      .from('profiles')
      .select('id, email, name, role, province, city, managed_club_id')
      .order('created_at', { ascending: false });
    if (retry.error) throw retry.error;
    data = retry.data;
    error = null;
  }
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    email: r.email,
    name: r.name || '',
    role: r.role || 'player',
    province: r.province || '',
    city: r.city || '',
    managedClubId: r.managed_club_id || null,
    adminProvince: r.admin_province || null,
  }));
}

export async function updateUserRole(userId: string, role: 'player' | 'club_admin' | 'super_admin' | 'province_admin', managedClubId?: string | null, managedProvince?: string | null): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  const update: any = { role };
  if (role === 'club_admin') {
    update.managed_club_id = managedClubId || null;
  } else {
    update.managed_club_id = null;
  }
  if (role === 'province_admin') {
    // The admin_province column only exists after migration 0011 is run;
    // the caller must catch its error and guide Reza accordingly.
    update.admin_province = managedProvince || '';
  }
  const { error } = await sb.from('profiles').update(update).eq('id', userId);
  if (error) throw error;
}

// ============ Club ratings (player votes → club rank) ============

/** One rating per player per club (upsert). Returns the saved rating. */
export async function upsertClubRating(clubId: string, userId: string, rating: number): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  const r = Math.max(1, Math.min(5, Math.round(rating)));
  const { error } = await sb
    .from('club_ratings')
    .upsert({ club_id: clubId, user_id: userId, rating: r }, { onConflict: 'club_id,user_id' });
  if (error) throw error;
}

/** All ratings by one user: clubId → 1..5 */
export async function fetchMyClubRatings(userId: string): Promise<Record<string, number>> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase not configured');
  const { data, error } = await sb
    .from('club_ratings')
    .select('club_id, rating')
    .eq('user_id', userId);
  if (error) throw error;
  const map: Record<string, number> = {};
  for (const row of data ?? []) {
    map[String((row as any).club_id)] = Number((row as any).rating);
  }
  return map;
}
