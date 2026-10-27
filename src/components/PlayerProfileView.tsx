import React, { useEffect, useRef, useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { useAuth } from '../context/AuthContext';
import { UserManagementModal } from './UserManagementModal';
import { AuthModal } from './AuthModal';
import { ConfirmDialog } from './ConfirmDialog';
import { PlayingHand, PlayingSide, type Booking } from '../types';
import { PROVINCES_LIST } from '../mockData';
import GradeBadge from './GradeBadge';
import { levelToGrade, gradeBandFa, SKILL_GRADES, GRADE_MIDPOINT } from '../utils/skillGrades';
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
import { toJalaliDisplay, isBookingCancellable } from '../utils/dates';
import { fetchMyBookings } from '../lib/db';
import { getSupabase } from '../lib/supabase';
import { Badges } from './Badges';
import { CURRENT_VERSION_NAME } from '../lib/appUpdate';

const PALETTE_COLORS = [
  { name: 'قرمز ولت', hex: '#ff2d55' },
  { name: 'آبی نئونی', hex: '#2f7bff' },
  { name: 'فیروزه‌ای', hex: '#00c2ff' },
  { name: 'مرجانی شعله‌ور', hex: '#f43f5e' },
  { name: 'نقره‌ای', hex: '#cbd5e1' },
  { name: 'زمردی دریایی', hex: '#10b981' },
];

export const PlayerProfileView: React.FC = () => {
  const {
    playerProfile,
    updatePlayerProfile,
    bookings,
    coachBookings,
    openMatches,
    cancelBooking,
    setSyncNotification
  } = usePadel();

  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'none'>('none');
  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const { user, role, changePassword } = useAuth();
  // NOTE: user.role is the Supabase JWT role ('authenticated'), not the app
  // role — the app role comes from AuthContext's profile-backed `role`.
  const isSuperAdmin = role === 'super_admin';
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  // In-flight guard: cancelBooking awaits a remote delete + re-read, so a
  // double-tap would otherwise fire two cancels for the same booking.
  const cancelBookingInflightRef = useRef(false);

  // Today's Tehran date (Gregorian YYYY-MM-DD): past bookings can't be cancelled.
  const tehranToday = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  // Server bookings: context `bookings` only covers this device's
  // localStorage, so after a cache clear / reinstall / new device the
  // history looked empty. When the signed-in user opens the history tab,
  // load their server bookings and merge them in (dedupe by id, local-only
  // bookings stay visible).
  const userId = user?.id;
  const [serverBookings, setServerBookings] = useState<Booking[]>([]);
  useEffect(() => {
    if (activeTab !== 'history' || !userId || !getSupabase()) return;
    let cancelled = false;
    (async () => {
      try {
        const server = await fetchMyBookings(userId);
        if (!cancelled) setServerBookings(server);
      } catch {
        // Keep local-only history when the server read fails.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, userId]);
  const displayBookings: Booking[] = [
    ...bookings,
    ...serverBookings.filter((sb) => !bookings.some((b) => b.id === sb.id)),
  ];

  // Cancel, then re-read the server list so the view reflects server
  // truth: a failed remote delete keeps the booking visible, a successful
  // one drops it. (Local bookings are removed from context by cancelBooking.)
  // Confirmation target for the history "لغو سانس" button — tapping it only
  // opens the dialog; the booking is cancelled after explicit confirmation.
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const handleCancelBooking = async (bookingId: string) => {
    if (cancelBookingInflightRef.current) return;
    cancelBookingInflightRef.current = true;
    try {
      // Pass the merged display booking's date/timeSlot as a hint so the
      // cancellable guard in cancelBooking also applies to server-only
      // bookings that aren't in local state.
      const target = displayBookings.find((b) => b.id === bookingId);
      await cancelBooking(
        bookingId,
        target ? { date: target.date, timeSlot: target.timeSlot } : undefined
      );
      if (userId && getSupabase()) {
        try {
          setServerBookings(await fetchMyBookings(userId));
        } catch {
          // Keep the current list on a refresh failure.
        }
      }
    } finally {
      cancelBookingInflightRef.current = false;
    }
  };

  // Change-password form state
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    if (pwNew.length < 6) {
      setPwError('رمز جدید باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError('تکرار رمز جدید با رمز جدید یکی نیست.');
      return;
    }
    setPwBusy(true);
    try {
      const { error } = await changePassword(pwCurrent, pwNew);
      if (error) {
        setPwError(error);
        return;
      }
      setPwSuccess(true);
      setPwCurrent('');
      setPwNew('');
      setPwConfirm('');
      setTimeout(() => {
        setShowPwForm(false);
        setPwSuccess(false);
      }, 2500);
    } catch {
      setPwError('خطا در ارتباط با سرور؛ دوباره تلاش کنید.');
    } finally {
      setPwBusy(false);
    }
  };

  // Form State
  const [name, setName] = useState(playerProfile.name);
  const [phone, setPhone] = useState(playerProfile.phone);
  const [city, setCity] = useState(playerProfile.city);
  const [province, setProvince] = useState(playerProfile.province);
  const [level, setLevel] = useState<number>(playerProfile.level);
  const [themeColor, setThemeColor] = useState(playerProfile.themeColor ?? '#ff2d55');

  // Lighten a hex color so theme-colored text stays readable on the dark card.
  // Null-safe: a profile restored from older/incomplete storage may carry
  // no themeColor, and this runs before the auth gate below — an undefined
  // hex used to crash the whole tab (white screen, no error boundary).
  const lighten = (hex: string | undefined, amt = 0.45) => {
    const h = (hex ?? '#ff2d55').replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(full, 16);
    const f = (v: number) => Math.min(255, Math.round(v + (255 - v) * amt));
    return `#${((1 << 24) + (f((n >> 16) & 255) << 16) + (f((n >> 8) & 255) << 8) + f(n & 255)).toString(16).slice(1)}`;
  };
  const themeColorLight = lighten(themeColor);
  const [preferredSide, setPreferredSide] = useState<PlayingSide>(playerProfile.preferredSide);
  const [hand, setHand] = useState<PlayingHand>(playerProfile.hand);
  const [racketBrand, setRacketBrand] = useState(playerProfile.racketBrand);
  const [racketModel, setRacketModel] = useState(playerProfile.racketModel);
  const [bio, setBio] = useState(playerProfile.bio || '');

  // Re-sync the edit form from the live playerProfile.
  // The form state initializes once at mount, but the post-sign-in profile
  // sync (PadelContext) can update playerProfile later. Without this, saving
  // an edit would push stale values through updatePlayerProfile and clobber
  // the newer server-synced name/avatar — locally AND on the server.
  // Rule: sync whenever the profile changes or the edit panel opens, but
  // NEVER while the edit panel is open (activeTab === 'profile'), so the
  // user's in-progress edits are never clobbered.
  const prevActiveTab = useRef(activeTab);
  useEffect(() => {
    const justOpened = prevActiveTab.current !== 'profile' && activeTab === 'profile';
    prevActiveTab.current = activeTab;
    if (activeTab === 'profile' && !justOpened) return; // edit in progress: leave it alone
    setName(playerProfile.name);
    setPhone(playerProfile.phone);
    setCity(playerProfile.city);
    setProvince(playerProfile.province);
    setLevel(playerProfile.level);
    setThemeColor(playerProfile.themeColor ?? '#ff2d55');
    setPreferredSide(playerProfile.preferredSide);
    setHand(playerProfile.hand);
    setRacketBrand(playerProfile.racketBrand);
    setRacketModel(playerProfile.racketModel);
    setBio(playerProfile.bio || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerProfile, activeTab]);

  // Auth gate: anonymous visitors must not see or edit any profile
  // (local residue included). Matches the native-app login gate in App.tsx.
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#ff2d55]/15 border border-[#ff2d55]/30 flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-[#ff2d55]" />
        </div>
        <h2 className="text-lg font-black text-slate-100 mb-2">پروفایل من</h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          برای دیدن و ویرایش پروفایلت وارد شو
          <br />
          <span className="text-xs text-slate-500">رزروها، تاریخچه و مشخصاتت روی سرور ذخیره می‌شن</span>
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="px-8 py-3 rounded-xl bg-[#ff2d55] text-white font-bold text-sm shadow-[0_0_24px_rgba(255,45,85,0.4)] active:scale-95 transition"
        >
          ورود / ثبت‌نام
        </button>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // Persian validation: name is required
    if (!name.trim()) {
      alert('لطفاً نام و نام خانوادگی را وارد کنید.');
      return;
    }
    // updatePlayerProfile resolves true on server save, false on failure
    // (a notification is already shown in that case). Cast keeps this
    // compiling while the context migration lands; a non-boolean return
    // (old void signature) is treated as success, not failure.
    const ok = (await updatePlayerProfile({
      name: name.trim(),
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
    })) as unknown as boolean | undefined;

    if (ok !== false) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Close the edit form after successful save
      setTimeout(() => setActiveTab('none'), 1000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {isSuperAdmin && (
        <button
          onClick={() => setShowUserMgmt(true)}
          className="w-full py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-sm font-bold text-slate-300 hover:bg-white/[0.08] transition flex items-center justify-center gap-2"
        >
          <span>👥</span>
          مدیریت کاربران و نقش‌ها
        </button>
      )}
      <UserManagementModal isOpen={showUserMgmt} onClose={() => setShowUserMgmt(false)} />
      
      {/* Player Identity Showcase Hero Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border transition-all duration-300"
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderColor: `${themeColor}80`,
          boxShadow: `0 8px 30px ${themeColor}30`,
        }}
      >
        <div
          className="absolute -top-16 -right-16 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: themeColor }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar with customized player color frame - bigger for half-body photos */}
          <div className="relative">
            <label className="cursor-pointer block">
              <img
                src={playerProfile.avatar}
                alt={playerProfile.name}
                className="w-40 h-52 sm:w-48 sm:h-60 rounded-3xl object-cover ring-4 shadow-2xl hover:opacity-90 transition"
                style={{ borderColor: themeColor }}
              />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  // Reset so the same file can be picked again
                  e.target.value = '';
                  if (!file) return;
                  // Downscale to a max-512px JPEG before storing: a full-res phone
                  // photo as a data URL is several MB and would blow the ~5MB
                  // localStorage quota, so the avatar would silently not persist.
                  // createImageBitmap with imageOrientation:'from-image' also
                  // honors the photo's EXIF rotation.
                  const storeDataUrl = (dataUrl: string) => {
                    if (!dataUrl) return;
                    // Awaited (fire-and-forget): an avatar push failure must
                    // surface with avatar-specific wording, never as a
                    // misleading "profile save failed". The form-save
                    // notification path is untouched.
                    void (async () => {
                      try {
                        const ok = (await updatePlayerProfile({ avatar: dataUrl })) as unknown as boolean | undefined;
                        if (ok === false) {
                          setSyncNotification('ذخیره عکس پروفایل ناموفق بود؛ اتصال اینترنت را بررسی کنید.');
                        }
                      } catch {
                        setSyncNotification('ذخیره عکس پروفایل ناموفق بود؛ اتصال اینترنت را بررسی کنید.');
                      }
                    })();
                  };
                  const fallbackToOriginal = () => {
                    const reader = new FileReader();
                    reader.onload = (ev) => storeDataUrl(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  };
                  if (typeof createImageBitmap === 'function') {
                    createImageBitmap(file, { imageOrientation: 'from-image' })
                      .then((bmp) => {
                        try {
                          const MAX = 512;
                          const scale = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
                          const w = Math.max(1, Math.round(bmp.width * scale));
                          const h = Math.max(1, Math.round(bmp.height * scale));
                          const canvas = document.createElement('canvas');
                          canvas.width = w;
                          canvas.height = h;
                          const ctx = canvas.getContext('2d');
                          if (!ctx) throw new Error('no 2d context');
                          ctx.drawImage(bmp, 0, 0, w, h);
                          storeDataUrl(canvas.toDataURL('image/jpeg', 0.82));
                        } catch {
                          fallbackToOriginal();
                        } finally {
                          bmp.close();
                        }
                      })
                      .catch(fallbackToOriginal);
                  } else {
                    fallbackToOriginal();
                  }
                }}
              />
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                تغییر عکس
              </span>
            </label>
            <span
              className="absolute -bottom-2 -left-2 px-3 py-1 rounded-xl text-xs font-black shadow-md"
              style={{ backgroundColor: themeColor, color: '#000' }}
            >
              سطح {levelToGrade(playerProfile.level)} · {gradeBandFa(levelToGrade(playerProfile.level))}
            </span>
          </div>

          {/* Core Info */}
          <div className="text-center md:text-right space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                {playerProfile.name}
              </h1>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${themeColor}20`,
                  color: themeColorLight,
                  borderColor: `${themeColor}50`,
                }}
              >
                رتبه #{playerProfile.rankingPosition} {playerProfile.province}
              </span>
            </div>

            <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5" style={{ color: themeColorLight }} />
              {playerProfile.city}، {playerProfile.province} | {playerProfile.phone}
            </p>

            <p className="text-xs text-slate-500 max-w-xl italic">
              "{playerProfile.bio}"
            </p>

            {/* Technical Specs - Chic Display */}
            {(playerProfile.hand || playerProfile.preferredSide || playerProfile.racketBrand) && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                {playerProfile.hand && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-bold text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                    {playerProfile.hand === 'right' ? 'راست‌دست' : playerProfile.hand === 'left' ? 'چپ‌دست' : 'هر دو دست'}
                  </span>
                )}
                {playerProfile.preferredSide && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-bold text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                    سمت {playerProfile.preferredSide === 'right' ? 'راست' : playerProfile.preferredSide === 'left' ? 'چپ' : 'هر دو'}
                  </span>
                )}
                {playerProfile.racketBrand && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-bold text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                    راکت: {playerProfile.racketBrand} {playerProfile.racketModel}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats Bento */}
          <div className="grid grid-cols-3 gap-3 bg-white/[0.05] p-4 rounded-2xl border border-white/10 shrink-0 text-center">
            <div>
              <span className="text-[10px] text-slate-500 block">امتیاز رنکینگ</span>
              <span className="text-lg font-black" style={{ color: themeColorLight }}>
                {playerProfile.rankingPoints.toLocaleString('fa-IR')}
              </span>
            </div>
            <div className="border-r border-white/10 pr-3">
              <span className="text-[10px] text-slate-500 block">درصد پیروزی</span>
              <span className="text-lg font-black text-emerald-600">
                {playerProfile.winRate ?? (playerProfile.matchesPlayed > 0 ? Math.round((playerProfile.matchesWon / playerProfile.matchesPlayed) * 100) : 0)}٪
              </span>
            </div>
            <div className="border-r border-white/10 pr-3">
              <span className="text-[10px] text-slate-500 block">بازی‌ها</span>
              <span className="text-lg font-black text-slate-100">
                {playerProfile.matchesPlayed}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
          <button
            onClick={() => setActiveTab(activeTab === 'profile' ? 'none' : 'profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'profile'
                ? 'btn-fire shadow-md'
                : 'bg-white/[0.04] text-slate-400 hover:bg-white/10'
            }`}
          >
            <User className="w-4 h-4" />
            <span>ویرایش مشخصات و رنگ اختصاصی بازیکن</span>
          </button>
          <button
            onClick={() => setActiveTab(activeTab === 'history' ? 'none' : 'history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'history'
                ? 'btn-fire shadow-md'
                : 'bg-white/[0.04] text-slate-400 hover:bg-white/10'
            }`}
          >
            <History className="w-4 h-4" />
            <span>تاریخچه رزروها و جلسات ({displayBookings.length + coachBookings.length})</span>
          </button>
        </div>
      </div>

      {/* Security: change password */}
      <div className="rounded-3xl bg-white/[0.06] border border-white/10 overflow-hidden">
        <button
          onClick={() => setShowPwForm((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
        >
          <span className="flex items-center gap-2 text-sm font-black text-slate-100">
            <Shield className="w-4 h-4 text-[#ff6b81]" />
            تغییر رمز عبور
          </span>
          <span className="text-[11px] text-slate-500 font-bold">
            {showPwForm ? 'بستن ▲' : '▼'}
          </span>
        </button>
        {showPwForm && (
          <form onSubmit={handleChangePassword} className="px-5 pb-5 space-y-3">
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">رمز فعلی</label>
              <input
                type="password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:border-[#ff2d55]/60 outline-none"
                placeholder="رمز عبور فعلی"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">رمز جدید (حداقل ۶ کاراکتر)</label>
              <input
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:border-[#ff2d55]/60 outline-none"
                placeholder="رمز عبور جدید"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">تکرار رمز جدید</label>
              <input
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:border-[#ff2d55]/60 outline-none"
                placeholder="تکرار رمز عبور جدید"
              />
            </div>
            {pwError && (
              <p className="text-[11px] text-rose-400 font-bold">{pwError}</p>
            )}
            {pwSuccess && (
              <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                رمز عبور با موفقیت تغییر کرد.
              </p>
            )}
            <button
              type="submit"
              disabled={pwBusy}
              className="w-full py-3 bg-[#ff2d55] hover:bg-[#e11d48] disabled:opacity-50 text-white font-black text-sm rounded-xl transition cursor-pointer"
            >
              {pwBusy ? 'در حال تغییر...' : 'تغییر رمز عبور'}
            </button>
          </form>
        )}
      </div>

      {/* Tab 1: Profile Editor Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="rounded-3xl bg-white/[0.06] border border-white/10 p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#ff6b81]" />
                شخصی‌سازی مشخصات فنی و رنگ کارت پدل
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تنظیمات این بخش در تابلوی مچ‌میکینگ، بازیکن‌های آزاد و تورنومنت‌ها برای همه نمایش داده می‌شود.
              </p>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                اطلاعات با موفقیت ذخیره شد
              </div>
            )}
          </div>

          {/* Theme Color Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">
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
                      ? 'border-white bg-white/[0.04] shadow-md ring-2 ring-white/50'
                      : 'border-white/10 bg-white/[0.05] text-slate-500 hover:border-slate-500'
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
              <label className="block text-slate-400 font-bold mb-1">نام و نام خانوادگی:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">شماره تماس (جهت هماهنگی):</label>
              <input
                type="text"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none text-right"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">استان سکونت:</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
              >
                {PROVINCES_LIST.filter((p) => p !== 'همه استان‌ها').map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">شهر:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
              />
            </div>
          </div>

          {/* Level Rating & Calibration */}
          <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-100 block">
                  سطح بازی شما (از D- مبتدی تا A+ حرفه‌ای):
                </label>
                <p className="text-[11px] text-slate-500">
                  گرید شما در مچ‌میکینگ و تورنومنت‌ها تعیین‌کننده رده شماست.
                </p>
              </div>
              <GradeBadge grade={levelToGrade(level)} className="text-base px-3 py-1.5" />
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5" dir="ltr">
              {SKILL_GRADES.map((g) => {
                const active = levelToGrade(level) === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setLevel(GRADE_MIDPOINT[g])}
                    className={`py-2 rounded-xl text-sm font-black transition cursor-pointer border ${
                      active
                        ? 'bg-gradient-to-br from-[#ff2d55] to-[#2f7bff] text-white border-white/30 shadow-[0_2px_12px_rgba(255,45,85,0.4)]'
                        : 'bg-white/[0.04] text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
                    }`}
                    title={gradeBandFa(g)}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 font-medium text-center">
              {gradeBandFa(levelToGrade(level))} — برای تغییر گرید، یکی را انتخاب کنید
            </p>
          </div>

          {/* Technical Specs: Side, Hand, Racket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Preferred Side */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">سمت بازی در کورت (Position):</label>
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
                        ? 'bubble-btn rounded-2xl'
                        : 'bg-white/[0.05] border-white/10 text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dominant Hand */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">دست غالب:</label>
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
                        ? 'bubble-btn rounded-2xl'
                        : 'bg-white/[0.05] border-white/10 text-slate-400'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Racket Details */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">برند و مدل راکت:</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="برند (Babolat)"
                  value={racketBrand}
                  onChange={(e) => setRacketBrand(e.target.value)}
                  className="bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                />
                <input
                  type="text"
                  placeholder="مدل (Viper)"
                  value={racketModel}
                  onChange={(e) => setRacketModel(e.target.value)}
                  className="bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Bio / Playing Philosophy */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              متن معرفی در کارت بازیکن (Bio):
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="مثال: علاقه‌مند به مچ‌های سرعتی و بازی تهاجمی لب تور..."
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#ff2d55] hover:bg-[#8fd126] text-white font-black text-sm px-8 py-3 rounded-2xl shadow-[0_4px_20px_rgba(255,45,85,0.3)] transition active:scale-95 cursor-pointer"
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
          <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-6 space-y-4">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#ff6b81]" />
              سانس‌های رزرو شده زمین‌های پدل ({displayBookings.length})
            </h3>

            {displayBookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">هنوز هیچ زمینی رزرو نکرده‌اید.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-100 text-sm">{b.clubName}</h4>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">{b.id}</span>
                    </div>

                    <div className="flex items-center gap-4 text-slate-400">
                      <span>زمین: <strong className="text-[#ff6b81]">{b.courtName}</strong></span>
                      <span>مدت: {b.durationMinutes} دقیقه</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-white/10">
                      <span>{toJalaliDisplay(b.date)} | {b.timeSlot}</span>
                      {isBookingCancellable(b.date, b.timeSlot, tehranToday) && (
                        <button
                          onClick={() => setCancelTargetId(b.id)}
                          className="text-rose-400 hover:text-rose-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          لغو سانس
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coach Bookings */}
          <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-6 space-y-4">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              جلسات مربیگری رزرو شده ({coachBookings.length})
            </h3>

            {coachBookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">هنوز کلاسی با مربیان رزرو نشده است.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coachBookings.map((cb) => (
                  <div
                    key={cb.id}
                    className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-100 text-sm">مربی: {cb.coachName}</h4>
                      <span className="text-xs text-[#ff6b81] font-black">
                        {cb.price.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                    <p className="text-slate-500">محل: {cb.clubName}</p>
                    <p className="text-cyan-400 font-semibold">{cb.date} | ساعت {cb.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* نشان‌های من — monthly challenges + collectible badges.
          Mounted below all profile content, only reachable for signed-in
          users because the anonymous auth gate above returns early. */}
      <Badges />

      {/* App version — subtle, so the owner can verify which build is installed */}
      <p className="text-center text-[10px] text-slate-600 font-medium pt-2">
        نسخه {CURRENT_VERSION_NAME}
      </p>

      <ConfirmDialog
        open={cancelTargetId !== null}
        title="لغو سانس"
        message="این سانس لغو شود؟ این عمل قابل بازگشت نیست."
        confirmLabel="لغو سانس"
        cancelLabel="انصراف"
        onConfirm={() => {
          const id = cancelTargetId;
          setCancelTargetId(null);
          if (id) void handleCancelBooking(id);
        }}
        onCancel={() => setCancelTargetId(null)}
      />

    </div>
  );
};
