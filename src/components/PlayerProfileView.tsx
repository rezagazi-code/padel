import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { PlayingHand, PlayingSide } from '../types';
import { PROVINCES_LIST } from '../mockData';
import {
  User,
  Shield,
  Palette,
  Award,
  Zap,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  TrendingUp,
  Flame,
  Save,
  Trash2,
  Smartphone,
  Trophy,
  History
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PALETTE_COLORS = [
  { name: 'سبز فسفری پدل', hex: '#a3e635' },
  { name: 'آبی نئونی', hex: '#38bdf8' },
  { name: 'مرجانی شعله‌ور', hex: '#f43f5e' },
  { name: 'کهربایی مسابقه‌ای', hex: '#fbbf24' },
  { name: 'بنفش سلطنتی', hex: '#a855f7' },
  { name: 'زمردی دریایی', hex: '#10b981' },
];

export const PlayerProfileView: React.FC = () => {
  const {
    playerProfile,
    updatePlayerProfile,
    bookings,
    coachBookings,
    openMatches,
    cancelBooking
  } = usePadel();

  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [name, setName] = useState(playerProfile.name);
  const [phone, setPhone] = useState(playerProfile.phone);
  const [city, setCity] = useState(playerProfile.city);
  const [province, setProvince] = useState(playerProfile.province);
  const [level, setLevel] = useState<number>(playerProfile.level);
  const [themeColor, setThemeColor] = useState(playerProfile.themeColor);
  const [preferredSide, setPreferredSide] = useState<PlayingSide>(playerProfile.preferredSide);
  const [hand, setHand] = useState<PlayingHand>(playerProfile.hand);
  const [racketBrand, setRacketBrand] = useState(playerProfile.racketBrand);
  const [racketModel, setRacketModel] = useState(playerProfile.racketModel);
  const [bio, setBio] = useState(playerProfile.bio || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlayerProfile({
      name,
      phone,
      city,
      province,
      level: Number(level),
      themeColor,
      preferredSide,
      hand,
      racketBrand,
      racketModel,
      bio,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Player Identity Showcase Hero Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border transition-all duration-300"
        style={{
          backgroundColor: '#090d16',
          borderColor: themeColor,
          boxShadow: `0 0 35px ${themeColor}25`,
        }}
      >
        <div
          className="absolute -top-16 -right-16 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: themeColor }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar with customized player color frame */}
          <div className="relative">
            <img
              src={playerProfile.avatar}
              alt={playerProfile.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 shadow-2xl"
              style={{ borderColor: themeColor }}
            />
            <span
              className="absolute -bottom-2 -left-2 px-3 py-1 rounded-xl text-xs font-black shadow-md"
              style={{ backgroundColor: themeColor, color: '#000' }}
            >
              سطح {playerProfile.level.toFixed(2)}
            </span>
          </div>

          {/* Core Info */}
          <div className="text-center md:text-right space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {playerProfile.name}
              </h1>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${themeColor}20`,
                  color: themeColor,
                  borderColor: `${themeColor}50`,
                }}
              >
                رتبه #{playerProfile.rankingPosition} {playerProfile.province}
              </span>
            </div>

            <p className="text-xs text-slate-300 flex items-center justify-center md:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5" style={{ color: themeColor }} />
              {playerProfile.city}، {playerProfile.province} | {playerProfile.phone}
            </p>

            <p className="text-xs text-slate-400 max-w-xl italic">
              "{playerProfile.bio}"
            </p>
          </div>

          {/* Quick Stats Bento */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 shrink-0 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">امتیاز رنکینگ</span>
              <span className="text-lg font-black" style={{ color: themeColor }}>
                {playerProfile.rankingPoints.toLocaleString('fa-IR')}
              </span>
            </div>
            <div className="border-r border-slate-800 pr-3">
              <span className="text-[10px] text-slate-400 block">درصد پیروزی</span>
              <span className="text-lg font-black text-emerald-400">
                {playerProfile.winRate ?? (playerProfile.matchesPlayed > 0 ? Math.round((playerProfile.matchesWon / playerProfile.matchesPlayed) * 100) : 75)}٪
              </span>
            </div>
            <div className="border-r border-slate-800 pr-3">
              <span className="text-[10px] text-slate-400 block">بازی‌ها</span>
              <span className="text-lg font-black text-white">
                {playerProfile.matchesPlayed}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>ویرایش مشخصات و رنگ اختصاصی بازیکن</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>تاریخچه رزروها و جلسات ({bookings.length + coachBookings.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Profile Editor Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#a3e635]" />
                شخصی‌سازی مشخصات فنی و رنگ کارت پدل
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تنظیمات این بخش در تابلوی مچ‌میکینگ، بازیکن‌های آزاد و تورنومنت‌ها برای همه نمایش داده می‌شود.
              </p>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                اطلاعات با موفقیت ذخیره شد
              </div>
            )}
          </div>

          {/* Theme Color Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              ۱. انتخاب رنگ شاخص و اختصاصی شما در اپلیکیشن:
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {PALETTE_COLORS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => setThemeColor(col.hex)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    themeColor === col.hex
                      ? 'border-white bg-slate-800 shadow-md ring-2 ring-white/50'
                      : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/30"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">نام و نام خانوادگی:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-[#a3e635] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">شماره تماس (جهت هماهنگی):</label>
              <input
                type="text"
                dir="ltr"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-[#a3e635] focus:outline-none text-right"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">استان سکونت:</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-[#a3e635] focus:outline-none"
              >
                {PROVINCES_LIST.filter((p) => p !== 'همه استان‌ها').map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">شهر:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-[#a3e635] focus:outline-none"
              />
            </div>
          </div>

          {/* Level Rating & Calibration */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white block">
                  سطح پدل شما بر اساس استانداردهای جهانی Playtomic (۱.۰۰ تا ۷.۰۰):
                </label>
                <p className="text-[11px] text-slate-400">
                  این عدد در مچ‌میکینگ مسابقات و تورنومنت‌ها تعیین‌کننده رده شماست.
                </p>
              </div>
              <span
                className="text-xl font-black px-3 py-1 rounded-xl"
                style={{ backgroundColor: themeColor, color: '#000' }}
              >
                {level.toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min="1.0"
              max="6.5"
              step="0.05"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full accent-[#a3e635]"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>۱.۰ (مبتدی تازه وارد)</span>
              <span>۲.۵ (آشنایی با شیشه و سرویس)</span>
              <span>۳.۵ (متوسط مسابقه‌ای)</span>
              <span>۴.۵ (پیشرفته کشوری)</span>
              <span>۶.۰+ (حرفه‌ای بین‌المللی)</span>
            </div>
          </div>

          {/* Technical Specs: Side, Hand, Racket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Preferred Side */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">سمت بازی در کورت (Position):</label>
              <div className="flex gap-2">
                {[
                  { id: 'left', label: 'سمت چپ (Reves)' },
                  { id: 'right', label: 'سمت راست (Drive)' },
                  { id: 'both', label: 'هر دو سمت' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPreferredSide(s.id as PlayingSide)}
                    className={`flex-1 py-2.5 rounded-xl border font-bold transition cursor-pointer ${
                      preferredSide === s.id
                        ? 'bg-[#a3e635] text-slate-950 border-[#a3e635]'
                        : 'bg-slate-950 border-slate-700 text-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dominant Hand */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">دست غالب:</label>
              <div className="flex gap-2">
                {[
                  { id: 'right', label: 'راست‌دست' },
                  { id: 'left', label: 'چپ‌دست (مزیت تاکتیکی)' },
                ].map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHand(h.id as PlayingHand)}
                    className={`flex-1 py-2.5 rounded-xl border font-bold transition cursor-pointer ${
                      hand === h.id
                        ? 'bg-[#a3e635] text-slate-950 border-[#a3e635]'
                        : 'bg-slate-950 border-slate-700 text-slate-300'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Racket Details */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">برند و مدل راکت:</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="برند (Babolat)"
                  value={racketBrand}
                  onChange={(e) => setRacketBrand(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="مدل (Viper)"
                  value={racketModel}
                  onChange={(e) => setRacketModel(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Bio / Playing Philosophy */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              متن معرفی در کارت بازیکن (Bio):
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="مثال: علاقه‌مند به مچ‌های سرعتی و بازی تهاجمی لب تور..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#a3e635] hover:bg-[#8fd126] text-slate-950 font-black text-sm px-8 py-3 rounded-2xl shadow-[0_4px_20px_rgba(163,230,53,0.3)] transition active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات پروفایل</span>
            </button>
          </div>

        </form>
      )}

      {/* Tab 2: Booking History & Reservations */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Court Bookings */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#a3e635]" />
              سانس‌های رزرو شده زمین‌های پدل ({bookings.length})
            </h3>

            {bookings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">هنوز هیچ زمینی رزرو نکرده‌اید.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{b.clubName}</h4>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">{b.id}</span>
                    </div>

                    <div className="flex items-center gap-4 text-slate-300">
                      <span>زمین: <strong className="text-[#a3e635]">{b.courtName}</strong></span>
                      <span>مدت: {b.durationMinutes} دقیقه</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/80">
                      <span>{b.date} | {b.timeSlot}</span>
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="text-rose-400 hover:text-rose-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        لغو سانس
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coach Bookings */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              جلسات مربیگری رزرو شده ({coachBookings.length})
            </h3>

            {coachBookings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">هنوز کلاسی با مربیان رزرو نشده است.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coachBookings.map((cb) => (
                  <div
                    key={cb.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">مربی: {cb.coachName}</h4>
                      <span className="text-xs text-[#a3e635] font-black">
                        {cb.price.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                    <p className="text-slate-400">محل: {cb.clubName}</p>
                    <p className="text-cyan-400 font-semibold">{cb.date} | ساعت {cb.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
