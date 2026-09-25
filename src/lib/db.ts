// Data-access layer for the Supabase backend.
// Every function returns app-domain types (src/types.ts). The app keeps
// working on local mock data when Supabase is not configured.
import { getSupabase } from './supabase';
import type {
  Booking, Club, Court, Tournament, TournamentCategory, TournamentFormat,
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
    .select('*, clubs!inner(name), courts!inner(name)')
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
    // 23505 = unique violation on (court_id, date, time_slot)
    if ((error as any).code === '23505') throw new Error(DOUBLE_BOOKED);
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
    organizerType: r.organizer_type === 'official' ? 'club' : undefined,
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
