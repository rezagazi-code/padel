import React, { useEffect, useState } from 'react';
import {
  loadDongiRecords,
  getBalances,
  suggestSettlements,
  toggleDongiSharePaid,
  deleteDongiRecord,
  subscribeDongi,
  type DongiRecord,
  type BalanceEntry,
  type Settlement,
} from '../lib/dongi';
import { toJalaliDisplay } from '../utils/dates';
import {
  Wallet,
  CheckCircle2,
  Circle,
  Trash2,
  ArrowLeft,
  Scale,
  ReceiptText,
} from 'lucide-react';

const fmt = (n: number) => Math.round(n).toLocaleString('fa-IR');

function balanceTone(balance: number): {
  label: string;
  cls: string;
} {
  if (balance > 0)
    return {
      label: 'طلبکار',
      cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    };
  if (balance < 0)
    return {
      label: 'بدهکار',
      cls: 'bg-[#ff2d55]/15 text-[#ff6b81] border-[#ff2d55]/40',
    };
  return { label: 'تسویه', cls: 'bg-white/[0.06] text-slate-400 border-white/15' };
}

export const DongiPanel: React.FC = () => {
  const [records, setRecords] = useState<DongiRecord[]>(() => loadDongiRecords());
  const [balances, setBalances] = useState<BalanceEntry[]>(() => getBalances());
  const [settlements, setSettlements] = useState<Settlement[]>(() => suggestSettlements());

  const refresh = () => {
    setRecords(loadDongiRecords());
    setBalances(getBalances());
    setSettlements(suggestSettlements());
  };

  useEffect(() => subscribeDongi(refresh), []);

  return (
    <div className="court-card p-6 space-y-6">
      {/* Header */}
      <h2 className="court-title text-base font-black text-slate-100">
        <span className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#ff6b81]" />
          حساب دنگی
        </span>
      </h2>
      <p className="text-xs text-slate-500 leading-relaxed -mt-3">
        مانده‌ی حساب مشترک شما با هم‌بازی‌ها؛ هر رزرو «دنگی» در اینجا ثبت می‌شود و بدهی‌ها ساده‌سازی می‌شوند.
      </p>

      {records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
          <Scale className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-400">هنوز هیچ دنگی ثبت نشده است</p>
          <p className="text-xs text-slate-500 mt-1">
            هنگام رزرو، گزینه‌ی «دنگی» را فعال کنید تا سهم هر هم‌بازی در این حساب ثبت شود.
          </p>
        </div>
      ) : (
        <>
          {/* Net balances */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#6ea8ff]" />
              مانده‌ی هر نفر (خالص)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {balances.map((b) => {
                const tone = balanceTone(b.balance);
                return (
                  <div
                    key={b.name}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-3 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200 truncate">{b.name}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${tone.cls}`}
                      >
                        {tone.label}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-black ${
                        b.balance > 0
                          ? 'text-emerald-300'
                          : b.balance < 0
                          ? 'text-[#ff6b81]'
                          : 'text-slate-400'
                      }`}
                    >
                      {fmt(Math.abs(b.balance))} تومان
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Who pays whom */}
          {settlements.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5 text-[#ff6b81]" />
                تسویه‌ی پیشنهادی (ساده‌شده)
              </h3>
              <div className="space-y-2">
                {settlements.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 rounded-xl bg-[#ff2d55]/[0.06] border border-[#ff2d55]/25 px-3.5 py-2.5 text-xs"
                  >
                    <span className="font-bold text-slate-200">
                      {s.from}
                      <ArrowLeft className="w-3.5 h-3.5 inline mx-1.5 text-[#ff6b81]" />
                      {s.to}
                    </span>
                    <span className="font-black text-[#ff8ba0] shrink-0">
                      {fmt(s.amount)} تومان
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="court-divider" />

          {/* Per-booking ledger */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <ReceiptText className="w-3.5 h-3.5 text-[#6ea8ff]" />
              دفتر دنگی‌ها ({records.length})
            </h3>
            <div className="space-y-3">
              {records.map((r) => (
                <div
                  key={r.bookingId}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-200 truncate">
                        {r.clubName || 'باشگاه'} · {r.courtName || 'زمین'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {r.date ? toJalaliDisplay(r.date) : ''} {r.timeSlot ? `| ${r.timeSlot}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-slate-100">
                        {fmt(r.total)} <span className="font-semibold text-slate-500">تومان</span>
                      </span>
                      <button
                        onClick={() => deleteDongiRecord(r.bookingId)}
                        className="text-slate-500 hover:text-[#ff6b81] transition cursor-pointer"
                        title="حذف این دنگی"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {r.shares.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => toggleDongiSharePaid(r.bookingId, s.name)}
                        className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 border text-xs transition cursor-pointer ${
                          s.paid
                            ? 'bg-emerald-500/[0.08] border-emerald-500/25 text-emerald-200'
                            : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                        }`}
                        title="برای تغییر وضعیت پرداخت ضربه بزنید"
                      >
                        <span className="font-bold truncate">{s.name}</span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          <span className="font-black">{fmt(s.amount)}</span>
                          {s.paid ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    پرداخت‌کننده‌ی کل مبلغ: <span className="font-bold text-slate-400">{r.paidBy}</span>
                    {' · '}برای ثبت پرداخت هر سهم، روی آن ضربه بزنید.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
