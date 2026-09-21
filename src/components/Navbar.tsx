import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import {
  CalendarDays,
  Users,
  Trophy,
  UserCheck,
  GraduationCap,
  User,
  PlusCircle,
  Smartphone,
  Cloud,
  Download,
  Bell,
  Sparkles,
  MapPin
} from 'lucide-react';

interface NavbarProps {
  onOpenClubOwnerModal: () => void;
  onOpenCloudModal: () => void;
  onOpenPwaModal: () => void;
  onOpenExportModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenClubOwnerModal,
  onOpenCloudModal,
  onOpenPwaModal,
  onOpenExportModal
}) => {
  const {
    activeTab,
    setActiveTab,
    isMobileDeviceView,
    setIsMobileDeviceView,
    playerProfile,
    isSupabaseConfigured,
    selectedProvince,
    setSelectedProvince
  } = usePadel();

  const [showNotifications, setShowNotifications] = useState(false);

  const navItems: {
    id: 'booking' | 'matchmaking' | 'free-agents' | 'tournaments' | 'coaches' | 'profile';
    label: string;
    icon: any;
    badge?: string;
  }[] = [
    { id: 'booking', label: 'رزرو زمین', icon: CalendarDays },
    { id: 'matchmaking', label: 'مچ‌میکینگ', icon: Users, badge: 'زنده' },
    { id: 'free-agents', label: 'بازیکنان آزاد', icon: UserCheck, badge: 'جدید' },
    { id: 'tournaments', label: 'تورنومنت و رنکینگ', icon: Trophy },
    { id: 'coaches', label: 'رزرو مربی', icon: GraduationCap },
    { id: 'profile', label: 'پروفایل من', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('booking')}
              className="flex items-center gap-2.5 group text-right cursor-pointer"
            >
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-[#a3e635]/40 flex items-center justify-center shadow-[0_0_15px_rgba(163,230,53,0.2)] group-hover:border-[#a3e635] transition">
                <span className="text-xl font-extrabold text-[#a3e635]">P</span>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#a3e635] rounded-full ring-2 ring-[#090d16]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">PADEL<span className="text-[#a3e635]">PRO</span></span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    ARENA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">سامانه بین‌المللی رزرو، تورنومنت و مچ‌میکینگ</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-slate-800/80 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#a3e635] text-slate-950 font-bold shadow-[0_2px_12px_rgba(163,230,53,0.3)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-slate-950 text-[#a3e635]' : 'bg-[#a3e635]/20 text-[#a3e635]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action buttons & User Widget */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Club Owner Quick Action */}
            <button
              onClick={onOpenClubOwnerModal}
              className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition active:scale-95 cursor-pointer border border-emerald-400/30"
              title="ثبت باشگاه جدید و تعریف کورت‌ها"
            >
              <PlusCircle className="w-4 h-4" />
              <span>پنل باشگاه‌دار</span>
            </button>

            {/* Cloud & Mobile Release for Clubs */}
            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                className="hidden xl:flex items-center gap-1.5 glow-btn-cyan text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
                title="دانلود و خروجی سرور ابری رایگان و نسخه اندروید / iOS جهت ارائه به باشگاه‌ها"
              >
                <Cloud className="w-4 h-4" />
                <span>کلود و نسخه‌های موبایل</span>
              </button>
            )}

            {/* Mobile Device Simulator Switch */}
            <button
              onClick={() => setIsMobileDeviceView(!isMobileDeviceView)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                isMobileDeviceView
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="تغییر به نمای گوشی جهت تست نصب موبایل"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">
                {isMobileDeviceView ? 'نمای عادی وب' : 'پیش‌نمایش موبایل'}
              </span>
            </button>

            {/* PWA Install */}
            <button
              onClick={onOpenPwaModal}
              className="glow-btn-lime flex items-center gap-1.5 text-slate-950 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-black transition cursor-pointer"
              title="نصب اپلیکیشن روی گوشی (PWA)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">نصب اپ</span>
            </button>

            {/* Supabase & Cloud status */}
            <button
              onClick={onOpenCloudModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="تنظیمات سرور ابری و اتصال Supabase"
            >
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">اتصال ابری</span>
            </button>

            {/* Quick Profile Level Badge */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
            >
              <div className="relative">
                <img
                  src={playerProfile.avatar}
                  alt={playerProfile.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2"
                  style={{ borderColor: playerProfile.themeColor }}
                />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#090d16]" />
              </div>
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white max-w-[90px] truncate">{playerProfile.name}</span>
                  <span
                    className="text-[10px] font-black px-1 rounded"
                    style={{ backgroundColor: playerProfile.themeColor, color: '#000' }}
                  >
                    {playerProfile.level.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">رنک #{playerProfile.rankingPosition}</p>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Always visible on mobile screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090d16]/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer relative ${
                  isActive ? 'text-[#a3e635]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`relative p-1 rounded-xl ${isActive ? 'bg-[#a3e635]/15' : ''}`}>
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#a3e635] rounded-full animate-ping" />
                  )}
                </div>
                <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
