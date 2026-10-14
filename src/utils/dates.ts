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

// Slot labels use Persian digits ('۱۸:۰۰ - ۱۹:۳۰'); normalize to get the
// start of the slot in minutes since midnight. Same parse as the booking
// form's stale-pick guard.
export function slotStartMinutes(timeSlot: string): number | null {
  const en = timeSlot.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const m = en.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Current time in Tehran, in minutes since midnight. */
export function tehranNowMinutes(): number {
  const [hh, mm] = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(new Date())
    .split(':')
    .map(Number);
  return (hh || 0) * 60 + (mm || 0);
}

/** True when a booking on `date` (Gregorian YYYY-MM-DD) starting at
 *  `timeSlot` can still be cancelled: future days always, today only if
 *  the slot has not started yet (Tehran time). An unparsable slot stays
 *  cancellable — same as the old date-only gate — rather than blocking
 *  on a guess. */
export function isBookingCancellable(
  date: string,
  timeSlot: string,
  tehranToday: string
): boolean {
  if (date < tehranToday) return false;
  if (date > tehranToday) return true;
  const start = slotStartMinutes(timeSlot);
  if (start === null) return true;
  return start > tehranNowMinutes();
}
