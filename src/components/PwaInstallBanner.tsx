import React, { useState, useEffect } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { Download, Smartphone, CheckCircle, X, Sparkles, Share, PlusSquare } from 'lucide-react';

interface PwaInstallBannerProps {
  onOpenManualModal: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ onOpenManualModal }) => {
  const { isInstallable, isInstalled, isInStandaloneMode, isIos, triggerInstall } = usePwaInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('padelpro_pwa_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (isInStandaloneMode || isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('padelpro_pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isIos) {
      onOpenManualModal();
      return;
    }

    if (isInstallable) {
      const outcome = await triggerInstall();
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => {
          setIsDismissed(true);
        }, 3000);
      }
    } else {
      // Show instructions modal if automatic prompt is not ready or unsupported
      onOpenManualModal();
    }
  };

  return (
    <div className="w-full bg-gradient-to-l from-[#ff2d55]/15 via-[#0d1526]/90 to-[#2f7bff]/15 border-b border-white/10 px-3 py-2.5 sm:px-4 sm:py-3 transition shadow-lg relative z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Banner Info */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-[#ff2d55]/15 border border-[#ff2d55]/60/40 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-[#ff6b81]" />
          </div>
          <div className="text-right flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-slate-100">نصب نسخه موبایل اپلیکیشن پدل‌پرو</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full btn-fire">
                PWA بومی
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              اجرای سریع تمام‌صفحه بدون نیاز به گوگل‌پلی یا اپ‌استور با امکان استفاده آفلاین
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {installSuccess ? (
            <div className="flex items-center gap-1 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800">
              <CheckCircle className="w-4 h-4" />
              <span>اپلیکیشن با موفقیت نصب شد!</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleInstallClick}
                className="btn-fire glow-btn-fire flex items-center justify-center gap-1.5 text-white font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer flex-1 sm:flex-initial"
              >
                {isIos ? (
                  <>
                    <Share className="w-3.5 h-3.5" />
                    <span>راهنمای نصب روی آیفون</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>نصب مستقیم روی گوشی</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDismiss}
                className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-white/[0.05] transition"
                title="بستن اعلان"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
