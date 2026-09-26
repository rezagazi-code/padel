/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PadelProvider, usePadel } from './context/PadelContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { CourtBookingView } from './components/CourtBookingView';
import { MatchmakingView } from './components/MatchmakingView';
import { FreeAgentsView } from './components/FreeAgentsView';
import { TournamentsView } from './components/TournamentsView';
import { CoachBookingView } from './components/CoachBookingView';
import { PlayerProfileView } from './components/PlayerProfileView';
import { ClubOwnerModal } from './components/ClubOwnerModal';
import { SupabaseModal } from './components/SupabaseModal';
import { PwaInstallModal } from './components/PwaInstallModal';
import { CloudExportModal } from './components/CloudExportModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { Smartphone, Zap, Sparkles, Trophy, Calendar, Users, Check } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, isMobileDeviceView, setIsMobileDeviceView, syncNotification, setSyncNotification } = usePadel();

  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [pwaModalOpen, setPwaModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Global toast for sync/notification messages (booking results, errors, …)
  const [toastVisible, setToastVisible] = useState(false);
  useEffect(() => {
    if (!syncNotification) {
      setToastVisible(false);
      return;
    }
    setToastVisible(true);
    const t = setTimeout(() => {
      setToastVisible(false);
      setSyncNotification(null);
    }, 4200);
    return () => clearTimeout(t);
  }, [syncNotification, setSyncNotification]);

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'booking':
        return <CourtBookingView onOpenClubOwnerModal={() => setClubModalOpen(true)} />;
      case 'matchmaking':
        return <MatchmakingView />;
      case 'free-agents':
        return <FreeAgentsView />;
      case 'tournaments':
        return <TournamentsView />;
      case 'coaches':
        return <CoachBookingView />;
      case 'profile':
        return <PlayerProfileView />;
      default:
        return <CourtBookingView onOpenClubOwnerModal={() => setClubModalOpen(true)} />;
    }
  };

  const appBody = (
    <div className="min-h-screen bg-[#060a13] text-slate-200 flex flex-col selection:bg-[#ff2d55] selection:text-black">
      {/* Top Mobile Friendly Install Banner */}
      <PwaInstallBanner onOpenManualModal={() => setPwaModalOpen(true)} />

      <Navbar
        onOpenClubOwnerModal={() => setClubModalOpen(true)}
        onOpenCloudModal={() => setCloudModalOpen(true)}
        onOpenPwaModal={() => setPwaModalOpen(true)}
        onOpenExportModal={() => setExportModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20 lg:pb-6">
        {renderCurrentView()}
      </main>

      {/* Modals */}
      <ClubOwnerModal isOpen={clubModalOpen} onClose={() => setClubModalOpen(false)} />
      <SupabaseModal isOpen={cloudModalOpen} onClose={() => setCloudModalOpen(false)} />
      <PwaInstallModal isOpen={pwaModalOpen} onClose={() => setPwaModalOpen(false)} />
      <CloudExportModal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Global sync toast */}
      {toastVisible && syncNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-[92vw]">
          <div className="flex items-center gap-2.5 rounded-2xl bg-[#0b1220]/95 border border-[#ff2d55]/40 px-4 py-3 shadow-[0_8px_30px_rgba(255,45,85,0.25)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
            <span className="w-2 h-2 rounded-full bg-[#ff2d55] animate-pulse shrink-0" />
            <span className="text-xs font-bold text-slate-100 leading-relaxed">{syncNotification}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="glass border-t border-white/10 mt-8 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff2d55] animate-pulse" />
            <span className="font-bold text-slate-100">پدل‌پرو آرنا (PadelPro Arena)</span>
            <span className="text-slate-500">| الهام گرفته از استانداردهای برتر جهانی Playtomic</span>
          </div>

          <p className="text-[11px] text-slate-500">
            رزرو کورت، مچ‌میکینگ، تابلوی بازیکنان آزاد، مسابقات و رنکینگ استانی
          </p>
        </div>
      </footer>
    </div>
  );

  // If mobile simulator device mode is toggled on desktop
  if (isMobileDeviceView) {
    return (
      <div className="min-h-screen bg-[#060a13] flex flex-col items-center justify-center p-4">
        {/* Device Switcher Bar */}
        <div className="mb-4 flex items-center justify-between w-full max-w-sm glass p-3 rounded-2xl text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <Smartphone className="w-4 h-4 text-[#65a30d]" />
            <span>پیش‌نمایش اپلیکیشن موبایل (PWA)</span>
          </div>
          <button
            onClick={() => setIsMobileDeviceView(false)}
            className="text-xs bg-white/[0.05] hover:bg-white/10 text-slate-300 px-3 py-1 rounded-xl cursor-pointer border border-white/10"
          >
            خروج از نمای موبایل
          </button>
        </div>

        {/* Mobile Mockup Device Frame */}
        <div className="relative w-full max-w-[400px] h-[840px] bg-white rounded-[48px] p-3 ring-1 ring-white/70 shadow-[0_25px_60px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden">
          {/* Dynamic Island */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-50 flex items-center justify-between px-3">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff2d55]/80" />
          </div>

          {/* Screen Content */}
          <div className="w-full h-full rounded-[38px] overflow-y-auto overflow-x-hidden bg-[#060a13] text-slate-200 flex flex-col scrollbar-none pt-4">
            {appBody}
          </div>
        </div>
      </div>
    );
  }

  return appBody;
};

export default function App() {
  return (
    <AuthProvider>
      <PadelProvider>
        <MainContent />
      </PadelProvider>
    </AuthProvider>
  );
}
