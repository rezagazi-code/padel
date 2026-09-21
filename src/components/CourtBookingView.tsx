import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { Club, Court } from '../types';
import { PROVINCES_LIST } from '../mockData';
import {
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users,
  CreditCard,
  Phone,
  PlusCircle,
  Layers,
  Award,
  ChevronLeft,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CourtBookingViewProps {
  onOpenClubOwnerModal: () => void;
}

export const CourtBookingView: React.FC<CourtBookingViewProps> = ({ onOpenClubOwnerModal }) => {
  const {
    clubs,
    createBooking,
    playerProfile,
    selectedProvince,
    setSelectedProvince
  } = usePadel();

  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || '');
  const [selectedCourtId, setSelectedCourtId] = useState<string>(
    clubs[0]?.courts[0]?.id || ''
  );
  
  // Dates: Next 7 days
  const daysList = [
    { dayName: 'امروز', dateStr: '۱۴۰۳/۰۶/۲۸', raw: '2024-09-18' },
    { dayName: 'فردا', dateStr: '۱۴۰۳/۰۶/۲۹', raw: '2024-09-19' },
    { dayName: 'جمعه', dateStr: '۱۴۰۳/۰۶/۳۰', raw: '2024-09-20' },
    { dayName: 'شنبه', dateStr: '۱۴۰۳/۰۷/۰۱', raw: '2024-09-21' },
    { dayName: 'یک‌شنبه', dateStr: '۱۴۰۳/۰۷/۰۲', raw: '2024-09-22' },
    { dayName: 'دوشنبه', dateStr: '۱۴۰۳/۰۷/۰۳', raw: '2024-09-23' },
    { dayName: 'سه‌شنبه', dateStr: '۱۴۰۳/۰۷/۰۴', raw: '2024-09-24' },
  ];

  const [selectedDate, setSelectedDate] = useState(daysList[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('۱۹:۳۰ - ۲۱:۰۰');
  const [duration, setDuration] = useState<number>(90); // 60, 90, 120
  const [splitPayment, setSplitPayment] = useState<boolean>(true);
  const [needsExtraPlayers, setNeedsExtraPlayers] = useState<boolean>(false);
  const [playersNeededCount, setPlayersNeededCount] = useState<number>(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [lastBookingInfo, setLastBookingInfo] = useState<any>(null);

  // Filter clubs by province
  const filteredClubs = clubs.filter(
    (c) => selectedProvince === 'همه استان‌ها' || c.province === selectedProvince
  );

  const currentClub = clubs.find((c) => c.id === selectedClubId) || clubs[0];
  const currentCourt =
    currentClub?.courts.find((ct) => ct.id === selectedCourtId) ||
    currentClub?.courts[0];

  // Standard time slots with peak indicator
  const timeSlots = [
    { time: '۰۸:۰۰ - ۰۹:۳۰', isPeak: false, isBooked: false, period: 'morning' },
    { time: '۰۹:۳۰ - ۱۱:۰۰', isPeak: false, isBooked: true, period: 'morning' },
    { time: '۱۱:۰۰ - ۱۲:۳۰', isPeak: false, isBooked: false, period: 'morning' },
    { time: '۱۵:۰۰ - ۱۶:۳۰', isPeak: false, isBooked: false, period: 'afternoon' },
    { time: '۱۶:۳۰ - ۱۸:۰۰', isPeak: false, isBooked: false, period: 'afternoon' },
    { time: '۱۸:۰۰ - ۱۹:۳۰', isPeak: true, isBooked: true, period: 'night' },
    { time: '۱۹:۳۰ - ۲۱:۰۰', isPeak: true, isBooked: false, period: 'night' },
    { time: '۲۱:۰۰ - ۲۲:۳۰', isPeak: true, isBooked: false, period: 'night' },
    { time: '۲۲:۳۰ - ۲۴:۰۰', isPeak: true, isBooked: false, period: 'night' },
  ];

  const isCurrentSlotPeak = selectedTimeSlot.includes('۱۸:') || selectedTimeSlot.includes('۱۹:') || selectedTimeSlot.includes('۲۱:') || selectedTimeSlot.includes('۲۲:');
  const baseRate = currentCourt ? (isCurrentSlotPeak ? currentCourt.peakHourlyRate : currentCourt.hourlyRate) : 700000;
  const totalPrice = Math.round((baseRate * duration) / 60);
  const splitPrice = Math.round(totalPrice / 4);

  const handleConfirmBooking = () => {
    if (!currentClub || !currentCourt) return;

    const newBooking = createBooking({
      clubId: currentClub.id,
      clubName: currentClub.name,
      courtId: currentCourt.id,
      courtName: currentCourt.name,
      date: selectedDate.dateStr,
      timeSlot: selectedTimeSlot,
      durationMinutes: duration,
      totalPrice,
      splitPricePerPerson: splitPrice,
      paymentStatus: splitPayment ? 'split_active' : 'paid',
      bookedByPlayerId: playerProfile.id,
      bookedByPlayerName: playerProfile.name,
      playersNeeded: needsExtraPlayers ? playersNeededCount : 0,
    });

    setLastBookingInfo(newBooking);
    setShowConfirmationModal(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a3e635', '#38bdf8', '#ffffff']
      });
    } catch {
      // safe fallback
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / Headline */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#a3e635]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/30 text-[#a3e635] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              رزرو هوشمند و لحظه‌ای زمین‌های پدل سراسر کشور
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              رزرو زمین پدل با استانداردهای جهانی Playtomic
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              انتخاب کورت‌های شیشه‌ای پانورامیک، چمن تخصصی Mondo 4NX، زمان‌بندی دقیق و پرداخت سهمی ۴ نفره به همراه اعلام نیاز به بازیکن.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenClubOwnerModal}
              className="flex items-center gap-2 bg-[#a3e635] hover:bg-[#8fd126] text-slate-950 font-black text-sm px-5 py-3 rounded-2xl shadow-[0_4px_20px_rgba(163,230,53,0.3)] transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>افزودن باشگاه و زمین (ویژه باشگاه‌داران)</span>
            </button>
          </div>
        </div>

        {/* Province Filter Pills */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 ml-2">
            <MapPin className="w-3.5 h-3.5 text-[#a3e635]" />
            استان:
          </span>
          {PROVINCES_LIST.map((prov) => (
            <button
              key={prov}
              onClick={() => setSelectedProvince(prov)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                selectedProvince === prov
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {prov}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Club Selection & Court Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Clubs List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#a3e635]" />
              باشگاه‌های منتخب ({filteredClubs.length})
            </h2>
            <span className="text-xs text-slate-400">کورت‌های دارای مجوز</span>
          </div>

          <div className="space-y-3">
            {filteredClubs.map((club) => {
              const isSelected = club.id === selectedClubId;
              return (
                <div
                  key={club.id}
                  onClick={() => {
                    setSelectedClubId(club.id);
                    if (club.courts.length > 0) {
                      setSelectedCourtId(club.courts[0].id);
                    }
                  }}
                  className={`group relative overflow-hidden rounded-2xl p-4 transition cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-800/90 border-[#a3e635] shadow-[0_0_20px_rgba(163,230,53,0.15)] ring-1 ring-[#a3e635]'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={club.coverImage}
                      alt={club.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 ring-1 ring-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-[#a3e635] transition">
                          {club.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[#facc15] text-xs font-black shrink-0">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{club.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        {club.city}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
                          {club.courtsCount} کورت فعال
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ساعت کار: {club.openingHour} الی {club.closingHour}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Court Schedule & Booking Controls (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Selected Club Details Card */}
          {currentClub && (
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
              
              {/* Club Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">{currentClub.name}</h2>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      تایید رسمی
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#a3e635]" />
                    {currentClub.address}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span dir="ltr">{currentClub.phone}</span>
                </div>
              </div>

              {/* Amenities Tags */}
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-2">امکانات ویژه باشگاه:</span>
                <div className="flex flex-wrap gap-2">
                  {currentClub.amenities.map((am, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-300 border border-slate-700/80 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#a3e635]" />
                      {am}
                    </span>
                  ))}
                </div>
              </div>

              {/* Court Selection Tabs */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  ۱. انتخاب زمین مورد نظر ({currentClub.courts.length} زمین):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentClub.courts.map((court) => {
                    const isCourtSelected = court.id === currentCourt?.id;
                    return (
                      <button
                        key={court.id}
                        onClick={() => setSelectedCourtId(court.id)}
                        className={`p-3.5 rounded-2xl text-right transition cursor-pointer border ${
                          isCourtSelected
                            ? 'bg-[#a3e635]/15 border-[#a3e635] text-white shadow-[0_0_15px_rgba(163,230,53,0.2)]'
                            : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black">{court.name}</span>
                          <span
                            className="w-3 h-3 rounded-full border border-slate-700"
                            style={{ backgroundColor: court.turfColor }}
                            title="رنگ چمن کورت"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {court.type === 'panoramic' ? 'شیشه‌ای تمام پانورامیک' : court.type === 'indoor' ? 'سالنی سرپوشیده' : 'روباز با نور LED'}
                        </p>
                        <div className="mt-2 text-xs font-bold text-[#a3e635]">
                          {(court.hourlyRate / 1000).toLocaleString('fa-IR')} هزار تومان / ساعت
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Selection Horizontal Bar */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  ۲. انتخاب روز رزرو:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {daysList.map((d, index) => {
                    const isDateSelected = d.raw === selectedDate.raw;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(d)}
                        className={`min-w-[90px] py-3 px-3 rounded-2xl text-center transition cursor-pointer border shrink-0 ${
                          isDateSelected
                            ? 'bg-[#a3e635] text-slate-950 font-black shadow-[0_4px_12px_rgba(163,230,53,0.3)]'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <span className="text-xs font-semibold block">{d.dayName}</span>
                        <span className="text-sm font-black mt-0.5 block">{d.dateStr.split('/')[2]} شهریور</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration Toggle: 60, 90, 120 mins */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  ۳. مدت زمان سانس بازی:
                </label>
                <div className="inline-flex p-1 rounded-xl bg-slate-800 border border-slate-700 gap-1">
                  {[
                    { mins: 60, label: '۶۰ دقیقه' },
                    { mins: 90, label: '۹۰ دقیقه (استاندارد مچ پدل)' },
                    { mins: 120, label: '۱۲۰ دقیقه (تورنومنتی)' },
                  ].map((dur) => (
                    <button
                      key={dur.mins}
                      onClick={() => setDuration(dur.mins)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                        duration === dur.mins
                          ? 'bg-[#a3e635] text-slate-950 shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots Grid */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  ۴. انتخاب سانس ساعت:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {timeSlots.map((slot, index) => {
                    const isSlotSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={index}
                        disabled={slot.isBooked}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-3 rounded-xl text-center border transition relative cursor-pointer ${
                          slot.isBooked
                            ? 'bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-not-allowed opacity-50'
                            : isSlotSelected
                            ? 'bg-[#a3e635] text-slate-950 font-black border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                            : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
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

                        <div className="flex items-center justify-center gap-1 mt-1">
                          {slot.isBooked ? (
                            <span className="text-[10px] text-rose-400 font-semibold">رزرو شده</span>
                          ) : slot.isPeak ? (
                            <span
                              className={`text-[10px] font-bold px-1.5 rounded ${
                                isSlotSelected ? 'bg-black text-[#a3e635]' : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              ساعات پیک
                            </span>
                          ) : (
                            <span
                              className={`text-[10px] font-bold px-1.5 rounded ${
                                isSlotSelected ? 'bg-black text-[#a3e635]' : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              سانس عادی
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Free Agent / Need Player Helper Toggle */}
              <div className="rounded-2xl bg-gradient-to-r from-slate-800/90 to-indigo-950/40 border border-indigo-500/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">آیا برای این سانس به بازیکن کمکی احتیاج دارید؟</h4>
                      <p className="text-xs text-slate-400">
                        در صورت فعال‌سازی، آگهی «نیاز به بازیکن» خودکار در تابلوی بازیکن‌های آزاد ثبت می‌شود.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needsExtraPlayers}
                      onChange={(e) => setNeedsExtraPlayers(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a3e635]"></div>
                  </label>
                </div>

                {needsExtraPlayers && (
                  <div className="pt-3 border-t border-slate-700/80 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
                    <span className="text-slate-400">تعداد بازیکن مورد نیاز:</span>
                    {[1, 2, 3].map((count) => (
                      <button
                        key={count}
                        onClick={() => setPlayersNeededCount(count)}
                        className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                          playersNeededCount === count
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {count} بازیکن
                      </button>
                    ))}
                    <span className="text-[11px] text-cyan-400">
                      هزینه هر بازیکن: {splitPrice.toLocaleString('fa-IR')} تومان محاسبه می‌شود.
                    </span>
                  </div>
                )}
              </div>

              {/* Checkout Calculation & Confirmation */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Payment Breakdown */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400">نحوه پرداخت:</span>
                    <button
                      onClick={() => setSplitPayment(true)}
                      className={`text-xs px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                        splitPayment
                          ? 'bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      دنگ ۴ نفره (سهم من)
                    </button>
                    <button
                      onClick={() => setSplitPayment(false)}
                      className={`text-xs px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                        !splitPayment
                          ? 'bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      پرداخت کل مبلغ
                    </button>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">
                      {(splitPayment ? splitPrice : totalPrice).toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">تومان</span>
                    {splitPayment && (
                      <span className="text-xs text-slate-500">
                        (کل مبلغ سانس: {totalPrice.toLocaleString('fa-IR')} تومان)
                      </span>
                    )}
                  </div>
                </div>

                {/* Final CTA Button */}
                <button
                  onClick={handleConfirmBooking}
                  className="glow-btn-lime flex items-center justify-center gap-2 text-slate-950 font-black text-base px-8 py-3.5 rounded-2xl transition cursor-pointer"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>تایید و رزرو قطعی زمین</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Booking Confirmation Receipt Modal */}
      {showConfirmationModal && lastBookingInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-[#a3e635]/50 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[#a3e635]/20 border border-[#a3e635] text-[#a3e635] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">زمین با موفقیت رزرو گردید!</h3>
              <p className="text-xs text-slate-400">رسید الکترونیکی رزرو کورت پدل شما صادر شد.</p>
            </div>

            {/* Receipt Summary Box */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">کد پیگیری:</span>
                <span className="font-mono text-cyan-400 font-bold">{lastBookingInfo.id}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">باشگاه:</span>
                <span className="font-bold text-white">{lastBookingInfo.clubName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">زمین:</span>
                <span className="font-bold text-[#a3e635]">{lastBookingInfo.courtName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">تاریخ و ساعت:</span>
                <span className="font-bold text-white">{lastBookingInfo.date} | {lastBookingInfo.timeSlot}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">مدت سانس:</span>
                <span className="font-bold text-white">{lastBookingInfo.durationMinutes} دقیقه</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">رزرو کننده:</span>
                <span className="font-bold text-white">{lastBookingInfo.bookedByPlayerName}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
                <span className="text-slate-400 font-bold">مبلغ پرداختی:</span>
                <span className="text-[#a3e635] font-black">
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
                  آگهی نیاز به {lastBookingInfo.playersNeeded} بازیکن در بخش بازیکن‌های آزاد ثبت شد تا سایر بازیکنان ملحق شوند.
                </span>
              </div>
            )}

            <button
              onClick={() => setShowConfirmationModal(false)}
              className="w-full py-3 bg-[#a3e635] hover:bg-[#8fd126] text-slate-950 font-black text-sm rounded-xl transition cursor-pointer"
            >
              بستن و بازگشت به سامانه
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
