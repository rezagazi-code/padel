import type { RankingPlayer } from '../types';

/**
 * The "your rank" badges (Navbar, profile header, rankings tab) used to read
 * playerProfile.rankingPosition — a static profile field no award path ever
 * updates, so it showed the mock default (#4) forever even after tournaments
 * changed the rankings table. Derive the displayed rank from the rankings
 * table row for this player instead, falling back to the profile field when
 * the player has no rankings row yet (never played a ranked tournament).
 * Province rank is used because every badge pairs the number with the
 * player's province. Name match prefers the player's own province, then any
 * province, matching how award paths credit players by trimmed name.
 */
/**
 * The rankings-table row for this player, if any. Name match prefers the
 * player's own province, then any province, matching how award paths
 * credit players by trimmed name.
 */
export function findRankingRow(
  rankings: RankingPlayer[],
  profileName: string,
  profileProvince: string
): RankingPlayer | undefined {
  const name = (profileName ?? '').trim();
  if (!name) return undefined;
  const byName = rankings.filter((r) => (r.name ?? '').trim() === name);
  if (byName.length === 0) return undefined;
  return byName.find((r) => (r.province ?? '').trim() === (profileProvince ?? '').trim()) ?? byName[0];
}

export function displayProvinceRank(
  rankings: RankingPlayer[],
  profileName: string,
  profileProvince: string,
  fallback: number
): number {
  return findRankingRow(rankings, profileName, profileProvince)?.provinceRank || fallback;
}
