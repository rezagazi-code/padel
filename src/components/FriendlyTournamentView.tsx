import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { FriendlyTournament } from '../types';
import { Trophy, Users, Clock, MapPin, Plus, X, Shuffle, Coins, Calculator, TriangleAlert, Lightbulb } from 'lucide-react';
import { TVBracket, BracketMatch } from './TVBracket';
import { FriendlyTournamentPredictions } from './Predictions';
import { generateBracket, bracketToDisplay } from '../lib/bracket';
import { SKILL_GRADES, type SkillGrade } from '../utils/skillGrades';

// Persian/Arabic-Indic digits → Latin, so inputs typed on a fa-IR keyboard
// («۱۲») parse instead of silently falling back to defaults. Same pattern
// as InlineBooking's faDigitsToEn; kept here as the shared local helper.
const faDigitsToEn = (s: string) =>
  s.replace(/[۰-۹٠-٩]/g, (d) => {
    const p = '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);
    return String(p >= 0 ? p : '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  });

// Suggest match duration and validate feasibility
function calculateSuggestion(teamsCount: number, courtsCount: number, hours: number) {
  const matchMin = 90; // standard padel match
  const matchesNeeded = Math.max(0, teamsCount - 1); // single elimination
  const matchesPossible = Math.floor((courtsCount * hours * 60) / matchMin);
  const hoursNeeded = matchesNeeded > 0 ? Math.ceil((matchesNeeded * matchMin) / (courtsCount * 60) * 2) / 2 : 0;
  return { matchMin, matchesNeeded, matchesPossible, hoursNeeded, feasible: matchesPossible >= matchesNeeded };
}

export const FriendlyTournamentView: React.FC = () => {
  // retry build
  const {
    friendlyTournaments,
    createFriendlyTournament,
    addFriendlyTeam,
    drawFriendlyBracket,
    recordFriendlyScore,
    resetFriendlyBracket,
    setSyncNotification,
    clubs,
    playerProfile,
  } = usePadel();

  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<FriendlyTournament | null>(null);
  // Same signed-out gate as open matches (edab738): a guest's blank
  // profile would otherwise create a tournament owned by «ناشناس».
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Create form
  const [fTitle, setFTitle] = useState('');
  const [fTitleError, setFTitleError] = useState('');
  const [fClubError, setFClubError] = useState('');
  const [fNameError, setFNameError] = useState('');
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
  const [tRank, setTRank] = useState<SkillGrade>('C');
  const [tNameError, setTNameError] = useState('');

  // Score form
  const [scoreInputs, setScoreInputs] = useState<Record<string, { s1: string; s2: string }>>({});

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Same signed-out gate as handleAddTeam/handleScore: the opener button
    // gates guests, but a submit reaching here must never create a
    // tournament owned by «ناشناس».
    if (!user) { setAuthModalOpen(true); return; }
    // Signed-in but profile-less: the auth sync effect returns early when
    // auth.profile is null, so playerProfile.name stays '' (mockData
    // initial) and without this check the tournament below would be filed
    // under «ناشناس» despite the gate above. Block with an inline error
    // asking the user to set their name in their profile first.
    if (!playerProfile.name.trim()) {
      setFNameError('برای ساخت مسابقه، اول نام خود را در پروفایل ثبت کنید.');
      return;
    }
    setFNameError('');
    // Blank title used to return silently (the input placeholder marks it
    // required) — show an inline error like handleAddTeam does for teams.
    if (!fTitle.trim()) {
      setFTitleError('عنوان مسابقه را وارد کنید.');
      return;
    }
    setFTitleError('');
    // No silent reassignment: the select visibly defaults to the first club
    // (see value below), so the stored club is always the one shown. Never
    // fall back to clubs[0] behind a blank select — and with an empty club
    // list there is no club at all, so fail loudly instead of filing a
    // club-less tournament with a blank name.
    const effectiveClubId = fClubId || clubs[0]?.id || '';
    const club = clubs.find((c) => c.id === effectiveClubId);
    if (!club) {
      setFClubError('باشگاهی برای برگزاری مسابقه در دسترس نیست.');
      return;
    }
    setFClubError('');
    const t = createFriendlyTournament({
      title: fTitle.trim(),
      clubId: club.id,
      clubName: club.name,
      date: fDate || 'تعیین نشده',
      // Fee is free text like the coach rate: separators must be stripped
      // before parseInt, or '500,000' stores as 500 (near-free entry) and
      // the prize pool (teams × fee) is wrong by 1000×.
      // Sign clamp: `||` only rescues empty/NaN/0 — a negative parses
      // truthy and survives, making the prize pool (teams × fee) negative
      // and the court/hour hint render «با ‎-۲ زمین».
      entryFeePerTeam: Math.max(0, parseInt(faDigitsToEn(fFee).replace(/[,٬،\s]/g, '')) || 0),
      courtsCount: Math.max(1, parseInt(faDigitsToEn(fCourts)) || 1),
      hoursReserved: Math.max(1, parseFloat(faDigitsToEn(fHours)) || 2),
      matchDurationMin: 90,
      prizeSplit: fSplit,
      createdBy: playerProfile.name || 'ناشناس',
    });
    setShowCreate(false);
    setSelected(t);
    // Reset the whole form, not just title/date/fee: courts/hours/split/
    // club otherwise persist and a second tournament silently reuses the
    // previous tournament's values (same stale-form class as the
    // ClubOwnerModal reset fix).
    setFTitle(''); setFDate(''); setFFee('');
    setFCourts('2'); setFHours('4'); setFSplit('70-30'); setFClubId('');
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    // Same signed-out gate as create: the detail view is reachable by
    // guests, and an ungated add-team let a guest mutate a tournament
    // left on the device by a previous user.
    if (!user) { setAuthModalOpen(true); return; }
    // Blank team name used to return silently (the input placeholder says
    // the name is required) — show the same inline error as other refusals.
    if (!tName.trim()) {
      setTNameError('نام تیم را وارد کنید.');
      return;
    }
    // A team with neither player named used to register as the fake
    // «بازیکن ۱ و بازیکن ۲» and enter the draw as if two real players —
    // require at least one real player name.
    if (!tP1.trim() && !tP2.trim()) {
      setTNameError('نام دست‌کم یک بازیکن را وارد کنید.');
      return;
    }
    // Stale detail view: the form only renders while open, but `selected`
    // can lag behind a draw done elsewhere — never clear the form on a
    // tournament that is no longer open.
    if (selected.status !== 'open') {
      setTNameError('این تورنمنت دیگر برای ثبت تیم باز نیست.');
      return;
    }
    // Duplicate team names: reject trimmed + case-insensitive + collapsed
    // internal whitespace, exactly like registerTournamentTeam does for
    // official tournaments — with a Persian inline error, never a silent
    // accept.
    const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
    if (selected.teams.some((tm) => norm(tm.teamName) === norm(tName))) {
      setTNameError('تیمی با این نام قبلاً در این تورنمنت ثبت شده است.');
      return;
    }
    const ok = addFriendlyTeam(selected.id, {
      teamName: tName.trim(),
      player1Name: tP1.trim() || 'بازیکن ۱',
      player2Name: tP2.trim() || 'بازیکن ۲',
      rank: tRank,
    });
    if (!ok) {
      // addFriendlyTeam fails for two reasons with the same `false`: a
      // duplicate name, or a tournament that is no longer open (stale
      // `selected` still says 'open'). The duplicate message lied in the
      // second case — read the live tournament's status to pick the
      // honest message (the toast from addFriendlyTeam already says it).
      const live = friendlyTournaments.find((t) => t.id === selected.id);
      setTNameError(
        !live || live.status !== 'open'
          ? 'این تورنمنت دیگر برای ثبت تیم باز نیست.'
          : 'تیمی با این نام قبلاً در این تورنمنت ثبت شده است.'
      );
      return;
    }
    // Refresh selected from state. No fake team is appended: the detail
    // view below re-reads the tournament from fresh friendlyTournaments on
    // every render, and prizePool/suggestion use the live lookup too — a
    // stale `{ id: 'tmp' }` append inflated the prize pool by one team and
    // accumulated duplicate keys.
    const updated = friendlyTournaments.find((t) => t.id === selected.id);
    if (updated) setSelected({ ...updated });
    setTName(''); setTP1(''); setTP2(''); setTRank('C'); setTNameError('');
  };

  const handleScore = (matchId: string) => {
    if (!selected) return;
    // Same signed-out gate as create: score entry in the detail view
    // was reachable by guests (see handleAddTeam).
    if (!user) { setAuthModalOpen(true); return; }
    const inp = scoreInputs[matchId];
    // Silent `return` here left the admin guessing why «ثبت» did nothing
    // on an untouched row — both fields are required, so say so.
    if (!inp) {
      setSyncNotification('برای ثبت نتیجه، هر دو ست را وارد کنید.');
      return;
    }
    // Inputs prefill visually from the recorded score, but scoreInputs only
    // gains the field the user actually types — an untouched field stays
    // undefined and faDigitsToEn(undefined) throws, killing the save with
    // no feedback. Fall back to the recorded score for untouched fields,
    // so fixing a single typo number works.
    const match =
      friendlyTournaments.find((t) => t.id === selected.id)?.bracket.find((m) => m.id === matchId) ??
      selected.bracket.find((m) => m.id === matchId);
    // Score entry is for the match's players or the tournament creator
    // (2026-10-31): the old signed-in-only gate let any stranger record
    // or overwrite results of a game they play no part in. Same
    // normalization as team-name dedupe; legacy «ناشناس» rows keep the
    // creator fallback since they have no stored creator id.
    {
      const tournForScore = friendlyTournaments.find((t) => t.id === selected.id) ?? selected;
      const normName = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
      const me = normName(playerProfile.name);
      const matchTeamNames = [match?.team1Id, match?.team2Id]
        .map((id) => tournForScore.teams.find((tm) => tm.id === id))
        .filter((tm): tm is NonNullable<typeof tm> => !!tm)
        .flatMap((tm) => [normName(tm.player1Name), normName(tm.player2Name)]);
      const iPlay = me !== '' && matchTeamNames.includes(me);
      const iCreated = tournForScore.createdById
        ? tournForScore.createdById === user?.id
        : tournForScore.createdBy === 'ناشناس' || (me !== '' && normName(tournForScore.createdBy) === me);
      if (!iPlay && !iCreated) {
        setSyncNotification('فقط بازیکنان این بازی یا سازنده تورنمنت می‌توانند نتیجه را ثبت کنند.');
        return;
      }
    }
    const raw1 = inp.s1 ?? (match?.score1 != null ? String(match.score1) : '');
    const raw2 = inp.s2 ?? (match?.score2 != null ? String(match.score2) : '');
    // Persian/Arabic-Indic digits → Latin, so «۶-۴» on a fa-IR keyboard
    // parses instead of silently failing (faDigitsToEn is the module-level
    // shared helper; same pattern as InlineBooking's, kept local per
    // codebase convention).
    const s1 = Math.max(0, parseInt(faDigitsToEn(raw1)));
    const s2 = Math.max(0, parseInt(faDigitsToEn(raw2)));
    // Same silent-return trap as above: a half-filled row (one field
    // empty, no recorded score to fall back to) parses to NaN.
    if (isNaN(s1) || isNaN(s2)) {
      setSyncNotification('برای ثبت نتیجه، هر دو ست را وارد کنید.');
      return;
    }
    recordFriendlyScore(selected.id, matchId, s1, s2);
    // Only clear the inputs when the score was accepted: a tie is
    // rejected by recordFriendlyScore (toast only), so the inputs must
    // stay for the user to correct.
    if (s1 !== s2) {
      setScoreInputs((prev) => {
        const n = { ...prev };
        delete n[matchId];
        return n;
      });
    }
  };

  const getTeamName = (tourn: FriendlyTournament, teamId: string | null) => {
    if (!teamId) return '---';
    return tourn.teams.find((t) => t.id === teamId)?.teamName || '---';
  };

  // Live tournament for derived values: `selected` can lag one render
  // behind after addFriendlyTeam (stale closure), so prize/suggestion math
  // must read the fresh tournament from state — never selected.teams.
  const liveTourn = selected
    ? friendlyTournaments.find((t) => t.id === selected.id) ?? selected
    : null;

  const prizePool = liveTourn ? liveTourn.teams.length * liveTourn.entryFeePerTeam : 0;
  const splitParts = liveTourn?.prizeSplit === '70-30' ? [0.7, 0.3] : [0.6, 0.4];
  const prizeFirst = Math.round(prizePool * splitParts[0]);
  // Second share is the exact remainder: rounding both shares independently
  // can overshoot the pool by 1 (e.g. pool 25 at 70-30 -> 18 + 8 = 26).
  const prizeSecond = prizePool - prizeFirst;

  const suggestion = calculateSuggestion(
    liveTourn?.teams.length || 0,
    liveTourn?.courtsCount || parseInt(faDigitsToEn(fCourts)) || 2,
    liveTourn?.hoursReserved || parseFloat(faDigitsToEn(fHours)) || 4
  );

  if (selected) {
    const tourn = friendlyTournaments.find((t) => t.id === selected.id) || selected;
    // Draw / undo-draw are organizer-only. Since 2026-10-31 the creator's
    // auth id is stored (createdById): a name comparison alone let any
    // user who copied the creator's profile name seize the tournament.
    // Legacy rows without an id keep the name-match fallback, and legacy
    // «ناشناس» tournaments (created before the name gate) have no
    // identifiable creator, so they stay open.
    const isCreator =
      tourn.createdById ? tourn.createdById === user?.id :
      tourn.createdBy === 'ناشناس' ||
      (playerProfile.name.trim() !== '' &&
        tourn.createdBy.trim() === playerProfile.name.trim());
    return (
      <div className="space-y-6 pb-12">
        <button onClick={() => setSelected(null)} className="text-sm text-slate-400 hover:text-slate-200">
          → بازگشت به لیست
        </button>

        <div className="court-card court-watermark p-6">
          <h2 className="text-xl font-black text-slate-100 mb-2">{tourn.title}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{tourn.clubName}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{tourn.date}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{tourn.teams.length} تیم</span>
          </div>

          {/* Undo accidental draw (A5): only before any result is recorded */}
          {isCreator && tourn.bracket?.length > 0 && tourn.status === 'draw_done' &&
            !tourn.bracket.some((m) => m.winnerId !== null && (m.score1 !== null || m.score2 !== null)) && (
            <button
              onClick={() => {
                if (!user) { setAuthModalOpen(true); return; }
                if (window.confirm('قرعه‌کشی حذف و تورنمنت به وضعیت ثبت‌نام برگردد؟')) {
                  resetFriendlyBracket(tourn.id);
                }
              }}
              className="mt-4 w-full py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/[0.08] transition"
            >
              حذف قرعه‌کشی و شروع مجدد
            </button>
          )}

          {/* Calculator */}
          <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm">
            <p className="font-bold text-slate-300 mb-2 flex items-center gap-1.5"><Calculator className="w-4 h-4 text-[#ff6b81]" />محاسبه‌گر</p>
            <p className="text-slate-400">
              {tourn.teams.length} تیم → {suggestion.matchesNeeded} بازی لازم است.
              با {tourn.courtsCount} زمین و {tourn.hoursReserved} ساعت، {suggestion.matchesPossible} بازی می‌توانید برگزار کنید.
            </p>
            {!suggestion.feasible && suggestion.matchesNeeded > 0 && (
              <p className="text-amber-400 mt-1 flex items-center gap-1.5">
                <TriangleAlert className="w-4 h-4 shrink-0" />زمان کافی نیست! حدود {suggestion.hoursNeeded} ساعت لازم دارید.
              </p>
            )}
            <p className="text-slate-500 mt-1">مدت پیشنهادی هر بازی: {suggestion.matchMin} دقیقه</p>
          </div>

          {/* Prize */}
          {prizePool > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-sm">
              <p className="font-bold text-amber-300 mb-1 flex items-center gap-1"><Coins className="w-4 h-4" />جایزه</p>
              <p className="text-slate-300">مجموع ورودی: {prizePool.toLocaleString('fa-IR')} تومان</p>
              <p className="text-slate-400">اول: {prizeFirst.toLocaleString('fa-IR')} | دوم: {prizeSecond.toLocaleString('fa-IR')} ({tourn.prizeSplit})</p>
              {tourn.winnerTeamId && (
                <div className="mt-3 p-5 rounded-2xl bg-gradient-to-l from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.15)_0%,transparent_70%)] animate-pulse" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center shrink-0">
                      <Trophy className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-amber-300 font-black text-lg">قهرمان مسابقات!</p>
                      <p className="text-slate-200 font-bold">{getTeamName(tourn, tourn.winnerTeamId)}</p>
                      {tourn.runnerUpTeamId && (
                        <p className="text-slate-400 text-sm mt-1">🥈 نایب‌قهرمان: {getTeamName(tourn, tourn.runnerUpTeamId)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Teams */}
        {tourn.status === 'open' && (
          <div className="court-card p-6">
            <div className="court-title mb-4">
              <h3 className="font-black text-slate-200 whitespace-nowrap">تیم‌ها ({tourn.teams.length})</h3>
            </div>
            <div className="space-y-2 mb-4">
              {tourn.teams.map((tm) => (
                <div key={tm.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] text-sm">
                  <span className="font-bold text-slate-200">{tm.teamName}</span>
                  <span className="text-slate-500 text-xs">{[tm.player1Name, tm.player2Name].filter((n) => n !== 'بازیکن ۱' && n !== 'بازیکن ۲').join(' و ')} (سطح {tm.rank})</span>
                </div>
              ))}
              {tourn.teams.length === 0 && <p className="text-slate-500 text-sm">هنوز تیمی اضافه نشده.</p>}
            </div>
            <form onSubmit={handleAddTeam} className="grid grid-cols-2 gap-2">
              <input value={tName} onChange={(e) => { setTName(e.target.value); setTNameError(''); }} placeholder="نام تیم *" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              <select value={tRank} onChange={(e) => setTRank(e.target.value as SkillGrade)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200">
                {SKILL_GRADES.map((g) => (
                  <option key={g} value={g} className="bg-[#0d1420]">سطح {g}</option>
                ))}
              </select>
              <input value={tP1} onChange={(e) => setTP1(e.target.value)} placeholder="بازیکن ۱" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              <input value={tP2} onChange={(e) => setTP2(e.target.value)} placeholder="بازیکن ۲" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              <button type="submit" className="col-span-2 py-2 rounded-xl btn-ice text-white text-sm font-bold">+ افزودن تیم</button>
              {tNameError && (
                <p className="col-span-2 text-xs text-red-400">{tNameError}</p>
              )}
            </form>
            {isCreator && tourn.teams.length >= 2 && (
              <button
                onClick={() => { if (!user) { setAuthModalOpen(true); } else { drawFriendlyBracket(tourn.id); } }}
                className="w-full mt-4 py-3 rounded-2xl bubble-btn-fire text-white font-black flex items-center justify-center gap-2"
              >
                <Shuffle className="w-5 h-5" />قرعه‌کشی بر اساس رنک
              </button>
            )}
            {!isCreator && tourn.teams.length >= 2 && (
              <p className="mt-4 text-xs text-slate-500 text-center">قرعه‌کشی با سازنده تورنمنت است.</p>
            )}
          </div>
        )}

        {/* TV-Style Bracket */}
        {(() => {
          // Convert FriendlyMatch[] to BracketMatch[] for TV display (properly ordered)
          const tvMatches: BracketMatch[] = bracketToDisplay(tourn.bracket, (id) => getTeamName(tourn, id));
          // If no bracket yet but teams exist, generate preview
          const displayMatches = tvMatches.length > 0 ? tvMatches : 
            (tourn.teams.length >= 2 ? generateBracket(tourn.teams.map(t => ({ id: t.id, name: t.teamName, rank: t.rank }))) : []);
          
          if (displayMatches.length === 0) return null;
          // Pre-draw bracket is only a preview: generateBracket pairs
          // sequentially, while the real draw uses snake seeding, so the
          // semifinal paths can differ. Label it so nobody mistakes the
          // preview for the final draw.
          const isPreview = tvMatches.length === 0;
          return (
            <div className="space-y-4">
              <TVBracket matches={displayMatches} title={isPreview ? `پیش‌نمایش جدول ${tourn.title}` : `جدول ${tourn.title}`} />
              {isPreview && (
                <p className="text-center text-xs text-slate-500">این جدول پیش‌نمایش است؛ قرعه نهایی ممکن است متفاوت باشد.</p>
              )}
              {/* Score entry for admins - kept below the TV bracket */}
              {tourn.bracket.length > 0 && (
                <div className="court-card p-6">
                  <div className="court-title mb-4">
                    <h4 className="font-bold text-slate-300 text-sm whitespace-nowrap">ثبت نتایج</h4>
                  </div>
                  <div className="space-y-3">
                    {tourn.bracket.map((m) => (
                      m.team1Id && m.team2Id ? (
                        <div key={m.id} className="flex items-center gap-2 text-sm">
                          <span className="text-slate-400 text-xs flex-1">{m.roundFa}: {getTeamName(tourn, m.team1Id)} در برابر {getTeamName(tourn, m.team2Id)}</span>
                          {/* Scored matches stay editable: a typo used to be
                              unfixable because the row vanished once a winner
                              existed, even though recordFriendlyScore already
                              handles corrections (drops later rounds built
                              from the old winner). Prefill with the recorded
                              score; `??` (not `||`) so clearing an input
                              doesn't snap back to the old value. */}
                          <input
                            value={scoreInputs[m.id]?.s1 ?? (m.score1 != null ? String(m.score1) : '')}
                            onChange={(e) => setScoreInputs((p) => ({ ...p, [m.id]: { ...p[m.id], s1: e.target.value } }))}
                            placeholder="0" inputMode="numeric"
                            className="w-14 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-center text-sm text-slate-200"
                          />
                          <span className="text-slate-500">-</span>
                          <input
                            value={scoreInputs[m.id]?.s2 ?? (m.score2 != null ? String(m.score2) : '')}
                            onChange={(e) => setScoreInputs((p) => ({ ...p, [m.id]: { ...p[m.id], s2: e.target.value } }))}
                            placeholder="0" inputMode="numeric"
                            className="w-14 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-center text-sm text-slate-200"
                          />
                          <button onClick={() => handleScore(m.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">{m.winnerId ? 'ویرایش' : 'ثبت'}</button>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <FriendlyTournamentPredictions tournament={tourn} defaultName={playerProfile.name} />
        {/* Detail view returns early, so the list view's modal never
            renders here — the new guest gates above need their own. */}
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-100">مسابقات دوستانه</h2>
        <button
          onClick={() => { if (!user) { setAuthModalOpen(true); } else { setShowCreate(true); } }}
          className="px-4 py-2 rounded-2xl bubble-btn-fire text-white text-sm font-bold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />جدید
        </button>
      </div>
      <p className="text-sm text-slate-500">بدون امتیاز رنکینگ — جایزه نقدی به تیم اول و دوم</p>

      {friendlyTournaments.length === 0 ? (
        <div className="court-card p-12 text-center">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">هنوز مسابقه دوستانه‌ای ساخته نشده.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {friendlyTournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className="court-card card-hover text-right p-5 transition"
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
              <input value={fTitle} onChange={(e) => { setFTitle(e.target.value); setFTitleError(''); }} placeholder="عنوان *" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              {fTitleError && (
                <p className="text-xs text-red-400">{fTitleError}</p>
              )}
              <select value={fClubId || clubs[0]?.id || ''} onChange={(e) => { setFClubId(e.target.value); setFClubError(''); }} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200">
                {clubs.map((c) => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
              </select>
              {fClubError && (
                <p className="text-xs text-red-400">{fClubError}</p>
              )}
              <input value={fDate} onChange={(e) => setFDate(e.target.value)} placeholder="تاریخ (مثلاً جمعه ۱۴۰۳/۰۷/۲۰)" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              <div className="grid grid-cols-2 gap-2">
                <input value={fCourts} onChange={(e) => setFCourts(e.target.value)} placeholder="تعداد زمین" inputMode="numeric" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
                <input value={fHours} onChange={(e) => setFHours(e.target.value)} placeholder="ساعت رزرو" inputMode="decimal" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              </div>
              <input value={fFee} onChange={(e) => setFFee(e.target.value)} placeholder="ورودی هر تیم (تومان)" inputMode="numeric" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600" />
              <div>
                <p className="text-xs text-slate-400 mb-2">تقسیم جایزه (اول - دوم):</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setFSplit('70-30')} className={`py-2 rounded-xl text-sm font-bold border ${fSplit === '70-30' ? 'bubble-btn-fire border-transparent text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>۷۰ - ۳۰</button>
                  <button type="button" onClick={() => setFSplit('60-40')} className={`py-2 rounded-xl text-sm font-bold border ${fSplit === '60-40' ? 'bubble-btn-fire border-transparent text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>۶۰ - ۴۰</button>
                </div>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />هر بازی حدود ۹۰ دقیقه طول می‌کشد. با {fCourts} زمین و {fHours} ساعت می‌توانید حدود {Math.floor(Math.max(1, parseInt(faDigitsToEn(fCourts)) || 1) * Math.max(1, parseFloat(faDigitsToEn(fHours)) || 2) * 60 / 90)} بازی برگزار کنید.</p>
              {fNameError && (
                <p className="text-xs text-red-400">{fNameError}</p>
              )}
              <button type="submit" className="w-full py-3 rounded-2xl bubble-btn-fire text-white font-black">ساخت مسابقه</button>
            </form>
          </div>
        </div>
      )}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};
