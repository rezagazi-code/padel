import React, { useState } from 'react';
import { BracketMatch } from '../types';
import {
  Trophy,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronLeft,
  Crown,
  Edit3,
  X,
  Play,
  ShieldCheck
} from 'lucide-react';

interface TournamentBracketProps {
  bracket?: BracketMatch[];
  canManage: boolean;
  onUpdateMatch?: (matchId: string, winnerId: string, score: number[]) => void;
  tournamentTitle: string;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  bracket,
  canManage,
  onUpdateMatch,
  tournamentTitle
}) => {
  const [editingMatch, setEditingMatch] = useState<BracketMatch | null>(null);
  const [scoreT1S1, setScoreT1S1] = useState(6);
  const [scoreT1S2, setScoreT1S2] = useState(6);
  const [scoreT2S1, setScoreT2S1] = useState(4);
  const [scoreT2S2, setScoreT2S2] = useState(3);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>('');

  if (!bracket || bracket.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white/[0.04] border border-dashed border-white/10 space-y-2">
        <Trophy className="w-8 h-8 text-slate-400 mx-auto" />
        <p className="text-xs text-slate-500 font-bold">جدول مسابقات برای این تورنومنت هنوز قرعه‌کشی و رسمی نشده است.</p>
        <p className="text-[11px] text-slate-500">پس از اتمام مهلت ثبت‌نام تیم‌ها، جدول حذفی خط‌کشی‌شده بارگذاری می‌گردد.</p>
      </div>
    );
  }

  const semiMatches = bracket.filter((m) => m.round === 'semi');
  const finalMatch = bracket.find((m) => m.round === 'final');

  const handleOpenEdit = (m: BracketMatch) => {
    if (!canManage) return;
    setEditingMatch(m);
    setSelectedWinnerId(m.winnerId || m.team1?.id || '');
    if (m.team1?.score) {
      setScoreT1S1(m.team1.score[0] ?? 6);
      setScoreT1S2(m.team1.score[1] ?? 6);
    }
    if (m.team2?.score) {
      setScoreT2S1(m.team2.score[0] ?? 4);
      setScoreT2S2(m.team2.score[1] ?? 3);
    }
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch || !onUpdateMatch || !selectedWinnerId) return;

    onUpdateMatch(editingMatch.id, selectedWinnerId, [
      scoreT1S1,
      scoreT1S2,
      scoreT2S1,
      scoreT2S2
    ]);
    setEditingMatch(null);
  };

  return (
    <div className="space-y-4">
      
      {/* Title & Info Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-100">جدول خط‌کشی‌شده و براکت رسمی مسابقات</h4>
            <p className="text-[10px] text-slate-500">مسیر صعود تا قهرمانی جام {tournamentTitle}</p>
          </div>
        </div>

        {canManage && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#ff6b81] bg-[#ff2d55]/10 border border-[#ff2d55]/60/30 px-2.5 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            شما دسترسی مدیریت نتایج جدول را دارید (کلیک روی هر مسابقه برای ثبت امتیاز)
          </span>
        )}
      </div>

      {/* Modern Grid Bracket Display */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[650px] grid grid-cols-2 gap-8 relative">
          
          {/* Column 1: Semi-Finals (نیمه‌نهایی) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                مرحله نیمه‌نهایی (Semi-Finals)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">۲ مسابقه</span>
            </div>

            <div className="space-y-6 relative">
              {semiMatches.map((match, idx) => {
                const isFinished = match.status === 'completed';
                const team1Win = match.team1?.isWinner;
                const team2Win = match.team2?.isWinner;

                return (
                  <div
                    key={match.id}
                    onClick={() => handleOpenEdit(match)}
                    className={`relative rounded-2xl border transition-all p-3.5 shadow-md ${
                      canManage ? 'cursor-pointer hover:border-[#ff2d55]/60/70 hover:bg-white/[0.05]' : ''
                    } ${
                      isFinished
                        ? 'bg-white/[0.06] border-white/10'
                        : 'bg-white/[0.06] border-white/10'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pb-2 border-b border-white/10 mb-2">
                      <span className="font-bold text-slate-100 flex items-center gap-1">
                        <span>{match.roundName}</span>
                        {canManage && <Edit3 className="w-3 h-3 text-slate-500 hover:text-[#ff6b81]" />}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {match.scheduledTime || 'تعیین نشده'}
                      </span>
                    </div>

                    {/* Team 1 */}
                    <div
                      className={`flex items-center justify-between p-2 rounded-xl mb-1.5 transition ${
                        team1Win
                          ? 'bg-emerald-500/15 border border-emerald-500/40 text-slate-100 font-black'
                          : 'bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {match.team1?.seed && (
                          <span className="w-4 h-4 rounded bg-white/[0.04] text-[10px] text-slate-500 flex items-center justify-center font-mono">
                            {match.team1.seed}
                          </span>
                        )}
                        <span className="text-xs truncate max-w-[160px]">
                          {match.team1?.name || 'تعیین نشده'}
                        </span>
                        {team1Win && <Crown className="w-3.5 h-3.5 text-amber-400 inline" />}
                      </div>

                      {match.team1?.score && (
                        <div className="flex items-center gap-1 font-mono text-xs font-black">
                          <span className="w-5 text-center bg-white/[0.05] px-1 py-0.5 rounded text-[#ff6b81]">
                            {match.team1.score[0]}
                          </span>
                          <span className="w-5 text-center bg-white/[0.05] px-1 py-0.5 rounded text-[#ff6b81]">
                            {match.team1.score[1]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Team 2 */}
                    <div
                      className={`flex items-center justify-between p-2 rounded-xl transition ${
                        team2Win
                          ? 'bg-emerald-500/15 border border-emerald-500/40 text-slate-100 font-black'
                          : 'bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {match.team2?.seed && (
                          <span className="w-4 h-4 rounded bg-white/[0.04] text-[10px] text-slate-500 flex items-center justify-center font-mono">
                            {match.team2.seed}
                          </span>
                        )}
                        <span className="text-xs truncate max-w-[160px]">
                          {match.team2?.name || 'تعیین نشده'}
                        </span>
                        {team2Win && <Crown className="w-3.5 h-3.5 text-amber-400 inline" />}
                      </div>

                      {match.team2?.score && (
                        <div className="flex items-center gap-1 font-mono text-xs font-black">
                          <span className="w-5 text-center bg-white/[0.05] px-1 py-0.5 rounded text-[#ff6b81]">
                            {match.team2.score[0]}
                          </span>
                          <span className="w-5 text-center bg-white/[0.05] px-1 py-0.5 rounded text-[#ff6b81]">
                            {match.team2.score[1]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Court Name */}
                    {match.courtName && (
                      <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-[#ff6b81]" />
                        <span>{match.courtName}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Final Match (فینال بزرگ) */}
          <div className="space-y-6 flex flex-col justify-center">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                فینال بزرگ مسابقات (Final)
              </span>
              <span className="text-[10px] text-amber-300/70 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                تعیین قهرمان
              </span>
            </div>

            {finalMatch ? (
              <div
                onClick={() => handleOpenEdit(finalMatch)}
                className={`relative rounded-3xl border transition-all p-5 shadow-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.03] ${
                  canManage ? 'cursor-pointer hover:border-amber-400' : ''
                } ${
                  finalMatch.status === 'completed'
                    ? 'border-amber-500/70 ring-2 ring-amber-500/20'
                    : 'border-white/10'
                }`}
              >
                {/* Finalist Header */}
                <div className="flex items-center justify-between text-[11px] pb-3 border-b border-white/10 mb-3">
                  <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    {finalMatch.roundName}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {finalMatch.scheduledTime || 'جمعه شب'}
                  </span>
                </div>

                {/* Team 1 Finalist */}
                <div
                  className={`flex items-center justify-between p-3 rounded-2xl mb-2 transition ${
                    finalMatch.team1?.isWinner
                      ? 'bg-amber-500/20 border border-amber-500/50 text-slate-100 font-black'
                      : 'bg-white/[0.05] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold truncate max-w-[170px]">
                      {finalMatch.team1?.name || 'برنده نیمه‌نهایی ۱'}
                    </span>
                    {finalMatch.team1?.isWinner && (
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-white text-[10px] font-black flex items-center gap-1 shadow">
                        <Crown className="w-3 h-3" />
                        قهرمان
                      </span>
                    )}
                  </div>

                  {finalMatch.team1?.score && (
                    <div className="flex items-center gap-1 font-mono text-sm font-black">
                      <span className="w-6 text-center bg-slate-900/40 px-1 py-0.5 rounded text-amber-300">
                        {finalMatch.team1.score[0]}
                      </span>
                      <span className="w-6 text-center bg-slate-900/40 px-1 py-0.5 rounded text-amber-300">
                        {finalMatch.team1.score[1]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Team 2 Finalist */}
                <div
                  className={`flex items-center justify-between p-3 rounded-2xl transition ${
                    finalMatch.team2?.isWinner
                      ? 'bg-amber-500/20 border border-amber-500/50 text-slate-100 font-black'
                      : 'bg-white/[0.05] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold truncate max-w-[170px]">
                      {finalMatch.team2?.name || 'برنده نیمه‌نهایی ۲'}
                    </span>
                    {finalMatch.team2?.isWinner && (
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-white text-[10px] font-black flex items-center gap-1 shadow">
                        <Crown className="w-3 h-3" />
                        قهرمان
                      </span>
                    )}
                  </div>

                  {finalMatch.team2?.score && (
                    <div className="flex items-center gap-1 font-mono text-sm font-black">
                      <span className="w-6 text-center bg-slate-900/40 px-1 py-0.5 rounded text-amber-300">
                        {finalMatch.team2.score[0]}
                      </span>
                      <span className="w-6 text-center bg-slate-900/40 px-1 py-0.5 rounded text-amber-300">
                        {finalMatch.team2.score[1]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Center court indicator */}
                {finalMatch.courtName && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#ff6b81]" />
                      {finalMatch.courtName}
                    </span>
                    {canManage && (
                      <span className="text-[10px] text-amber-400 font-bold hover:underline">
                        ویرایش نتیجه فینال
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-white/[0.05] border border-dashed border-white/10 text-xs text-slate-500">
                در انتظار پایان مسابقات نیمه‌نهایی...
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Edit Match Score Modal for Authorized Admins */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white/[0.05] border border-white/10 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#ff6b81]" />
                <h3 className="text-sm font-black text-slate-100">ثبت نتیجه مسابقه: {editingMatch.roundName}</h3>
              </div>
              <button onClick={() => setEditingMatch(null)} className="text-slate-500 hover:text-slate-100 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-4">
              
              {/* Team 1 Score inputs */}
              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-2">
                <label className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                  <input
                    type="radio"
                    name="winner"
                    value={editingMatch.team1?.id || 't1'}
                    checked={selectedWinnerId === (editingMatch.team1?.id || 't1')}
                    onChange={() => setSelectedWinnerId(editingMatch.team1?.id || 't1')}
                    className="accent-[#ff2d55]"
                  />
                  <span>تیم ۱: {editingMatch.team1?.name || 'تعیین نشده'} (انتخاب به عنوان برنده)</span>
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] text-slate-500">ست اول:</span>
                  <input
                    type="number"
                    min={0}
                    max={7}
                    value={scoreT1S1}
                    onChange={(e) => setScoreT1S1(Number(e.target.value))}
                    className="w-16 bg-white/[0.05] border border-white/10 rounded-lg p-1.5 text-center text-slate-100 font-mono"
                  />
                  <span className="text-[11px] text-slate-500">ست دوم:</span>
                  <input
                    type="number"
                    min={0}
                    max={7}
                    value={scoreT1S2}
                    onChange={(e) => setScoreT1S2(Number(e.target.value))}
                    className="w-16 bg-white/[0.05] border border-white/10 rounded-lg p-1.5 text-center text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Team 2 Score inputs */}
              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-2">
                <label className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                  <input
                    type="radio"
                    name="winner"
                    value={editingMatch.team2?.id || 't2'}
                    checked={selectedWinnerId === (editingMatch.team2?.id || 't2')}
                    onChange={() => setSelectedWinnerId(editingMatch.team2?.id || 't2')}
                    className="accent-[#ff2d55]"
                  />
                  <span>تیم ۲: {editingMatch.team2?.name || 'تعیین نشده'} (انتخاب به عنوان برنده)</span>
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] text-slate-500">ست اول:</span>
                  <input
                    type="number"
                    min={0}
                    max={7}
                    value={scoreT2S1}
                    onChange={(e) => setScoreT2S1(Number(e.target.value))}
                    className="w-16 bg-white/[0.05] border border-white/10 rounded-lg p-1.5 text-center text-slate-100 font-mono"
                  />
                  <span className="text-[11px] text-slate-500">ست دوم:</span>
                  <input
                    type="number"
                    min={0}
                    max={7}
                    value={scoreT2S2}
                    onChange={(e) => setScoreT2S2(Number(e.target.value))}
                    className="w-16 bg-white/[0.05] border border-white/10 rounded-lg p-1.5 text-center text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl btn-fire font-black hover:bg-[#8fd126] transition cursor-pointer"
                >
                  ثبت رسمی نتیجه مسابقه و صعود تیم
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMatch(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] text-slate-400 hover:bg-white/10 transition cursor-pointer"
                >
                  انصراف
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
