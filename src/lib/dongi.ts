/**
 * «دنگی» — split-cost ledger for court bookings.
 *
 * LocalStorage-first, exactly like the existing booking data in PadelContext
 * (`padelpro_v1_bookings`). One record per booking with the key
 * `padelpro:dongi:v1`.
 *
 * Balance model (per booking record):
 *  - `paidBy` is the person who fronted the court total to the club.
 *  - each share is what one person owes for the booking; `paid` means they
 *    settled that share with `paidBy`.
 * Net balance for a person across all records:
 *    balance = (totals they fronted + shares they settled) − (shares they owe)
 *  Positive → others owe them (طلبکار). Negative → they owe others (بدهکار).
 */

export interface DongiShare {
  name: string;
  amount: number; // تومان
  paid: boolean; // settled with the payer
}

export interface DongiRecord {
  bookingId: string;
  total: number; // full court price in تومان
  paidBy: string; // name of the person who fronted the total
  clubName?: string;
  courtName?: string;
  date?: string; // YYYY-MM-DD
  timeSlot?: string;
  shares: DongiShare[];
  createdAt: string; // ISO
}

export interface BalanceEntry {
  name: string;
  balance: number; // > 0 طلبکار, < 0 بدهکار
  fronted: number; // totals this person paid up-front as payer
  settled: number; // share amounts this person paid back
  owed: number; // share amounts assigned to this person
}

export interface Settlement {
  from: string; // debtor
  to: string; // creditor
  amount: number;
}

const STORAGE_KEY = 'padelpro:dongi:v1';
const UPDATE_EVENT = 'padelpro:dongi:updated';

function notifyUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  }
}

/** Subscribe to دنگی ledger changes (panels re-read on save). */
export function subscribeDongi(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => listener();
  window.addEventListener(UPDATE_EVENT, handler);
  return () => window.removeEventListener(UPDATE_EVENT, handler);
}

/** Load all دنگی records. Never throws — returns [] on bad data. */
export function loadDongiRecords(): DongiRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r) => r && typeof r.bookingId === 'string' && Array.isArray(r.shares)
    ) as DongiRecord[];
  } catch {
    return [];
  }
}

function persist(records: DongiRecord[]): DongiRecord[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Quota exceeded — keep going with in-memory state, like PadelContext does.
  }
  notifyUpdated();
  return records;
}

/** Insert or replace the record for a booking (idempotent per booking). */
export function saveDongiRecord(record: Omit<DongiRecord, 'createdAt'>): DongiRecord[] {
  const records = loadDongiRecords().filter((r) => r.bookingId !== record.bookingId);
  records.unshift({
    ...record,
    shares: record.shares.map((s) => ({ ...s })),
    createdAt: new Date().toISOString(),
  });
  return persist(records);
}

/** Remove the دنگی record for a booking (e.g. after a booking is cancelled). */
export function deleteDongiRecord(bookingId: string): DongiRecord[] {
  return persist(loadDongiRecords().filter((r) => r.bookingId !== bookingId));
}

/** Toggle one person's `paid` flag inside a record's shares. */
export function toggleDongiSharePaid(bookingId: string, name: string): DongiRecord[] {
  return persist(
    loadDongiRecords().map((r) => {
      if (r.bookingId !== bookingId) return r;
      return {
        ...r,
        shares: r.shares.map((s) => (s.name === name ? { ...s, paid: !s.paid } : s)),
      };
    })
  );
}

/** Net running balance for every person across all دنگی records. */
export function getBalances(): BalanceEntry[] {
  const map = new Map<string, { fronted: number; settled: number; owed: number }>();

  const entry = (name: string) => {
    let e = map.get(name);
    if (!e) {
      e = { fronted: 0, settled: 0, owed: 0 };
      map.set(name, e);
    }
    return e;
  };

  for (const r of loadDongiRecords()) {
    if (r.paidBy) entry(r.paidBy).fronted += r.total;
    for (const s of r.shares) {
      const e = entry(s.name);
      e.owed += s.amount;
      if (s.paid) e.settled += s.amount;
    }
  }

  return [...map.entries()].map(([name, e]) => ({
    name,
    fronted: e.fronted,
    settled: e.settled,
    owed: e.owed,
    balance: e.fronted + e.settled - e.owed,
  }));
}

/**
 * Simple greedy settlement: pair the biggest debtors with the biggest
 * creditors until balances net out. Produces minimal-ish "who pays whom"
 * instructions, not a single global tally.
 */
export function suggestSettlements(): Settlement[] {
  const balances = getBalances();
  const creditors = balances
    .filter((b) => b.balance > 0)
    .map((b) => ({ name: b.name, amount: b.balance }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = balances
    .filter((b) => b.balance < 0)
    .map((b) => ({ name: b.name, amount: -b.balance }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;
  while (i < creditors.length && j < debtors.length) {
    const c = creditors[i];
    const d = debtors[j];
    const amount = Math.min(c.amount, d.amount);
    if (amount <= 0) break;
    settlements.push({ from: d.name, to: c.name, amount: Math.round(amount) });
    c.amount -= amount;
    d.amount -= amount;
    if (c.amount <= 0) i++;
    if (d.amount <= 0) j++;
  }
  return settlements;
}
