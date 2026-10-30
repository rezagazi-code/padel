import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePadel } from '../context/PadelContext';
import { Club } from '../types';
import {
  Sun,
  Moon,
  Users,
  Wallet,
  CreditCard,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { toJalaliDisplay } from '../utils/dates';
import { fetchBookedIntervals, BookedInterval } from '../lib/db';
import { getSupabase } from '../lib/supabase';
import { saveDongiRecord } from '../lib/dongi';
import { DongiPanel } from './DongiPanel';

interface InlineBookingProps {
  club: Club;
  courtId: string;
  onClose: () => void;
  onBooked?: () => void;
}

/**
 * Court booking as a bottom sheet: slides up when a court's "رزرو" is tapped.
 * Contains the full booking form — court switcher, date (7 days), duration,
 * time slots (booked/peak), free-agent toggle, dongi panel, confirm CTA.
 * Glossy blue bubble buttons (`.bubble-btn`) for primary actions,
 * red (`.bubble-btn-fire`) for secondary/close.
 */
export const InlineBooking: React.FC<InlineBookingProps> = ({
  club,
  courtId,
  onClose,
  onBooked,
}) => {
  const {
    bookings,
    createBooking,
    playerProfile,
    freeAgents,
  } = usePadel();

  const [activeCourtId, setActiveCourtId] = useState<string>(
    club.courts.some((c) => c.id === courtId) ? courtId : club.courts[0]?.id || ''
  );
  const court = club.courts.find((c) => c.id === activeCourtId) || club.courts[0];

  // Follow court switches made outside the panel (e.g. the detail column's
  // court tabs): without this the panel keeps showing — and booking — the
  // previously selected court while the rest of the UI moved on.
  useEffect(() => {
    setActiveCourtId(club.courts.some((c) => c.id === courtId) ? courtId : club.courts[0]?.id || '');
  }, [courtId, club.courts]);

  // Dates: next 7 days, generated live in the Jalali (Persian) calendar
  // Bumped whenever the tab regains focus so a PWA left open overnight
  // rebuilds its chips instead of labelling yesterday «امروز» (same fix
  // as CourtBookingView — InlineBooking previously rebuilt never).
  const [daysTick, setDaysTick] = useState(0);
  useEffect(() => {
    const refresh = () => setDaysTick((t) => t + 1);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  // All four formatters use Asia/Tehran: booking dates are compared and
  // stored in Tehran time elsewhere, so the day list must not follow the
  // device timezone (a no-op on a Tehran-set device).
  const daysList = useMemo(() => {
    const fmtWeekday = new Intl.DateTimeFormat('fa-IR', { weekday: 'long', timeZone: 'Asia/Tehran' });
    const fmtDayMonth = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long', timeZone: 'Asia/Tehran' });
    const fmtJalali = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Tehran',
    });
    const fmtIso = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Tehran',
    });
    // Anchor on the Tehran calendar date, then step in whole UTC days:
    // setDate() steps in device-local time, so on a DST-transition week
    // for a device outside Iran two entries could format to the same
    // Tehran date (and one day go missing from the list).
    const tehranToday = fmtIso.format(new Date());
    const [ty, tm, td] = tehranToday.split('-').map(Number);
    const tehranMidnightUtc = Date.UTC(ty, tm - 1, td);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(tehranMidnightUtc + i * 86400000);
      const parts = fmtDayMonth.formatToParts(d);
      return {
        dayName: i === 0 ? 'امروز' : i === 1 ? 'فردا' : fmtWeekday.format(d),
        dateStr: fmtJalali.format(d),
        dayNum: parts.find((p) => p.type === 'day')?.value ?? '',
        monthName: parts.find((p) => p.type === 'month')?.value ?? '',
        raw: fmtIso.format(d),
      };
    });
  }, [daysTick]);

  const [selectedDate, setSelectedDate] = useState(daysList[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  // If a chip rebuild drops the selected day (tab left open past
  // midnight), fall back to today instead of keeping a stale date.
  useEffect(() => {
    if (selectedDate && !daysList.some((d) => d.raw === selectedDate.raw)) {
      setSelectedDate(daysList[0]);
      setSelectedTimeSlot('');
    }
  }, [daysList]);
  const [duration, setDuration] = useState<number>(90);
  const [splitPayment, setSplitPayment] = useState<boolean>(true);
  const [dongiEnabled, setDongiEnabled] = useState<boolean>(false);
  const [dongiNames, setDongiNames] = useState<string[]>(['', '', '']);
  // Dongi was ON but no teammate was tagged → nothing was recorded;
  // the receipt must say so instead of silently implying a split was saved.
  const [dongiSkippedNoNames, setDongiSkippedNoNames] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [needsExtraPlayers, setNeedsExtraPlayers] = useState<boolean>(false);
  const [playersNeededCount, setPlayersNeededCount] = useState<number>(1);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [lastBookingInfo, setLastBookingInfo] = useState<any>(null);
  const [booked, setBooked] = useState<BookedInterval[]>([]);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const userPickedSlotRef = useRef(false);
  const notifiedOnBookedRef = useRef(false);

  const faDigitsToEn = (s: string) =>
    s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const slotStartMinutes = (timeSlot: string): number | null => {
    const m = faDigitsToEn(timeSlot).match(/(\d{1,2}):(\d{2})/);
    if (!m) return null;
    return Number(m[1]) * 60 + Number(m[2]);
  };

  const bookedIntervals = useMemo(
    () =>
      booked
        .map((b) => {
          const start = slotStartMinutes(b.timeSlot);
          if (start === null) return null;
          return { start, end: start + (b.durationMinutes || 90) };
        })
        .filter((iv): iv is { start: number; end: number } => iv !== null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [booked]
  );

  const intervalsOverlap = (
    startA: number,
    endA: number,
    intervals: { start: number; end: number }[]
  ) => intervals.some((iv) => startA < iv.end && iv.start < endA);

  // Real availability: reload booked intervals whenever the court or date changes.
  useEffect(() => {
    let cancelled = false;
    const cid = court?.id;
    const dateISO = selectedDate?.raw;
    if (!cid || !dateISO) {
      setBooked([]);
      setSlotsLoading(false);
      return;
    }
    setSlotsLoading(true);
    (async () => {
      // Local-only (guest) bookings never reach the server, but they must
      // still block their slot on this device.
      const localIntervals: BookedInterval[] = bookings
        .filter((b) => b.courtId === cid && b.date === dateISO)
        .map((b) => ({ timeSlot: b.timeSlot, durationMinutes: b.durationMinutes || 90 }));
      try {
        if (getSupabase()) {
          const server = await fetchBookedIntervals(cid, dateISO);
          // Server wins on timeSlot collision.
          const seen = new Set(server.map((iv) => iv.timeSlot).filter(Boolean));
          if (!cancelled)
            setBooked([...server, ...localIntervals.filter((iv) => !seen.has(iv.timeSlot))]);
        } else {
          if (!cancelled) setBooked(localIntervals);
        }
      } catch {
        // A failed server fetch must not hide local bookings.
        if (!cancelled) setBooked(localIntervals);
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [court?.id, selectedDate?.raw, bookings]);

  // A new court/date/duration starts a fresh selection.
  useEffect(() => {
    userPickedSlotRef.current = false;
  }, [activeCourtId, selectedDate?.raw, duration]);

  // Time slots generated from the club's working hours (grid follows the selected duration).
  const timeSlots = useMemo(() => {
    const faDigits = (s: string) => s.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
    const toMinutes = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map(Number);
      return h * 60 + (m || 0);
    };
    const toHHMM = (mins: number) =>
      `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
    const open = toMinutes(club.openingHour || '08:00');
    const close = toMinutes(club.closingHour || '24:00');
    // Past slots are never bookable: when the selected date is today
    // (Tehran local date; `raw` is a Gregorian YYYY-MM-DD), drop every slot
    // whose start time has already passed. Auto-select skips them too,
    // because they are simply absent from this list.
    const tehranToday = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    // daysList is a mount-time snapshot: if the view stayed open past
    // midnight, the «امروز» chip's raw date is yesterday — emit no slots at
    // all for a whole-past day so it can't be booked.
    if (selectedDate?.raw && selectedDate.raw < tehranToday) return [];
    const isToday = selectedDate?.raw === tehranToday;
    let nowMinutes = -1;
    if (isToday) {
      const [hh, mm] = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Tehran',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
        .format(new Date())
        .split(':')
        .map(Number);
      nowMinutes = (hh || 0) * 60 + (mm || 0);
    }
    const slots: { time: string; isPeak: boolean; isBooked: boolean; period: 'morning' | 'afternoon' | 'night' }[] = [];
    for (let start = open; start + duration <= close; start += duration) {
      if (isToday && start <= nowMinutes) continue; // slot already passed today
      const h = Math.floor(start / 60);
      const time = `${faDigits(toHHMM(start))} - ${faDigits(toHHMM(start + duration))}`;
      slots.push({
        time,
        isPeak: h >= 18,
        isBooked: intervalsOverlap(start, start + duration, bookedIntervals),
        period: h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'night',
      });
    }
    return slots;
  }, [club.openingHour, club.closingHour, bookedIntervals, duration, selectedDate?.raw]);

  // Auto-select the first free slot on a fresh selection.
  // If the whole day is booked, no fallback to a booked slot: leave it empty
  // so the confirm CTA stays disabled.
  useEffect(() => {
    if (userPickedSlotRef.current) return;
    const first = timeSlots.find((s) => !s.isBooked);
    setSelectedTimeSlot(first ? first.time : '');
  }, [timeSlots]);

  // Belt-and-braces: if the picked slot no longer exists in the current
  // list (day crossed midnight, or the slot aged past its start) — or it
  // flipped to booked (someone else grabbed it in a refresh) — drop the
  // stale pick so the confirm CTA goes disabled again.
  useEffect(() => {
    const picked = timeSlots.find((s) => s.time === selectedTimeSlot);
    if (selectedTimeSlot && (!picked || picked.isBooked)) {
      if (userPickedSlotRef.current) {
        setBookingError('این سانس توسط کاربر دیگری رزرو شد؛ لطفاً سانس دیگری انتخاب کنید.');
      }
      userPickedSlotRef.current = false;
      setSelectedTimeSlot('');
    }
  }, [timeSlots, selectedTimeSlot]);

  const handleSlotPick = (time: string) => {
    userPickedSlotRef.current = true;
    setSelectedTimeSlot(time);
  };

  const selectedSlot = timeSlots.find((s) => s.time === selectedTimeSlot);
  const isCurrentSlotPeak = selectedSlot ? selectedSlot.isPeak : false;
  // Legacy server rows can carry a NULL peak rate (mapped to 0): never price a peak slot at 0.
  const baseRate = court ? (isCurrentSlotPeak ? (court.peakHourlyRate > 0 ? court.peakHourlyRate : court.hourlyRate) : court.hourlyRate) : 700000;
  const totalPrice = Math.round((baseRate * duration) / 60);
  const splitPrice = Math.round(totalPrice / 4);

  // Case-insensitive compare: «Ali» vs «ali» is the same person — without
  // this, a re-cased duplicate creates a second balance entry and can
  // suggest the person pays themselves (Persian names have no case, so
  // this only affects Latin-script names). Display casing is preserved.
  const dongiOthers = dongiNames
    .map((n) => n.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .filter((n) => n.toLowerCase() !== playerProfile.name.trim().replace(/\s+/g, ' ').toLowerCase())
    .filter((n, i, arr) => arr.findIndex((m) => m.toLowerCase() === n.toLowerCase()) === i);
  const dongiPerPerson = Math.round(totalPrice / Math.max(1, 1 + dongiOthers.length));
  // Ledger-consistent display: the saved record gives the last person the
  // rounding remainder (see handleConfirmBooking), so when the total does
  // not divide evenly the panel must not claim every share equals the
  // rounded figure — it previously differed by 1 تومان from the ledger.
  const dongiLastShare = Math.max(0, totalPrice - dongiPerPerson * dongiOthers.length);
  const dongiShareLabel =
    totalPrice <= 0
      ? 'قیمت ثبت نشده'
      : dongiLastShare === dongiPerPerson
        ? `${dongiPerPerson.toLocaleString('fa-IR')} تومان`
        : `${dongiPerPerson.toLocaleString('fa-IR')} تومان (نفر آخر ${dongiLastShare.toLocaleString('fa-IR')} تومان)`;

  const handleConfirmBooking = async () => {
    if (isSubmitting) return;
    if (!court) return;
    if (!selectedTimeSlot) return;
    setBookingError(null);
    // A NULL hourly_rate maps to 0 in db.ts: never confirm a 0-toman booking
    // as "paid" — a missing rate is a data defect, not a free court.
    if (totalPrice <= 0) {
      setBookingError('قیمت این زمین ثبت نشده است؛ لطفاً با باشگاه تماس بگیرید.');
      return;
    }
    // Stale-pick guard: the user may have tapped a slot long ago — if
    // midnight crossed (the selected day is now past) or the picked slot
    // already started today, the pick is no longer bookable. Never book a
    // past day or an already-started slot.
    const tehranToday = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    if (selectedDate.raw < tehranToday) {
      setBookingError('این سانس دیگر قابل رزرو نیست. لطفاً روز و سانس جدیدی انتخاب کنید.');
      return;
    }
    if (selectedDate.raw === tehranToday) {
      const [hh, mm] = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Tehran',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
        .format(new Date())
        .split(':')
        .map(Number);
      const nowMinutes = (hh || 0) * 60 + (mm || 0);
      const pickedStart = slotStartMinutes(selectedTimeSlot);
      if (pickedStart === null || pickedStart <= nowMinutes) {
        setBookingError('این سانس دیگر قابل رزرو نیست. لطفاً سانس جدیدی انتخاب کنید.');
        return;
      }
    }
    setIsSubmitting(true);
    try {
      // Fresh availability pull before the overlap check: the cached intervals
      // may be stale, and a server-side UNIQUE(court_id,date,time_slot) does
      // not catch a 90-min booking overlapping our 60-min slot with the same start.
      let freshIntervals: { start: number; end: number }[];
      try {
        if (getSupabase() && selectedDate?.raw) {
          const fresh = await fetchBookedIntervals(court.id, selectedDate.raw);
          // Merge local-only (guest) bookings so the overlap check also sees
          // this device's bookings that never reached the server.
          const local: BookedInterval[] = bookings
            .filter((b) => b.courtId === court.id && b.date === selectedDate.raw)
            .map((b) => ({ timeSlot: b.timeSlot, durationMinutes: b.durationMinutes || 90 }));
          const seen = new Set(fresh.map((iv) => iv.timeSlot).filter(Boolean));
          const merged: BookedInterval[] = [
            ...fresh,
            ...local.filter((iv) => !seen.has(iv.timeSlot)),
          ];
          freshIntervals = merged
            .map((b) => {
              const start = slotStartMinutes(b.timeSlot);
              if (start === null) return null;
              return { start, end: start + (b.durationMinutes || 90) };
            })
            .filter((iv): iv is { start: number; end: number } => iv !== null);
        } else {
          freshIntervals = bookedIntervals;
        }
      } catch {
        freshIntervals = bookedIntervals;
      }

      const slotStart = slotStartMinutes(selectedTimeSlot);
      if (
        slotStart !== null &&
        intervalsOverlap(slotStart, slotStart + duration, freshIntervals)
      ) {
        setBookingError('این سانس با یک رزرو موجود تداخل دارد. لطفاً سانس دیگری انتخاب کنید.');
        return;
      }

      const newBooking = await createBooking({
        clubId: club.id,
        clubName: club.name,
        courtId: court.id,
        courtName: court.name,
        date: selectedDate.raw,
        timeSlot: selectedTimeSlot,
        durationMinutes: duration,
        totalPrice,
        splitPricePerPerson: splitPrice,
        paymentStatus: splitPayment ? 'split_active' : 'paid',
        bookedByPlayerId: playerProfile.id,
        bookedByPlayerName: playerProfile.name.trim() || 'شما',
        playersNeeded: needsExtraPlayers ? playersNeededCount : 0,
      });

      if (!newBooking) {
        setBookingError('رزرو ثبت نشد. لطفاً اتصال اینترنت را بررسی کنید و دوباره تلاش کنید. اگر سانس توسط شخص دیگری رزرو شده باشد، سانس دیگری انتخاب کنید.');
        return;
      }

      setLastBookingInfo(newBooking);
      notifiedOnBookedRef.current = false;
      setShowConfirmation(true);
      // The pick is consumed: when the bookings state updates, this slot
      // flips to isBooked, which the stale-pick effect would otherwise
      // misread as "grabbed by someone else" and report as an error on top
      // of the success receipt. Clearing the ref keeps the effect silent
      // for our own booking; a real steal (no booking made) still errors.
      userPickedSlotRef.current = false;

      // Skipped under split payment: with split_active the booker pays only
      // their own quarter at the club, so there is no full amount paid by
      // them for teammates to owe — recording one would inflate every
      // balance in the Dongi panel.
      setDongiSkippedNoNames(false);
      if (dongiEnabled && !splitPayment) {
        // No teammates tagged → no split to record; a self-only entry would
        // just sit in the Dongi panel as a dead record to delete by hand.
        // Flag it so the receipt warns instead of implying a split was saved.
        if (dongiOthers.length === 0) setDongiSkippedNoNames(true);
        if (dongiOthers.length > 0) {
        // A blank profile name would save blank payer/share cards in the
        // Dongi panel — fall back to an honest "you" label, never a fake name.
        const payerName = playerProfile.name.trim() || 'شما';
        const names = [payerName, ...dongiOthers];
        const n = Math.max(1, names.length);
        const perPerson = Math.round(totalPrice / n);
        // Rounding residue: the last share absorbs the remainder so the shares
        // always sum to the total (e.g. 700000/3 = 233333×2 + 233334).
        const lastShare = Math.max(0, totalPrice - perPerson * (n - 1));
        saveDongiRecord({
          bookingId: newBooking.id,
          total: totalPrice,
          paidBy: payerName,
          clubName: newBooking.clubName,
          courtName: newBooking.courtName,
          date: newBooking.date,
          timeSlot: newBooking.timeSlot,
          shares: names.map((name, idx) => ({ name, amount: idx === n - 1 ? lastShare : perPerson, paid: idx === 0 })),
        });
        }
        setDongiNames(['', '', '']);
        setDongiEnabled(false);
      }

      // NOTE: onBooked is fired from dismissReceipt, not here — calling it here
      // unmounts the panel before the receipt modal can paint.
    } finally {
      setIsSubmitting(false);
    }
  };

  // Receipt dismissal also notifies the parent (fires once) so the panel
  // closes only after the user has seen the receipt.
  const dismissReceipt = () => {
    setShowConfirmation(false);
    if (!notifiedOnBookedRef.current) {
      notifiedOnBookedRef.current = true;
      onBooked?.();
    }
  };

  return (
    <div className="animate-slide-down overflow-hidden rounded-2xl border border-[#ff2d55]/30 bg-[#0a0f1c]/95 backdrop-blur-md mt-2 mb-1 shadow-[0_8px_30px_rgba(255,45,85,0.12)]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-100 truncate">رزرو زمین</p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {club.name} • {court?.name}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-100 p-1 text-xl leading-none">
            ✕
          </button>
        </div>
      <div className="space-y-5">
        {/* Court switcher */}
        {club.courts.length > 1 && (
          <div>
            <p className="text-[11px] font-bold text-slate-400 mb-1.5">زمین</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {club.courts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCourtId(c.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                    c.id === activeCourtId
                      ? 'bubble-btn'
                      : 'bg-white/[0.05] border-white/10 text-slate-400'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date selection */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 mb-1.5">روز رزرو</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {daysList.map((d, index) => {
              const isSelected = d.raw === selectedDate.raw;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(d)}
                  className={`min-w-[76px] py-2.5 px-2 rounded-2xl text-center transition cursor-pointer border shrink-0 ${
                    isSelected
                      ? 'bubble-btn'
                      : 'bg-white/[0.05] text-slate-400 border-white/10'
                  }`}
                >
                  <span className="text-[11px] font-semibold block">{d.dayName}</span>
                  <span className="text-[13px] font-black mt-0.5 block">{d.dayNum} {d.monthName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration toggle */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 mb-1.5">مدت سانس</p>
          <div className="inline-flex p-1 rounded-full bg-white/[0.04] border border-white/10 gap-1">
            {[
              { mins: 60, label: '۶۰ دقیقه' },
              { mins: 90, label: '۹۰ دقیقه' },
              { mins: 120, label: '۱۲۰ دقیقه' },
            ].map((dur) => (
              <button
                key={dur.mins}
                onClick={() => setDuration(dur.mins)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                  duration === dur.mins ? 'bubble-btn' : 'text-slate-400'
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time slots */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 mb-1.5">سانس ساعت</p>
          {slotsLoading && (
            <div className="flex items-center justify-center gap-2 py-3 text-[11px] font-bold text-slate-400">
              <div className="w-4 h-4 border-2 border-white/20 border-t-[#ff6b81] rounded-full animate-spin" />
              <span>در حال بارگذاری سانس‌ها…</span>
            </div>
          )}
          {!slotsLoading && timeSlots.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-5 text-center text-xs font-bold text-slate-400">
              برای این روز سانسی موجود نیست
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((slot, index) => {
              const isSelected = selectedTimeSlot === slot.time;
              return (
                <button
                  key={index}
                  disabled={slot.isBooked}
                  onClick={() => handleSlotPick(slot.time)}
                  className={`p-3 rounded-2xl text-center border transition relative cursor-pointer ${
                    slot.isBooked
                      ? 'bg-white/[0.03] border-white/10 text-slate-500 cursor-not-allowed opacity-50'
                      : isSelected
                      ? 'bubble-btn border-transparent'
                      : 'bg-white/[0.05] border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                    {slot.period === 'morning' ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span>{slot.time}</span>
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    {slot.isBooked ? (
                      <span className="text-[10px] text-rose-400 font-semibold">رزرو شده</span>
                    ) : slot.isPeak ? (
                      <span className={`text-[10px] font-bold px-1.5 rounded ${isSelected ? 'bg-black/40 text-white' : 'bg-amber-500/20 text-amber-400'}`}>
                        ساعات پیک
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-1.5 rounded ${isSelected ? 'bg-black/40 text-white' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        سانس عادی
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Free-agent toggle */}
        <div className="rounded-2xl bg-gradient-to-r from-[#2f7bff]/15 to-[#ff2d55]/10 border border-[#2f7bff]/30 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Users className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <h4 className="text-[13px] font-bold text-slate-100">نیاز به بازیکن کمکی؟</h4>
                <p className="text-[11px] text-slate-500 leading-4">
                  آگهی «نیاز به بازیکن» در تابلوی بازیکن‌های آزاد ثبت می‌شود.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={needsExtraPlayers}
                onChange={(e) => setNeedsExtraPlayers(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff2d55]"></div>
            </label>
          </div>
          {needsExtraPlayers && (
            <div className="pt-3 mt-3 border-t border-white/10 flex items-center gap-2 flex-wrap">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  onClick={() => setPlayersNeededCount(count)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                    playersNeededCount === count
                      ? 'bubble-btn'
                      : 'bg-white/[0.04] border-white/10 text-slate-400'
                  }`}
                >
                  {count} بازیکن
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dongi */}
        <div className="rounded-2xl bg-[#ff2d55]/[0.05] border border-[#ff2d55]/25 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Wallet className="w-5 h-5 text-[#ff6b81] shrink-0" />
              <div className="min-w-0">
                <h4 className="text-[13px] font-bold text-slate-100">«دنگی» — تقسیم هزینه</h4>
                <p className="text-[11px] text-slate-500 leading-4">
                  سهم هر نفر در «حساب دنگی» ذخیره می‌شود.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={dongiEnabled}
                onChange={(e) => setDongiEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff2d55]"></div>
            </label>
          </div>
          {dongiEnabled && (
            <div className="pt-3 mt-3 border-t border-white/10 space-y-3">
              {splitPayment && (
                <p className="text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
                  در حالت «دنگ ۴ نفره» هر نفر سهم خودش را در باشگاه می‌پردازد، پس دنگی در «حساب دنگی» ذخیره نمی‌شود. برای ذخیره‌ی دنگی، پرداخت یکجا را انتخاب کنید.
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {dongiNames.map((name, idx) => (
                  <input
                    key={idx}
                    value={name}
                    onChange={(e) =>
                      setDongiNames((prev) => {
                        const next = [...prev];
                        next[idx] = e.target.value;
                        return next;
                      })
                    }
                    placeholder={`هم‌بازی ${['۱', '۲', '۳'][idx]}`}
                    className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-2.5 py-2 text-xs font-bold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#ff2d55]/60"
                  />
                ))}
              </div>
              {freeAgents.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500">افزودن سریع:</span>
                  {freeAgents.slice(0, 6).map((agent) => {
                    const used =
                      agent.name.trim().toLowerCase() === playerProfile.name.trim().toLowerCase() || dongiOthers.some((n) => n.toLowerCase() === agent.name.trim().toLowerCase());
                    const noSlot = !dongiNames.some((n) => !n.trim());
                    return (
                      <button
                        key={agent.id}
                        disabled={used || noSlot}
                        onClick={() =>
                          setDongiNames((prev) => {
                            const next = [...prev];
                            const slot = next.findIndex((n) => !n.trim());
                            if (slot >= 0) next[slot] = agent.name;
                            return next;
                          })
                        }
                        className="rounded-full px-2.5 py-1 text-[11px] font-bold bg-white/[0.06] border border-white/10 text-slate-300 cursor-pointer disabled:opacity-40 disabled:cursor-default"
                      >
                        {agent.name}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-[11px] text-slate-400">
                سهم هر نفر:{' '}
                <span className="font-black text-[#ff6b81]">
                  {dongiShareLabel}
                </span>{' '}
                ({1 + dongiOthers.length} نفر)
              </p>
            </div>
          )}
        </div>

        {/* Payment + confirm */}
        <div className="pt-1 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSplitPayment(true)}
                className={`text-[11px] px-3 py-1.5 rounded-2xl font-bold transition cursor-pointer border ${
                  splitPayment
                    ? 'bubble-btn'
                    : 'bg-white/[0.04] text-slate-500 border-white/10'
                }`}
              >
                دنگ ۴ نفره
              </button>
              <button
                onClick={() => setSplitPayment(false)}
                className={`text-[11px] px-3 py-1.5 rounded-2xl font-bold transition cursor-pointer border ${
                  !splitPayment
                    ? 'bubble-btn'
                    : 'bg-white/[0.04] text-slate-500 border-white/10'
                }`}
              >
                پرداخت کل
              </button>
            </div>
            <div className="flex items-baseline gap-1.5">
              {totalPrice <= 0 ? (
                <span className="text-sm font-bold text-slate-400">قیمت ثبت نشده</span>
              ) : (
                <>
                  <span className="text-xl font-black text-slate-100">
                    {(splitPayment ? splitPrice : totalPrice).toLocaleString('fa-IR')}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">تومان</span>
                </>
              )}
            </div>
          </div>

          {bookingError && (
            <div className="rounded-2xl bg-[#ff2d55]/10 border border-[#ff2d55]/50 px-4 py-3 text-xs font-bold text-[#ff8ba0] leading-relaxed">
              {bookingError}
            </div>
          )}

          <button
            onClick={handleConfirmBooking}
            disabled={isSubmitting || !selectedTimeSlot || slotsLoading}
            className="bubble-btn rounded-full w-full flex items-center justify-center gap-2 text-white font-black text-base px-8 py-4 disabled:opacity-60"
          >
            <CreditCard className="w-5 h-5" />
            <span>{isSubmitting ? 'در حال ثبت رزرو…' : 'تایید و رزرو قطعی زمین'}</span>
          </button>
        </div>

        <DongiPanel />
      </div>

      {/* Receipt modal */}
      {showConfirmation && lastBookingInfo && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={dismissReceipt}>
          <div
            className="w-full max-w-md rounded-3xl bg-[#0d1424] border border-[#ff2d55]/50 p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bubble-btn-fire flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-100">{typeof lastBookingInfo.id === 'string' && lastBookingInfo.id.startsWith('booking-') ? 'رزرو روی همین دستگاه ثبت شد' : 'زمین با موفقیت رزرو شد!'}</h3>
              <p className="text-xs text-slate-500">رسید الکترونیکی رزرو شما صادر شد.</p>
              {typeof lastBookingInfo.id === 'string' && lastBookingInfo.id.startsWith('booking-') && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2 text-right">
                  <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    این رزرو فقط روی همین دستگاه ثبت شده؛ باشگاه آن را نمی‌بیند — برای قطعی‌شدن با باشگاه تماس بگیرید.
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-500">کد پیگیری:</span>
                <span className="font-mono text-cyan-400 font-bold">{lastBookingInfo.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-500">باشگاه:</span>
                <span className="font-bold text-slate-100">{lastBookingInfo.clubName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-500">زمین:</span>
                <span className="font-bold text-[#ff6b81]">{lastBookingInfo.courtName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-500">تاریخ و ساعت:</span>
                <span className="font-bold text-slate-100">{toJalaliDisplay(lastBookingInfo.date)} | {lastBookingInfo.timeSlot}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-500">مدت سانس:</span>
                <span className="font-bold text-slate-100">{lastBookingInfo.durationMinutes} دقیقه</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm">
                <span className="text-slate-500 font-bold">مبلغ قابل پرداخت در باشگاه:</span>
                <span className="text-[#ff6b81] font-black">
                  {(lastBookingInfo.paymentStatus === 'split_active'
                    ? lastBookingInfo.splitPricePerPerson
                    : lastBookingInfo.totalPrice
                  ).toLocaleString('fa-IR')}{' '}
                  تومان
                </span>
              </div>
            </div>

            {lastBookingInfo.playersNeeded > 0 && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                <span>
                  آگهی نیاز به {lastBookingInfo.playersNeeded} بازیکن روی همین دستگاه در بخش بازیکن‌های آزاد ثبت شد؛ فعلاً برای بازیکنان دیگر قابل مشاهده نیست.
                </span>
              </div>
            )}

            {dongiSkippedNoNames && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  «دنگی» فعال بود ولی نام هیچ هم‌بازی‌ای ثبت نشد، پس سهمی در «حساب دنگی» ذخیره نشد. برای تقسیم هزینه، نام هم‌بازی‌ها را وارد کنید.
                </span>
              </div>
            )}

            <button
              onClick={() => {
                dismissReceipt();
                onClose();
              }}
              className="bubble-btn-fire rounded-full w-full py-3.5 text-sm"
            >
              بستن
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
