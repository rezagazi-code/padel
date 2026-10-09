import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { FriendlyTournament } from '../types';
import { Trophy, Users, Clock, MapPin, Plus, X, Shuffle, Coins } from 'lucide-react';

// Suggest match duration and validate feasibility
function calculateSuggestion(teamsCount: number, courtsCount: number, hours: number) {
  const matchMin = 90; // standard padel match
  const matchesNeeded = Math.max(0, teamsCount - 1); // single elimination
  const matchesPossible = Math.floor((courtsCount * hours * 60) / matchMin);
  const hoursNeeded = matchesNeeded > 0 ? Math.ceil((matchesNeeded * matchMin) / (courtsCount * 60) * 2) / 2 : 0;
  return { matchMin, matchesNeeded, matchesPossible, hoursNeeded, feasible: matchesPossible >= matchesNeeded };
}

export const FriendlyTournamentView: React.FC = () => {
  const {
    friendlyTournaments,
    createFriendlyTournament,
    addFriendlyTeam,
    drawFriendlyBracket,
    recordFriendlyScore,
    clubs,
    playerProfile,
  } = usePadel();

  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<FriendlyTournament | null>(null);

  // Create form
  const [fTitle, setFTitle] = useState('');
  const [fClubId, setFClubId] = useState('');
  const [fDate, setFDate] = useState('');
  const [fFee, setFFee] = useState('');
  const [fCourts, setFCourts] = useState('2');
  const [fHours, setFHours] = useState('4');
  const [fSplit, setFSplit] = useState<'70-30' | '60-40'>('70-30');

  // Add team form
  const [tName, setTName] = useState('');
  const [tP1, setTP1] = useState('');
  const [tP2, setTP2] = useState('');
  const [tRank, setTRank] = useState('');

  // Score form
  const [scoreInputs, setScoreInputs] = useState<Record<string, { s1: string; s2: string }>>({});

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim()) return;
    const club = clubs.find((c) => c.id === fClubId) || clubs[0];
    const t = createFriendlyTournament({
      title: fTitle.trim(),
      clubId: club?.id || '',
      clubName: club?.name || '',
      date: fDate || 'تعیین نشده',
      entryFeePerTeam: parseInt(fFee) || 0,
      courtsCount: parseInt(fCourts) || 1,
      hoursReserved: parseFloat(fHours) || 2,
      matchDurationMin: 90,
      prizeSplit: fSplit,
      createdBy: playerProfile.name || 'ناشناس',
    });
    setShowCreate(false);
    setSelected(t);
    setFTitle(''); setFDate(''); setFFee('');
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !tName.trim()) return;
    addFriendlyTeam(selected.id, {
      teamName: tName.trim(),
      player1Name: tP1.trim() || 'بازیکن ۱',
      player2Name: tP2.trim() || 'بازیکن ۲',
      rank: parseInt(tRank) || 999,
    });
    // Refresh selected
    const updated = friendlyTournaments.find((t) => t.id === selected.id);
    if (updated) setSelected({ ...updated, teams: [...updated.teams, { id: 'tmp', teamName: tName.trim(), player1Name: tP1.trim(), player2Name: tP2.trim(), rank: parseInt(tRank) || 999 }] });
    setTName(''); setTP1(''); setTP2(''); setTRank('');
  };

  const handleScore = (matchId: string) => {
    if (!selected) return;
    const inp = scoreInputs[matchId];
    if (!inp) return;
    const s1 = parseInt(inp.s1);
    const s2 = parseInt(inp.s2);
    if (isNaN(s1) || isNaN(s2)) return;
    recordFriendlyScore(selected.id, matchId, s1, s2);
    setScoreInputs((prev) => {
      const n = { ...prev };
      delete n[matchId];
      return n;
    });
  };

  const getTeamName = (tourn: FriendlyTournament, teamId: string | null) => {
    if (!teamId) return '---';
    return tourn.teams.find((t) => t.id === teamId)?.teamName || '---';
  };

  const prizePool = selected ? selected.teams.length * selected.entryFeePerTeam : 0;
  const splitParts = selected?.prizeSplit === '70-30' ? [0.7, 0.3] : [0.6, 0.4];
  const prizeFirst = Math.round(prizePool * splitParts[0]);
  const prizeSecond = Math.round(prizePool * splitParts[1]);

  const suggestion = calculateSuggestion(
    selected?.teams.length || 0,
    selected?.courtsCount || parseInt(fCourts) || 2,
    selected?.hoursReserved || parseFloat(fHours) || 4
  );

  if (selected) {
    const tourn = friendlyTournaments.find((t) => t.id === selected.id) || selected;
    return (
      <div className="space-y-6 pb-12">
        <button onClick={() => setSelected(null)} className="text-sm text-slate-400 hover:text-slate-200">
          → بازگشت به لیست
        </button>

        <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-6">
          <h2 className="text-xl font-black text-slate-100 mb-2">{tourn.title}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{tourn.clubName}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{tourn.date}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{tourn.teams.length} تیم</span>
          </div>

          {/* Calculator */}
          <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm">
            <p className="font-bold text-slate-300 mb-2">🧮 محاسبه‌گر</p>
            <p className="text-slate-400">
              {tourn.teams.length} تیم → {suggestion.matchesNeeded} بازی لازم است.
              با {tourn.courtsCount} زمین و {tourn.hoursReserved} ساعت، {suggestion.matchesPossible} بازی می‌توانید برگزار کنید.
            </p>
            {!suggestion.feasible && suggestion.matchesNeeded > 0 && (
              <p className="text-amber-400 mt-1">
                ⚠️ زمان کافی نیست! حدود {suggestion.hoursNeeded} ساعت لازم دارید.
              </p>
            )}
            <p className="text-slate-500 mt-1">مدت پیشنهادی هر بازی: {suggestion.matchMin} دقیقه</p>
          </div>

          {/* Prize */}
          {prizePool > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-sm">
              <p className="font-bold text-amber-300 mb-1 flex items-center gap-1"><Coins className="w-4 h-4" />جایزه</p>
              <p className="text-slate-300">مجموع ورودی: {prizePool.toLocaleString('fa-IR')} تومان</p>
              <p className="text-slate-400">🥇 اول: {prizeFirst.toLocaleString('fa-IR')} | 🥈 دوم: {prizeSecond.toLocaleString('fa-IR')} ({tourn.prizeSplit})</p>
              {tourn.winnerTeamId && (
                <p className="text-emerald-400 mt-1">🏆 قهرمان: {getTeamName(tourn, tourn.winnerTeamId)}</p>
              )}
            </div>
          )}
        </div>

        {/* Teams */}
        {tourn.status === 'open' && (
          <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-6">
            <h3 className="font-black text-slate-200 mb-4">تیم‌ها ({tourn.teams.length})</h3>
            <div className="space-y-2 mb-4">
              {tourn.teams.map((tm) => (
                <div key={tm.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm">
                  <span className="font-bold text-slate-200">{tm.teamName}</span>
                  <span className="text-slate-500 text-xs">{tm.player1Name} و {tm.player2Name} (رنک {tm.rank})</span>
                </div>
              ))}
              {tourn.teams.length === 0 && <p className="text-slate-500 text-sm">هنوز تیمی اضافه نشده.</p>}
            </div>
            <form onSubmit={handleAddTeam} className="grid grid-cols-2 gap-2">
              <input value={tName} onChange={(e) => setTName(e.target.value)} placeholder="نام تیم *" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              <input value={tRank} onChange={(e) => setTRank(e.target.value)} placeholder="رنک (برای قرعه‌کشی)" inputMode="numeric" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              <input value={tP1} onChange={(e) => setTP1(e.target.value)} placeholder="بازیکن ۱" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              <input value={tP2} onChange={(e) => setTP2(e.target.value)} placeholder="بازیکن ۲" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              <button type="submit" className="col-span-2 py-2 rounded-xl bg-[#2f7bff] text-white text-sm font-bold">+ افزودن تیم</button>
            </form>
            {tourn.teams.length >= 2 && (
              <button
                onClick={() => { drawFriendlyBracket(tourn.id); }}
                className="w-full mt-4 py-3 rounded-xl bg-[#ff2d55] text-white font-black flex items-center justify-center gap-2"
              >
                <Shuffle className="w-5 h-5" />قرعه‌کشی بر اساس رنک
              </button>
            )}
          </div>
        )}

        {/* Bracket */}
        {tourn.bracket.length > 0 && (
          <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-6">
            <h3 className="font-black text-slate-200 mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" />جدول مسابقات</h3>
            <div className="space-y-3">
              {tourn.bracket.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <p className="text-xs text-slate-500 mb-2">{m.roundFa}</p>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className={`font-bold ${m.winnerId === m.team1Id ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {getTeamName(tourn, m.team1Id)}
                    </span>
                    <span className="text-slate-500 text-xs">در برابر</span>
                    <span className={`font-bold ${m.winnerId === m.team2Id ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {getTeamName(tourn, m.team2Id)}
                    </span>
                  </div>
                  {m.winnerId ? (
                    <p className="text-xs text-slate-500 mt-2">نتیجه: {m.score1} - {m.score2}</p>
                  ) : m.team1Id && m.team2Id ? (
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        value={scoreInputs[m.id]?.s1 || ''}
                        onChange={(e) => setScoreInputs((p) => ({ ...p, [m.id]: { ...p[m.id], s1: e.target.value } }))}
                        placeholder="0" inputMode="numeric"
                        className="w-16 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-center text-sm text-slate-200"
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        value={scoreInputs[m.id]?.s2 || ''}
                        onChange={(e) => setScoreInputs((p) => ({ ...p, [m.id]: { ...p[m.id], s2: e.target.value } }))}
                        placeholder="0" inputMode="numeric"
                        className="w-16 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-center text-sm text-slate-200"
                      />
                      <button onClick={() => handleScore(m.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">ثبت</button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 mt-2">استراحت (Bye)</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-100">مسابقات دوستانه</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl bg-[#ff2d55] text-white text-sm font-bold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />جدید
        </button>
      </div>
      <p className="text-sm text-slate-500">بدون امتیاز رنکینگ — جایزه نقدی به تیم اول و دوم</p>

      {friendlyTournaments.length === 0 ? (
        <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-12 text-center">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">هنوز مسابقه دوستانه‌ای ساخته نشده.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {friendlyTournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className="text-right p-5 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition"
            >
              <p className="font-black text-slate-100">{t.title}</p>
              <p className="text-xs text-slate-500 mt-1">{t.clubName} • {t.teams.length} تیم • {t.status === 'open' ? 'ثبت‌نام باز' : t.status === 'completed' ? 'پایان یافته' : 'در حال برگزاری'}</p>
            </button>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-strong rounded-3xl border border-white/10 p-6 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-100">مسابقه دوستانه جدید</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="عنوان *" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              <select value={fClubId} onChange={(e) => setFClubId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200">
                {clubs.map((c) => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
              </select>
              <input value={fDate} onChange={(e) => setFDate(e.target.value)} placeholder="تاریخ (مثلاً جمعه ۱۴۰۳/۰۷/۲۰)" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              <div className="grid grid-cols-2 gap-2">
                <input value={fCourts} onChange={(e) => setFCourts(e.target.value)} placeholder="تعداد زمین" inputMode="numeric" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
                <input value={fHours} onChange={(e) => setFHours(e.target.value)} placeholder="ساعت رزرو" inputMode="decimal" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              </div>
              <input value={fFee} onChange={(e) => setFFee(e.target.value)} placeholder="ورودی هر تیم (تومان)" inputMode="numeric" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              <div>
                <p className="text-xs text-slate-400 mb-2">تقسیم جایزه (اول - دوم):</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setFSplit('70-30')} className={`py-2 rounded-xl text-sm font-bold border ${fSplit === '70-30' ? 'bg-[#ff2d55] border-[#ff2d55] text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>۷۰ - ۳۰</button>
                  <button type="button" onClick={() => setFSplit('60-40')} className={`py-2 rounded-xl text-sm font-bold border ${fSplit === '60-40' ? 'bg-[#ff2d55] border-[#ff2d55] text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>۶۰ - ۴۰</button>
                </div>
              </div>
              <p className="text-xs text-slate-500">💡 هر بازی حدود ۹۰ دقیقه طول می‌کشد. با {fCourts} زمین و {fHours} ساعت می‌توانید حدود {Math.floor((parseInt(fCourts) || 2) * (parseFloat(fHours) || 4) * 60 / 90)} بازی برگزار کنید.</p>
              <button type="submit" className="w-full py-3 rounded-xl bg-[#ff2d55] text-white font-black">ساخت مسابقه</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
