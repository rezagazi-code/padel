import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  Booking,
  BracketMatch,
  Club,
  Coach,
  CoachBooking,
  Court,
  FriendlyTournament,
  FriendlyTeam,
  FriendlyMatch,
  GroupSession,
  GroupSessionCourt,
  NeedPlayerPost,
  OpenMatch,
  PlayerProfile,
  RankingPlayer,
  Tournament,
  UserRole
} from '../types';
import {
  initialClubs,
  initialCoaches,
  initialFreeAgents,
  initialGroupSessions,
  initialNeedPlayerPosts,
  initialOpenMatches,
  initialPlayerProfile,
  initialRankings,
  initialTournaments
} from '../mockData';
import { levelToGrade, SKILL_GRADES, LEVEL_JOIN_TOLERANCE } from '../utils/skillGrades';
import { getSupabase, getSupabaseConfig } from '../lib/supabase';
import { deleteDongiRecord } from '../lib/dongi';
import {
  fetchClubs,
  fetchTournaments,
  insertBooking,
  insertClub,
  insertCoach,
  insertCourt,
  insertTournament,
  deleteBookingById,
  deleteClubById,
  deleteCoachById,
  deleteTournamentById,
  fetchCoaches,
  updateMyProfile,
  type ProfilePatch,
  DOUBLE_BOOKED,
  upsertClubRating,
  fetchMyClubRatings,
  insertTournamentTeam,
  updateTournament,
} from '../lib/db';
import { useAuthOptional } from './AuthContext';
import { isBookingCancellable } from '../utils/dates';

// localStorage record of tournament ranking-points awards: which tournament
// Guard record for the bracket-points award dedup. `{ winner }` is the team
// name that was credited; `participantsCredited` is true when the FULL
// award (winner 250 + runner-up 150 + all-participant 50/turnsPlayed) ran.
// `championsCredited` / `runnerUpsCredited` list every team name that already
// received that placement for the tournament — a corrected final must never
// re-credit an already-credited placement (2026-10-22: the record only kept
// the latest winner, so an unchanged runner-up got +150 twice and a second
// correction re-crowning the original champion double-awarded +250).
// Any legacy string value in storage (pre-2026-10-20 format) means the
// tournament was fully awarded under the old code, so it migrates to
// `{ winner, participantsCredited: true }` on read.
// Invariant: each tournament's PARTICIPANT credit is given exactly once;
// a corrected final crowning a DIFFERENT champion still awards the new
// champion's winner points via awardChampionPointsOnly (no revocation of
// the old champion's points — deliberate product constraint).
interface BracketAwardRecord {
  winner: string;
  participantsCredited: boolean;
  championsCredited?: string[];
  runnerUpsCredited?: string[];
}

// ids already had points awarded, and to which winner team name
// ({ [tournId]: winnerTeamName }). The in-memory ref alone was reload-unsafe:
// seeding ran before the async catalog load completed, so after a reload the
// Map was empty and re-recording a completed final double-awarded
// 250/150/50 ranking points. Every localStorage access is try/catch guarded
// — storage can be unavailable (private mode, disabled cookies, quota).
const BRACKET_POINTS_AWARDED_KEY = 'padelpro_bracket_points_awarded_v1';

// Seeds the award guard from BOTH (a) already-completed tournaments in state
// and (b) the localStorage record. The record wins on conflict: it was
// written at the exact moment the award happened, while the state seed is a
// fallback for completions from before this persistence existed (documented
// trade-off: pre-fix bracket-completed tournaments keep their zero points —
// no new corruption is possible, no backfill either).
function loadBracketPointsAwardedSeed(tournaments: Tournament[]): Map<string, BracketAwardRecord> {
  const seed = new Map<string, BracketAwardRecord>(
    tournaments
      .filter((t) => t.status === 'completed' && t.winnerTeam)
      .map((t) => [t.id, {
        winner: t.winnerTeam as string,
        participantsCredited: true,
        championsCredited: [t.winnerTeam as string],
        runnerUpsCredited: t.runnerUpTeam ? [t.runnerUpTeam] : [],
      }])
  );
  try {
    const raw = localStorage.getItem(BRACKET_POINTS_AWARDED_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as Record<string, unknown>;
      for (const [tournId, value] of Object.entries(stored)) {
        if (typeof value === 'string' && value.length > 0) {
          // Legacy format: a stored record always meant a full award.
          seed.set(tournId, { winner: value, participantsCredited: true, championsCredited: [value], runnerUpsCredited: [] });
        } else if (value && typeof value === 'object') {
          const rec = value as Partial<BracketAwardRecord>;
          if (typeof rec.winner === 'string' && rec.winner.length > 0) {
            seed.set(tournId, {
              winner: rec.winner,
              participantsCredited: !!rec.participantsCredited,
              championsCredited: stringArray(rec.championsCredited, rec.winner),
              runnerUpsCredited: stringArray(rec.runnerUpsCredited),
            });
          }
        }
      }
    }
  } catch {
    // Storage unavailable — keep the in-memory seed only.
  }
  return seed;
}

// Sanitizes an unknown value into a string array (localStorage data is
// untrusted); falls back to `fallback` when absent/invalid.
function stringArray(value: unknown, fallback?: string): string[] {
  if (Array.isArray(value)) {
    const out = value.filter((s): s is string => typeof s === 'string' && s.length > 0);
    if (out.length > 0 || !fallback) return out;
  }
  return fallback ? [fallback] : [];
}

export type ActiveTab =
  | 'booking'
  | 'matchmaking'
  | 'free-agents'
  | 'tournaments'
  | 'coaches'
  | 'profile'
  | 'shop'
  | 'club-owner';

interface PadelContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileDeviceView: boolean;
  setIsMobileDeviceView: (val: boolean) => void;
  playerProfile: PlayerProfile;
  updatePlayerProfile: (updates: Partial<PlayerProfile>) => Promise<boolean>;
  clubs: Club[];
  addClub: (club: Omit<Club, 'id' | 'rating' | 'reviewCount'>) => Promise<Club>;
  addCourtToClub: (clubId: string, court: Omit<Court, 'id' | 'clubId'>) => Promise<void>;
  deleteClub: (clubId: string) => Promise<void>;
  deleteTournament: (tournamentId: string) => Promise<void>;
  myClubRatings: Record<string, number>;
  rateClub: (clubId: string, rating: number) => Promise<void>;
  bookings: Booking[];
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking | null>;
  cancelBooking: (bookingId: string, hint?: { date: string; timeSlot: string }) => Promise<void>;
  openMatches: OpenMatch[];
  createOpenMatch: (matchData: Omit<OpenMatch, 'id' | 'slots' | 'status'>) => OpenMatch;
  joinMatchSlot: (matchId: string, slotNumber: number) => boolean;
  leaveMatchSlot: (matchId: string, slotNumber: number) => void;
  deleteOpenMatch: (matchId: string) => void;
  groupSessions: GroupSession[];
  createGroupSession: (data: Omit<GroupSession, 'id' | 'courts' | 'status' | 'createdAt'>, courtNames: string[]) => GroupSession;
  joinGroupSessionSlot: (sessionId: string, courtNumber: number, slotNumber: number) => boolean;
  leaveGroupSessionSlot: (sessionId: string, courtNumber: number, slotNumber: number) => void;
  deleteGroupSession: (sessionId: string) => void;
  friendlyTournaments: FriendlyTournament[];
  createFriendlyTournament: (data: Omit<FriendlyTournament, 'id' | 'status' | 'teams' | 'bracket' | 'createdAt'>) => FriendlyTournament;
  addFriendlyTeam: (tournId: string, team: Omit<FriendlyTeam, 'id'>) => boolean;
  drawFriendlyBracket: (tournId: string) => void;
  drawOfficialBracket: (tournId: string) => void;
  recordFriendlyScore: (tournId: string, matchId: string, score1: number, score2: number) => void;
  finalizeFriendlyTournament: (tournId: string) => void;
  resetFriendlyBracket: (tournId: string) => void;
  needPlayerPosts: NeedPlayerPost[];
  createNeedPlayerPost: (post: Omit<NeedPlayerPost, 'id' | 'joinedPlayers' | 'status'>) => void;
  joinNeedPlayerPost: (postId: string) => boolean;
  leaveNeedPlayerPost: (postId: string) => boolean;
  deleteNeedPlayerPost: (postId: string) => boolean;
  freeAgents: PlayerProfile[];
  toggleFreeAgentStatus: (available: boolean, note?: string) => void;
  inviteFreeAgent: (agentId: string, matchTitle: string) => void;
  coaches: Coach[];
  addCoach: (coach: Omit<Coach, 'id' | 'rating' | 'reviewsCount'>) => Promise<Coach>;
  deleteCoach: (coachId: string) => Promise<void>;
  coachBookings: CoachBooking[];
  bookCoach: (booking: Omit<CoachBooking, 'id' | 'status'>) => CoachBooking | null;
  tournaments: Tournament[];
  createTournament: (tourn: Omit<Tournament, 'id' | 'registeredTeamsCount' | 'registeredTeams' | 'status'>) => Promise<Tournament>;
  registerTournamentTeam: (tournId: string, teamName: string, partnerName: string, partnerLevel: number) => boolean;
  finalizeTournamentResults: (tournId: string, winnerTeamId: string, runnerUpTeamId: string) => void;
  updateTournamentBracketMatch: (tournId: string, matchId: string, winnerId: string, score: number[]) => void;
  // Role & Admin Permissions
  currentUserId: string;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  adminClubId: string;
  setAdminClubId: (clubId: string) => void;
  adminProvince: string;
  setAdminProvince: (province: string) => void;
  rankings: RankingPlayer[];
  selectedProvince: string;
  setSelectedProvince: (prov: string) => void;
  // Supabase / Cloud config
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseConfig: { url: string; anonKey: string };
  setSupabaseConfig: (configOrUrl: { url: string; anonKey: string } | string, key?: string) => void;
  isSupabaseConfigured: boolean;
  isSupabaseConnected: boolean;
  syncNotification: string | null;
  setSyncNotification: (msg: string | null) => void;
  resetAllDataToDefaults: () => void;
}

const PadelContext = createContext<PadelContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'padelpro_v1_';

function getInitialData<T>(key: string, defaultVal: T): T {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
  }
  return defaultVal;
}

// Merge bundled clubs (from initialClubs in mockData.ts) into any club list,
// so clubs that exist in neither the localStorage cache nor Supabase still
// show up. Dedupe is by id AND name because Supabase rows carry UUID ids
// while bundled clubs use `club-xxx` ids. Clubs the super_admin deliberately
// deleted (tracked in `deleted_club_ids`) are never resurrected.
function withBundledClubs(list: Club[]): Club[] {
  let deletedIds: string[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'deleted_club_ids');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) deletedIds = parsed.filter((x) => typeof x === 'string');
    }
  } catch {
    deletedIds = [];
  }
  const ids = new Set(list.map((c) => c.id));
  const names = new Set(list.map((c) => c.name));
  const missing = initialClubs.filter(
    (c) => !ids.has(c.id) && !names.has(c.name) && !deletedIds.includes(c.id)
  );
  return missing.length > 0 ? [...list, ...missing] : list;
}

export const PadelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('booking');
  const [isMobileDeviceView, setIsMobileDeviceView] = useState<boolean>(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('همه استان‌ها');

  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() =>
    getInitialData('profile', initialPlayerProfile)
  );

  const [clubs, setClubs] = useState<Club[]>(() =>
    withBundledClubs(getInitialData('clubs', initialClubs))
  );

  // My own club ratings (clubId -> 1..5), loaded for the signed-in user.
  const [myClubRatings, setMyClubRatings] = useState<Record<string, number>>({});

  const [bookings, setBookings] = useState<Booking[]>(() =>
    getInitialData('bookings', [])
  );

  const [openMatches, setOpenMatches] = useState<OpenMatch[]>(() =>
    getInitialData('open_matches', initialOpenMatches)
  );

  const [groupSessions, setGroupSessions] = useState<GroupSession[]>(() =>
    getInitialData('group_sessions', initialGroupSessions)
  );

  const [friendlyTournaments, setFriendlyTournaments] = useState<FriendlyTournament[]>(() =>
    getInitialData('friendly_tournaments', [])
  );

  const [needPlayerPosts, setNeedPlayerPosts] = useState<NeedPlayerPost[]>(() =>
    getInitialData('need_players', initialNeedPlayerPosts)
  );

  const [freeAgents, setFreeAgents] = useState<PlayerProfile[]>(() =>
    getInitialData('free_agents', initialFreeAgents)
  );

  const [coaches, setCoaches] = useState<Coach[]>(() =>
    getInitialData('coaches', initialCoaches)
  );

  const [coachBookings, setCoachBookings] = useState<CoachBooking[]>(() =>
    getInitialData('coach_bookings', [])
  );

  const [tournaments, setTournaments] = useState<Tournament[]>(() =>
    getInitialData('tournaments', initialTournaments)
  );

  const [rankings, setRankings] = useState<RankingPlayer[]>(() =>
    getInitialData('rankings', initialRankings)
  );

  // Role Management State
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() =>
    (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'user_role') as UserRole) || 'player'
  );
  const [adminClubId, setAdminClubId] = useState<string>(() =>
    localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_club_id') || 'club-1'
  );
  const [adminProvince, setAdminProvince] = useState<string>(() =>
    localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_province') || 'تهران'
  );

  // Manual config (localStorage) overrides env vars; env vars (Render) are the
  // default so the modal truthfully reports the connection in production.
  const [supabaseUrl, setSupabaseUrl] = useState<string>(() => {
    const env = getSupabaseConfig();
    return localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'sb_url') || env?.url || '';
  });
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>(() => {
    const env = getSupabaseConfig();
    return localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'sb_key') || env?.anonKey || '';
  });
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // Optional auth (AuthProvider wraps the app in App.tsx). When the user is
  // signed in, role + admin club come from their server profile, not the
  // local demo switcher.
  const auth = useAuthOptional();

  // Sync the local test role with the real authenticated user role.
  // When a user logs in, their actual Supabase role takes precedence.
  // NOTE: auth.user.role is the Supabase JWT role ('authenticated' for every
  // signed-in user), NOT the app role — reading it made this sync a no-op
  // for real users, so internal consumers of currentUserRole (e.g.
  // bindNewClubAsAdminClub, deleteNeedPlayerPost) kept the stale demo role
  // while the context value (which already reads profile.role) looked right.
  // The app role lives on auth.profile.role.
  useEffect(() => {
    const realRole = auth?.profile?.role;
    if (realRole && ['player', 'club_admin', 'super_admin', 'province_admin'].includes(realRole)) {
      setCurrentUserRole(realRole as UserRole);
    }
    const realClubId = (auth?.profile as any)?.adminClubId;
    if (realClubId) {
      setAdminClubId(realClubId);
    }
    const realProvince = (auth?.profile as any)?.adminProvince;
    if (realProvince) {
      setAdminProvince(realProvince);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.profile?.role, (auth?.profile as any)?.adminClubId, (auth?.profile as any)?.adminProvince]);

  // ---- «پروفایل من» <-> AuthProfile sync ----
  // On sign-in, pull the server identity (name/email/avatar/level) into the
  // local sports profile. Afterwards the local profile is the source of truth
  // for the UI and edits are pushed back to the server (see updatePlayerProfile).
  const lastSyncedAuthId = useRef<string | null>(null);
  // Optimistic join guard: pre-validation reads state from the last render,
  // so two joins landing before the re-render would both pass it and the
  // defensive setState updater would silently decline the second — while
  // the success toast still fired and `true` was returned. The ref is
  // checked synchronously, so only the first of the racing calls toasts and
  // returns true. Keys are released inside the updater once React processes
  // it (a flag set inside the updater can never be read at return time —
  // React 18 batches the updater — so the ref only covers the race window).
  const pendingJoinRef = useRef<Set<string>>(new Set());
  // In-flight slot keys for the local (client-side) booking paths below.
  // The dup guards in createBooking/bookCoach read closure state, which is
  // stale when the confirm button is tapped twice before React re-renders,
  // so a rapid double-tap could book the same slot twice. The key is held
  // for 5s after a successful local booking (2026-10-24): deleting it in
  // `finally` only blocked re-entrant calls in the same tick, but a real
  // double-tap's second call resumes after the confirm handler's awaited
  // server fetch, long after the first call returned.
  const bookingInFlightRef = useRef<Set<string>>(new Set());
  const coachBookingInFlightRef = useRef<Set<string>>(new Set());
  // Friendly-draw guard (2026-10-27): drawFriendlyBracket's updater silently
  // refuses a second draw (status is no longer 'open'), but the success
  // toast fired unconditionally — a same-tick double-click drew once and
  // toasted twice. The updater can't report back (it runs later, and
  // StrictMode double-invokes it), so a synchronously-set ref is the
  // authority for "already drawn in this session". Cleared by
  // resetFriendlyBracket so an undone draw can be re-run; a fresh session
  // relies on the closure status check below instead.
  const friendlyDrawGuardRef = useRef<Set<string>>(new Set());
  // Guard against double-awarding tournament ranking points: a tournament's
  // participant credit must be given exactly once. StrictMode double-invokes
  // state updaters and both the free-text finalize path and the bracket path
  // can award, so the ref records which tournament ids already credited which
  // winner. Seeded at init from already-completed tournaments AND the
  // localStorage record (loadBracketPointsAwardedSeed) — the in-memory-only
  // seed was reload-unsafe (see Bug 1 fix, 2026-10-19). When a corrected
  // final crowns a different champion, the new champion still receives
  // champion points (awardChampionPointsOnly) — no revocation of the old
  // champion's points (deliberate product constraint); participant credit
  // never runs twice for the same tournament.
  const bracketPointsAwardedRef = useRef<Map<string, BracketAwardRecord>>(
    loadBracketPointsAwardedSeed(tournaments)
  );
  // Read pair for the award guard. The full record is used internally when
  // deciding whether the full award or the champion-only award applies;
  // getAwardedWinner keeps the original string-only signature for callers
  // that only need the winner name. Both are called outside React state
  // updaters (StrictMode double-invokes updaters).
  const getAwardedWinner = (tournId: string): string | undefined =>
    bracketPointsAwardedRef.current.get(tournId)?.winner;
  const getAwardedRecord = (tournId: string): BracketAwardRecord | undefined =>
    bracketPointsAwardedRef.current.get(tournId);
  // Write-through: persists to localStorage so the guard survives reloads.
  // The write MERGES with the stored JSON instead of overwriting it from the
  // in-memory map, so a second tab that awarded in the meantime isn't
  // clobbered (concurrent-tab read-modify-write race). Re-recording the SAME
  // result after a reload must NOT award; a corrected final crowning a
  // DIFFERENT champion updates the record winner (participant credit stays
  // given exactly once).
  const setAwardedWinner = (tournId: string, record: BracketAwardRecord): void => {
    bracketPointsAwardedRef.current.set(tournId, record);
    try {
      const stored: Record<string, BracketAwardRecord> = {};
      const raw = localStorage.getItem(BRACKET_POINTS_AWARDED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        for (const [id, value] of Object.entries(parsed)) {
          if (typeof value === 'string' && value.length > 0) {
            stored[id] = { winner: value, participantsCredited: true, championsCredited: [value], runnerUpsCredited: [] };
          } else if (value && typeof value === 'object') {
            const rec = value as Partial<BracketAwardRecord>;
            if (typeof rec.winner === 'string' && rec.winner.length > 0) {
              stored[id] = {
                winner: rec.winner,
                participantsCredited: !!rec.participantsCredited,
                championsCredited: stringArray(rec.championsCredited, rec.winner),
                runnerUpsCredited: stringArray(rec.runnerUpsCredited),
              };
            }
          }
        }
      }
      bracketPointsAwardedRef.current.forEach((rec, id) => {
        stored[id] = rec;
      });
      localStorage.setItem(BRACKET_POINTS_AWARDED_KEY, JSON.stringify(stored));
    } catch {
      // Storage unavailable — the in-memory guard still covers this session.
    }
  };
  // Full-award bookkeeping: the first (and only) placement credit for the
  // tournament — records exactly which teams were credited.
  const recordFullAward = (tournId: string, winnerTeamName: string, runnerUpTeamName: string): void => {
    setAwardedWinner(tournId, {
      winner: winnerTeamName,
      participantsCredited: true,
      championsCredited: [winnerTeamName],
      runnerUpsCredited: runnerUpTeamName ? [runnerUpTeamName] : [],
    });
  };
  // Correction bookkeeping: appends the newly credited champion/runner-up
  // team names to the record (deduped) so a later correction never
  // re-credits a team that already received that placement for this
  // tournament. `winner` always tracks the LATEST champion.
  const recordCorrectionAward = (tournId: string, winnerTeamName: string, runnerUpTeamName: string): void => {
    const prev = getAwardedRecord(tournId);
    const champs = [...(prev?.championsCredited ?? (prev?.winner ? [prev.winner] : []))];
    if (winnerTeamName && !champs.includes(winnerTeamName)) champs.push(winnerTeamName);
    const runners = [...(prev?.runnerUpsCredited ?? [])];
    if (runnerUpTeamName && !runners.includes(runnerUpTeamName)) runners.push(runnerUpTeamName);
    setAwardedWinner(tournId, {
      winner: winnerTeamName,
      participantsCredited: true,
      championsCredited: champs,
      runnerUpsCredited: runners,
    });
  };
  useEffect(() => {
    const p = auth?.profile;
    if (!p) {
      lastSyncedAuthId.current = null;
      return;
    }
    if (lastSyncedAuthId.current === p.id) return;
    lastSyncedAuthId.current = p.id;
    setPlayerProfile((prev) => ({
      ...prev,
      name: p.name || prev.name,
      email: p.email || prev.email,
      avatar: p.avatar_url || prev.avatar,
      level: p.level > 0 ? p.level : prev.level,
    }));
  }, [auth?.profile]);

  // Load shared catalog data from Supabase when configured; fall back to
  // local mock data otherwise (or on error).
  useEffect(() => {
    if (!getSupabase()) return;
    let cancelled = false;
    (async () => {
      try {
        const [remoteClubs, remoteTournaments, remoteCoaches] = await Promise.all([
          fetchClubs(),
          fetchTournaments(),
          fetchCoaches(),
        ]);
        if (!cancelled) {
          if (remoteClubs.length > 0) setClubs(withBundledClubs(remoteClubs));
          if (remoteTournaments.length > 0) {
            // MERGE, don't replace: a registration that only exists locally
            // (e.g. inserted while offline, or its server insert failed)
            // must survive the catalog reload. Match by team name; the
            // remote row wins when a team exists in both.
            setTournaments((prev) => {
              const prevById = new Map(prev.map((t) => [t.id, t]));
              const remoteIds = new Set(remoteTournaments.map((t) => t.id));
              // Canonical JSON: server rows round-trip through Postgres
              // jsonb, which normalizes object key order — a plain
              // JSON.stringify comparison would spuriously differ and make
              // the local bracket always win over newer server data.
              const canon = (v: unknown): string =>
                v === null || typeof v !== 'object'
                  ? JSON.stringify(v)
                  : Array.isArray(v)
                    ? `[${v.map(canon).join(',')}]`
                    : `{${Object.keys(v as Record<string, unknown>)
                        .sort()
                        .map(
                          (k) =>
                            `${JSON.stringify(k)}:${canon(
                              (v as Record<string, unknown>)[k],
                            )}`,
                        )
                        .join(',')}}`;
              const statusRank = (s: string) =>
                s === 'completed'
                  ? 3
                  : s === 'ongoing'
                    ? 2
                    : s === 'draw_done'
                      ? 1
                      : 0;
              const merged = remoteTournaments.map((rt) => {
                const local = prevById.get(rt.id);
                if (!local) return rt;
                // Match the registration guard's normalization (trimmed +
                // case-insensitive): names that differ only by case/whitespace
                // are the same team.
                const normName = (s: string) => s.trim().toLowerCase();
                const remoteNames = new Set(
                  rt.registeredTeams.map((tm) => normName(tm.teamName))
                );
                const localOnly = local.registeredTeams.filter(
                  (tm) => !remoteNames.has(normName(tm.teamName))
                );
                const mergedTeams =
                  localOnly.length > 0
                    ? [...rt.registeredTeams, ...localOnly]
                    : rt.registeredTeams;
                // Local bracket/result edits whose server persist failed
                // must survive the reload: the failure toasts promise the
                // local edit is kept, but returning the server row
                // wholesale dropped it (draw, recorded result, finalize).
                // Server data still wins when it already carries the edit;
                // local wins only for bracket/winner/status the server row
                // doesn't have yet. 'draw_done' intentionally still flips
                // back to 'registration' (documented on the Tournament
                // type: the Postgres enum rejects it) — only
                // 'ongoing'/'completed' are carried forward.
                const bracketDiffers =
                  (local.bracket ?? []).length > 0 &&
                  canon(local.bracket) !== canon(rt.bracket ?? []);
                const keepWinner =
                  !!local.winnerTeam && !rt.winnerTeam;
                const keepRunnerUp =
                  !!local.runnerUpTeam && !rt.runnerUpTeam;
                const keepStatus =
                  (local.status === 'ongoing' ||
                    local.status === 'completed') &&
                  statusRank(local.status) > statusRank(rt.status);
                if (
                  localOnly.length === 0 &&
                  !bracketDiffers &&
                  !keepWinner &&
                  !keepRunnerUp &&
                  !keepStatus
                )
                  return rt;
                return {
                  ...rt,
                  registeredTeams: mergedTeams,
                  registeredTeamsCount: mergedTeams.length,
                  ...(bracketDiffers ? { bracket: local.bracket } : {}),
                  ...(keepWinner ? { winnerTeam: local.winnerTeam } : {}),
                  ...(keepRunnerUp
                    ? { runnerUpTeam: local.runnerUpTeam }
                    : {}),
                  ...(keepStatus ? { status: local.status } : {}),
                };
              });
              // Preserve local-only tournaments (ids like `tourn-…`) that
              // have no server row yet: dropping them here + the
              // persistence effect overwriting localStorage would delete
              // them permanently. Mirrors the coaches merge below.
              const localOnlyTourns = prev.filter(
                (t) => t.id.startsWith('tourn-') && !remoteIds.has(t.id)
              );
              // Local-only tournaments stay at the top (matching
              // createTournament's prepend), so cards don't jump down the
              // list after a catalog reload.
              return [...localOnlyTourns, ...merged];
            });
          }
        }
        if (remoteCoaches.length > 0) {
          setCoaches((prev) => {
            const localOnly = prev.filter((c) => c.id.startsWith('coach-'));
            const ids = new Set(remoteCoaches.map((c) => c.id));
            return [...remoteCoaches, ...localOnly.filter((c) => !ids.has(c.id))];
          });
        }
      } catch (err) {
        console.warn('Supabase catalog load failed, using local data:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load my club ratings when the signed-in user changes.
  useEffect(() => {
    const userId = auth?.user?.id;
    if (!getSupabase() || !userId) {
      setMyClubRatings({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const map = await fetchMyClubRatings(userId);
        if (!cancelled) setMyClubRatings(map);
      } catch (err) {
        console.warn('Failed to load my club ratings:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth?.user?.id]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'user_role', currentUserRole);
  }, [currentUserRole]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_club_id', adminClubId);
  }, [adminClubId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_province', adminProvince);
  }, [adminProvince]);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'profile', JSON.stringify(playerProfile));
    } catch {
      // Quota exceeded (e.g. an oversized avatar data URL) — keep the
      // in-memory profile as the source of truth rather than crashing.
    }
  }, [playerProfile]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'clubs', JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'open_matches', JSON.stringify(openMatches));
  }, [openMatches]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'group_sessions', JSON.stringify(groupSessions));
  }, [groupSessions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'friendly_tournaments', JSON.stringify(friendlyTournaments));
  }, [friendlyTournaments]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'need_players', JSON.stringify(needPlayerPosts));
  }, [needPlayerPosts]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'free_agents', JSON.stringify(freeAgents));
  }, [freeAgents]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'coach_bookings', JSON.stringify(coachBookings));
  }, [coachBookings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'tournaments', JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'rankings', JSON.stringify(rankings));
  }, [rankings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'coaches', JSON.stringify(coaches));
  }, [coaches]);

  const updatePlayerProfile = async (updates: Partial<PlayerProfile>): Promise<boolean> => {
    setPlayerProfile((prev) => {
      const updated = { ...prev, ...updates };
      // Also update in free agents if isFreeAgent
      if (updated.isFreeAgent) {
        setFreeAgents((agents) => {
          const exists = agents.some((a) => a.id === updated.id);
          if (exists) {
            return agents.map((a) => (a.id === updated.id ? updated : a));
          } else {
            return [updated, ...agents];
          }
        });
      } else {
        setFreeAgents((agents) => agents.filter((a) => a.id !== updated.id));
      }
      return updated;
    });
    // Push the editable identity fields back to the server profile so
    // «پروفایل من» stays connected to AuthProfile. Returns true when the
    // local save (and the server push, if applicable) succeeds, false
    // when the server push fails — the local profile remains the UI source
    // of truth either way.
    const authUserId = auth?.user?.id ?? null;
    if (getSupabase() && authUserId) {
      const patch: ProfilePatch = {};
      if (updates.name !== undefined) patch.name = updates.name;
      if (updates.avatar !== undefined) patch.avatar_url = updates.avatar;
      if (updates.themeColor !== undefined) patch.theme_color = updates.themeColor;
      if (updates.level !== undefined) patch.level = updates.level;
      if (updates.hand !== undefined) patch.hand = updates.hand;
      if (updates.preferredSide !== undefined) patch.preferred_side = updates.preferredSide;
      if (updates.racketBrand !== undefined) patch.racket_brand = updates.racketBrand;
      if (updates.racketModel !== undefined) patch.racket_model = updates.racketModel;
      if (updates.province !== undefined) patch.province = updates.province;
      if (updates.city !== undefined) patch.city = updates.city;
      if (updates.phone !== undefined) patch.phone = updates.phone;
      if (updates.bio !== undefined) patch.bio = updates.bio;
      if (updates.isFreeAgent !== undefined) patch.is_free_agent = updates.isFreeAgent;
      if (Object.keys(patch).length === 0) return true;
      try {
        await updateMyProfile(authUserId, patch);
        return true;
      } catch {
        setSyncNotification('ذخیره پروفایل ناموفق بود؛ اتصال اینترنت را بررسی کنید.');
        return false;
      }
    }
    return true;
  };

  // A club_admin who registers a club must be able to run tournaments
  // under it: bind the new club as their admin club when their current
  // binding points at no existing club (the default 'club-1' matches no
  // bundled club, and a null server managed_club_id binds nothing).
  // Deliberately a no-op when the admin already has a working club, so
  // registering a second club never silently unbinds the first. The
  // provider falls back to this local binding when the server value is
  // null; a super_admin-assigned managed_club_id still wins on login.
  const bindNewClubAsAdminClub = (clubId: string) => {
    if (currentUserRole !== 'club_admin') return;
    const effectiveAdminClubId = auth?.profile ? auth.profile.adminClubId : adminClubId;
    if (!effectiveAdminClubId || !clubs.some((c) => c.id === effectiveAdminClubId)) {
      setAdminClubId(clubId);
    }
  };

  const addClub = async (clubData: Omit<Club, 'id' | 'rating' | 'reviewCount'>): Promise<Club> => {
    const authUserId = auth?.user?.id ?? null;

    // Real backend path: insert the club, then its courts, into Supabase so
    // every user sees the new club. Throws on failure so the UI can show an
    // error instead of silently keeping a local-only club.
    if (getSupabase() && authUserId) {
      // Track the remote club so a court-insert failure can roll it back
      // instead of leaving a court-less club on the server.
      let remoteId: string | null = null;
      try {
        const remote = await insertClub(
          {
            name: clubData.name,
            province: clubData.province,
            city: clubData.city,
            address: clubData.address,
            phone: clubData.phone,
            coverImage: clubData.coverImage,
            galleryImages: clubData.galleryImages,
            amenities: clubData.amenities,
            openingHour: clubData.openingHour,
            closingHour: clubData.closingHour,
            ownerName: clubData.ownerName,
            ownerPhone: clubData.ownerPhone,
          },
          authUserId
        );
        remoteId = remote.id;
        const courts: Court[] = [];
        for (let i = 0; i < clubData.courts.length; i++) {
          const c = clubData.courts[i];
          const rc = await insertCourt(remote.id, {
            name: c.name,
            courtNumber: c.courtNumber || i + 1,
            type: c.type,
            surface: c.surface,
            turfColor: c.turfColor,
            hourlyRate: c.hourlyRate,
            peakHourlyRate: c.peakHourlyRate,
            hasLighting: !!c.hasLighting,
            hasCameras: !!c.hasCameras,
          });
          courts.push(rc);
        }
        const fullClub: Club = { ...remote, courts, courtsCount: courts.length };
        setClubs((prev) => [fullClub, ...prev]);
        setSyncNotification(`باشگاه «${fullClub.name}» با موفقیت افزوده شد!`);
        bindNewClubAsAdminClub(fullClub.id);
        return fullClub;
      } catch (err) {
        // Best-effort rollback: a club whose courts failed to insert must
        // not survive as a court-less club. If the delete itself is denied
        // (RLS) or fails, the original error still surfaces unchanged.
        if (remoteId) {
          try {
            await deleteClubById(remoteId);
          } catch {
            /* keep the original addClub error */
          }
        }
        console.error('addClub remote failed', err);
        setSyncNotification('خطا در ثبت باشگاه روی سرور. دوباره تلاش کنید.');
        throw err;
      }
    }

    // Local fallback (offline / not signed in)
    const newClub: Club = {
      ...clubData,
      id: `club-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, // same-ms collision guard, 2026-10-23
      // No fabricated rating: a brand-new club has no reviews, and the
      // card already renders '—' / 0 stars when reviewCount is 0.
      rating: 0,
      reviewCount: 0,
    };
    setClubs((prev) => [newClub, ...prev]);
    setSyncNotification(`باشگاه «${newClub.name}» با موفقیت افزوده شد!`);
    bindNewClubAsAdminClub(newClub.id);
    return newClub;
  };

  const addCourtToClub = async (clubId: string, courtData: Omit<Court, 'id' | 'clubId'>): Promise<void> => {
    // Real backend path for clubs that already live on Supabase (UUID ids).
    if (getSupabase() && clubId && !clubId.startsWith('club-')) {
      try {
        const remote = await insertCourt(clubId, {
          name: courtData.name,
          courtNumber: courtData.courtNumber,
          type: courtData.type,
          surface: courtData.surface,
          turfColor: courtData.turfColor,
          hourlyRate: courtData.hourlyRate,
          peakHourlyRate: courtData.peakHourlyRate,
          hasLighting: !!courtData.hasLighting,
          hasCameras: !!courtData.hasCameras,
        });
        setClubs((prev) =>
          prev.map((c) => {
            if (c.id === clubId) {
              const updatedCourts = [...c.courts, remote];
              return {
                ...c,
                courtsCount: updatedCourts.length,
                courts: updatedCourts,
              };
            }
            return c;
          })
        );
        setSyncNotification(`زمین جدید به باشگاه اضافه شد.`);
        return;
      } catch (err) {
        console.error('addCourtToClub remote failed', err);
        setSyncNotification('خطا در ثبت زمین روی سرور. دوباره تلاش کنید.');
        throw err;
      }
    }

    // Local fallback
    const newCourt: Court = {
      ...courtData,
      id: `court-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, // same-ms collision guard, 2026-10-24
      clubId,
    };

    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === clubId) {
          const updatedCourts = [...c.courts, newCourt];
          return {
            ...c,
            courtsCount: updatedCourts.length,
            courts: updatedCourts,
          };
        }
        return c;
      })
    );
    setSyncNotification(`زمین جدید به باشگاه اضافه شد.`);
  };

  const deleteClub = async (clubId: string): Promise<void> => {
    // Real backend path for clubs that live on Supabase (UUID ids). The DB
    // cascades the delete to courts and bookings. RLS: super_admin only.
    if (getSupabase() && clubId && !clubId.startsWith('club-')) {
      try {
        await deleteClubById(clubId);
      } catch (err) {
        console.error('deleteClub remote failed', err);
        setSyncNotification('خطا در حذف باشگاه روی سرور. دوباره تلاش کنید.');
        throw err;
      }
    } else if (clubId && clubId.startsWith('club-')) {
      // Bundled club (local `club-xxx` id): remember the deletion so the
      // withBundledClubs merge never resurrects a club the super_admin
      // deliberately deleted. Remote (UUID) deletes need no tracking —
      // Supabase is the source of truth there.
      try {
        const key = LOCAL_STORAGE_KEY_PREFIX + 'deleted_club_ids';
        const raw = localStorage.getItem(key);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        const arr: string[] = Array.isArray(parsed)
          ? parsed.filter((x) => typeof x === 'string')
          : [];
        if (!arr.includes(clubId)) {
          localStorage.setItem(key, JSON.stringify([...arr, clubId]));
        }
      } catch (err) {
        console.warn('Could not persist deleted club id:', err);
      }
    }
    setClubs((prev) => prev.filter((c) => c.id !== clubId));
    setSyncNotification('باشگاه با موفقیت حذف شد.');
  };

  const rateClub = async (clubId: string, rating: number): Promise<void> => {
    const userId = auth?.user?.id;
    // Bundled/local clubs (club-xxx ids) have no server row to rate.
    if (!getSupabase() || !userId || !clubId || clubId.startsWith('club-')) {
      if (clubId?.startsWith('club-')) {
        setSyncNotification('این باشگاه هنوز روی سرور ثبت نشده؛ امتیازدهی فعلاً ممکن نیست.');
      }
      return;
    }
    const r = Math.max(1, Math.min(5, Math.round(rating)));
    try {
      await upsertClubRating(clubId, userId, r);
    } catch (err) {
      console.error('rateClub failed', err);
      setSyncNotification('خطا در ثبت امتیاز. دوباره تلاش کنید.');
      throw err;
    }
    setMyClubRatings((prev) => ({ ...prev, [clubId]: r }));
    // The DB trigger refreshes clubs.rating/review_count — reload to show it.
    try {
      const remoteClubs = await fetchClubs();
      if (remoteClubs.length > 0) setClubs(withBundledClubs(remoteClubs));
    } catch (err) {
      console.warn('Club list refresh after rating failed:', err);
    }
    setSyncNotification('امتیاز شما ثبت شد. ممنون!');
  };

  const deleteTournament = async (tournamentId: string): Promise<void> => {
    // Real backend path for tournaments that live on Supabase (UUID ids).
    // RLS: the organizer or a super_admin.
    if (getSupabase() && tournamentId && !tournamentId.startsWith('tourn-')) {
      try {
        await deleteTournamentById(tournamentId);
      } catch (err) {
        console.error('deleteTournament remote failed', err);
        setSyncNotification('خطا در حذف تورنمنت روی سرور. دوباره تلاش کنید.');
        throw err;
      }
    }
    setTournaments((prev) => prev.filter((t) => t.id !== tournamentId));
    setSyncNotification('تورنمنت با موفقیت حذف شد.');
  };

  const addCoach = async (coachData: Omit<Coach, 'id' | 'rating' | 'reviewsCount'>): Promise<Coach> => {
    if (getSupabase()) {
      try {
        const remote = await insertCoach(coachData);
        // If migration 0012 (phone column) hasn't run yet, the server row
        // comes back without it — keep the typed phone in local state for
        // this session so it isn't silently lost.
        const withPhone =
          coachData.phone && !remote.phone ? { ...remote, phone: coachData.phone } : remote;
        setCoaches((prev) => [withPhone, ...prev]);
        setSyncNotification(`مربی «${withPhone.name}» با موفقیت افزوده شد!`);
        return withPhone;
      } catch (err) {
        console.error('addCoach remote failed', err);
        setSyncNotification('خطا در ثبت مربی روی سرور. دوباره تلاش کنید.');
        throw err;
      }
    }
    // Local fallback — no fabricated rating: a new coach has zero reviews,
    // so rating stays 0 until real reviews exist (same class as the club
    // rating fix; CoachBookingView gates the display on reviewsCount > 0).
    const newCoach: Coach = {
      ...coachData,
      id: `coach-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, // same-ms collision guard, 2026-10-23
      rating: 0,
      reviewsCount: 0,
    };
    setCoaches((prev) => [newCoach, ...prev]);
    setSyncNotification(`مربی «${newCoach.name}» با موفقیت افزوده شد!`);
    return newCoach;
  };

  const deleteCoach = async (coachId: string): Promise<void> => {
    if (getSupabase() && coachId && !coachId.startsWith('coach-')) {
      try {
        await deleteCoachById(coachId);
      } catch (err) {
        console.error('deleteCoach remote failed', err);
        setSyncNotification('خطا در حذف مربی روی سرور. دوباره تلاش کنید.');
        throw err;
      }
    }
    setCoaches((prev) => prev.filter((c) => c.id !== coachId));
    setSyncNotification('مربی با موفقیت حذف شد.');
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking | null> => {
    const authUserId = auth?.user?.id ?? null;

    // Real backend path: insert into Supabase first so the UNIQUE(court_id, date,
    // time_slot) constraint atomically blocks double booking.
    // Bundled local clubs ('club-…') have no server rows (bookings.club_id /
    // court_id are uuid columns): route them through the local fallback even
    // when signed in — otherwise the insert fails with 22P02 and the user
    // cannot book at all (2026-10-22).
    if (getSupabase() && authUserId && bookingData.clubId && !bookingData.clubId.startsWith('club-')) {
      try {
        const remote = await insertBooking(
          {
            clubId: bookingData.clubId,
            courtId: bookingData.courtId,
            date: bookingData.date,
            timeSlot: bookingData.timeSlot,
            durationMinutes: bookingData.durationMinutes,
            totalPrice: bookingData.totalPrice,
            paymentStatus: bookingData.paymentStatus,
            playersNeeded: bookingData.playersNeeded,
          },
          authUserId
        );
        const newBooking: Booking = {
          ...remote,
          bookedByPlayerName: bookingData.bookedByPlayerName,
          splitPricePerPerson: bookingData.splitPricePerPerson,
        };
        setBookings((prev) => [newBooking, ...prev]);
        if (newBooking.playersNeeded > 0) createNeedPostForBooking(newBooking);
        setSyncNotification(`زمین «${newBooking.courtName}» با موفقیت برای شما رزرو شد!`);
        return newBooking;
      } catch (err) {
        if (err instanceof Error && err.message === DOUBLE_BOOKED) {
          setSyncNotification('این سانس همین حالا توسط شخص دیگری رزرو شد. لطفاً سانس دیگری انتخاب کنید.');
          return null;
        }
        setSyncNotification('خطا در ثبت رزرو روی سرور. دوباره تلاش کنید.');
        return null;
      }
    }

    // Local fallback (offline / not signed in, or bundled 'club-…' clubs with
    // no server rows): the server UNIQUE(court_id, date, time_slot) constraint
    // does NOT apply here, so guard against double-booking the same
    // court/date/slot at the context level — same class of fix as the
    // bookCoach dup-guard (2026-10-23). Returns null so callers show a clear
    // message (the server path already returns null on DOUBLE_BOOKED).
    // In-flight guard: `bookings` above is closure state and stays stale when
    // the confirm button is double-tapped before React re-renders. A second
    // call with the same slot key within 5s of a successful booking is a
    // duplicate tap, not a new intent — block it (the key is held past the
    // synchronous body, 2026-10-24, because the confirm handlers await a
    // server fetch before calling us).
    const slotKey = `${bookingData.courtId}|${bookingData.date}|${bookingData.timeSlot}`;
    if (bookingInFlightRef.current.has(slotKey)) {
      setSyncNotification('این سانس قبلاً رزرو شده است. لطفاً سانس دیگری انتخاب کنید.');
      return null;
    }
    bookingInFlightRef.current.add(slotKey);
    const dup = bookings.some(
      (b) =>
        b.courtId === bookingData.courtId &&
        b.date === bookingData.date &&
        b.timeSlot === bookingData.timeSlot
    );
    if (dup) {
      setSyncNotification('این سانس قبلاً رزرو شده است. لطفاً سانس دیگری انتخاب کنید.');
      bookingInFlightRef.current.delete(slotKey);
      return null;
    }
    const newBooking: Booking = {
      ...bookingData,
      // Date.now() alone can collide for two bookings in the same millisecond
      // (same class as the coach-booking fix, 2026-10-23): the random suffix
      // keeps React keys and the local list unique.
      id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [newBooking, ...prev]);

    // If host needs players, automatically create a NeedPlayerPost!
    if (newBooking.playersNeeded > 0) createNeedPostForBooking(newBooking);

    setSyncNotification(`زمین «${newBooking.courtName}» با موفقیت برای شما رزرو شد!`);
    // Hold the key past this synchronous body (2026-10-24): the old
    // finally-delete only blocked re-entrant calls in the same tick, but a
    // real double-tap's second call resumes after the confirm handler's
    // awaited server fetch — after the first call already returned — so it
    // saw stale closure state and no key, and booked the slot twice. A 5s
    // hold covers the second tap's resume window; a legitimate re-book
    // after a cancellation is blocked for at most 5s.
    window.setTimeout(() => bookingInFlightRef.current.delete(slotKey), 5000);
    return newBooking;
  };

  const createNeedPostForBooking = (newBooking: Booking) => {
    const needPost: NeedPlayerPost = {
      // Same ms-collision guard as the booking id above.
      id: `np-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      bookingId: newBooking.id,
      clubName: newBooking.clubName,
      province: playerProfile.province,
      date: newBooking.date,
      time: newBooking.timeSlot,
      spotsNeeded: newBooking.playersNeeded,
      preferredSide: 'both',
      minLevel: Math.max(1, playerProfile.level - 0.7),
      maxLevel: Math.min(7, playerProfile.level + 0.8),
      costPerPerson: newBooking.splitPricePerPerson,
      hostPlayerId: playerProfile.id,
      hostName: playerProfile.name,
      hostAvatar: playerProfile.avatar,
      hostLevel: playerProfile.level,
      note: `زمین توسط ${playerProfile.name} رزرو شده و به ${newBooking.playersNeeded} بازیکن هم‌سطح احتیاج داریم.`,
      joinedPlayers: [],
      status: 'active',
    };
    setNeedPlayerPosts((prev) => [needPost, ...prev]);
  };

  const cancelBooking = async (
    bookingId: string,
    hint?: { date: string; timeSlot: string }
  ): Promise<void> => {
    // Defense in depth: past bookings — and same-day slots whose start
    // time (Tehran) has already passed — can never be cancelled. The
    // history view hides the button for those; this guards every other
    // caller of cancelBooking.
    const target = bookings.find((b) => b.id === bookingId);
    // Server-only bookings aren't in local `bookings` state; when the
    // caller passes a hint (date/timeSlot from the merged display list),
    // run the same guard against it instead of skipping the check.
    const guardTarget = target ?? hint;
    if (guardTarget) {
      const tehranToday = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Tehran',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
      if (!isBookingCancellable(guardTarget.date, guardTarget.timeSlot, tehranToday)) {
        setSyncNotification('رزروهای گذشته یا شروع‌شده قابل لغو نیستند.');
        return;
      }
    }
    // Real backend path: delete from Supabase first (server booking ids are
    // UUIDs; local-only ids start with 'booking-'). RLS allows the owner, a
    // super_admin, or the club's admin to delete.
    if (getSupabase() && bookingId && !bookingId.startsWith('booking-')) {
      try {
        await deleteBookingById(bookingId);
      } catch (err) {
        console.error('cancelBooking remote failed', err);
        setSyncNotification('خطا در لغو رزرو روی سرور. دوباره تلاش کنید.');
        return;
      }
    }
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    // Drop auto-created "need player" ads for the cancelled booking
    // (manual posts have no bookingId, so they're unaffected).
    setNeedPlayerPosts((prev) => prev.filter((p) => p.bookingId !== bookingId));
    // Drop the «دنگی» ledger record for the cancelled booking so it stops
    // inflating balances (deleteDongiRecord is a no-op when none exists).
    if (typeof deleteDongiRecord === 'function') {
      deleteDongiRecord(bookingId);
    }
    setSyncNotification('رزرو سانس با موفقیت لغو گردید.');
  };

  const createOpenMatch = (matchData: Omit<OpenMatch, 'id' | 'slots' | 'status'>): OpenMatch => {
    const newMatch: OpenMatch = {
      ...matchData,
      // Same-ms collision guard (same class as booking/coach-booking fixes, 2026-10-23).
      id: `match-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: 'open',
      slots: [
        {
          slotNumber: 1,
          team: 1,
          side: playerProfile.preferredSide === 'both' ? 'left' : playerProfile.preferredSide,
          playerId: playerProfile.id,
          playerName: playerProfile.name,
          playerAvatar: playerProfile.avatar,
          playerLevel: playerProfile.level,
        },
        { slotNumber: 2, team: 1, side: playerProfile.preferredSide === 'left' ? 'right' : 'left' },
        { slotNumber: 3, team: 2, side: 'left' },
        { slotNumber: 4, team: 2, side: 'right' },
      ],
    };
    setOpenMatches((prev) => [newMatch, ...prev]);
    setSyncNotification(`مسابقه جدید در ${newMatch.clubName} ایجاد شد.`);
    return newMatch;
  };

  const joinMatchSlot = (matchId: string, slotNumber: number): boolean => {
    // Validate against current state first: the setState updater runs
    // asynchronously under React 18 batching, so a flag set inside it can
    // never be returned (the old `success` was always false → toast never fired).
    const m = openMatches.find((x) => x.id === matchId);
    if (!m) return false;
    // Check if player already joined another slot
    if (m.slots.some((s) => s.playerId === playerProfile.id)) {
      setSyncNotification('شما قبلاً در این مسابقه شرکت کرده‌اید.');
      return false;
    }
    // Check level
    if (playerProfile.level < m.minLevel - LEVEL_JOIN_TOLERANCE || playerProfile.level > m.maxLevel + LEVEL_JOIN_TOLERANCE) {
      setSyncNotification(`سطح شما (${levelToGrade(playerProfile.level)}) با محدوده این مسابقه (${levelToGrade(m.minLevel)} - ${levelToGrade(m.maxLevel)}) منطبق نیست.`);
      return false;
    }
    const target = m.slots.find((s) => s.slotNumber === slotNumber);
    if (!target || target.playerId) return false;
    // Racing tap: a join for this match+player is already queued from this
    // render frame — the defensive updater below would decline it, so don't
    // toast or report success for it.
    const joinKey = `match:${matchId}:${playerProfile.id}`;
    if (pendingJoinRef.current.has(joinKey)) return false;
    pendingJoinRef.current.add(joinKey);

    setOpenMatches((prev) => {
      pendingJoinRef.current.delete(joinKey);
      return prev.map((x) => {
        if (x.id !== matchId) return x;
        // Defensive: pre-validation ran against state that may be stale when
        // two taps land in the same render frame — never allow the player in
        // two slots of the same match on rapid clicks.
        if (x.slots.some((s) => s.playerId === playerProfile.id)) return x;
        const updatedSlots = x.slots.map((slot) => {
          if (slot.slotNumber === slotNumber && !slot.playerId) {
            return {
              ...slot,
              playerId: playerProfile.id,
              playerName: playerProfile.name,
              playerAvatar: playerProfile.avatar,
              playerLevel: playerProfile.level,
            };
          }
          return slot;
        });

        const isFull = updatedSlots.every((s) => s.playerId);

        return {
          ...x,
          slots: updatedSlots,
          status: isFull ? 'full' : 'open',
        };
      });
    });

    setSyncNotification('شما با موفقیت به مسابقه پیوستید!');
    return true;
  };

  const leaveMatchSlot = (matchId: string, slotNumber: number) => {
    setOpenMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          const updatedSlots = m.slots.map((s) => {
            if (s.slotNumber === slotNumber && s.playerId === playerProfile.id) {
              return {
                slotNumber: s.slotNumber,
                team: s.team,
                side: s.side,
              };
            }
            return s;
          });
          return {
            ...m,
            slots: updatedSlots,
            status: 'open',
          };
        }
        return m;
      })
    );
    setSyncNotification('شما از این مسابقه انصراف دادید.');
  };

  const deleteOpenMatch = (matchId: string) => {
    setOpenMatches((prev) => prev.filter((m) => m.id !== matchId));
    setSyncNotification('مسابقه حذف شد.');
  };

  // ============ Group Sessions (سانس گروهی — multi-court open sessions) ============

  const makeGroupSessionCourts = (courtNames: string[]): GroupSessionCourt[] =>
    courtNames.map((courtName, ci) => ({
      courtNumber: ci + 1,
      courtName,
      slots: [1, 2, 3, 4].map((n) => ({
        slotNumber: n,
        team: (n <= 2 ? 1 : 2) as 1 | 2,
        side: (n % 2 === 1 ? 'left' : 'right') as 'left' | 'right',
      })),
    }));

  const createGroupSession = (
    data: Omit<GroupSession, 'id' | 'courts' | 'status' | 'createdAt'>,
    courtNames: string[]
  ): GroupSession => {
    const courts = makeGroupSessionCourts(courtNames);
    // Creator takes slot 1 of court 1
    courts[0].slots[0] = {
      ...courts[0].slots[0],
      playerId: playerProfile.id,
      playerName: playerProfile.name,
      playerAvatar: playerProfile.avatar,
      playerLevel: playerProfile.level,
    };
    const newSession: GroupSession = {
      ...data,
      id: `gs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, // same-ms collision guard, 2026-10-23
      status: 'open',
      courts,
      createdAt: new Date().toISOString(),
    };
    setGroupSessions((prev) => [newSession, ...prev]);
    setSyncNotification(`سانس گروهی جدید در ${newSession.clubName} ایجاد شد.`);
    return newSession;
  };

  const groupSessionIsFull = (courts: GroupSession['courts']) =>
    courts.every((c) => c.slots.every((s) => s.playerId));

  const joinGroupSessionSlot = (sessionId: string, courtNumber: number, slotNumber: number): boolean => {
    // Validate against current state first (same batching reason as joinMatchSlot).
    const g = groupSessions.find((x) => x.id === sessionId);
    if (!g) return false;
    // Seeded sample sessions (gs-sample-*) are display-only: joining one
    // used to report success while nothing real happened.
    if (g.id.startsWith('gs-sample-') || g.creatorId.startsWith('player-sample-')) {
      setSyncNotification('این سانس نمونه است و امکان پیوستن به آن وجود ندارد.');
      return false;
    }
    // Player may hold only one slot per session
    if (g.courts.some((c) => c.slots.some((s) => s.playerId === playerProfile.id))) {
      setSyncNotification('شما قبلاً در این سانس گروهی شرکت کرده‌اید.');
      return false;
    }
    if (playerProfile.level < g.minLevel - LEVEL_JOIN_TOLERANCE || playerProfile.level > g.maxLevel + LEVEL_JOIN_TOLERANCE) {
      setSyncNotification(`سطح شما (${levelToGrade(playerProfile.level)}) با محدوده این سانس (${levelToGrade(g.minLevel)} - ${levelToGrade(g.maxLevel)}) منطبق نیست.`);
      return false;
    }
    const targetCourt = g.courts.find((c) => c.courtNumber === courtNumber);
    const target = targetCourt?.slots.find((s) => s.slotNumber === slotNumber);
    if (!target || target.playerId) return false;
    // Racing tap: a join for this session+player is already queued from this
    // render frame — the defensive updater below would decline it, so don't
    // toast or report success for it.
    const joinKey = `gsession:${sessionId}:${playerProfile.id}`;
    if (pendingJoinRef.current.has(joinKey)) return false;
    pendingJoinRef.current.add(joinKey);

    setGroupSessions((prev) => {
      pendingJoinRef.current.delete(joinKey);
      return prev.map((x) => {
        if (x.id !== sessionId) return x;
        // Defensive: pre-validation ran against state that may be stale when
        // two taps land in the same render frame — never allow the player in
        // two slots of the same session on rapid clicks.
        if (x.courts.some((c) => c.slots.some((s) => s.playerId === playerProfile.id))) return x;
        const updatedCourts = x.courts.map((c) => {
          if (c.courtNumber !== courtNumber) return c;
          return {
            ...c,
            slots: c.slots.map((slot) => {
              if (slot.slotNumber === slotNumber && !slot.playerId) {
                return {
                  ...slot,
                  playerId: playerProfile.id,
                  playerName: playerProfile.name,
                  playerAvatar: playerProfile.avatar,
                  playerLevel: playerProfile.level,
                };
              }
              return slot;
            }),
          };
        });
        return {
          ...x,
          courts: updatedCourts,
          status: groupSessionIsFull(updatedCourts) ? 'full' : 'open',
        };
      });
    });
    setSyncNotification('شما با موفقیت به سانس گروهی پیوستید!');
    return true;
  };

  const leaveGroupSessionSlot = (sessionId: string, courtNumber: number, slotNumber: number) => {
    setGroupSessions((prev) =>
      prev.map((g) => {
        if (g.id !== sessionId) return g;
        const updatedCourts = g.courts.map((c) => {
          if (c.courtNumber !== courtNumber) return c;
          return {
            ...c,
            slots: c.slots.map((s) => {
              if (s.slotNumber === slotNumber && s.playerId === playerProfile.id) {
                return { slotNumber: s.slotNumber, team: s.team, side: s.side };
              }
              return s;
            }),
          };
        });
        return { ...g, courts: updatedCourts, status: 'open' as const };
      })
    );
    setSyncNotification('شما از این سانس گروهی انصراف دادید.');
  };

  const deleteGroupSession = (sessionId: string) => {
    setGroupSessions((prev) => prev.filter((g) => g.id !== sessionId));
    setSyncNotification('سانس گروهی حذف شد.');
  };

  // ============ Friendly Tournaments (matchmaking) ============

  const createFriendlyTournament = (
    data: Omit<FriendlyTournament, 'id' | 'status' | 'teams' | 'bracket' | 'createdAt'>
  ): FriendlyTournament => {
    const newT: FriendlyTournament = {
      ...data,
      id: `ft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, // same-ms collision guard, 2026-10-23
      status: 'open',
      teams: [],
      bracket: [],
      createdAt: new Date().toISOString(),
    };
    setFriendlyTournaments((prev) => [newT, ...prev]);
    setSyncNotification(`مسابقه دوستانه «${newT.title}» ایجاد شد.`);
    return newT;
  };

  const addFriendlyTeam = (tournId: string, team: Omit<FriendlyTeam, 'id'>): boolean => {
    // Duplicate team names: same trimmed + case-insensitive rejection as the
    // official registerTournamentTeam path — identical names confuse the TV
    // bracket display.
    const normName = (s: string) => s.trim().toLowerCase();
    const tourn = friendlyTournaments.find((x) => x.id === tournId);
    if (tourn && tourn.teams.some((tm) => normName(tm.teamName) === normName(team.teamName))) {
      setSyncNotification('تیمی با این نام قبلاً در این تورنمنت ثبت شده است.');
      return false;
    }
    // Not-open (or unknown) tournament: the state updater below is a no-op
    // for these, so returning true + the success toast here would lie about
    // a team that was never added. Fail honestly instead.
    if (!tourn || tourn.status !== 'open') {
      setSyncNotification('این تورنمنت دیگر برای ثبت تیم باز نیست.');
      return false;
    }
    setFriendlyTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== tournId || t.status !== 'open') return t;
        const newTeam: FriendlyTeam = { ...team, id: `ftm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
        return { ...t, teams: [...t.teams, newTeam] };
      })
    );
    setSyncNotification(`تیم «${team.teamName}» اضافه شد.`);
    return true;
  };

  // Seeded draw: sort by rank (lower = stronger), then snake-seed into a true
  // bracket — seeds 1&2 can only meet in the final.
  const drawFriendlyBracket = (tournId: string) => {
    // Round keys only go up to 64 teams: beyond that the first-round key
    // would fall back to 'round16' and crown a champion with matches
    // unplayed. Refuse the draw honestly instead of building a wrong bracket.
    const drawTourn = friendlyTournaments.find((x) => x.id === tournId);
    if (drawTourn && drawTourn.teams.length > 64) {
      setSyncNotification('قرعه‌کشی دوستانه فعلاً برای حداکثر ۶۴ تیم پشتیبانی می‌شود.');
      return;
    }
    // The updater below silently refuses a non-open tournament or one
    // with fewer than 2 teams, but the success toast used to fire anyway
    // — a stale button or same-tick double-click reported a draw that
    // never happened. Refuse honestly here instead; the ref guard covers
    // the same-tick double-click, where both closures still see 'open'.
    if (!drawTourn || drawTourn.status !== 'open' || drawTourn.teams.length < 2) {
      setSyncNotification('قرعه‌کشی ممکن نیست؛ تورنمنت باید در وضعیت ثبت‌نام و حداقل ۲ تیم داشته باشد.');
      return;
    }
    if (friendlyDrawGuardRef.current.has(tournId)) {
      setSyncNotification('برای این تورنمنت قبلاً قرعه‌کشی انجام شده است.');
      return;
    }
    friendlyDrawGuardRef.current.add(tournId);
    setFriendlyTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== tournId || t.status !== 'open' || t.teams.length < 2) return t;
        const sorted = [...t.teams].sort((a, b) => SKILL_GRADES.indexOf(a.rank) - SKILL_GRADES.indexOf(b.rank));
        // Pad to power of 2 with byes
        const n = sorted.length;
        const size = Math.pow(2, Math.ceil(Math.log2(n)));
        const seeded: (FriendlyTeam | null)[] = [...sorted];
        while (seeded.length < size) seeded.push(null);

        // True snake seeding: order the bracket positions so the halves stay
        // balanced — seeds 1&2 can only meet in the final. For 8 teams the
        // quarterfinals are 1v8, 4v5, 2v7, 3v6 (halves {1,4,5,8} vs {2,3,6,7}).
        // Byes (nulls) are appended after the real seeds, so they land on the
        // top seeds (e.g. 1v8 and 2v7 in a 6-team draw).
        const seedOrder = (n: number): number[] => {
          if (n <= 2) return [1, 2];
          const prev = seedOrder(n / 2);
          const out: number[] = [];
          for (const s of prev) out.push(s, n + 1 - s);
          return out;
        };
        const order = seedOrder(size);
        // Round key must match the true bracket depth: size 8 -> quarterfinal,
        // size 16 -> round16, size 32 -> round32. (Sizes 2/4 -> final/semifinal.)
        // Using a key shallower than the true depth makes recordFriendlyScore
        // reach 'final' with leftover matches, crowning a champion one round
        // early, so the key is derived from the actual bracket size.
        const firstRound: Record<number, { key: string; fa: string }> = {
          2: { key: 'final', fa: 'فینال' },
          4: { key: 'semifinal', fa: 'نیمه‌نهایی' },
          8: { key: 'quarterfinal', fa: 'یک‌چهارم نهایی' },
          16: { key: 'round16', fa: 'یک‌هشتم نهایی' },
          32: { key: 'round32', fa: 'یک‌شانزدهم نهایی' },
          64: { key: 'round64', fa: 'یک‌سی‌ودوم نهایی' },
        };
        const roundName = firstRound[size]?.key ?? 'round16';
        const roundFa = firstRound[size]?.fa ?? 'یک‌هشتم نهایی';
        const matches: FriendlyMatch[] = [];
        for (let i = 0; i < size / 2; i++) {
          const t1 = seeded[order[2 * i] - 1];
          const t2 = seeded[order[2 * i + 1] - 1];
          matches.push({
            id: `fm-${Date.now()}-${i}`,
            round: roundName,
            roundFa,
            team1Id: t1?.id ?? null,
            team2Id: t2?.id ?? null,
            score1: null,
            score2: null,
            winnerId: t1 && !t2 ? t1.id : !t1 && t2 ? t2.id : null, // bye auto-advance
          });
        }
        return { ...t, bracket: matches, status: 'draw_done' as const };
      })
    );
    setSyncNotification('قرعه‌کشی انجام شد!');
  };

  // Official tournament draw: same snake-seeding as drawFriendlyBracket, but
  // seeded from the tournament's REGISTERED teams and built in the official
  // BracketMatch shape (round keys round_16/quarter/semi/final). Generates
  // the full skeleton (later rounds start with TBD teams; winners advance
  // via updateTournamentBracketMatch). Odd team counts are padded to a power
  // of 2 exactly like generateBracket: byes land on the top seeds and
  // auto-advance, their winners propagated into the next round at draw time.
  const drawOfficialBracket = (tournId: string) => {
    const tourn = tournaments.find((t) => t.id === tournId);
    if (!tourn || tourn.status !== 'registration') return;
    // Never clobber an existing bracket — recorded results would be lost.
    if (tourn.bracket && tourn.bracket.length > 0) {
      setSyncNotification('برای این تورنمنت قبلاً قرعه‌کشی انجام شده است.');
      return;
    }
    const teams = tourn.registeredTeams;
    if (teams.length < 2) {
      setSyncNotification('برای قرعه‌کشی حداقل ۲ تیم ثبت‌نام‌شده لازم است.');
      return;
    }
    if (teams.length > 16) {
      setSyncNotification('قرعه‌کشی رسمی فعلاً برای حداکثر ۱۶ تیم پشتیبانی می‌شود.');
      return;
    }

    // Sort by strength: average numeric level, stronger first (ties broken
    // by name for a deterministic draw).
    const sorted = [...teams].sort((a, b) => {
      const sa = (a.player1Level + a.player2Level) / 2;
      const sb = (b.player1Level + b.player2Level) / 2;
      return sb - sa || a.teamName.localeCompare(b.teamName, 'fa');
    });
    const seedRank = new Map(sorted.map((t, i) => [t.id, i + 1]));

    const n = sorted.length;
    const size = Math.pow(2, Math.ceil(Math.log2(n)));
    const seeded: ((typeof sorted)[number] | null)[] = [...sorted];
    while (seeded.length < size) seeded.push(null);

    // True snake seeding — identical to drawFriendlyBracket: seeds 1&2 can
    // only meet in the final; byes (nulls) land on the top seeds.
    const seedOrder = (k: number): number[] => {
      if (k <= 2) return [1, 2];
      const prev = seedOrder(k / 2);
      const out: number[] = [];
      for (const s of prev) out.push(s, k + 1 - s);
      return out;
    };
    const order = seedOrder(size);

    // Round key derived from the true bracket size (same derivation as the
    // friendly draw). The official BracketMatch type supports up to round_16.
    const ROUND_BY_SIZE: Record<number, { key: BracketMatch['round']; fa: string }> = {
      2: { key: 'final', fa: 'فینال' },
      4: { key: 'semi', fa: 'نیمه‌نهایی' },
      8: { key: 'quarter', fa: 'یک‌چهارم نهایی' },
      16: { key: 'round_16', fa: 'یک‌هشتم نهایی' },
    };
    const first = ROUND_BY_SIZE[size];
    if (!first) return;

    const ROUND_SEQ: BracketMatch['round'][] = ['round_16', 'quarter', 'semi', 'final'];
    const ROUND_FA: Record<BracketMatch['round'], string> = {
      round_16: 'یک‌هشتم نهایی',
      quarter: 'یک‌چهارم نهایی',
      semi: 'نیمه‌نهایی',
      final: 'فینال',
    };

    const bracket: BracketMatch[] = [];
    const stamp = Date.now();
    let seq = 0;
    // First round from the snake order; a bye (one side null) auto-advances
    // its team: completed match with winnerId set, like the friendly draw.
    const firstRoundCount = size / 2;
    for (let i = 0; i < firstRoundCount; i++) {
      const t1 = seeded[order[2 * i] - 1];
      const t2 = seeded[order[2 * i + 1] - 1];
      const byeWinner = t1 && !t2 ? t1 : !t1 && t2 ? t2 : null;
      bracket.push({
        id: `ob-${stamp}-${seq++}`,
        round: first.key,
        roundName: first.fa,
        matchNumber: i + 1,
        team1: t1 ? { id: t1.id, name: t1.teamName, seed: seedRank.get(t1.id) } : undefined,
        team2: t2 ? { id: t2.id, name: t2.teamName, seed: seedRank.get(t2.id) } : undefined,
        status: byeWinner ? 'completed' : 'pending',
        winnerId: byeWinner ? byeWinner.id : undefined,
      });
    }
    // Later-round skeleton with TBD teams; matchNumber is sequential per
    // round so winner advancement pairing stays correct.
    const startIdx = ROUND_SEQ.indexOf(first.key);
    let prevCount = firstRoundCount;
    for (let r = startIdx + 1; r < ROUND_SEQ.length; r++) {
      const count = prevCount / 2;
      for (let i = 0; i < count; i++) {
        bracket.push({
          id: `ob-${stamp}-${seq++}`,
          round: ROUND_SEQ[r],
          roundName: ROUND_FA[ROUND_SEQ[r]],
          matchNumber: i + 1,
          status: 'pending',
        });
      }
      prevCount = count;
    }
    // Propagate bye winners forward into the next round's slots (match m ->
    // next-round match ceil(m/2); odd m -> team1, even m -> team2). Byes only
    // exist in the first round, so one forward pass suffices.
    for (let r = startIdx; r < ROUND_SEQ.length - 1; r++) {
      const cur = bracket
        .filter((m) => m.round === ROUND_SEQ[r])
        .sort((a, b) => a.matchNumber - b.matchNumber);
      const nxt = bracket
        .filter((m) => m.round === ROUND_SEQ[r + 1])
        .sort((a, b) => a.matchNumber - b.matchNumber);
      cur.forEach((m, idx) => {
        if (m.status === 'completed' && m.winnerId) {
          const winner = m.team1?.id === m.winnerId ? m.team1 : m.team2;
          const target = nxt[Math.floor(idx / 2)];
          if (winner && target) {
            target[idx % 2 === 0 ? 'team1' : 'team2'] = {
              id: winner.id,
              name: winner.name,
              seed: winner.seed,
            };
          }
        }
      });
    }

    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournId ? { ...t, bracket, status: 'draw_done' as const } : t
      )
    );

    // Persist the bracket server-side (fire-and-forget with surfaced errors,
    // same as updateTournamentBracketMatch). NOTE: status is deliberately NOT
    // persisted as 'draw_done' — the tournaments.status Postgres enum only
    // accepts registration/ongoing/completed and the write would be rejected.
    if (
      tourn &&
      getSupabase() &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tournId)
    ) {
      void updateTournament(tournId, { bracket }).catch((err) => {
        console.warn('drawOfficialBracket remote persist failed, keeping local bracket', err);
        setSyncNotification('⚠️ قرعه‌کشی انجام شد اما ذخیره‌سازی روی سرور ناموفق بود — لطفاً با پشتیبانی در میان بگذارید.');
      });
    }
    setSyncNotification('قرعه‌کشی رسمی انجام شد!');
  };

  const recordFriendlyScore = (tournId: string, matchId: string, score1: number, score2: number) => {
    if (score1 === score2) {
      setSyncNotification('نتیجه مساوی معتبر نیست؛ لطفاً برنده را مشخص کنید.');
      return;
    }
    // Unknown match (e.g. stale UI after a corrected-score invalidation
    // dropped later rounds): the updater below would be a no-op, so the
    // success toast at the end would lie. Fail honestly instead.
    const friendlyTourn = friendlyTournaments.find((x) => x.id === tournId);
    if (!friendlyTourn || !friendlyTourn.bracket.some((m) => m.id === matchId)) {
      setSyncNotification('این مسابقه یافت نشد؛ نتیجه ثبت نشد.');
      return;
    }
    setFriendlyTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== tournId) return t;

        const roundOrder: Record<string, number> = {
          round64: -2, round32: -1, round16: 0, quarterfinal: 1, semifinal: 2, final: 3,
        };

        // 1. Record the score
        const bracket = t.bracket.map((m) => {
          if (m.id !== matchId) return m;
          const winnerId = score1 > score2 ? m.team1Id : score2 > score1 ? m.team2Id : m.team1Id;
          return { ...m, score1, score2, winnerId };
        });

        // 1b. Corrected scores must propagate: if this recording CHANGES the
        //     match's winner (or scores a previously-unscored match feeding an
        //     existing later round), drop every later round — they were built
        //     from the old winner and are rebuilt below from the corrected
        //     one. An unchanged winner keeps the append-only forward path.
        const before = t.bracket.find((m) => m.id === matchId);
        const after = bracket.find((m) => m.id === matchId);
        const recOrder = roundOrder[before?.round ?? ''] ?? -3;
        const winnerChanged = !!before && !!after && before.winnerId !== after.winnerId;
        let workingBracket = bracket;
        let downstreamInvalidated = false;
        if (winnerChanged && bracket.some((m) => (roundOrder[m.round] ?? -3) > recOrder)) {
          workingBracket = bracket.filter((m) => (roundOrder[m.round] ?? -3) <= recOrder);
          downstreamInvalidated = true;
        }

        // 2. Group by round to find the LATEST round
        const byRound = new Map<string, typeof workingBracket>();
        workingBracket.forEach((m) => {
          if (!byRound.has(m.round)) byRound.set(m.round, []);
          byRound.get(m.round)!.push(m);
        });
        
        // Find latest round (highest order)
        let latestRound = '';
        let latestOrder = -3; // below round64 (-2) so round32 (-1)/round64 (-2) win the comparison
        byRound.forEach((_, round) => {
          const order = roundOrder[round] ?? -3;
          if (order > latestOrder) {
            latestOrder = order;
            latestRound = round;
          }
        });

        const latestMatches = byRound.get(latestRound) || [];
        const allWinnersDecided = latestMatches.length > 0 && latestMatches.every((m) => m.winnerId);
        
        let newBracket = [...workingBracket];
        // A corrected earlier-round winner invalidates the crowned champion
        // and runner-up: they will be re-decided as the rebuilt rounds play out.
        let status = downstreamInvalidated ? ('in_progress' as const) : t.status;
        let winnerTeamId = downstreamInvalidated ? undefined : t.winnerTeamId;
        let runnerUpTeamId = downstreamInvalidated ? undefined : t.runnerUpTeamId;

        if (allWinnersDecided) {
          if (latestRound === 'final') {
            // Tournament complete!
            const finalMatch = latestMatches[0];
            winnerTeamId = finalMatch.winnerId ?? undefined;
            runnerUpTeamId = finalMatch.winnerId === finalMatch.team1Id 
              ? finalMatch.team2Id ?? undefined 
              : finalMatch.team1Id ?? undefined;
            status = 'completed';
          } else {
            // Create next round from winners of latest round
            const winners = latestMatches.map((m) => m.winnerId as string).filter(Boolean);
            const nextOrder = latestOrder + 1;
            const nextRound = Object.keys(roundOrder).find((k) => roundOrder[k] === nextOrder) || '';
            const nextRoundFa = nextRound === 'semifinal' ? 'نیمه‌نهایی' 
              : nextRound === 'final' ? 'فینال'
              : nextRound === 'quarterfinal' ? 'یک‌چهارم نهایی'
              : nextRound === 'round16' ? 'یک‌هشتم نهایی'
              : nextRound === 'round32' ? 'یک‌شانزدهم نهایی'
              : nextRound === 'round64' ? 'یک‌سی‌ودوم نهایی' : '';
            
            if (nextRound && winners.length >= 2) {
              const nextMatches: FriendlyMatch[] = [];
              for (let i = 0; i < winners.length; i += 2) {
                // Skip bye vs bye (shouldn't happen, but safe)
                if (!winners[i] && !winners[i + 1]) continue;
                nextMatches.push({
                  id: `fm-${Date.now()}-r${nextOrder}-${i}`,
                  round: nextRound,
                  roundFa: nextRoundFa,
                  team1Id: winners[i] ?? null,
                  team2Id: winners[i + 1] ?? null,
                  score1: null,
                  score2: null,
                  // Auto-advance if one side is bye
                  winnerId: winners[i] && !winners[i + 1] ? winners[i] : !winners[i] && winners[i + 1] ? winners[i + 1] : null,
                });
              }
              if (nextMatches.length > 0) {
                newBracket = [...workingBracket, ...nextMatches];
                status = 'in_progress';
              }
            } else if (winners.length === 1) {
              // Single winner = champion (happens with byes). The runner-up
              // is the other side of the deciding match, when it is known —
              // otherwise the completed tournament showed a blank runner-up.
              winnerTeamId = winners[0];
              const decidingMatch = latestMatches.find((m) => m.winnerId === winners[0]);
              runnerUpTeamId = decidingMatch
                ? (decidingMatch.winnerId === decidingMatch.team1Id
                    ? decidingMatch.team2Id ?? undefined
                    : decidingMatch.team1Id ?? undefined)
                : undefined;
              status = 'completed';
            }
          }
        }

        return { ...t, bracket: newBracket, status, winnerTeamId, runnerUpTeamId };
      })
    );
    setSyncNotification('نتیجه ثبت شد!');
  };

  const finalizeFriendlyTournament = (tournId: string) => {
    setFriendlyTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== tournId) return t;
        return { ...t, status: 'completed' as const };
      })
    );
    setSyncNotification('مسابقه دوستانه به پایان رسید!');
  };

  // Undo an accidental friendly-tournament draw (A5): only allowed while
  // the bracket exists, status is still draw_done, and NO match has a
  // recorded result. A "recorded result" means a winnerId accompanied by
  // scores (recordFriendlyScore always sets score1+score2+winnerId
  // together); a bare winnerId with null scores is just a bye auto-advance
  // from the draw and must not block the undo. Resets to open so teams
  // can be edited and the draw re-run. Persists via the existing
  // friendly_tournaments localStorage effect.
  const resetFriendlyBracket = (tournId: string) => {
    const t = friendlyTournaments.find((x) => x.id === tournId);
    if (!t || t.status !== 'draw_done' || !t.bracket || t.bracket.length === 0) return;
    const anyResult = t.bracket.some(
      (m) => m.winnerId !== null && (m.score1 !== null || m.score2 !== null)
    );
    if (anyResult) return;
    // Release the draw guard so the undone tournament can be re-drawn.
    friendlyDrawGuardRef.current.delete(tournId);
    setFriendlyTournaments((prev) =>
      prev.map((x) => (x.id === tournId ? { ...x, bracket: [], status: 'open' as const } : x))
    );
    setSyncNotification('قرعه‌کشی حذف شد و تورنمنت به وضعیت ثبت‌نام برگشت.');
  };

  const createNeedPlayerPost = (postData: Omit<NeedPlayerPost, 'id' | 'joinedPlayers' | 'status'>) => {
    const newPost: NeedPlayerPost = {
      ...postData,
      // Same-ms collision guard (same class as createNeedPostForBooking fix, 2026-10-23).
      id: `np-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      joinedPlayers: [],
      status: 'active',
    };
    setNeedPlayerPosts((prev) => [newPost, ...prev]);
    setSyncNotification('آگهی نیاز به بازیکن با موفقیت منتشر شد.');
  };

  const joinNeedPlayerPost = (postId: string): boolean => {
    // Validate against current state first (same batching reason as joinMatchSlot).
    const p = needPlayerPosts.find((x) => x.id === postId);
    if (!p) return false;
    if (p.hostPlayerId === playerProfile.id) {
      setSyncNotification('شما خودتان میزبان این سانس هستید.');
      return false;
    }
    if (p.joinedPlayers.some((j) => j.playerId === playerProfile.id)) {
      setSyncNotification('شما قبلاً به این بازی پیوسته‌اید.');
      return false;
    }
    if (p.spotsNeeded <= p.joinedPlayers.length) {
      setSyncNotification('ظرفیت این درخواست تکمیل شده است.');
      return false;
    }
    if (playerProfile.level < p.minLevel - LEVEL_JOIN_TOLERANCE || playerProfile.level > p.maxLevel + LEVEL_JOIN_TOLERANCE) {
      setSyncNotification(`سطح شما (${levelToGrade(playerProfile.level)}) با محدوده این آگهی (${levelToGrade(p.minLevel)} - ${levelToGrade(p.maxLevel)}) منطبق نیست.`);
      return false;
    }

    const newJoin = {
      playerId: playerProfile.id,
      playerName: playerProfile.name,
      avatar: playerProfile.avatar,
      level: playerProfile.level,
      side: playerProfile.preferredSide,
    };
    // Racing tap: a join for this post+player is already queued from this
    // render frame — the defensive updater below would decline it, so don't
    // toast or report success for it.
    const joinKey = `needpost:${postId}:${playerProfile.id}`;
    if (pendingJoinRef.current.has(joinKey)) return false;
    pendingJoinRef.current.add(joinKey);

    setNeedPlayerPosts((prev) => {
      pendingJoinRef.current.delete(joinKey);
      return prev.map((x) => {
        if (x.id !== postId) return x;
        // Defensive: never exceed capacity on rapid clicks.
        if (x.spotsNeeded <= x.joinedPlayers.length) return x;
        if (x.joinedPlayers.some((j) => j.playerId === playerProfile.id)) return x;
        const updatedJoined = [...x.joinedPlayers, newJoin];
        return {
          ...x,
          joinedPlayers: updatedJoined,
          status: updatedJoined.length >= x.spotsNeeded ? 'filled' : 'active',
        };
      });
    });
    setSyncNotification('درخواست پیوستن شما به عنوان بازیکن آزاد ثبت شد!');
    return true;
  };

  // Leave a need-player post: removes the current player from joinedPlayers.
  // Returns false (with a notification) when the post doesn't exist or the
  // user isn't joined — the view only renders the button for joined users,
  // so this is defense-in-depth.
  const leaveNeedPlayerPost = (postId: string): boolean => {
    const p = needPlayerPosts.find((x) => x.id === postId);
    if (!p) {
      setSyncNotification('این آگهی پیدا نشد.');
      return false;
    }
    if (!p.joinedPlayers.some((j) => j.playerId === playerProfile.id)) {
      setSyncNotification('شما عضو این آگهی نیستید.');
      return false;
    }
    setNeedPlayerPosts((prev) =>
      prev.map((x) => {
        if (x.id !== postId) return x;
        const joinedPlayers = x.joinedPlayers.filter((j) => j.playerId !== playerProfile.id);
        return {
          ...x,
          joinedPlayers,
          status: joinedPlayers.length >= x.spotsNeeded ? 'filled' : 'active',
        };
      })
    );
    setSyncNotification('از آگهی نیاز به بازیکن خارج شدید.');
    return true;
  };

  // Delete a need-player post. Gating mirrors canDeleteMatch/canDeleteSession
  // (MatchmakingView): the host (hostPlayerId === current player) or a
  // super_admin may delete. The view confirms with window.confirm before
  // calling; this is defense-in-depth. Returns false + notification
  // otherwise.
  const deleteNeedPlayerPost = (postId: string): boolean => {
    const p = needPlayerPosts.find((x) => x.id === postId);
    if (!p) {
      setSyncNotification('این آگهی پیدا نشد.');
      return false;
    }
    const allowed =
      p.hostPlayerId === playerProfile.id || currentUserRole === 'super_admin';
    if (!allowed) {
      setSyncNotification('فقط میزبان آگهی یا مدیر سیستم می‌تواند آن را حذف کند.');
      return false;
    }
    setNeedPlayerPosts((prev) => prev.filter((x) => x.id !== postId));
    setSyncNotification('آگهی نیاز به بازیکن حذف شد.');
    return true;
  };

  const toggleFreeAgentStatus = (available: boolean, note?: string) => {
    updatePlayerProfile({
      isFreeAgent: available,
      freeAgentNote: note || playerProfile.freeAgentNote,
    });
    setSyncNotification(
      available
        ? 'وضعیت شما به "بازیکن آزاد آماده به بازی" تغییر یافت.'
        : 'وضعیت بازیکن آزاد شما غیرفعال شد.'
    );
  };

  const inviteFreeAgent = (agentId: string, matchTitle: string) => {
    const agent = freeAgents.find((a) => a.id === agentId);
    if (agent) {
      setSyncNotification(`دعوت‌نامه بازی «${matchTitle}» برای ${agent.name} با موفقیت ارسال شد.`);
    }
  };

  const bookCoach = (bookingData: Omit<CoachBooking, 'id' | 'status'>): CoachBooking | null => {
    // Local duplicate-slot guard: coach bookings are stored client-side only
    // (no server insert — see the coach_bookings table gap), so this check is
    // the only thing stopping the same coach/day/hour from being booked
    // twice. Returns null so the caller can show a clear message.
    // In-flight guard: `coachBookings` is closure state and stays stale when
    // the confirm button is double-tapped before React re-renders. A second
    // call with the same slot key within 5s of a successful booking is a
    // duplicate tap, not a new intent — block it (key held past the
    // synchronous body, 2026-10-24, same fix as the court-booking guard).
    const slotKey = `${bookingData.coachId}|${bookingData.date}|${bookingData.time}`;
    if (coachBookingInFlightRef.current.has(slotKey)) return null;
    coachBookingInFlightRef.current.add(slotKey);
    const dup = coachBookings.some(
      (b) => b.coachId === bookingData.coachId && b.date === bookingData.date && b.time === bookingData.time
    );
    if (dup) {
      coachBookingInFlightRef.current.delete(slotKey);
      return null;
    }
    const newBooking: CoachBooking = {
      ...bookingData,
      // Date.now() alone can collide for two bookings in the same millisecond;
      // the random suffix keeps React keys and the local list unique.
      id: `cb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: 'confirmed',
    };
    setCoachBookings((prev) => [newBooking, ...prev]);
    setSyncNotification(`جلسه تمرینی با مربی ${newBooking.coachName} تایید و رزرو شد!`);
    // Hold the key past this synchronous body (2026-10-24): same flaw as
    // the court-booking guard — a finally-delete only blocks re-entrant
    // calls, not a double-tap whose second call resumes after an await.
    window.setTimeout(() => coachBookingInFlightRef.current.delete(slotKey), 5000);
    return newBooking;
  };

  const createTournament = async (
    tournData: Omit<Tournament, 'id' | 'registeredTeamsCount' | 'registeredTeams' | 'status'>
  ): Promise<Tournament> => {
    const authUserId = auth?.user?.id ?? null;
    const role = auth?.profile?.role ?? null;
    // Official tournaments are reserved for admins; everyone else creates
    // friendly ones. RLS enforces this server-side too.
    const official = role === 'super_admin' || role === 'province_admin' || role === 'club_admin';

    // Real backend path: insert into Supabase so every user sees it. Dates
    // must be ISO (YYYY-MM-DD) for the `date` columns — the form now collects
    // them with native date inputs.
    // Bundled local clubs ('club-…') have no server rows (tournaments.club_id
    // is a uuid column): route them through the local fallback even when
    // signed in — otherwise the insert fails with 22P02 and the tournament
    // is never created (same shape as the 2026-10-22 booking fix).
    // The `tournData.clubId &&` guard matches the booking path: a falsy
    // clubId must never reach .startsWith (TypeError would bypass both the
    // remote catch and the local fallback below).
    if (getSupabase() && authUserId && tournData.clubId && !tournData.clubId.startsWith('club-')) {
      try {
        const remote = await insertTournament(
          {
            title: tournData.title,
            clubId: tournData.clubId,
            clubName: tournData.clubName,
            province: tournData.province,
            category: tournData.category,
            format: tournData.format,
            startDate: tournData.startDate,
            endDate: tournData.endDate,
            registrationDeadline: tournData.registrationDeadline,
            entryFee: tournData.entryFee,
            prizePool: tournData.prizePool,
            maxTeams: tournData.maxTeams,
            levelRange: tournData.levelRange,
            bannerImage: tournData.bannerImage,
            rules: tournData.rules,
            official,
            organizerType: tournData.organizerType,
          },
          authUserId
        );
        setTournaments((prev) => [remote, ...prev]);
        setSyncNotification(`تورنومنت «${remote.title}» با موفقیت ثبت شد!`);
        return remote;
      } catch (err) {
        console.error('createTournament remote failed', err);
        setSyncNotification('خطا در ثبت تورنمنت روی سرور. دوباره تلاش کنید.');
        throw err;
      }
    }

    // Local fallback (offline / not signed in)
    const newTourn: Tournament = {
      ...tournData,
      id: `tourn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, // same-ms collision guard, 2026-10-23
      registeredTeamsCount: 0,
      registeredTeams: [],
      status: 'registration',
    };
    setTournaments((prev) => [newTourn, ...prev]);
    setSyncNotification(`تورنومنت «${newTourn.title}» توسط باشگاه ثبت شد!`);
    return newTourn;
  };

  const registerTournamentTeam = (
    tournId: string,
    teamName: string,
    partnerName: string,
    partnerLevel: number
  ): boolean => {
    // Validate against current state BEFORE setTournaments: React 18 batches
    // the updater, so a flag set inside it is never visible at return time
    // (the old `success` flag was always false → modal never closed, no toast).
    const t = tournaments.find((x) => x.id === tournId);
    // Silent `return false` here left the register modal open with no
    // feedback when the tournament vanished between list render and submit
    // — every other refusal branch toasts, so this one does too.
    if (!t) {
      setSyncNotification('این تورنومنت دیگر موجود نیست.');
      return false;
    }
    // Registration is only open while the tournament is in 'registration'
    // status: the server RLS policy rejects team inserts for ongoing /
    // completed tournaments, so refuse locally with the same
    // error-return pattern instead of a silent remote failure.
    if (t.status !== 'registration') {
      setSyncNotification('مهلت ثبت‌نام این تورنومنت به پایان رسیده است.');
      return false;
    }
    // A drawn bracket means registration is over even if the status was not
    // persisted server-side (A2): refuse with the same error-return pattern
    // instead of a silent remote RLS failure.
    if (t.bracket && t.bracket.length > 0) {
      setSyncNotification('قرعه‌کشی این تورنومنت انجام شده و ثبت‌نام بسته است.');
      return false;
    }
    // Registration deadline: stored at creation (and validated ≤ start
    // date) but never enforced here — a team could register after the
    // deadline as long as the status was still 'registration'. ISO
    // YYYY-MM-DD strings compare lexicographically; the deadline day
    // itself is still open.
    if (t.registrationDeadline) {
      // Tehran date, like every other date guard in the app (booking,
      // cancellation): the device timezone must not move the deadline.
      const todayStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Tehran',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
      if (todayStr > t.registrationDeadline) {
        setSyncNotification('مهلت ثبت‌نام این تورنومنت به پایان رسیده است.');
        return false;
      }
    }
    if (t.registeredTeamsCount >= t.maxTeams) {
      setSyncNotification('ظرفیت ثبت‌نام این تورنومنت تکمیل شده است.');
      return false;
    }
    // A blank profile name must never register: the duplicate check below
    // is name-equality, so one blank-captain team ('' === '') would block
    // every other anonymous visitor from registering in this tournament.
    if (!playerProfile.name || !playerProfile.name.trim()) {
      setSyncNotification('ابتدا نام خود را در پروفایل وارد کنید، سپس تیم ثبت کنید.');
      return false;
    }
    const isRegistered = t.registeredTeams.some(
      (tm) => tm.player1Name === playerProfile.name || tm.player2Name === playerProfile.name
    );
    if (isRegistered) {
      setSyncNotification('شما قبلاً در این تورنومنت تیم ثبت کرده‌اید.');
      return false;
    }
    // Duplicate team names: the finalize flow matches teams by name, so
    // identical names mis-credit rankings and the catalog-merge dedupe
    // silently drops one registration. Compare trimmed + case-insensitive.
    const normName = (s: string) => s.trim().toLowerCase();
    if (t.registeredTeams.some((tm) => normName(tm.teamName) === normName(teamName))) {
      setSyncNotification('تیمی با این نام قبلاً در این تورنمنت ثبت شده است.');
      return false;
    }
    // Partner validation: the partner was never checked — a captain could
    // register themselves as partner (player1 === player2) or a player
    // already in another team of this tournament, and bracket/ranking
    // matching (by name) would then count one person twice. The
    // 'هم‌تیمی انتخابی' placeholder means "no partner chosen", not a real
    // person, so it is exempt from both checks.
    const normPartner = normName(partnerName);
    const isPlaceholderPartner = normPartner === normName('هم‌تیمی انتخابی');
    if (!isPlaceholderPartner) {
      if (normPartner === normName(playerProfile.name)) {
        setSyncNotification('هم‌تیمی نمی‌تواند خودتان باشید.');
        return false;
      }
      if (
        t.registeredTeams.some(
          (tm) => normName(tm.player1Name) === normPartner || normName(tm.player2Name) === normPartner
        )
      ) {
        setSyncNotification('این بازیکن قبلاً در تیم دیگری در این تورنمنت ثبت شده است.');
        return false;
      }
    }

    const newTeam = {
      // Same-ms collision guard (same class as booking/coach-booking fixes, 2026-10-23).
      id: `tm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      teamName,
      player1Name: playerProfile.name,
      player1Level: playerProfile.level,
      player2Name: partnerName,
      player2Level: partnerLevel,
    };
    setTournaments((prev) =>
      prev.map((x) => {
        if (x.id !== tournId) return x;
        // Defensive: never exceed capacity, double-register on rapid
        // clicks, or add a duplicate team name.
        if (x.registeredTeamsCount >= x.maxTeams) return x;
        if (
          x.registeredTeams.some(
            (tm) => tm.player1Name === playerProfile.name || tm.player2Name === playerProfile.name
          )
        )
          return x;
        if (
          x.registeredTeams.some(
            (tm) => normName(tm.teamName) === normName(newTeam.teamName)
          )
        )
          return x;
        // Defensive mirror of the partner checks above (same-tick race):
        // never let a self-partner or an already-registered partner slip
        // in through the updater. Placeholder partner exempt, as above.
        if (normName(newTeam.player2Name) !== normName('هم‌تیمی انتخابی')) {
          if (
            normName(newTeam.player2Name) === normName(playerProfile.name) ||
            x.registeredTeams.some(
              (tm) =>
                normName(tm.player1Name) === normName(newTeam.player2Name) ||
                normName(tm.player2Name) === normName(newTeam.player2Name)
            )
          )
            return x;
        }
        return {
          ...x,
          registeredTeamsCount: x.registeredTeamsCount + 1,
          registeredTeams: [...x.registeredTeams, newTeam],
        };
      })
    );
    setSyncNotification(`تیم «${teamName}» با موفقیت در تورنومنت ثبت شد.`);
    // Persist to Supabase (fire-and-forget): without this the registration
    // only lives in local state/localStorage and is wiped on the next
    // catalog reload from the server. The local state above is the
    // optimistic fallback — a failed insert never blocks or undoes it.
    // Local-only tournaments (ids like `tourn-…`) have no server row, so
    // their teams can't be inserted (tournament_id is a UUID FK).
    if (
      getSupabase() &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tournId)
    ) {
      void insertTournamentTeam({
        tournamentId: tournId,
        teamName,
        player1Id: auth?.user?.id ?? null,
        player1Name: playerProfile.name,
        player1Level: playerProfile.level,
        player2Id: null,
        player2Name: partnerName,
        player2Level: partnerLevel,
      }).catch((err) => {
        console.warn(
          'registerTournamentTeam remote insert failed, keeping local registration',
          err
        );
        // The success toast above already fired, so a silent failure would
        // leave a team that is invisible on other devices with no hint.
        // Surface it: the registration survives locally, but it never
        // reached the server.
        setSyncNotification('تیم به‌صورت محلی ثبت شد ولی همگام‌سازی با سرور ناموفق بود؛ در دستگاه‌های دیگر دیده نمی‌شود.');
      });
    }
    return true;
  };

  // Recompute the derived ranking columns after any award: overall rank
  // (points desc), province rank (position within the player's own
  // province, points desc), and win rate (won/played). These columns were
  // never written by any award path, so the table rendered empty
  // province-rank / win-rate cells even for players with points.
  const recomputeRankingDerived = (list: RankingPlayer[]): RankingPlayer[] => {
    const provinceCounters = new Map<string, number>();
    return [...list]
      .sort((a, b) => b.points - a.points)
      .map((p, idx) => {
        const n = (provinceCounters.get(p.province) ?? 0) + 1;
        provinceCounters.set(p.province, n);
        return {
          ...p,
          rank: idx + 1,
          provinceRank: n,
          winRate: p.tournamentsPlayed > 0 ? Math.round((p.tournamentsWon / p.tournamentsPlayed) * 100) : 0,
        };
      });
  };

  // Awards provincial/country ranking points for a tournament result.
  // Extracted (verbatim logic) so the free-text finalize path and the
  // bracket-completion path award IDENTICAL points. Callers guard with
  // get/setAwardedWinner so each tournament's participant credit is given
  // exactly once; a corrected final crowning a DIFFERENT champion uses
  // awardChampionPointsOnly instead (the new champion still receives
  // champion points — no revocation, deliberate product constraint).
  // MUST be called outside setTournaments updaters (StrictMode
  // double-invokes updaters → double award); calling setRankings +
  // setSyncNotification directly here is fine.
  const awardTournamentRankingPoints = (
    tourn: Tournament,
    winnerTeamName: string,
    runnerUpTeamName: string
  ) => {
    setRankings((prev) => {
      const norm = (s: string) => s.trim();
      const winnerTeam = tourn?.registeredTeams.find((tm) => norm(tm.teamName) === norm(winnerTeamName));
      const runnerUpTeam = tourn?.registeredTeams.find((tm) => norm(tm.teamName) === norm(runnerUpTeamName));
      // The registration form defaults an empty partner to the placeholder
      // «هم‌تیمی انتخابی» — a label, not a player: never credit it points.
      const isPlaceholderPlayer = (n: string) => n.trim() === 'هم‌تیمی انتخابی';
      const winnerNames = winnerTeam ? [winnerTeam.player1Name, winnerTeam.player2Name].filter((n) => !isPlaceholderPlayer(n)) : [];
      const runnerUpNames = runnerUpTeam ? [runnerUpTeam.player1Name, runnerUpTeam.player2Name].filter((n) => !isPlaceholderPlayer(n)) : [];
      const participantNames = new Set((tourn?.registeredTeams ?? []).flatMap((tm) => [tm.player1Name, tm.player2Name]).filter((n) => !isPlaceholderPlayer(n)));
      if (!winnerTeam) {
        setSyncNotification('نام تیم قهرمان در فهرست ثبت‌نام‌شده‌ها پیدا نشد؛ امتیاز رنکینگ برای قهرمان ثبت نشد.');
      }
      const updated = prev.map((player) => {
        if (winnerNames.includes(player.name)) {
          return { ...player, points: player.points + 250, tournamentsPlayed: player.tournamentsPlayed + 1, tournamentsWon: player.tournamentsWon + 1, form: (['W', ...player.form.slice(0, 4)] as ('W' | 'L')[]) };
        }
        if (runnerUpNames.includes(player.name)) {
          return { ...player, points: player.points + 150, tournamentsPlayed: player.tournamentsPlayed + 1, form: (['L', ...player.form.slice(0, 4)] as ('W' | 'L')[]) };
        }
        if (participantNames.has(player.name)) {
          return { ...player, points: player.points + 50, tournamentsPlayed: player.tournamentsPlayed + 1, form: (['L', ...player.form.slice(0, 4)] as ('W' | 'L')[]) };
        }
        return player; // non-participants: completely untouched
      });
      // A first-time winner/participant used to never appear: the map
      // above only updates existing rows, so on a fresh install (empty
      // rankings) the "rankings updated!" toast lied and the table stayed
      // empty forever. Insert a row for every participant missing one,
      // with the same credit the map branch would have given them.
      const present = new Set(updated.map((p) => p.name));
      const extras: RankingPlayer[] = [];
      const insertRow = (name: string, level: number, points: number, won: number) => {
        if (!name || name.trim() === 'هم‌تیمی انتخابی' || present.has(name)) return;
        present.add(name);
        extras.push({
          rank: 0,
          provinceRank: 0,
          id: name === playerProfile.name ? playerProfile.id : `rk-${name.trim().replace(/\s+/g, '-')}`,
          name,
          avatar: '',
          province: tourn?.province ?? '',
          level,
          points,
          tournamentsPlayed: 1,
          tournamentsWon: won,
          winRate: 0,
          form: [(won ? 'W' : 'L') as 'W' | 'L'],
        });
      };
      for (const tm of tourn?.registeredTeams ?? []) {
        const isWinner = norm(tm.teamName) === norm(winnerTeamName);
        const isRunnerUp = norm(tm.teamName) === norm(runnerUpTeamName);
        insertRow(tm.player1Name, tm.player1Level, isWinner ? 250 : isRunnerUp ? 150 : 50, isWinner ? 1 : 0);
        insertRow(tm.player2Name, tm.player2Level, isWinner ? 250 : isRunnerUp ? 150 : 50, isWinner ? 1 : 0);
      }
      return recomputeRankingDerived([...updated, ...extras]);
    });

    setSyncNotification(`نتایج تورنومنت ثبت شد و جدول رنکینگ استانی و کشوری آپدیت گردید!`);
  };

  // Champion-only award for a CORRECTED final that crowns a different
  // champion after the full award already ran: mirrors the winner and
  // runner-up branches of awardTournamentRankingPoints ONLY (winner's
  // players +250 / tournamentsWon +1 / form 'W'; runner-up's players +150 /
  // form 'L'). NO participant +50, NO tournamentsPlayed increments —
  // every participant was already credited exactly once by the first award.
  // Anti-double-dip (2026-10-22): a team already placement-credited for
  // this tournament is never re-credited — the previously recorded
  // champion is skipped in the runner-up branch (a champion/runner-up swap
  // used to stack +150 on the old champion's +250), an UNCHANGED runner-up
  // is skipped too (it used to get +150 twice: 300 points for one
  // tournament), and a re-crowned original champion is skipped in the
  // winner branch (+250 was awarded twice: 500 points, tournamentsWon +2).
  // The old champion's award stands untouched (deliberate product
  // constraint), nothing is revoked and nothing extra is added.
  // Same sort + rank recompute as the full award; same StrictMode caveat
  // (must be called outside state updaters).
  const awardChampionPointsOnly = (
    tourn: Tournament,
    winnerTeamName: string,
    runnerUpTeamName: string,
    previousWinnerTeamName?: string
  ) => {
    const norm = (s: string) => s.trim();
    // Teams already placement-credited for THIS tournament: never re-credited.
    // (2026-10-22) Two holes the old "previous winner only" skip missed:
    //  1. a corrected final with an UNCHANGED runner-up re-awarded the
    //     runner-up +150 a second time (300 points for one tournament);
    //  2. a second correction re-crowning the ORIGINAL champion re-awarded
    //     the +250 champion credit (500 points, tournamentsWon +2) because
    //     the record only remembered the latest winner.
    // The record's championsCredited/runnerUpsCredited arrays are the source
    // of truth; previousWinnerTeamName stays as a legacy fallback.
    const record = getAwardedRecord(tourn.id);
    const champTeams = new Set(
      [...(record?.championsCredited ?? []), ...(previousWinnerTeamName ? [previousWinnerTeamName] : [])].map(norm)
    );
    const runnerTeams = new Set((record?.runnerUpsCredited ?? []).map(norm));
    const winnerAlreadyCredited = champTeams.has(norm(winnerTeamName));
    const runnerUpAlreadyCredited =
      runnerTeams.has(norm(runnerUpTeamName)) || champTeams.has(norm(runnerUpTeamName));
    setRankings((prev) => {
      const winnerTeam = tourn?.registeredTeams.find((tm) => norm(tm.teamName) === norm(winnerTeamName));
      const runnerUpTeam = tourn?.registeredTeams.find((tm) => norm(tm.teamName) === norm(runnerUpTeamName));
      const winnerNames = winnerTeam ? [winnerTeam.player1Name, winnerTeam.player2Name].filter((n) => n.trim() !== 'هم‌تیمی انتخابی') : [];
      const runnerUpNames = runnerUpTeam ? [runnerUpTeam.player1Name, runnerUpTeam.player2Name].filter((n) => n.trim() !== 'هم‌تیمی انتخابی') : [];
      if (!winnerTeam) {
        setSyncNotification('نام تیم قهرمان در فهرست ثبت‌نام‌شده‌ها پیدا نشد؛ امتیاز رنکینگ برای قهرمان ثبت نشد.');
      }
      const updated = prev.map((player) => {
        if (winnerNames.includes(player.name) && !winnerAlreadyCredited) {
          return { ...player, points: player.points + 250, tournamentsWon: player.tournamentsWon + 1, form: (['W', ...player.form.slice(0, 4)] as ('W' | 'L')[]) };
        }
        if (runnerUpNames.includes(player.name) && !runnerUpAlreadyCredited) {
          return { ...player, points: player.points + 150, form: (['L', ...player.form.slice(0, 4)] as ('W' | 'L')[]) };
        }
        return player; // participants already credited by the first full award: untouched
      });
      // Same insert-missing rule as the full award: a corrected final can
      // crown a player with no row (e.g. the first award ran pre-fix and
      // inserted nothing). A missing row means the credit never
      // materialized anywhere visible, so inserting it is a repair, not a
      // double credit — existing rows are still never re-credited.
      const present = new Set(updated.map((p) => p.name));
      const extras: RankingPlayer[] = [];
      const insertRow = (name: string, level: number, points: number, won: number) => {
        if (!name || name.trim() === 'هم‌تیمی انتخابی' || present.has(name)) return;
        present.add(name);
        extras.push({
          rank: 0,
          provinceRank: 0,
          id: name === playerProfile.name ? playerProfile.id : `rk-${name.trim().replace(/\s+/g, '-')}`,
          name,
          avatar: '',
          province: tourn?.province ?? '',
          level,
          points,
          tournamentsPlayed: 1,
          tournamentsWon: won,
          winRate: 0,
          form: [(won ? 'W' : 'L') as 'W' | 'L'],
        });
      };
      if (winnerTeam) {
        insertRow(winnerTeam.player1Name, winnerTeam.player1Level, 250, 1);
        insertRow(winnerTeam.player2Name, winnerTeam.player2Level, 250, 1);
      }
      if (runnerUpTeam) {
        insertRow(runnerUpTeam.player1Name, runnerUpTeam.player1Level, 150, 0);
        insertRow(runnerUpTeam.player2Name, runnerUpTeam.player2Level, 150, 0);
      }
      return recomputeRankingDerived([...updated, ...extras]);
    });

    setSyncNotification(`نتایج تورنومنت اصلاح و جدول رنکینگ استانی و کشوری آپدیت گردید!`);
  };

  const finalizeTournamentResults = (
    tournId: string,
    winnerTeamName: string,
    runnerUpTeamName: string
  ) => {
    const tourn = tournaments.find((t) => t.id === tournId);
    // Defense in depth (the UI validates too): a tournament cannot be
    // finalized before its start date — otherwise permanent ranking
    // points would be awarded for matches never played.
    if (tourn?.startDate) {
      const todayStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Tehran',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
      if (todayStr < tourn.startDate) {
        setSyncNotification('نتیجه نهایی ثبت نشد: تورنمنت هنوز شروع نشده است.');
        return;
      }
    }
    // Defense in depth (the UI validates too): winner/runner-up must be
    // registered teams and must differ — otherwise rankings get points
    // for ghost teams and the tournament is wrongly marked completed.
    const norm = (s: string) => s.trim();
    const names = new Set((tourn?.registeredTeams ?? []).map((tm) => norm(tm.teamName)));
    if (
      !tourn ||
      !names.has(norm(winnerTeamName)) ||
      !names.has(norm(runnerUpTeamName)) ||
      norm(winnerTeamName) === norm(runnerUpTeamName)
    ) {
      setSyncNotification('نتیجه نهایی ثبت نشد: نام تیم‌ها باید از تیم‌های ثبت‌نام‌شده و متفاوت باشند.');
      return;
    }
    // A non-empty bracket here is necessarily partially played (a
    // completed bracket implies completed status, which this guard can't
    // see after a server-less reload): the free-text finalize would award
    // points the bracket-completion path would then refuse, or vice
    // versa. Finish the bracket in the bracket UI instead.
    if (tourn.bracket && tourn.bracket.length > 0) {
      setSyncNotification('ابتدا نتایج جدول تورنمنت را کامل ثبت کنید.');
      return;
    }
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournId) {
          return {
            ...t,
            status: 'completed',
            winnerTeam: winnerTeamName,
            runnerUpTeam: runnerUpTeamName,
          };
        }
        return t;
      })
    );

    // Persist the result server-side (fire-and-forget): without this the
    // next catalog reload overwrites local state and the tournament
    // reverts to registration with the winner lost. Local-only
    // tournaments (`tourn-…`) have no server row, so skip them.
    if (
      getSupabase() &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tournId)
    ) {
      void updateTournament(tournId, {
        status: 'completed',
        winnerTeam: winnerTeamName,
        runnerUpTeam: runnerUpTeamName,
      }).catch((err) => {
        // RLS can deny this (e.g. province admins had no UPDATE right):
        // the error must be visible — the UI otherwise shows success and
        // the next catalog reload silently reverts the result.
        console.warn('finalizeTournamentResults remote persist failed, keeping local result', err);
        setSyncNotification('⚠️ نتیجه ثبت شد اما ذخیره‌سازی روی سرور ناموفق بود (دسترسی کافی نیست) — لطفاً با پشتیبانی در میان بگذارید.');
      });
    }

    // Award ranking points exactly once per tournament (guarded by
    // getAwardedRecord/setAwardedWinner, backed by localStorage):
    // - no record → full award (winner 250 + runner-up 150 + participants
    //   50/tournamentsPlayed), then record { winner, participantsCredited: true }.
    // - record exists and the winner CHANGED (corrected final) → champion-only
    //   award for the NEW champion (no participant credit again — the old
    //   champion's points are NOT revoked, deliberate product constraint).
    // - record exists and the winner is UNCHANGED → runner-up-only check
    //   below (a corrected final may change only the runner-up — the new
    //   runner-up's players must get their +150; re-recording the identical
    //   result must not double-award).
    // The status/winner update stays unconditional — only the points award
    // is deduped.
    const awarded = getAwardedRecord(tournId);
    if (!awarded) {
      awardTournamentRankingPoints(tourn, winnerTeamName, runnerUpTeamName);
      recordFullAward(tournId, winnerTeamName, runnerUpTeamName);
    } else if (awarded.winner !== winnerTeamName) {
      awardChampionPointsOnly(tourn, winnerTeamName, runnerUpTeamName, awarded.winner);
      recordCorrectionAward(tournId, winnerTeamName, runnerUpTeamName);
    } else if (norm(tourn.runnerUpTeam ?? '') !== norm(runnerUpTeamName)) {
      // Winner unchanged, runner-up CHANGED: awardChampionPointsOnly skips
      // the already-credited champion internally and credits only the new
      // runner-up (+150); its own re-credit guard makes a repeat harmless.
      awardChampionPointsOnly(tourn, winnerTeamName, runnerUpTeamName, awarded.winner);
      recordCorrectionAward(tournId, winnerTeamName, runnerUpTeamName);
    }
  };

  const updateTournamentBracketMatch = (
    tournId: string,
    matchId: string,
    winnerId: string,
    score: number[]
  ) => {
    // Pure transform so the same result feeds both local state and the
    // server persist below (computed once from current state).
    const applyBracketMatch = (t: Tournament): Tournament => {
      if (!t.bracket) return t;

        const matchIdx = t.bracket.findIndex((m) => m.id === matchId);
        if (matchIdx === -1) return t;

        const currentMatch = t.bracket[matchIdx];
        // A winnerId matching neither team must not silently crown team2
        // via the `?: team2` fallback below — ignore the bogus record.
        if (winnerId !== currentMatch.team1?.id && winnerId !== currentMatch.team2?.id) return t;
        const isTeam1Winner = currentMatch.team1?.id === winnerId;
        const winnerTeam = isTeam1Winner ? currentMatch.team1 : currentMatch.team2;

        const updatedMatches = [...t.bracket];

        // Re-recording an earlier round must invalidate every later round that
        // was built from the old result — otherwise the final keeps its old
        // scores/winner and the tournament its stale champion (same bug class
        // as the friendly path fixed in v3.15.11). Only when the winner
        // actually changed (or a winnerless re-record meets a scored later
        // round); an unchanged winner keeps the append-only forward path.
        const roundOrder: Record<string, number> = {
          round_16: 0,
          quarter: 1,
          semi: 2,
          final: 3,
        };
        const recOrder = roundOrder[currentMatch.round] ?? -1;
        const prevWinnerId = currentMatch.winnerId;
        const winnerChanged = !!prevWinnerId && prevWinnerId !== winnerId;
        const downstreamScored = updatedMatches.some(
          (m) => (roundOrder[m.round] ?? -1) > recOrder && m.winnerId
        );
        let downstreamInvalidated = false;
        if ((winnerChanged || (!prevWinnerId && downstreamScored)) && downstreamScored) {
          for (let i = 0; i < updatedMatches.length; i++) {
            const m = updatedMatches[i];
            if ((roundOrder[m.round] ?? -1) > recOrder) {
              // Only the immediate next round keeps its teams: its other
              // slot still comes from an unchanged feeder match, and the
              // advance step below overwrites the slot fed by the
              // corrected match. Rounds beyond that were fed by the
              // now-invalidated results, so their teams are stale — clear
              // them to TBD, otherwise the final stays playable between
              // the wrong teams and can crown a wrong champion before
              // the semifinal is re-played (score entry is blocked only
              // for TBD matches, and stale teams are not TBD).
              const isImmediateNext = (roundOrder[m.round] ?? -1) === recOrder + 1;
              updatedMatches[i] = {
                ...m,
                status: 'pending',
                winnerId: undefined,
                team1: isImmediateNext && m.team1
                  ? { id: m.team1.id, name: m.team1.name, seed: m.team1.seed }
                  : undefined,
                team2: isImmediateNext && m.team2
                  ? { id: m.team2.id, name: m.team2.name, seed: m.team2.seed }
                  : undefined,
              };
            }
          }
          downstreamInvalidated = true;
        }

        updatedMatches[matchIdx] = {
          ...currentMatch,
          status: 'completed',
          winnerId,
          team1: currentMatch.team1
            ? { ...currentMatch.team1, score: score.slice(0, score.length / 2), isWinner: isTeam1Winner }
            : undefined,
          team2: currentMatch.team2
            ? { ...currentMatch.team2, score: score.slice(score.length / 2), isWinner: !isTeam1Winner }
            : undefined,
        };

        // Advance to the next round if applicable (round_16 -> quarter -> semi
        // -> final). Matches pair sequentially: winner of match m feeds
        // next-round match ceil(m/2) — slot team1 for odd m, team2 for even m.
        const NEXT_ROUND: Record<BracketMatch['round'], BracketMatch['round'] | undefined> = {
          round_16: 'quarter',
          quarter: 'semi',
          semi: 'final',
          final: undefined,
        };
        const nextRound = NEXT_ROUND[currentMatch.round];
        if (nextRound && winnerTeam) {
          const nextMatches = updatedMatches
            .filter((m) => m.round === nextRound)
            .sort((a, b) => a.matchNumber - b.matchNumber);
          const target = nextMatches[Math.ceil(currentMatch.matchNumber / 2) - 1];
          if (target) {
            // Assign a brand-new object — never mutate the shared match
            // object, which is still referenced by the previous state.
            const slot = currentMatch.matchNumber % 2 === 1 ? 'team1' : 'team2';
            const targetIdx = updatedMatches.findIndex((m) => m.id === target.id);
            if (targetIdx !== -1) {
              updatedMatches[targetIdx] = {
                ...updatedMatches[targetIdx],
                [slot]: { id: winnerTeam.id, name: winnerTeam.name, seed: winnerTeam.seed },
              };
            }
          }
        } else if (currentMatch.round === 'final' && winnerTeam) {
          // Tournament winner determined!
          return {
            ...t,
            status: 'completed',
            winnerTeam: winnerTeam.name,
            runnerUpTeam: isTeam1Winner ? currentMatch.team2?.name : currentMatch.team1?.name,
            bracket: updatedMatches,
          };
        }

        // A corrected earlier round uncrowns the champion: the tournament
        // goes back to ongoing until the rebuilt later rounds play out.
        if (downstreamInvalidated) {
          return {
            ...t,
            status: 'ongoing',
            winnerTeam: undefined,
            runnerUpTeam: undefined,
            bracket: updatedMatches,
          };
        }

        return {
          ...t,
          bracket: updatedMatches,
        };
    };

    const tourn = tournaments.find((t) => t.id === tournId);
    // Compute the transform ONCE from current state and reuse it for local
    // state, the server persist, and the points award below. applyBracketMatch
    // reads only `t` and builds fresh objects for everything it changes
    // (including advancing the winner into the next-round slot), so reusing
    // a single pre-computed `next` is safe.
    const next = tourn?.bracket ? applyBracketMatch(tourn) : undefined;
    // applyBracketMatch returns its input unchanged when the tournament
    // isn't found or matchId doesn't exist — in that case nothing was
    // recorded, so the success toast below must not fire.
    const recorded = !!next && next !== tourn;
    setTournaments((prev) =>
      prev.map((t) => (t.id === tournId ? applyBracketMatch(t) : t))
    );

    // Persist the updated bracket (+ derived status/winner) server-side
    // (fire-and-forget): without this the next catalog reload overwrites
    // local state and the recorded result is lost. Local-only tournaments
    // (`tourn-…`) have no server row, so skip them. A corrected earlier
    // round that uncrowns the champion persists the cleared winner too.
    if (
      next &&
      next !== tourn &&
      getSupabase() &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tournId)
    ) {
      // Never persist the local-only 'draw_done' status: the tournaments.status
      // Postgres enum accepts only registration/ongoing/completed and would
      // reject the whole write (status + bracket), silently dropping the
      // recorded scores. The server keeps its previous status; the local
      // 'draw_done' semantics (e.g. the registration-reopen guard) are
      // untouched.
      void updateTournament(tournId, {
        status: next.status === 'draw_done' ? undefined : next.status,
        winnerTeam: next.winnerTeam ?? '',
        runnerUpTeam: next.runnerUpTeam ?? '',
        bracket: next.bracket,
      }).catch((err) => {
        // Surface the failure so the bracket edit isn't silently lost on
        // the next catalog reload.
        console.warn('updateTournamentBracketMatch remote persist failed, keeping local bracket', err);
        setSyncNotification('⚠️ نتیجه ثبت شد اما ذخیره‌سازی روی سرور ناموفق بود (سرور نوشته را قبول نکرد) — لطفاً با پشتیبانی در میان بگذارید.');
      });
    }

    if (recorded) {
      setSyncNotification('نتیجه مسابقه جدول تورنومنت با موفقیت ثبت و مسابقه بعدی بروزرسانی شد.');
    } else {
      setSyncNotification('⚠️ مسابقه‌ای با این شناسه در جدول تورنومنت پیدا نشد؛ تغییری ثبت نشد.');
    }

    // Bracket completion awards ranking points (the fix: the final used to
    // award zero). Guarded by getAwardedRecord/setAwardedWinner
    // (localStorage-backed): re-recording the final doesn't double-award;
    // a corrected final crowning a NEW champion gives the new champion the
    // champion-only award, and a corrected final changing only the runner-up
    // credits the new runner-up's +150 (participant credit stays given
    // exactly once; the old champion's points are not revoked — deliberate). Placed AFTER
    // setTournaments on purpose — React StrictMode double-invokes state
    // updaters, and the award must never run inside one.
    if (next && next.status === 'completed' && next.winnerTeam) {
      const awarded = getAwardedRecord(tournId);
      const normRu = (s: string) => s.trim();
      if (!awarded) {
        awardTournamentRankingPoints(next, next.winnerTeam, next.runnerUpTeam ?? '');
        recordFullAward(tournId, next.winnerTeam, next.runnerUpTeam ?? '');
      } else if (awarded.winner !== next.winnerTeam) {
        awardChampionPointsOnly(next, next.winnerTeam, next.runnerUpTeam ?? '', awarded.winner);
        recordCorrectionAward(tournId, next.winnerTeam, next.runnerUpTeam ?? '');
      } else if (normRu(tourn?.runnerUpTeam ?? '') !== normRu(next.runnerUpTeam ?? '')) {
        // Winner unchanged, runner-up CHANGED (corrected final via bracket):
        // credit the new runner-up's +150 via the champion-only award (its
        // internal re-credit guard skips the champion and any already
        // placement-credited team). `tourn` is the pre-update tournament,
        // so its runnerUpTeam is the previous one.
        awardChampionPointsOnly(next, next.winnerTeam, next.runnerUpTeam ?? '', awarded.winner);
        recordCorrectionAward(tournId, next.winnerTeam, next.runnerUpTeam ?? '');
      }
    }
  };

  const setSupabaseConfig = (configOrUrl: { url: string; anonKey: string } | string, key?: string) => {
    let finalUrl = '';
    let finalKey = '';
    if (typeof configOrUrl === 'object') {
      finalUrl = configOrUrl.url;
      finalKey = configOrUrl.anonKey;
    } else {
      finalUrl = configOrUrl;
      finalKey = key || '';
    }
    setSupabaseUrl(finalUrl);
    setSupabaseAnonKey(finalKey);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'sb_url', finalUrl);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'sb_key', finalKey);
    setSyncNotification('اتصال و تنظیمات دیتابیس Supabase ذخیره شد.');
  };

  const resetAllDataToDefaults = () => {
    localStorage.clear();
    setPlayerProfile(initialPlayerProfile);
    setClubs(initialClubs);
    setBookings([]);
    setOpenMatches(initialOpenMatches);
    setGroupSessions(initialGroupSessions);
    setFriendlyTournaments([]);
    setNeedPlayerPosts(initialNeedPlayerPosts);
    setFreeAgents(initialFreeAgents);
    setCoaches(initialCoaches);
    setCoachBookings([]);
    setTournaments(initialTournaments);
    setRankings(initialRankings);
    setMyClubRatings({});
    setCurrentUserRole('player');
    setAdminClubId('club-1');
    setAdminProvince('تهران');
    // Supabase config reverts to its initializer defaults (env, if set).
    const env = getSupabaseConfig();
    setSupabaseUrl(env?.url || '');
    setSupabaseAnonKey(env?.anonKey || '');
    // localStorage.clear() wiped the award-guard record too, so the
    // in-memory ref must be cleared as well — otherwise re-created
    // tournaments reusing the same ids could never award points again
    // (state/storage divergence).
    bracketPointsAwardedRef.current.clear();
    setSyncNotification('اطلاعات به وضعیت پیش‌فرض بازگردانی شد.');
  };

  return (
    <PadelContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isMobileDeviceView,
        setIsMobileDeviceView,
        playerProfile,
        updatePlayerProfile,
        clubs,
        addClub,
        addCourtToClub,
        deleteClub,
        myClubRatings,
        rateClub,
        deleteTournament,
        bookings,
        createBooking,
        cancelBooking,
        openMatches,
        createOpenMatch,
        joinMatchSlot,
        leaveMatchSlot,
        deleteOpenMatch,
        groupSessions,
        createGroupSession,
        joinGroupSessionSlot,
        leaveGroupSessionSlot,
        deleteGroupSession,
        friendlyTournaments,
        createFriendlyTournament,
        addFriendlyTeam,
        drawFriendlyBracket,
        drawOfficialBracket,
        recordFriendlyScore,
        finalizeFriendlyTournament,
        resetFriendlyBracket,
        needPlayerPosts,
        createNeedPlayerPost,
        joinNeedPlayerPost,
        leaveNeedPlayerPost,
        deleteNeedPlayerPost,
        freeAgents,
        toggleFreeAgentStatus,
        inviteFreeAgent,
        coaches,
        addCoach,
        deleteCoach,
        coachBookings,
        bookCoach,
        tournaments,
        createTournament,
        registerTournamentTeam,
        finalizeTournamentResults,
        updateTournamentBracketMatch,
        currentUserId: auth?.user?.id ?? '',
        currentUserRole: auth?.profile ? auth.profile.role : currentUserRole,
        setCurrentUserRole,
        // Server managed_club_id wins when set AND it matches an existing
        // club; a stale server id (deleted club, or a default that matches
        // nothing) must NOT shadow the local binding — otherwise a
        // club_admin who just registered a club still hits «باشگاه شما
        // پیدا نشد» on tournament creation. When the server value is null
        // or stale, fall back to the local binding.
        adminClubId: auth?.profile
          ? (auth.profile.adminClubId && clubs.some((c) => c.id === auth.profile!.adminClubId)
              ? auth.profile.adminClubId
              : adminClubId)
          : adminClubId,
        setAdminClubId,
        adminProvince,
        setAdminProvince,
        rankings,
        selectedProvince,
        setSelectedProvince,
        supabaseUrl,
        supabaseAnonKey,
        supabaseConfig: { url: supabaseUrl, anonKey: supabaseAnonKey },
        setSupabaseConfig,
        isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
        isSupabaseConnected: Boolean(supabaseUrl && supabaseAnonKey),
        syncNotification,
        setSyncNotification,
        resetAllDataToDefaults,
      }}
    >
      {children}
    </PadelContext.Provider>
  );
};

export const usePadel = () => {
  const context = useContext(PadelContext);
  if (!context) {
    throw new Error('usePadel must be used within a PadelProvider');
  }
  return context;
};
