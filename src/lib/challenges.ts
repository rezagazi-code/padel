// Monthly / weekly player challenges («نشان‌ها») for PadelPro player profiles.
//
// All counters derive from real local app data (bookings + completed open
// matches + tournaments stored in the PadelContext state, which is persisted
// to localStorage under the `padelpro_v1_` prefix). Dates in the app are ISO
// Gregorian (YYYY-MM-DD); the "month" windows below are Jalali months so they
// match what the user sees in the UI.
//
// Earned badges persist in localStorage under the standalone key
// `padelpro:badges:v1` as { [challengeId]: earnedAtIsoString }.

import type {
  Booking,
  FriendlyTournament,
  OpenMatch,
  Tournament,
} from '../types';

export const BADGES_STORAGE_KEY = 'padelpro:badges:v1';

export interface ChallengeInput {
  bookings: Booking[];
  openMatches: OpenMatch[];
  tournaments: Tournament[];
  friendlyTournaments: FriendlyTournament[];
  /** Current player's id (matches Booking.bookedByPlayerId / OpenMatch slot playerId). */
  playerId: string;
  /** Current player's display name (fallback identity where ids are absent). */
  playerName: string;
}

export type ChallengePeriod = 'monthly' | 'weekly';

export interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  target: number;
  period: ChallengePeriod;
  /** Lucide icon key used by the Badges component. */
  icon: 'calendar' | 'flame' | 'map-pin' | 'trophy' | 'zap';
  /** Numeric progress toward `target` derived from real data. Never throws. */
  progress: (input: ChallengeInput) => number;
}

export interface ChallengeStatus {
  id: string;
  title: string;
  description: string;
  target: number;
  period: ChallengePeriod;
  icon: ChallengeDefinition['icon'];
  progress: number;
  completed: boolean;
  /** ISO timestamp of when the badge was first earned (persisted). */
  earnedAt: string | null;
}

// ---------------------------------------------------------------------------
// Date helpers (ISO Gregorian input, Jalali calendar output)
// ---------------------------------------------------------------------------

const ISO_PREFIX_RE = /^(\d{4})-(\d{2})-(\d{2})/;

/** Parse an ISO date (or ISO-timestamp prefix) to a Date at local noon. */
function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const m = ISO_PREFIX_RE.exec(value.trim());
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Jalali year/month key, e.g. "1405/07". Null for unparseable input. */
export function jalaliMonthKey(value: unknown): string | null {
  const d = parseIsoDate(value);
  if (!d) return null;
  const key = new Intl.DateTimeFormat('en-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
  }).format(d);
  // Normalise: strip the era suffix ("AP") and any non digit/slash chars.
  return key.replace(/[^0-9/]/g, '').replace(/^0+(\d)/, '$1');
}

function jalaliMonthKeyNow(): string | null {
  const d = new Date();
  const key = new Intl.DateTimeFormat('en-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
  }).format(d);
  return key.replace(/[^0-9/]/g, '');
}

/** True when the ISO date is within the last `days` days (inclusive). */
function isWithinLastDays(value: unknown, days: number): boolean {
  const d = parseIsoDate(value);
  if (!d) return false;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const cutoff = startOfToday.getTime() - days * 24 * 60 * 60 * 1000;
  return d.getTime() >= cutoff && d.getTime() <= now.getTime() + 24 * 60 * 60 * 1000;
}

/** Bookings that belong to the current player (by id, falling back to name). */
function ownBookings(input: ChallengeInput): Booking[] {
  const { bookings, playerId, playerName } = input;
  return (bookings ?? []).filter(
    (b) =>
      b.bookedByPlayerId === playerId ||
      (playerName && b.bookedByPlayerName === playerName),
  );
}

// ---------------------------------------------------------------------------
// Challenge definitions
// ---------------------------------------------------------------------------

const CHALLENGES: ChallengeDefinition[] = [
  {
    id: 'sessions-month',
    title: '۸ بازی در ماه',
    description: 'در ماه جاری ۸ سانس زمین رزرو و بازی کن',
    target: 8,
    period: 'monthly',
    icon: 'calendar',
    progress: (input) => {
      const month = jalaliMonthKeyNow();
      if (!month) return 0;
      return ownBookings(input).filter((b) => jalaliMonthKey(b.date) === month).length;
    },
  },
  {
    id: 'win-streak-3',
    title: '۳ برد پیاپی',
    description: '۳ بازی پشت سر هم را ببر',
    target: 3,
    period: 'monthly',
    icon: 'flame',
    progress: (input) => {
      const { openMatches, playerId } = input;
      const played = (openMatches ?? []).filter(
        (m) =>
          m.status === 'completed' &&
          Array.isArray(m.slots) &&
          m.slots.some((s) => s.playerId === playerId),
      );
      // Most recent first.
      played.sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));
      let streak = 0;
      for (const m of played) {
        const won = didPlayerWin(m, playerId);
        if (won === true) {
          streak += 1;
        } else if (won === false) {
          break; // streak ends at the first determined loss
        }
        // won === null → result missing/unreadable: skip without breaking streak
      }
      return streak;
    },
  },
  {
    id: 'two-clubs-month',
    title: 'بازی در ۲ باشگاه مختلف',
    description: 'در ماه جاری در حداقل ۲ باشگاه مختلف بازی کن',
    target: 2,
    period: 'monthly',
    icon: 'map-pin',
    progress: (input) => {
      const month = jalaliMonthKeyNow();
      if (!month) return 0;
      const clubs = new Set(
        ownBookings(input)
          .filter((b) => jalaliMonthKey(b.date) === month)
          .map((b) => b.clubId || b.clubName),
      );
      return clubs.size;
    },
  },
  {
    id: 'tournament-month',
    title: 'اولین تورنمنت ماه',
    description: 'در یک تورنمنت در ماه جاری شرکت کن',
    target: 1,
    period: 'monthly',
    icon: 'trophy',
    progress: (input) => {
      const month = jalaliMonthKeyNow();
      if (!month) return 0;
      const { playerName, tournaments, friendlyTournaments } = input;
      const name = (playerName ?? '').trim();
      if (!name) return 0;
      const inOfficial = (tournaments ?? []).some(
        (t) =>
          jalaliMonthKey(t.startDate) === month &&
          (t.registeredTeams ?? []).some(
            (team) => team.player1Name === name || team.player2Name === name,
          ),
      );
      if (inOfficial) return 1;
      const inFriendly = (friendlyTournaments ?? []).some(
        (t) =>
          jalaliMonthKey(t.date) === month &&
          (t.teams ?? []).some(
            (team) => team.player1Name === name || team.player2Name === name,
          ),
      );
      return inFriendly ? 1 : 0;
    },
  },
  {
    id: 'sessions-week',
    title: '۴ بازی در یک هفته',
    description: 'در ۷ روز گذشته ۴ سانس بازی کن',
    target: 4,
    period: 'weekly',
    icon: 'zap',
    progress: (input) =>
      ownBookings(input).filter((b) => isWithinLastDays(b.date, 7)).length,
  },
];

/**
 * Did the player win this completed open match?
 * Returns true (win), false (loss), or null when the recorded result is
 * missing or unreadable — in which case the match is skipped gracefully.
 */
function didPlayerWin(match: OpenMatch, playerId: string): boolean | null {
  try {
    const result = match.result;
    if (!result || !Array.isArray(result.team1Score) || !Array.isArray(result.team2Score))
      return null;
    const mySlot = (match.slots ?? []).find((s) => s.playerId === playerId);
    if (!mySlot) return null;
    const mySets =
      mySlot.team === 1
        ? countSetsWon(result.team1Score, result.team2Score)
        : countSetsWon(result.team2Score, result.team1Score);
    const oppSets =
      mySlot.team === 1
        ? countSetsWon(result.team2Score, result.team1Score)
        : countSetsWon(result.team1Score, result.team2Score);
    if (mySets === 0 && oppSets === 0) return null; // no scores recorded
    return mySets > oppSets;
  } catch {
    return null;
  }
}

function countSetsWon(a: number[], b: number[]): number {
  let won = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    const x = Number(a[i]);
    const y = Number(b[i]);
    if (Number.isFinite(x) && Number.isFinite(y) && x > y) won += 1;
  }
  return won;
}

// ---------------------------------------------------------------------------
// Badge award state
// ---------------------------------------------------------------------------

/** Read the persisted earned-badge map. Never throws. */
export function getEarnedBadges(): Record<string, string> {
  try {
    const raw = localStorage.getItem(BADGES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof k === 'string' && typeof v === 'string') out[k] = v;
      }
      return out;
    }
    return {};
  } catch {
    return {};
  }
}

/** Persist newly-earned badges; keeps the earliest earnedAt per badge. */
function persistEarnedBadges(newlyEarned: string[]): Record<string, string> {
  const earned = getEarnedBadges();
  const now = new Date().toISOString();
  let changed = false;
  for (const id of newlyEarned) {
    if (!earned[id]) {
      earned[id] = now;
      changed = true;
    }
  }
  if (changed) {
    try {
      localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(earned));
    } catch {
      // Quota/privacy mode: badges simply won't persist; progress still works.
    }
  }
  return earned;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute per-challenge status. Each progress() is guarded so a malformed
 * record can never crash the profile screen — it just reports 0.
 * Completing a challenge auto-awards (and persists) its badge.
 */
export function getChallengeStatus(input: ChallengeInput): ChallengeStatus[] {
  const earned = getEarnedBadges();
  const newlyEarned: string[] = [];

  const statuses = CHALLENGES.map((c) => {
    let progress = 0;
    try {
      progress = Math.max(0, Math.floor(Number(c.progress(input)) || 0));
    } catch {
      progress = 0;
    }
    const completed = progress >= c.target;
    if (completed && !earned[c.id]) newlyEarned.push(c.id);
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      target: c.target,
      period: c.period,
      icon: c.icon,
      progress,
      completed,
      earnedAt: earned[c.id] ?? null,
    };
  });

  if (newlyEarned.length > 0) {
    const updated = persistEarnedBadges(newlyEarned);
    for (const s of statuses) {
      if (newlyEarned.includes(s.id)) s.earnedAt = updated[s.id] ?? null;
    }
  }

  return statuses;
}
