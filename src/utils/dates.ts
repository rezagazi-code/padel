// Date helpers: the app displays Jalali dates to users, but Supabase `date`
// columns require Gregorian ISO (YYYY-MM-DD). These keep the two straight.

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})/;

/** Convert an ISO date (YYYY-MM-DD, or a prefix of an ISO timestamp) to a
 *  Jalali display string like «۰۴/۰۷/۱۴۰۳». Anything that is not ISO-shaped
 *  (e.g. an already-Jalali string) is returned untouched. */
export function toJalaliDisplay(iso: string): string {
  if (!iso) return iso;
  const m = ISO_RE.exec(iso.trim());
  if (!m) return iso;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/** True when the value is already an ISO Gregorian date for DB writes. */
export function isIsoDate(value: string): boolean {
  return ISO_RE.test((value ?? '').trim());
}
