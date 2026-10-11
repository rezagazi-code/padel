import type { Tournament, FriendlyTournament } from '../types';

/**
 * «پیش‌بینی قهرمان» — local prediction game for tournaments.
 * Predictions live in localStorage only (per device), keyed by tournament.
 */

/** One match normalized for the prediction game, regardless of tournament kind. */
export interface PredictableMatch {
  id: string;
  roundName: string;
  team1: { id: string; name: string };
  team2: { id: string; name: string };
  decided: boolean;
  winnerId?: string | null;
}

export interface Prediction {
  predictedTeamId: string;
  predictorName: string;
  /** Filled in by scorePredictions once the match is decided. */
  correct?: boolean;
}

export interface LeaderboardEntry {
  name: string;
  correct: number;
  total: number;
}

const STORE_KEY = 'padelpro:predictions:v1';
const NAME_KEY = 'padelpro:predictor-name:v1';

/** tournamentId -> matchId -> Prediction */
type Store = Record<string, Record<string, Prediction>>;

function readStore(): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed as Store;
    }
  } catch {
    /* corrupted storage — start fresh */
  }
  return {};
}

function writeStore(store: Store): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* storage full or unavailable — predictions just won't persist */
  }
}

/** Save (or overwrite) the current device user's pick for a match. */
export function savePrediction(
  tournamentId: string,
  matchId: string,
  predictedTeamId: string,
  predictorName: string
): void {
  const store = readStore();
  const perTourn = store[tournamentId] ?? {};
  perTourn[matchId] = { predictedTeamId, predictorName, correct: undefined };
  store[tournamentId] = perTourn;
  writeStore(store);
}

/** All predictions made for a tournament, keyed by matchId. */
export function getPredictions(tournamentId: string): Record<string, Prediction> {
  return readStore()[tournamentId] ?? {};
}

/**
 * Score every prediction for a tournament against the decided matches.
 * Persists the `correct` flags and returns the leaderboard,
 * sorted by correct picks (then total picks, then name).
 */
export function scorePredictions(
  tournamentId: string,
  matches: PredictableMatch[]
): LeaderboardEntry[] {
  const store = readStore();
  const preds = store[tournamentId] ?? {};
  const byMatch = new Map(matches.map((m) => [m.id, m]));
  const agg = new Map<string, { correct: number; total: number }>();
  let changed = false;

  for (const [matchId, p] of Object.entries(preds)) {
    let entry = agg.get(p.predictorName);
    if (!entry) {
      entry = { correct: 0, total: 0 };
      agg.set(p.predictorName, entry);
    }
    entry.total += 1;

    const m = byMatch.get(matchId);
    if (m && m.decided && m.winnerId) {
      const correct = p.predictedTeamId === m.winnerId;
      if (p.correct !== correct) {
        p.correct = correct;
        changed = true;
      }
      if (correct) entry.correct += 1;
    }
  }

  if (changed) writeStore(store);

  return [...agg.entries()]
    .map(([name, s]) => ({ name, correct: s.correct, total: s.total }))
    .sort(
      (a, b) =>
        b.correct - a.correct || b.total - a.total || a.name.localeCompare(b.name, 'fa')
    );
}

/** The device user's predictor name (asked once, editable). */
export function getPredictorName(): string {
  try {
    return localStorage.getItem(NAME_KEY) || '';
  } catch {
    return '';
  }
}

export function setPredictorName(name: string): void {
  try {
    localStorage.setItem(NAME_KEY, name.trim());
  } catch {
    /* ignore */
  }
}

/** Normalize an official tournament's bracket for the prediction game. */
export function officialMatchesOf(t: Tournament): PredictableMatch[] {
  return (t.bracket ?? [])
    .filter((m) => m.team1?.id && m.team2?.id)
    .map((m) => {
      const t1 = m.team1!;
      const t2 = m.team2!;
      const winnerId =
        m.winnerId ?? (t1.isWinner ? t1.id : t2.isWinner ? t2.id : null);
      return {
        id: m.id,
        roundName: m.roundName,
        team1: { id: t1.id, name: t1.name },
        team2: { id: t2.id, name: t2.name },
        decided: m.status === 'completed' || !!winnerId,
        winnerId,
      };
    });
}

/** Normalize a friendly tournament's bracket for the prediction game. */
export function friendlyMatchesOf(t: FriendlyTournament): PredictableMatch[] {
  const nameOf = (id: string | null) =>
    t.teams.find((x) => x.id === id)?.teamName ?? '—';
  return t.bracket
    .filter((m) => m.team1Id && m.team2Id)
    .map((m) => ({
      id: m.id,
      roundName: m.roundFa,
      team1: { id: m.team1Id!, name: nameOf(m.team1Id) },
      team2: { id: m.team2Id!, name: nameOf(m.team2Id) },
      decided: !!m.winnerId,
      winnerId: m.winnerId ?? null,
    }));
}
