import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { Coach } from '../types';
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
import confetti from 'canvas-confetti';

export const CoachBookingView: React.FC = () => {
  const { coaches, coachBookings, bookCoach, playerProfile } = usePadel();

  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('شنبه ۱۴۰۳/۰۶/۳۱');
  const [selectedHour, setSelectedHour] = useState<string>('۱۶:۰۰');
  const [sessionType, setSessionType] = useState<'1-on-1' | 'Duo Clinic' | 'Group Clinic' | 'Tactical Assessment'>('1-on-1');
  const [showReceiptModal, setShowReceiptModal] = useState<any>(null);

  const handleOpenBookingModal = (coach: Coach) => {
    setSelectedCoach(coach);
    setSelectedClub(coach.clubs[0] || 'باشگاه پدل انقلاب');
    setSelectedHour(coach.availableHours[0] || '۱۶:۰۰');
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoach) return;

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

    setSelectedCoach(null);
    setShowReceiptModal(newBooking);

    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch {}
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
              آکادمی و مربیان دارای مدرک رسمی فدراسیون بین‌المللی FIP
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
      </div>

      {/* Coaches Grid */}
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
                    <div className="flex items-center gap-1 text-[#facc15] text-xs font-black shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{coach.rating}</span>
                      <span className="text-slate-500 font-normal">({coach.reviewsCount})</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#ff6b81] font-bold">{coach.title}</p>
                  
                  <div className="inline-flex items-center gap-1 text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md mt-1">
                    <Award className="w-3 h-3" />
                    <span>{coach.fipCertification}</span>
                  </div>
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
                className="px-6 py-3 bg-[#ff2d55] hover:bg-[#8fd126] text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>رزرو جلسه تمرینی</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl glass-strong p-6 shadow-2xl space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#ff6b81]" />
                <h3 className="text-base font-black text-slate-100">رزرو جلسه با {selectedCoach.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCoach(null)}
                className="text-slate-500 hover:text-slate-100 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                <p className="text-[#ff6b81] text-[11px]">سطح فعلی: {playerProfile.level.toFixed(2)}</p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#ff2d55] hover:bg-[#8fd126] text-white font-black rounded-xl cursor-pointer flex items-center justify-center gap-2"
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
        </div>
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
              <p className="text-slate-500 text-[11px]">پیامک هماهنگی برای مربی و شما ارسال گردید.</p>
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
              onClick={() => setShowReceiptModal(null)}
              className="w-full py-2.5 bg-[#ff2d55] hover:bg-[#8fd126] text-white font-black rounded-xl cursor-pointer"
            >
              متشکرم، بستن
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
