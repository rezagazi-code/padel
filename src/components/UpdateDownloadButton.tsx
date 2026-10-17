import React, { useState, useRef } from 'react';
import { Download, Loader2, AlertCircle, Globe } from 'lucide-react';
import { downloadAndInstallApk, DownloadProgress } from '../lib/appUpdate';
import { openExternal } from '../lib/externalLink';

/**
 * Update button that downloads the APK natively inside the app (no browser)
 * and launches the Android installer. Shows download progress.
 */
export const UpdateDownloadButton: React.FC<{
  apkUrl: string;
  className?: string;
}> = ({ apkUrl, className }) => {
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const busyRef = useRef(false);

  const handleClick = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    void downloadAndInstallApk(apkUrl, (p) => {
      setProgress(p);
      // Allow retry after error, and re-download after 'done': the native
      // installer Activity may be cancelled (Back), leaving the user here
      // with the same cache file — re-download is idempotent.
      if (p.status === 'done' || p.status === 'error') {
        busyRef.current = false;
      }
    });
  };

  const pct = progress ? Math.round(progress.progress * 100) : 0;
  const isBusy = progress?.status === 'downloading' || progress?.status === 'installing';

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={isBusy}
        className={
          className ??
          'bubble-btn rounded-full w-full py-4 text-base font-black text-white flex items-center justify-center gap-2 disabled:opacity-70'
        }
      >
        {isBusy ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        {progress?.status === 'downloading'
          ? `در حال دانلود... ${pct}٪`
          : progress?.status === 'installing'
            ? 'در حال باز کردن نصب...'
            : 'دانلود و نصب نسخه جدید'}
      </button>
      {isBusy && (
        <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-l from-[#ff2d55] to-[#ff6b81] transition-all duration-300"
            style={{ width: `${Math.max(pct, 5)}%` }}
          />
        </div>
      )}
      {progress?.status === 'error' && (
        <div className="mt-2 flex flex-col items-center gap-2">
          <p className="text-[11px] text-red-400 flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            دانلود ناموفق بود — دوباره تلاش کن
          </p>
          <button
            type="button"
            onClick={() => void openExternal(apkUrl)}
            className="text-xs font-bold text-[#ff6b81] hover:text-[#ff8ba0] underline underline-offset-4 transition flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" />
            دانلود با مرورگر
          </button>
        </div>
      )}
    </div>
  );
};
