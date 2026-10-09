import type { BracketMatch } from '../components/TVBracket';

const ROUND_NAMES: Record<string, string> = {
  final: 'فینال',
  semifinal: 'نیمه‌نهایی',
  quarterfinal: 'یک‌چهارم نهایی',
  round16: 'یک‌هشتم نهایی',
};

function getRoundName(roundNum: number, totalRounds: number): string {
  const fromEnd = totalRounds - roundNum;
  if (fromEnd === 0) return 'فینال';
  if (fromEnd === 1) return 'نیمه‌نهایی';
  if (fromEnd === 2) return 'یک‌چهارم نهایی';
  if (fromEnd === 3) return 'یک‌هشتم نهایی';
  return `دور ${roundNum + 1}`;
}

/**
 * Generate a single-elimination bracket for N teams.
 * Returns BracketMatch[] ready for TVBracket display.
 * Teams are seeded by rank (1st vs last, etc.)
 */
export function generateBracket(
  teams: { id: string; name: string; rank?: number }[]
): BracketMatch[] {
  if (teams.length < 2) return [];

  // Sort by rank if available (1 = strongest)
  const sorted = [...teams].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));

  // Calculate rounds needed
  const teamCount = sorted.length;
  const totalRounds = Math.ceil(Math.log2(teamCount));

  const matches: BracketMatch[] = [];
  let matchId = 0;

  // First round: pair teams (1st vs last, 2nd vs 2nd-last, etc.)
  // Handle byes for non-power-of-2
  const firstRoundTeams = [...sorted];
  const firstRoundMatches: { team1: string; team2: string; team1Id: string; team2Id: string }[] = [];

  // Simple pairing: top half vs bottom half
  const half = Math.ceil(firstRoundTeams.length / 2);
  for (let i = 0; i < half && i + half < firstRoundTeams.length; i++) {
    const t1 = firstRoundTeams[i];
    const t2 = firstRoundTeams[firstRoundTeams.length - 1 - i];
    if (t1 && t2 && t1.id !== t2.id) {
      firstRoundMatches.push({
        team1: t1.name,
        team2: t2.name,
        team1Id: t1.id,
        team2Id: t2.id,
      });
    }
  }

  // Handle odd team out (bye) - they advance automatically
  // For simplicity, if odd number, last team gets a bye to next round

  const roundName = getRoundName(0, totalRounds);
  firstRoundMatches.forEach((m) => {
    matches.push({
      id: `br-${matchId++}`,
      round: 0,
      roundName,
      team1: m.team1,
      team2: m.team2,
    });
  });

  // Generate subsequent rounds (placeholders - winners TBD)
  let prevRoundCount = firstRoundMatches.length;
  for (let r = 1; r < totalRounds; r++) {
    const roundMatchCount = Math.ceil(prevRoundCount / 2);
    const rName = getRoundName(r, totalRounds);
    for (let i = 0; i < roundMatchCount; i++) {
      matches.push({
        id: `br-${matchId++}`,
        round: r,
        roundName: rName,
        team1: 'برنده',
        team2: 'برنده',
      });
    }
    prevRoundCount = roundMatchCount;
    if (prevRoundCount <= 1) break;
  }

  return matches;
}
