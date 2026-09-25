import React from 'react';
import { Download, Smartphone, Share2, PlusSquare, CheckCircle2, X, Sparkles, ExternalLink } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, triggerInstall, isIos } = usePwaInstall();

  if (!isOpen) return null;

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      await triggerInstall();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl glass-strong p-6 shadow-2xl space-y-5 text-xs text-right animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#ff2d55]/20 border border-[#ff2d55]/60 text-[#ff6b81] flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">نصب وب‌اپلیکیشن پدل‌پرو (PWA)</h3>
              <p className="text-[11px] text-slate-500">نصب بدون استور با لود فوق‌العاده سریع و نوتیفیکیشن</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-500 hover:text-slate-100 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick One-Click Install Button if supported by browser */}
        {isInstallable && !isIos && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#a3e635]/15 to-emerald-500/10 border border-[#ff2d55]/60/40 text-center space-y-2">
            <p className="font-bold text-slate-100 text-xs">مرورگر شما آماده نصب مستقیم با یک کلیک است!</p>
            <button
              onClick={handleTriggerInstall}
              className="w-full py-3 btn-fire glow-btn-fire text-white font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>نصب فوری اپلیکیشن روی گوشی / سیستم</span>
            </button>
          </div>
        )}

        {/* Instructions for Android Chrome */}
        <div className="rounded-2xl bg-white/[0.05] p-4 border border-white/10 space-y-2.5">
          <h4 className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
            <Download className="w-4 h-4 text-[#ff6b81]" />
            روش نصب در گوشی‌های اندروید (Chrome / Samsung):
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
            <li>روی منوی <strong className="text-slate-100">سه‌نقطه</strong> در گوشه بالای مرورگر کروم بزنید.</li>
            <li>گزینه <strong className="text-[#ff6b81]">نصب برنامه (Install App)</strong> یا افزودن به صفحه اصلی را بزنید.</li>
            <li>پیام تایید را لمس کنید تا آیکون پدل‌پرو به منوی گوشی شما اضافه شود.</li>
          </ol>
        </div>

        {/* Instructions for iPhone / iOS */}
        <div className="rounded-2xl bg-white/[0.05] p-4 border border-white/10 space-y-2.5">
          <h4 className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
            <Share2 className="w-4 h-4 text-cyan-400" />
            روش نصب در آیفون (iOS Safari):
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
            <li>در مرورگر سافاری روی آیکون <strong className="text-cyan-400">Share (اشتراک‌گذاری در نوار پایین)</strong> کلیک کنید.</li>
            <li>گزینه <strong className="text-[#ff6b81]">Add to Home Screen (افزودن به صفحه اصلی)</strong> را انتخاب کنید.</li>
            <li>در گوشه بالا دکمه <strong className="text-slate-100">Add</strong> را بزنید. برنامه بدون نیاز به اپ‌استور نصب می‌شود.</li>
          </ol>
        </div>

        {/* App benefits */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
          <div className="flex items-center gap-1.5 bg-white/[0.05] p-2 rounded-xl border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6b81]" />
            <span>اجرای تمام‌صفحه بدون نوار آدرس</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/[0.05] p-2 rounded-xl border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6b81]" />
            <span>کش آفلاین و باز شدن پرسرعت</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-white/[0.04] hover:bg-white/10 text-slate-300 font-bold rounded-xl transition cursor-pointer"
        >
          متوجه شدم، بستن
        </button>

      </div>
    </div>
  );
};

