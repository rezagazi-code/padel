import React, { useState, useRef } from 'react';
import { usePadel } from '../context/PadelContext';
import { useAuth } from '../context/AuthContext';
import { Coach } from '../types';
import GradeBadge from './GradeBadge';
import { BottomSheet } from './BottomSheet';
import { levelToGrade } from '../utils/skillGrades';
import {
  GraduationCap,
  Star,
  Award,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Check,
  ShieldCheck,
  Sparkles,
  Phone,
  X,
  CreditCard
} from 'lucide-react';

export const CoachBookingView: React.FC = () => {
  const { coaches, coachBookings, bookCoach, playerProfile, addCoach, deleteCoach } = usePadel();
  const { role } = useAuth();
  // NOTE: user.role is the Supabase JWT role ('authenticated'), not the app
  // role — the app role comes from AuthContext's profile-backed `role`.
  const isAdmin = role === 'super_admin' || role === 'club_admin';

  const [showAddModal, setShowAddModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formRate, setFormRate] = useState('');
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  // Persian weekday names (Iranian week starts Saturday) for the coach's
  // bookable days — same convention as coach.availableDays elsewhere.
  const [formDays, setFormDays] = useState<string[]>([]);
  const [formHours, setFormHours] = useState('');
  // Inline error inside the booking sheet (e.g. coach with no schedule).
  const [bookingError, setBookingError] = useState<string | null>(null);
  // Ref-based double-submit guard for coach booking confirmation.
  const bookingSubmittingRef = useRef(false);
  // Double-submit guard: bookingSubmittingRef is set/reset inside the same
  // synchronous handler, so it can't block a second click from another
  // event tick. This state lock survives across ticks and disables the
  // confirm button until the receipt modal is dismissed.
  const [bookingLocked, setBookingLocked] = useState(false);

  const WEEKDAYS_FA = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

  const parseHoursInput = (raw: string): string[] =>
    raw
      .split(/[،,؛;\n]+/)
      .map((s) =>
        // Normalize Persian/Arabic digits like parseRate below: without
        // this, '۰۸:۰۰' would fail the format check even though it is a
        // perfectly good hour on a fa-IR keyboard.
        s.trim().replace(/[۰-۹٠-٩]/g, (d) => {
          const fa = '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);
          return fa !== -1 ? fa.toString() : '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString();
        })
      )
      .filter(Boolean);

  // Rate input is plain text: admins type Persian digits ('۵۰۰۰۰۰') or
  // Latin separators ('500,000'), and raw parseInt mangles both — '500,000'
  // parses as 500 (a near-free booking) and '۵۰۰۰۰۰' as NaN (a valid rate
  // falsely rejected). Normalize digits and strip separators first.
  const parseRate = (raw: string): number => {
    const latin = raw.replace(/[۰-۹٠-٩]/g, (d) => {
      const fa = '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);
      return fa !== -1 ? fa.toString() : '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString();
    });
    return parseInt(latin.replace(/[,٬،\s]/g, ''), 10) || 0;
  };

  const handleAddCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formName.trim()) {
      setFormError('نام مربی الزامی است.');
      return;
    }
    // A coach without bookable days/hours can never be booked (the booking
    // sheet would render empty selects) — require both up front.
    const days = WEEKDAYS_FA.filter((d) => formDays.includes(d));
    const hours = parseHoursInput(formHours);
    if (days.length === 0 || hours.length === 0) {
      setFormError('حداقل یک روز و یک ساعت قابل رزرو برای مربی مشخص کنید.');
      return;
    }
    // Hours were format-free: 'abc' parsed as a bookable slot and showed
    // up in the booking sheet. Same HH:MM rule as ClubOwnerModal.
    const hourOk = (h: string) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(h) || h === '24:00';
    if (!hours.every(hourOk)) {
      setFormError('ساعت‌های مربی باید به قالب ساعت باشد (مثلاً 08:00).');
      return;
    }
    // A cleared rate stores 0 and then books sessions with a 0-toman
    // receipt — same "free by accident" class as the court-booking
    // zero-price fix. There is no free-coach concept, so reject.
    // parseRate normalizes Persian digits and separators first (see above).
    if (!(parseRate(formRate) > 0)) {
      setFormError('نرخ ساعتی مربی باید بیشتر از صفر باشد.');
      return;
    }
    setFormSaving(true);
    try {
      await addCoach({
        name: formName.trim(),
        avatar: '',
        title: formTitle.trim(),
        phone: formPhone.trim(),
        fipCertification: '',
        experienceYears: 0,
        province: '',
        clubs: [],
        hourlyRate: parseRate(formRate),
        bio: formBio.trim(),
        specialties: [],
        availableDays: days,
        availableHours: hours,
      });
      setShowAddModal(false);
      setFormName(''); setFormTitle(''); setFormPhone(''); setFormBio(''); setFormRate('');
      setFormDays([]); setFormHours('');
    } catch {
      setFormError('خطا در ذخیره مربی. دوباره تلاش کنید.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteCoach = async (coachId: string, coachName: string) => {
    if (!window.confirm(`مربی «${coachName}» حذف شود؟`)) return;
    try {
      await deleteCoach(coachId);
    } catch {
      // error toast already shown by context
    }
  };

  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('شنبه ۱۴۰۳/۰۶/۳۱');
  const [selectedHour, setSelectedHour] = useState<string>('۱۶:۰۰');
  const [sessionType, setSessionType] = useState<'1-on-1' | 'Duo Clinic' | 'Group Clinic' | 'Tactical Assessment'>('1-on-1');
  const [showReceiptModal, setShowReceiptModal] = useState<any>(null);

  const handleOpenBookingModal = (coach: Coach) => {
    setSelectedCoach(coach);
    setBookingError(null);
    setSelectedClub(coach.clubs[0] || 'باشگاه پدل انقلاب');
    // No fake fallbacks: a coach without a schedule keeps empty selections
    // and the confirm guard below blocks the booking with a clear message.
    setSelectedDate(coach.availableDays[0] || '');
    setSelectedHour(coach.availableHours[0] || '');
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoach) return;
    // Belt-and-braces: never record a booking for a coach with no schedule
    // (older coaches created before the add-form validation may have empty
    // availableDays/availableHours).
    if (selectedCoach.availableDays.length === 0 || selectedCoach.availableHours.length === 0) {
      setBookingError('این مربی برنامه‌ای ثبت نکرده است.');
      return;
    }
    // Confirm-time mirror of the court zero-price guard: a legacy or
    // server-side coach with rate 0 (or a bad rate that slipped past the
    // add form) must never book a session with a 0-toman receipt.
    if (!(selectedCoach.hourlyRate > 0)) {
      setBookingError('این مربی نرخ معتبری ندارد و قابل رزرو نیست.');
      return;
    }
    // Double-submit guard: bookCoach is synchronous, so a ref blocks a
    // same-tick double submit that would create duplicate coach bookings.
    // The bookingLocked state below survives across event ticks and keeps
    // the confirm button disabled until the receipt is dismissed.
    if (bookingSubmittingRef.current) return;
    bookingSubmittingRef.current = true;
    setBookingLocked(true);
    try {
      let multiplier = 1;
      if (sessionType === 'Duo Clinic') multiplier = 1.3;
      if (sessionType === 'Group Clinic') multiplier = 1.6;

      const finalPrice = Math.round(selectedCoach.hourlyRate * multiplier);

      const newBooking = bookCoach({
        coachId: selectedCoach.id,
        coachName: selectedCoach.name,
        clubName: selectedClub,
        date: selectedDate,
        time: selectedHour,
        sessionType,
        price: finalPrice,
        playerName: playerProfile.name,
        playerPhone: playerProfile.phone,
      });

      // bookCoach returns null when the same coach/day/hour is already booked
      // (duplicate-slot guard): show the error and unlock so the user can
      // pick another slot — no receipt modal.
      if (!newBooking) {
        setBookingError('این سانس قبلاً برای این مربی رزرو شده است. لطفاً روز یا ساعت دیگری انتخاب کنید.');
        setBookingLocked(false);
        return;
      }

      setSelectedCoach(null);
      setShowReceiptModal(newBooking);
    } finally {
      bookingSubmittingRef.current = false;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#ff2d55]/15 via-white/[0.03] to-[#2f7bff]/15 border border-white/10 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              آکادمی و مربیان پدل
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              رزرو مربی اختصاصی و کلینیک‌های پدل
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              تکنیک خود را با مربیان ارشد ارتقا دهید. آموزش ضربات اختصاصی شیشه (Bandeja, Vibora, Bajada)، اصلاح پوزیشن دونفره، رزرو خصوصی، دونفره یا گروهی در باشگاه‌های مختلف سراسر کشور.
            </p>
          </div>

          <div className="text-left bg-white/[0.05] border border-white/10 p-4 rounded-2xl shrink-0">
            <span className="text-xs text-slate-500 block">جلسات آموزشی رزرو شده شما:</span>
            <span className="text-xl font-black text-[#ff6b81]">{coachBookings.length} جلسه</span>
          </div>
        </div>
        {isAdmin && (
          <div className="relative z-10 mt-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-2xl bubble-btn text-white text-sm font-bold transition"
            >
              + افزودن مربی جدید
            </button>
          </div>
        )}
      </div>

      {/* Coaches Grid */}
      {coaches.length === 0 ? (
        <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-bold mb-2">هنوز مربی‌ای ثبت نشده است</p>
          <p className="text-sm text-slate-500">
            {isAdmin ? 'از دکمه بالا اولین مربی را اضافه کنید.' : 'به‌زودی مربیان این‌جا معرفی می‌شوند.'}
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coaches.map((coach) => (
          <div
            key={coach.id}
            className="rounded-3xl bg-white/[0.06] border border-white/10 p-6 space-y-5 hover:border-white/10 transition flex flex-col justify-between shadow-lg"
          >
            <div>
              {/* Profile Top */}
              <div className="flex gap-4">
                <img
                  src={coach.avatar}
                  alt={coach.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#ff2d55]/50 shrink-0"
                />

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-black text-slate-100 truncate">{coach.name}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteCoach(coach.id, coach.name)}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-2 py-1"
                        >
                          حذف
                        </button>
                      )}
                      <div className="flex items-center gap-1 text-[#facc15] text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{coach.reviewsCount > 0 ? coach.rating : '—'}</span>
                        {coach.reviewsCount > 0 && (
                          <span className="text-slate-500 font-normal">({coach.reviewsCount})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#ff6b81] font-bold">{coach.title}</p>
                  {coach.phone && (
                    <a
                      href={`tel:${coach.phone.replace(/\s/g, '')}`}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:text-emerald-200 mt-1"
                      dir="ltr"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{coach.phone}</span>
                    </a>
                  )}
                  
                  {coach.fipCertification && (
                  <div className="inline-flex items-center gap-1 text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md mt-1">
                    <Award className="w-3 h-3" />
                    <span>{coach.fipCertification}</span>
                  </div>
                  )}
                </div>
              </div>

              {/* Bio & Specialties */}
              <div className="mt-4 space-y-3 text-xs">
                <p className="text-slate-500 leading-relaxed text-[11px] bg-white/[0.04] p-3 rounded-xl border border-white/10">
                  {coach.bio}
                </p>

                <div>
                  <span className="text-slate-500 text-[11px] font-bold block mb-1.5">تخصص‌ها:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {coach.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 text-[10px] border border-white/10"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] font-bold block mb-1.5">باشگاه‌های محل آموزش:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {coach.clubs.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px] border border-indigo-500/20 flex items-center gap-1"
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Price */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-500 block">نرخ هر ساعت تمرین:</span>
                <span className="text-base font-black text-slate-100">
                  {coach.hourlyRate.toLocaleString('fa-IR')}{' '}
                  <span className="text-[11px] text-slate-500">تومان</span>
                </span>
              </div>

              <button
                onClick={() => handleOpenBookingModal(coach)}
                className="px-6 py-3 bubble-btn text-white font-black text-xs rounded-2xl transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>رزرو جلسه تمرینی</span>
              </button>
            </div>

          </div>
        ))}
      </div>
      )}

      {/* Booking Sheet — slides up from bottom */}
      {selectedCoach && (
        <BottomSheet
          label={`رزرو جلسه با ${selectedCoach.name}`}
          onClose={() => setSelectedCoach(null)}
          maxContentHeight="70vh"
          title={
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#ff6b81]" />
              <h3 className="text-base font-black text-slate-100">رزرو جلسه با {selectedCoach.name}</h3>
            </div>
          }
        >
          <div className="text-xs">
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              {/* Select Club */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">انتخاب باشگاه تمرین:</label>
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-slate-100"
                >
                  {selectedCoach.clubs.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">نوع جلسه تمرینی:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '1-on-1', label: 'خصوصی ۱ به ۱ (فردی)', sub: 'تمرکز ۱۰۰٪ روی تکنیک شما' },
                    { id: 'Duo Clinic', label: 'دونفره (زوج ورزشی)', sub: 'هماهنگی پارتنرها و تاکتیک' },
                    { id: 'Group Clinic', label: 'کلینیک گروهی ۴ نفره', sub: 'تمرینات پرتاب توپ و بازی' },
                    { id: 'Tactical Assessment', label: 'آنالیز تصویری تاکتیک', sub: 'ارزیابی ویدیویی بازی' },
                  ].map((typ) => (
                    <button
                      key={typ.id}
                      type="button"
                      onClick={() => setSessionType(typ.id as any)}
                      className={`p-2.5 rounded-xl border text-right transition cursor-pointer ${
                        sessionType === typ.id
                          ? 'bg-[#ff2d55]/15 border-[#ff2d55]/60 text-slate-100'
                          : 'bg-white/[0.05] border-white/10 text-slate-400'
                      }`}
                    >
                      <span className="font-bold block text-xs">{typ.label}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{typ.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">روز جلسه:</label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {selectedCoach.availableDays.map((d, i) => (
                      <option key={i} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">ساعت جلسه:</label>
                  <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {selectedCoach.availableHours.map((h, i) => (
                      <option key={i} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trainee info */}
              <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10 space-y-1">
                <span className="text-slate-500 text-[10px]">مشخصات ورزشکار:</span>
                <p className="text-slate-100 font-bold">{playerProfile.name} ({playerProfile.phone})</p>
                <p className="text-[#ff6b81] text-[11px] flex items-center gap-1.5">سطح فعلی: <GradeBadge grade={levelToGrade(playerProfile.level)} className="text-[10px] min-w-[1.8rem]" /></p>
              </div>

              {bookingError && (
                <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 text-center">
                  {bookingError}
                </p>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={bookingLocked}
                  className="flex-1 py-3 bubble-btn text-white font-black rounded-2xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>تایید و ثبت جلسه تمرینی</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCoach(null)}
                  className="px-4 py-3 bg-white/[0.04] text-slate-400 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </BottomSheet>
      )}

      {/* Confirmation Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white/[0.05] border border-[#ff2d55]/60/50 p-6 shadow-2xl space-y-4 text-xs">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#ff2d55]/20 border border-[#ff2d55]/60 text-[#ff6b81] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-100">جلسه مربیگری با موفقیت رزرو شد</h3>
              <p className="text-slate-500 text-[11px]">رزرو در همین گوشی ثبت شد و هنوز به مربی اطلاع داده نشده؛ برای هماهنگی نهایی خودتان با مربی تماس بگیرید.</p>
            </div>

            <div className="rounded-2xl bg-white/[0.05] p-4 border border-white/10 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">مربی:</span>
                <span className="text-slate-100 font-bold">{showReceiptModal.coachName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">باشگاه:</span>
                <span className="text-slate-100 font-bold">{showReceiptModal.clubName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">زمان:</span>
                <span className="text-cyan-400 font-bold">{showReceiptModal.date} | {showReceiptModal.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">مبلغ:</span>
                <span className="text-[#ff6b81] font-black">{showReceiptModal.price.toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowReceiptModal(null);
                setBookingLocked(false);
              }}
              className="w-full py-2.5 bubble-btn-fire text-white font-black rounded-2xl cursor-pointer"
            >
              متشکرم، بستن
            </button>
          </div>
        </div>
      )}

      {/* Add Coach Modal (admin) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-strong rounded-3xl border border-white/10 p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-100">افزودن مربی جدید</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCoach} className="space-y-3">
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="نام مربی *"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-500 text-sm"
              />
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="عنوان (مثلاً مربی ارشد)"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-500 text-sm"
              />
              <input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="شماره تماس مربی"
                inputMode="tel"
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-500 text-sm text-right"
              />
              <div>
                <span className="block text-slate-400 font-bold mb-1.5 text-xs">روزهای قابل رزرو *</span>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS_FA.map((d) => {
                    const active = formDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() =>
                          setFormDays((prev) =>
                            prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          active
                            ? 'bg-[#ff2d55]/20 border-[#ff2d55]/60 text-slate-100'
                            : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
              <input
                value={formHours}
                onChange={(e) => setFormHours(e.target.value)}
                placeholder="ساعت‌های قابل رزرو * (با ویرگول جدا کنید؛ مثلاً ۱۶:۰۰، ۱۷:۳۰)"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-500 text-sm"
              />
              <input
                value={formRate}
                onChange={(e) => setFormRate(e.target.value)}
                placeholder="نرخ ساعتی (تومان)"
                inputMode="numeric"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-500 text-sm"
              />
              <textarea
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                placeholder="بیوگرافی کوتاه"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-500 text-sm"
              />
              {formError && <p className="text-sm text-red-400">{formError}</p>}
              <button
                type="submit"
                disabled={formSaving}
                className="w-full py-2.5 bubble-btn disabled:opacity-50 text-white font-black rounded-2xl"
              >
                {formSaving ? 'در حال ذخیره...' : 'ثبت مربی'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
