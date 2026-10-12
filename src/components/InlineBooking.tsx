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
 * Glossy red bubble buttons (`.bubble-btn-fire`) to match the store feel
 * in the dark theme.
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

  // Dates: next 7 days, generated live in the Jalali (Persian) calendar
  const daysList = useMemo(() => {
    const fmtWeekday = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' });
    const fmtDayMonth = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' });
    const fmtJalali = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const fmtIso = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const parts = fmtDayMonth.formatToParts(d);
      return {
        dayName: i === 0 ? 'امروز' : i === 1 ? 'فردا' : fmtWeekday.format(d),
        dateStr: fmtJalali.format(d),
        dayNum: parts.find((p) => p.type === 'day')?.value ?? '',
        monthName: parts.find((p) => p.type === 'month')?.value ?? '',
        raw: fmtIso.format(d),
      };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState(daysList[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [duration, setDuration] = useState<number>(90);
  const [splitPayment, setSplitPayment] = useState<boolean>(true);
  const [dongiEnabled, setDongiEnabled] = useState<boolean>(false);
  const [dongiNames, setDongiNames] = useState<string[]>(['', '', '']);
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
      try {
        if (getSupabase()) {
          const intervals = await fetchBookedIntervals(cid, dateISO);
          if (!cancelled) setBooked(intervals);
        } else {
          if (!cancelled)
            setBooked(
              bookings
                .filter((b) => b.courtId === cid && b.date === dateISO)
                .map((b) => ({ timeSlot: b.timeSlot, durationMinutes: b.durationMinutes || 90 }))
            );
        }
      } catch {
        if (!cancelled) setBooked([]);
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
    const slots: { time: string; isPeak: boolean; isBooked: boolean; period: 'morning' | 'afternoon' | 'night' }[] = [];
    for (let start = open; start + duration <= close; start += duration) {
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
  }, [club.openingHour, club.closingHour, bookedIntervals, duration]);

  // Auto-select the first free slot on a fresh selection.
  // If the whole day is booked, no fallback to a booked slot: leave it empty
  // so the confirm CTA stays disabled.
  useEffect(() => {
    if (userPickedSlotRef.current) return;
    const first = timeSlots.find((s) => !s.isBooked);
    setSelectedTimeSlot(first ? first.time : '');
  }, [timeSlots]);

  const handleSlotPick = (time: string) => {
    userPickedSlotRef.current = true;
    setSelectedTimeSlot(time);
  };

  const selectedSlot = timeSlots.find((s) => s.time === selectedTimeSlot);
  const isCurrentSlotPeak = selectedSlot ? selectedSlot.isPeak : false;
  const baseRate = court ? (isCurrentSlotPeak ? court.peakHourlyRate : court.hourlyRate) : 700000;
  const totalPrice = Math.round((baseRate * duration) / 60);
  const splitPrice = Math.round(totalPrice / 4);

  const dongiOthers = dongiNames
    .map((n) => n.trim())
    .filter(Boolean)
    .filter((n) => n !== playerProfile.name)
    .filter((n, i, arr) => arr.indexOf(n) === i);
  const dongiPerPerson = Math.round(totalPrice / Math.max(1, 1 + dongiOthers.length));

  const handleConfirmBooking = async () => {
    if (isSubmitting) return;
    if (!court) return;
    if (!selectedTimeSlot) return;
    setBookingError(null);
    setIsSubmitting(true);
    try {
      // Fresh availability pull before the overlap check: the cached intervals
      // may be stale, and a server-side UNIQUE(court_id,date,time_slot) does
      // not catch a 90-min booking overlapping our 60-min slot with the same start.
      let freshIntervals: { start: number; end: number }[];
      try {
        if (getSupabase() && selectedDate?.raw) {
          const fresh = await fetchBookedIntervals(court.id, selectedDate.raw);
          freshIntervals = fresh
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
        bookedByPlayerName: playerProfile.name,
        playersNeeded: needsExtraPlayers ? playersNeededCount : 0,
      });

      if (!newBooking) {
        setBookingError('رزرو ثبت نشد. لطفاً اتصال اینترنت را بررسی کنید و دوباره تلاش کنید. اگر سانس توسط شخص دیگری رزرو شده باشد، سانس دیگری انتخاب کنید.');
        return;
      }

      setLastBookingInfo(newBooking);
      notifiedOnBookedRef.current = false;
      setShowConfirmation(true);

      if (dongiEnabled) {
        const names = [playerProfile.name, ...dongiOthers];
        const perPerson = Math.round(totalPrice / Math.max(1, names.length));
        saveDongiRecord({
          bookingId: newBooking.id,
          total: totalPrice,
          paidBy: playerProfile.name,
          clubName: newBooking.clubName,
          courtName: newBooking.courtName,
          date: newBooking.date,
          timeSlot: newBooking.timeSlot,
          shares: names.map((name, idx) => ({ name, amount: perPerson, paid: idx === 0 })),
        });
        setDongiNames(['', '', '']);
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
                      ? 'bubble-btn-fire'
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
                      ? 'bubble-btn-fire'
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
                  duration === dur.mins ? 'bubble-btn-fire' : 'text-slate-400'
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
                      ? 'bubble-btn-fire border-transparent'
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
                      ? 'bubble-btn-fire'
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
                      agent.name === playerProfile.name || dongiOthers.includes(agent.name);
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
                  {dongiPerPerson.toLocaleString('fa-IR')} تومان
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
                    ? 'bubble-btn-fire'
                    : 'bg-white/[0.04] text-slate-500 border-white/10'
                }`}
              >
                دنگ ۴ نفره
              </button>
              <button
                onClick={() => setSplitPayment(false)}
                className={`text-[11px] px-3 py-1.5 rounded-2xl font-bold transition cursor-pointer border ${
                  !splitPayment
                    ? 'bubble-btn-fire'
                    : 'bg-white/[0.04] text-slate-500 border-white/10'
                }`}
              >
                پرداخت کل
              </button>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-100">
                {(splitPayment ? splitPrice : totalPrice).toLocaleString('fa-IR')}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">تومان</span>
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
            className="bubble-btn-fire rounded-full w-full flex items-center justify-center gap-2 text-white font-black text-base px-8 py-4 disabled:opacity-60"
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
              <h3 className="text-xl font-black text-slate-100">زمین با موفقیت رزرو شد!</h3>
              <p className="text-xs text-slate-500">رسید الکترونیکی رزرو شما صادر شد.</p>
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
                <span className="text-slate-500 font-bold">مبلغ پرداختی:</span>
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
                  آگهی نیاز به {lastBookingInfo.playersNeeded} بازیکن در بخش بازیکن‌های آزاد ثبت شد.
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
