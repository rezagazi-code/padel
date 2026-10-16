// GPS coordinates for PadelPro clubs (estimated, ~1-3km accuracy).
// Source: ~/workspace/padel/club-coordinates.md
// Clubs without a precise address (پدل لند، T10 Club) are intentionally omitted.

export interface ClubCoords {
  lat: number;
  lng: number;
}

export const CLUB_COORDS: Record<string, ClubCoords> = {
  // Padel Point Heydarabad: village center (Heydarabad, Keraraj, Isfahan county:
  // 32.54778, 51.77389) — the only Heydarabad in Isfahan county, matches the
  // club's own "دهکده باغ‌ویلایی حیدرآباد". Approximate: exact club pin pending.
  'club-padelpoint': { lat: 32.54778, lng: 51.77389 },
  'club-tikpadel': { lat: 32.58, lng: 51.69 },
  'club-negaristan': { lat: 34.0, lng: 51.43 },
  'club-teh-arenapadel': { lat: 35.7249, lng: 51.2757 },
  'club-teh-fgb': { lat: 35.773, lng: 51.403 },
  'club-teh-hills': { lat: 35.778, lng: 51.375 },
  'club-teh-courtina': { lat: 35.798, lng: 51.505 },
  'club-shz-racketpark': { lat: 29.61, lng: 52.56 },
  'club-krj-padelzone': { lat: 35.928, lng: 50.828 },
};

/** Great-circle distance in km (Haversine). No API needed — works offline. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Initial bearing in degrees, 0 = north, clockwise. */
export function bearingDeg(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** Convert Latin digits in a string/number to Persian digits. */
export function faNum(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** Human-friendly Persian distance: "۸۵۰ متر" or "۲.۴ کیلومتر". */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${faNum(Math.round(km * 1000))} متر`;
  }
  const rounded = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
  // Keep decimal separator Latin-style dot, digits Persian
  const parts = String(rounded).split('.');
  const faInt = faNum(parts[0]);
  const faDec = parts[1] ? '٫' + faNum(parts[1]) : '';
  return `${faInt}${faDec} کیلومتر`;
}
