import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import GradeBadge from './GradeBadge';
import { levelToGrade } from '../utils/skillGrades';
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
    <header className="sticky top-0 z-40 w-full glass-strong border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('booking')}
              className="flex items-center gap-2.5 group text-right cursor-pointer"
            >
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff2d55] to-[#2f7bff] border border-white/10 flex items-center justify-center shadow-[0_4px_14px_rgba(255,45,85,0.35)] group-hover:scale-105 transition">
                <span className="text-xl font-extrabold text-[#ff6b81]">P</span>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#ff2d55] rounded-full ring-2 ring-black" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-100">PADEL<span className="text-[#ff6b81]">PRO</span></span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/10">
                    ARENA
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">سامانه بین‌المللی رزرو، تورنومنت و مچ‌میکینگ</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/10 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer nav-link ${
                    isActive
                      ? 'nav-active font-bold'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/[0.05] text-[#ff6b81]' : 'bg-[#ff2d55]/20 text-[#ff6b81]'
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
              className="hidden md:flex items-center gap-1.5 btn-ice text-xs font-bold px-3 py-2 rounded-xl cursor-pointer"
              title="ثبت باشگاه جدید و تعریف کورت‌ها"
            >
              <PlusCircle className="w-4 h-4" />
              <span>پنل باشگاه‌دار</span>
            </button>

            {/* Cloud & Mobile Release for Clubs */}
            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                className="hidden xl:flex items-center gap-1.5 glow-btn-cyan text-white font-black text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
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
                  : 'bg-white/[0.05] text-slate-400 border-white/10 hover:bg-white/10'
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
              className="btn-fire glow-btn-fire flex items-center gap-1.5 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-black transition cursor-pointer"
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
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/[0.05] text-slate-400 border-white/10 hover:bg-white/10'
              }`}
              title="تنظیمات سرور ابری و اتصال Supabase"
            >
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">اتصال ابری</span>
            </button>

            {/* Quick Profile Level Badge */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-white/10 transition cursor-pointer"
            >
              <div className="relative">
                <img
                  src={playerProfile.avatar}
                  alt={playerProfile.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2"
                  style={{ borderColor: playerProfile.themeColor }}
                />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-black" />
              </div>
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-100 max-w-[90px] truncate">{playerProfile.name}</span>
                  <GradeBadge grade={levelToGrade(playerProfile.level)} className="text-[10px] min-w-[1.8rem]" />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">رنک #{playerProfile.rankingPosition}</p>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Always visible on mobile screens) */}
      <div className="mobile-nav-bar lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0f1c]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer relative nav-link ${
                  isActive ? 'text-white mobile-nav-dot' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? 'nav-active' : ''}`}>
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff2d55] rounded-full animate-ping" />
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
