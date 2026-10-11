import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  /** Accessible label for the dialog */
  label: string;
  onClose: () => void;
  /** Optional title shown in the header row */
  title?: React.ReactNode;
  /** Max height of the scrollable content area */
  maxContentHeight?: string;
  children: React.ReactNode;
  /** Extra classes for the sheet panel */
  panelClassName?: string;
}

/**
 * Reusable bottom sheet: slides up with a spring effect, drag handle,
 * backdrop blur, Escape-to-close, and background scroll lock.
 * Use for all tap-to-detail flows on mobile (clubs, coaches, products…).
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  label,
  onClose,
  title,
  maxContentHeight = '62vh',
  children,
  panelClassName = '',
}) => {
  // Lock background scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/60 backdrop-blur-[2px] menu-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className={`sheet-slide-up w-full max-w-lg rounded-t-3xl glass-strong border border-white/10 border-b-0 shadow-2xl overflow-hidden flex flex-col ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-white/20" />
        </div>

        {title && (
          <div className="flex items-center justify-between gap-3 px-4 pb-3 border-b border-white/10 shrink-0">
            <div className="flex-1 min-w-0">{title}</div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.06] text-slate-400 hover:text-slate-100 transition cursor-pointer shrink-0"
              aria-label="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="overflow-y-auto px-4 pb-5 pt-3" style={{ maxHeight: maxContentHeight }}>
          {children}
        </div>
      </div>
    </div>
  );
};
