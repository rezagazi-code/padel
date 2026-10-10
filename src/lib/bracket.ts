import type { BracketMatch } from '../components/TVBracket';
import { SKILL_GRADES, type SkillGrade } from '../utils/skillGrades';

function getRoundName(roundIndex: number, totalRounds: number): string {
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) return 'فینال';
  if (fromEnd === 1) return 'نیمه‌نهایی';
  if (fromEnd === 2) return 'یک‌چهارم نهایی';
  return `دور ${roundIndex + 1}`;
}

/**
 * Generate a single-elimination bracket.
 * Handles any number of teams (2+) with proper byes.
 * - Sorts by rank for seeding (1 = strongest)
 * - Pairs strongest vs weakest
 * - Byes go to top seeds
 * Returns only the FIRST round matches. Later rounds are built
 * by recordFriendlyScore as winners are determined.
 */
export function generateBracket(
  teams: { id: string; name: string; rank: SkillGrade }[]
): BracketMatch[] {
  if (teams.length < 2) return [];

  // Sort by rank (A+ strongest).
  const sorted = [...teams].sort(
    (a, b) => SKILL_GRADES.indexOf(a.rank) - SKILL_GRADES.indexOf(b.rank)
  );
  const n = sorted.length;

  // Next power of 2 determines bracket size
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(n)));
  const byes = bracketSize - n;
  const totalRounds = Math.log2(bracketSize);

  // Top `byes` seeds get a bye. Remaining teams play first round.
  const byeTeams = sorted.slice(0, byes);
  const playingTeams = sorted.slice(byes);

  const matches: BracketMatch[] = [];
  let matchId = 0;
  const roundName = getRoundName(0, totalRounds);

  // Pair: strongest playing vs weakest playing
  for (let i = 0; i < playingTeams.length / 2; i++) {
    const t1 = playingTeams[i];
    const t2 = playingTeams[playingTeams.length - 1 - i];
    if (t1 && t2) {
      matches.push({
        id: `br-${Date.now()}-${matchId++}`,
        round: 0,
        roundName,
        team1: t1.name,
        team2: t2.name,
      });
    }
  }

  return matches;
}

/**
 * Build display matches from a FriendlyTournament's bracket,
 * grouped and ordered for the TV bracket component.
 */
export function bracketToDisplay(
  bracket: {
    id: string;
    round: string;
    roundFa: string;
    team1Id: string | null;
    team2Id: string | null;
    score1: number | null;
    score2: number | null;
    winnerId: string | null;
  }[],
  getTeamName: (id: string | null) => string
): BracketMatch[] {
  const roundOrder: Record<string, number> = {
    round16: 0,
    quarterfinal: 1,
    semifinal: 2,
    final: 3,
  };
  const sorted = [...bracket].sort(
    (a, b) => (roundOrder[a.round] ?? 99) - (roundOrder[b.round] ?? 99)
  );
  return sorted.map((m) => ({
    id: m.id,
    round: roundOrder[m.round] ?? 99,
    roundName: m.roundFa,
    team1: getTeamName(m.team1Id),
    team2: getTeamName(m.team2Id),
    winner: m.winnerId ? getTeamName(m.winnerId) : undefined,
    score1: m.score1 ?? undefined,
    score2: m.score2 ?? undefined,
  }));
}
