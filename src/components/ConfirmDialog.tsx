import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Styled in-app confirm dialog (replaces native window.confirm). */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'حذف',
  cancelLabel = 'انصراف',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-sm rounded-3xl glass-strong p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#ff2d55]/15 border border-[#ff2d55]/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#ff6b81]" />
          </div>
          <h3 className="text-base font-black text-slate-100">{title}</h3>
        </div>
        <p className="text-xs text-slate-400 leading-6 whitespace-pre-line">{message}</p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-[#ff2d55] hover:bg-[#e11d48] text-white font-black text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-bold text-sm rounded-xl transition cursor-pointer"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
