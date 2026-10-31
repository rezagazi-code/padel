import React, { useState, useRef, useEffect } from 'react';
import { usePadel } from '../context/PadelContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { FriendlyTournamentView } from './FriendlyTournamentView';
import { MatchType, OpenMatch, GroupSession, PlayingSide } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { LongPressable } from '../hooks/useLongPress';
import GradeBadge from './GradeBadge';
import { levelToGrade, LEVEL_JOIN_TOLERANCE } from '../utils/skillGrades';
import { avatarInitial } from '../lib/avatarInitial';
import {
  Users,
  Plus,
  Trophy,
  HeartHandshake,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRightLeft,
  X,
  PlusCircle,
  HelpCircle,
  Shield,
  LayoutGrid,
  Trash2
} from 'lucide-react';

// Same initial-letter fallback as FreeAgentsView: a fresh profile has
// avatar '' by default and a dead remote URL must not render a
// broken-image icon in the compatible-player chips.
function ChipAvatar({ src, name }: { src?: string; name?: string }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [src]);
  if (!src || broken) {
    return (
      <div className="w-6 h-6 rounded-full object-cover flex items-center justify-center font-bold text-white text-[10px] bg-slate-600">
        {avatarInitial(name)}
      </div>
    );
  }
  return <img src={src} alt="" aria-hidden="true" className="w-6 h-6 rounded-full object-cover" onError={() => setBroken(true)} />;
}

export const MatchmakingView: React.FC = () => {
  const {
    openMatches,
    createOpenMatch,
    joinMatchSlot,
    leaveMatchSlot,
    deleteOpenMatch,
    groupSessions,
    createGroupSession,
    joinGroupSessionSlot,
    leaveGroupSessionSlot,
    deleteGroupSession,
    playerProfile,
    currentUserRole,
    adminClubId,
    clubs,
    freeAgents,
    inviteFreeAgent
  } = usePadel();

  const [filterType, setFilterType] = useState<'all' | MatchType>('all');
  const [mainTab, setMainTab] = useState<'open' | 'friendly' | 'group'>('open');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<OpenMatch | null>(null);
  // Ref-based double-submit guard for open-match creation.
  const createMatchSubmittingRef = useRef(false);

  const canDeleteMatch = (m: OpenMatch) =>
    m.creatorId === playerProfile.id ||
    currentUserRole === 'super_admin' ||
    (currentUserRole === 'club_admin' && m.clubId === adminClubId);

  const MatchTabs: React.FC = () => (
    <div className="flex gap-2">
      {(
        [
          ['open', 'مسابقات باز'],
          ['group', 'سانس گروهی'],
          ['friendly', 'مسابقات دوستانه'],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          onClick={() => setMainTab(value)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            mainTab === value
              ? 'bg-[#ff2d55] text-white'
              : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  // New Match Form State
  const [newTitle, setNewTitle] = useState('');
  const [createMatchError, setCreateMatchError] = useState<string | null>(null);
  const [newClubId, setNewClubId] = useState(clubs[0]?.id || '');
  const [newCourtName, setNewCourtName] = useState('زمین سنترال ۱');
  const [newDate, setNewDate] = useState('فردا - ۱۹:۰۰');
  const [newTime, setNewTime] = useState('۱۹:۰۰ - ۲۰:۳۰');
  const [newType, setNewType] = useState<MatchType>('competitive');
  const [newMinLevel, setNewMinLevel] = useState<number>(3.0);
  const [newMaxLevel, setNewMaxLevel] = useState<number>(4.2);
  const [newPrice, setNewPrice] = useState<number>(220000);
  const [newGender, setNewGender] = useState<'all' | 'men' | 'women' | 'mixed'>('all');

  if (mainTab === 'friendly') {
    return (
      <div className="space-y-6 pb-12">
        <MatchTabs />
        <FriendlyTournamentView />
      </div>
    );
  }

  if (mainTab === 'group') {
    return (
      <div className="space-y-6 pb-12">
        <MatchTabs />
        <GroupSessionsTab />
      </div>
    );
  }

  const filteredMatches = openMatches.filter((m) => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  const handleJoinSlot = (matchId: string, slotNumber: number) => {
    if (!user) { setAuthModalOpen(true); return; }
    joinMatchSlot(matchId, slotNumber);
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    // Double-submit guard: the create modal stays open until the first
    // submit completes, so a rapid double-tap would create two open
    // matches. createOpenMatch is synchronous → a ref blocks it.
    if (createMatchSubmittingRef.current) return;
    createMatchSubmittingRef.current = true;
    try {
      setCreateMatchError(null);
      // Same signed-out + blank-name gates as the friendly-tournament
      // create: the opener button gates guests, but a submit reaching here
      // must never file a match under a blank creator name.
      if (!user) { setAuthModalOpen(true); return; }
      if (!playerProfile.name.trim()) {
        setCreateMatchError('برای ساخت مسابقه، اول نام خود را در پروفایل ثبت کنید.');
        return;
      }
      // No silent first-club fallback (same class just removed from
      // UserManagementModal): if the selected club id went stale across a
      // catalog reload, stop and ask instead of filing under an arbitrary club.
      const club = clubs.find((c) => c.id === newClubId);
      if (!club) {
        setCreateMatchError('باشگاه انتخاب‌شده در دسترس نیست؛ لطفاً دوباره انتخاب کنید.');
        return;
      }

      createOpenMatch({
        // Whitespace-only title/court defeat the `||` fallbacks below (a
        // string of spaces is truthy), so trim first — same class as the
        // club city/address and tournament prize-pool trims.
        title: newTitle.trim() || `مسابقه پدل در ${club.name}`,
        clubId: club.id,
        clubName: club.name,
        courtName: newCourtName.trim() || 'زمین ۱',
        date: newDate,
        time: newTime,
        type: newType,
        minLevel: Number(newMinLevel),
        maxLevel: Number(newMaxLevel),
        pricePerPlayer: Math.max(0, Number(newPrice) || 0),
        gender: newGender,
        creatorId: playerProfile.id,
        creatorName: playerProfile.name,
        creatorAvatar: playerProfile.avatar,
        creatorLevel: playerProfile.level,
      });

      setShowCreateModal(false);
      setNewTitle('');
    } finally {
      createMatchSubmittingRef.current = false;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <MatchTabs />
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#ff2d55]/12 via-white/[0.03] to-[#2f7bff]/12 border border-white/10 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              مچ‌میکینگ — مسابقات باز پدل
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              مسابقات باز پدل؛ حریف و هم‌تیمی هم‌سطح خود را پیدا کنید
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              دیگر نگران کمبود بازیکن یا لغو بازی نباشید. در مسابقات عمومی شرکت کرده یا خودتان یک مسابقه ایجاد کنید، اسلات‌های خالی را پر کنید و در سطح بازی خود بدرخشید. توجه: مسابقات و سانس‌های ساخته‌شده فعلاً فقط روی همین دستگاه ثبت می‌شوند و برای بازیکنان دیگر قابل مشاهده نیستند.
            </p>
          </div>

          <button
            // Signed-out web visitors have the blank guest profile, so
            // opening the create modal would seat a nameless host.
            // Open login instead, same as tournament registration.
            onClick={() => { if (!user) { setAuthModalOpen(true); } else { setShowCreateModal(true); } }}
            className="flex items-center gap-2 bg-[#ff2d55] hover:bg-[#8fd126] text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-[0_4px_20px_rgba(255,45,85,0.3)] transition active:scale-95 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>ایجاد مسابقه جدید</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">نوع مسابقه:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterType === 'all'
                  ? 'bubble-btn-fire rounded-2xl'
                  : 'bg-white/[0.04] text-slate-400 hover:bg-white/10'
              }`}
            >
              همه مسابقات ({openMatches.length})
            </button>
            <button
              onClick={() => setFilterType('competitive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                filterType === 'competitive'
                  ? 'bg-amber-400 text-white'
                  : 'bg-white/[0.04] text-slate-400 hover:bg-white/10'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              رقابتی با تاثیر رنکینگ
            </button>
            <button
              onClick={() => setFilterType('friendly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                filterType === 'friendly'
                  ? 'bg-emerald-400 text-white'
                  : 'bg-white/[0.04] text-slate-400 hover:bg-white/10'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />
              دوستانه و تفریحی
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>سطح شما:</span>
            <GradeBadge grade={levelToGrade(playerProfile.level)} />
            <span className="text-slate-400">({playerProfile.preferredSide === 'left' ? 'سمت چپ Reves' : 'سمت راست Drive'})</span>
          </div>
        </div>
      </div>

      {/* Matches Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMatches.map((match, idx) => {
          const filledSlotsCount = match.slots.filter((s) => s.playerId).length;
          const isUserInMatch = match.slots.some((s) => s.playerId === playerProfile.id);
          const isLevelCompatible =
            playerProfile.level >= match.minLevel - LEVEL_JOIN_TOLERANCE &&
            playerProfile.level <= match.maxLevel + LEVEL_JOIN_TOLERANCE;
          const riseClass = `pp-rise pp-rise-${Math.min((idx % 6) + 1, 6)}`;

          return (
            <LongPressable
              key={match.id}
              className={`rounded-3xl bg-white/[0.06] border border-white/10 p-6 space-y-5 hover:border-white/10 transition relative overflow-hidden shadow-lg ${riseClass}`}
              onLongPress={() => {
                if (canDeleteMatch(match)) setMatchToDelete(match);
              }}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {match.type === 'competitive' ? (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        رقابتی (تاثیر روی رنکینگ)
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <HeartHandshake className="w-3 h-3" />
                        دوستانه تفریحی
                      </span>
                    )}

                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      سطح:
                      <GradeBadge grade={levelToGrade(match.minLevel)} className="text-[10px] min-w-[1.8rem]" />
                      تا
                      <GradeBadge grade={levelToGrade(match.maxLevel)} className="text-[10px] min-w-[1.8rem]" />
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-100">{match.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#ff6b81]" />
                    {match.clubName} - {match.courtName}
                  </p>
                </div>

                <div className="text-left shrink-0">
                  <span className="text-sm font-black text-[#ff6b81]">
                    {match.pricePerPlayer.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-[10px] text-slate-500 block">تومان / هر نفر</span>
                  {canDeleteMatch(match) && (
                    <button
                      onClick={() => setMatchToDelete(match)}
                      className="mt-2 px-2.5 py-1.5 bg-[#ff2d55]/10 text-[#ff6b81] border border-[#ff2d55]/40 hover:bg-[#ff2d55]/20 font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="حذف مسابقه"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Match Timing */}
              <div className="flex items-center gap-4 text-xs text-slate-400 bg-white/[0.04] p-2.5 rounded-xl border border-white/10">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  {match.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {match.time}
                </span>
                <span className="mr-auto font-bold text-slate-500">
                  {filledSlotsCount} از ۴ بازیکن ملحق شدند
                </span>
              </div>

              {/* Court 4-Player Diagram (2 vs 2 Padel layout) */}
              <div className="relative rounded-2xl bg-gradient-to-b from-[#2f7bff]/15 via-white/[0.04] to-[#2f7bff]/15 border border-[#2f7bff]/30 p-4">
                
                {/* Court Net Divider Line */}
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-dashed bg-white/20 -translate-y-1/2 flex items-center justify-center">
                  <span className="bg-white/[0.05] border border-white/10 text-[9px] font-bold text-slate-500 px-2 py-0.5 rounded-full">
                    تور وسط زمین (NET)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 relative z-10">
                  
                  {/* Team 1 (Top / North Side) */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-cyan-400 block text-center">تیم اول (Team 1)</span>
                    <div className="grid grid-cols-2 gap-2">
                      {match.slots.slice(0, 2).map((slot) => {
                        const isSlotFilled = Boolean(slot.playerId);
                        const isMe = slot.playerId === playerProfile.id;
                        return (
                          <div
                            key={slot.slotNumber}
                            className={`p-2.5 rounded-xl border text-center transition ${
                              isMe
                                ? 'bg-[#ff2d55]/20 border-[#ff2d55]/60 text-slate-100 shadow-sm'
                                : isSlotFilled
                                ? 'bg-white/[0.06] border-white/10 text-slate-300'
                                : 'bg-white/[0.04] border-dashed border-white/10 hover:border-[#ff2d55]/60'
                            }`}
                          >
                            {isSlotFilled ? (
                              <div className="space-y-1">
                                <img
                                  src={slot.playerAvatar}
                                  alt="" aria-hidden="true"
                                  className="w-8 h-8 rounded-full mx-auto object-cover ring-1 ring-slate-600"
                                />
                                <p className="text-[11px] font-bold text-slate-100 truncate">{slot.playerName}</p>
                                <GradeBadge grade={slot.playerLevel != null ? levelToGrade(slot.playerLevel) : '?'} className="text-[9px] min-w-[1.6rem]" />
                                {isMe && (
                                  <button
                                    onClick={() => leaveMatchSlot(match.id, slot.slotNumber)}
                                    className="text-[9px] text-rose-400 hover:text-rose-300 block w-full mt-1 cursor-pointer font-bold"
                                  >
                                    انصراف
                                  </button>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleJoinSlot(match.id, slot.slotNumber)}
                                className="w-full h-full min-h-[70px] flex flex-col items-center justify-center gap-1 group cursor-pointer"
                              >
                                <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/20 flex items-center justify-center group-hover:border-[#ff2d55]/60 group-hover:bg-[#ff2d55]/20 transition">
                                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-[#ff6b81]" />
                                </div>
                                <span className="text-[10px] text-slate-500 font-semibold group-hover:text-[#ff6b81]">
                                  {slot.side === 'left' ? 'سمت چپ (Reves)' : 'سمت راست (Drive)'}
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Team 2 (Bottom / South Side) */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 block text-center">تیم دوم (Team 2)</span>
                    <div className="grid grid-cols-2 gap-2">
                      {match.slots.slice(2, 4).map((slot) => {
                        const isSlotFilled = Boolean(slot.playerId);
                        const isMe = slot.playerId === playerProfile.id;
                        return (
                          <div
                            key={slot.slotNumber}
                            className={`p-2.5 rounded-xl border text-center transition ${
                              isMe
                                ? 'bg-[#ff2d55]/20 border-[#ff2d55]/60 text-slate-100 shadow-sm'
                                : isSlotFilled
                                ? 'bg-white/[0.06] border-white/10 text-slate-300'
                                : 'bg-white/[0.04] border-dashed border-white/10 hover:border-[#ff2d55]/60'
                            }`}
                          >
                            {isSlotFilled ? (
                              <div className="space-y-1">
                                <img
                                  src={slot.playerAvatar}
                                  alt="" aria-hidden="true"
                                  className="w-8 h-8 rounded-full mx-auto object-cover ring-1 ring-slate-600"
                                />
                                <p className="text-[11px] font-bold text-slate-100 truncate">{slot.playerName}</p>
                                <GradeBadge grade={slot.playerLevel != null ? levelToGrade(slot.playerLevel) : '?'} className="text-[9px] min-w-[1.6rem]" />
                                {isMe && (
                                  <button
                                    onClick={() => leaveMatchSlot(match.id, slot.slotNumber)}
                                    className="text-[9px] text-rose-400 hover:text-rose-300 block w-full mt-1 cursor-pointer font-bold"
                                  >
                                    انصراف
                                  </button>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleJoinSlot(match.id, slot.slotNumber)}
                                className="w-full h-full min-h-[70px] flex flex-col items-center justify-center gap-1 group cursor-pointer"
                              >
                                <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/20 flex items-center justify-center group-hover:border-[#ff2d55]/60 group-hover:bg-[#ff2d55]/20 transition">
                                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-[#ff6b81]" />
                                </div>
                                <span className="text-[10px] text-slate-500 font-semibold group-hover:text-[#ff6b81]">
                                  {slot.side === 'left' ? 'سمت چپ (Reves)' : 'سمت راست (Drive)'}
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

              {/* Status Message / Join prompt */}
              <div className="flex items-center justify-between pt-1 text-xs">
                {isUserInMatch ? (
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    شما در این مسابقه ثبت‌نام کرده‌اید
                  </span>
                ) : !isLevelCompatible ? (
                  <span className="text-amber-400/90 flex items-center gap-1 text-[11px]">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    اختلاف سطح بازی (سطح شما: {levelToGrade(playerProfile.level)})
                  </span>
                ) : (
                  <span className="text-slate-500 text-[11px]">
                    روی هر جای خالی کلیک کنید تا اسلات برای شما رزرو شود.
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  <img
                    src={match.creatorAvatar}
                    alt={match.creatorName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-[11px] text-slate-500">سازنده: {match.creatorName}</span>
                </div>
              </div>

              {/* Suggested free agents for empty slots */}
              {(() => {
                const emptySlots = match.slots.filter((s) => !s.playerName).length;
                if (emptySlots === 0) return null;
                const compatible = freeAgents.filter(
                  (a) => a.level >= match.minLevel && a.level <= match.maxLevel && a.id !== playerProfile.id
                );
                if (compatible.length === 0) return null;
                return (
                  <div className="mt-4 p-3 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/20">
                    <p className="text-xs font-bold text-emerald-300 mb-2">
                      🎯 {compatible.length.toLocaleString('fa-IR')} بازیکن آزاد هم‌سطح برای {emptySlots.toLocaleString('fa-IR')} جای خالی
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {compatible.slice(0, 4).map((a) => (
                        <button
                          key={a.id}
                          onClick={() => inviteFreeAgent(a.id, match.title)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 hover:border-emerald-500/40 transition text-xs"
                          title={`دعوت ${a.name}`}
                        >
                          <ChipAvatar src={a.avatar} name={a.name} />
                          <span className="text-slate-200 font-bold">{a.name}</span>
                          <span className="text-emerald-400">+ دعوت</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

            </LongPressable>
          );
        })}
      </div>

      {/* Create Open Match Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl glass-strong p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#ff6b81]" />
                <h3 className="text-lg font-black text-slate-100">ایجاد مسابقه باز پدل (Open Match)</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-100 p-1 rounded-lg hover:bg-white/[0.04] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-400 font-bold mb-1">عنوان مسابقه:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مسابقه مچ پدل انقلاب سطح متوسط به بالا"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">باشگاه میزبان:</label>
                  <select
                    value={newClubId}
                    onChange={(e) => { setNewClubId(e.target.value); setCreateMatchError(null); }}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                  >
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">نام زمین:</label>
                  <input
                    type="text"
                    value={newCourtName}
                    onChange={(e) => setNewCourtName(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">تاریخ مسابقه:</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="مثال: پنج‌شنبه - ۲۰:۰۰"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">ساعت سانس:</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="مثال: ۲۰:۰۰ - ۲۱:۳۰"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">نوع مسابقه:</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewType('competitive')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition cursor-pointer ${
                        newType === 'competitive'
                          ? 'bg-amber-400 text-white border-amber-400'
                          : 'bg-white/[0.05] border-white/10 text-slate-400'
                      }`}
                    >
                      رقابتی رنکینگ
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType('friendly')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition cursor-pointer ${
                        newType === 'friendly'
                          ? 'bg-emerald-400 text-white border-emerald-400'
                          : 'bg-white/[0.05] border-white/10 text-slate-400'
                      }`}
                    >
                      دوستانه
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">هزینه هر بازیکن (تومان):</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  محدوده مجاز سطح بازیکنان (
                  <GradeBadge grade={levelToGrade(newMinLevel)} className="text-[10px] min-w-[1.8rem] mx-0.5" />
                  تا
                  <GradeBadge grade={levelToGrade(newMaxLevel)} className="text-[10px] min-w-[1.8rem] mx-0.5" />
                  ):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 text-[10px] mb-0.5 flex items-center gap-1.5">حداقل سطح: <GradeBadge grade={levelToGrade(newMinLevel)} className="text-[10px] min-w-[1.8rem]" /></span>
                    <input
                      type="range"
                      min="1.0"
                      max="6.0"
                      step="0.1"
                      value={newMinLevel}
                      onChange={(e) => setNewMinLevel(Math.min(Number(e.target.value), newMaxLevel))}
                      className="w-full accent-[#ff2d55]"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] mb-0.5 flex items-center gap-1.5">حداکثر سطح: <GradeBadge grade={levelToGrade(newMaxLevel)} className="text-[10px] min-w-[1.8rem]" /></span>
                    <input
                      type="range"
                      min="2.0"
                      max="7.0"
                      step="0.1"
                      value={newMaxLevel}
                      onChange={(e) => setNewMaxLevel(Math.max(Number(e.target.value), newMinLevel))}
                      className="w-full accent-[#ff2d55]"
                    />
                  </div>
                </div>
              </div>

              {createMatchError && (
                <p className="text-xs text-red-400 font-bold">{createMatchError}</p>
              )}

              <div className="pt-3 border-t border-white/10 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#ff2d55] hover:bg-[#8fd126] text-white font-black rounded-xl transition cursor-pointer"
                >
                  ثبت و انتشار مسابقه در تابلوی مچ‌میکینگ
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 bg-white/[0.04] hover:bg-white/10 text-slate-400 font-bold rounded-xl transition cursor-pointer"
                >
                  انصراف
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!matchToDelete}
        title="حذف مسابقه"
        message={matchToDelete ? `مسابقه «${matchToDelete.title}» حذف شود؟` : ''}
        confirmLabel="حذف مسابقه"
        onConfirm={() => {
          if (matchToDelete) deleteOpenMatch(matchToDelete.id);
          setMatchToDelete(null);
        }}
        onCancel={() => setMatchToDelete(null)}
      />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

/* ================= سانس گروهی (Group Sessions) ================= */

const GroupSessionsTab: React.FC = () => {
  const {
    groupSessions,
    createGroupSession,
    joinGroupSessionSlot,
    leaveGroupSessionSlot,
    deleteGroupSession,
    playerProfile,
    currentUserRole,
    adminClubId,
    clubs,
  } = usePadel();

  const [showModal, setShowModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<GroupSession | null>(null);
  // Same signed-out gate as open matches (edab738): the guest profile has
  // a blank name, so an ungated create/join would seat a nameless host or
  // player. GroupSessionsTab is a separate component, so it needs its own
  // auth state rather than the parent's.
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  // Ref-based double-submit guard for group-session creation: createGroupSession
  // is synchronous, so a ref blocks a same-tick double submit that would
  // create two sessions. (createMatchSubmittingRef lives in the sibling
  // MatchmakingView component and can't be shared here.)
  const createGroupSubmittingRef = useRef(false);

  const canDeleteSession = (s: GroupSession) =>
    s.creatorId === playerProfile.id ||
    currentUserRole === 'super_admin' ||
    (currentUserRole === 'club_admin' && s.clubId === adminClubId);
  const [gTitle, setGTitle] = useState('');
  const [createGroupError, setCreateGroupError] = useState<string | null>(null);
  const [gClubId, setGClubId] = useState(clubs[0]?.id || '');
  const [gCourtCount, setGCourtCount] = useState<2 | 3 | 4>(2);
  const [gCourtNames, setGCourtNames] = useState<string[]>(['زمین ۱', 'زمین ۲']);
  const [gDate, setGDate] = useState('فردا - ۱۹:۰۰');
  const [gTime, setGTime] = useState('۱۹:۰۰ - ۲۰:۳۰');
  const [gType, setGType] = useState<MatchType>('friendly');
  const [gMinLevel, setGMinLevel] = useState<number>(3.0);
  const [gMaxLevel, setGMaxLevel] = useState<number>(4.2);
  const [gPrice, setGPrice] = useState<number>(220000);

  const setCourtCount = (n: 2 | 3 | 4) => {
    setGCourtCount(n);
    setGCourtNames((prev) => {
      const next = [...prev];
      while (next.length < n) next.push(`زمین ${next.length + 1}`);
      return next.slice(0, n);
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (createGroupSubmittingRef.current) return;
    createGroupSubmittingRef.current = true;
    try {
      setCreateGroupError(null);
      // Same signed-out + blank-name gates as the friendly-tournament
      // create: the opener button gates guests, but a submit reaching here
      // must never file a session under a blank creator name.
      if (!user) { setAuthModalOpen(true); return; }
      if (!playerProfile.name.trim()) {
        setCreateGroupError('برای ساخت سانس گروهی، اول نام خود را در پروفایل ثبت کنید.');
        return;
      }
      // No silent first-club fallback: a stale club id stops here instead
      // of filing the session under an arbitrary club.
      const club = clubs.find((c) => c.id === gClubId);
      if (!club) {
        setCreateGroupError('باشگاه انتخاب‌شده در دسترس نیست؛ لطفاً دوباره انتخاب کنید.');
        return;
      }
      createGroupSession(
        {
          title: gTitle.trim() || `سانس گروهی ${club.name}`,
          clubId: club.id,
          clubName: club.name,
          date: gDate,
          time: gTime,
          type: gType,
          minLevel: Number(gMinLevel),
          maxLevel: Number(gMaxLevel),
          pricePerPlayer: Math.max(0, Number(gPrice) || 0),
          gender: 'all',
          creatorId: playerProfile.id,
          creatorName: playerProfile.name,
          creatorAvatar: playerProfile.avatar,
          creatorLevel: playerProfile.level,
        },
        gCourtNames.map((n, i) => n.trim() || `زمین ${i + 1}`)
      );
      setShowModal(false);
      setGTitle('');
    } finally {
      createGroupSubmittingRef.current = false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Slim header — calm, one accent */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-100">سانس گروهی</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            چند زمین برای یک سانس؛ هر زمین ۴ نفر. مناسب شب‌های شلوغ باشگاه.
          </p>
        </div>
        <button
          onClick={() => { if (!user) { setAuthModalOpen(true); } else { setShowModal(true); } }}
          className="flex items-center gap-2 bg-[#ff2d55] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          سانس گروهی جدید
        </button>
      </div>

      {groupSessions.length === 0 && (
        <div className="court-card p-10 text-center">
          <LayoutGrid className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">هنوز سانس گروهی ساخته نشده.</p>
          <p className="text-xs text-slate-600 mt-1">اولین سانس را شما بسازید.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groupSessions.map((session, idx) => {
          const totalSlots = session.courts.length * 4;
          const filledCount = session.courts.reduce(
            (acc, c) => acc + c.slots.filter((s) => s.playerId).length,
            0
          );
          const isUserIn = session.courts.some((c) =>
            c.slots.some((s) => s.playerId === playerProfile.id)
          );
          const isLevelOk =
            playerProfile.level >= session.minLevel - LEVEL_JOIN_TOLERANCE &&
            playerProfile.level <= session.maxLevel + LEVEL_JOIN_TOLERANCE;
          // The seeded demo session has a fake host — it must never look
          // joinable as a real game. The id prefix covers stored copies too.
          const isSampleSession = session.id.startsWith('gs-sample-');
          const riseClass = `pp-rise pp-rise-${Math.min((idx % 6) + 1, 6)}`;

          return (
            <LongPressable
              key={session.id}
              className={`court-card p-6 space-y-5 ${riseClass}`}
              onLongPress={() => {
                if (canDeleteSession(session)) setSessionToDelete(session);
              }}
            >
              {/* Title + price */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-black text-slate-100 leading-relaxed">
                  {session.title}
                  {isSampleSession && (
                    <span className="mr-2 align-middle px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-slate-400 text-[10px] font-bold">
                      نمونه نمایشی
                    </span>
                  )}
                </h3>
                <div className="text-left shrink-0">
                  <span className="text-sm font-black text-slate-200">
                    {session.pricePerPlayer.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-[10px] text-slate-500 block">تومان / هر نفر</span>
                  {canDeleteSession(session) && (
                    <button
                      onClick={() => setSessionToDelete(session)}
                      className="mt-2 px-2.5 py-1.5 bg-[#ff2d55]/10 text-[#ff6b81] border border-[#ff2d55]/40 hover:bg-[#ff2d55]/20 font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="حذف سانس گروهی"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Meta: club • date • time */}
              <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {session.clubName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {session.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {session.time}
                </span>
              </p>

              {/* Meta: level + count + type (one accent pill) */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <GradeBadge grade={levelToGrade(session.minLevel)} className="text-[10px] min-w-[1.8rem]" />
                <span className="text-slate-600">تا</span>
                <GradeBadge grade={levelToGrade(session.maxLevel)} className="text-[10px] min-w-[1.8rem]" />
                <span className="text-slate-500 font-bold mr-1">
                  {filledCount} از {totalSlots} نفر
                </span>
                {session.type === 'competitive' ? (
                  <span className="mr-auto text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25">
                    رقابتی
                  </span>
                ) : (
                  <span className="mr-auto text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                    دوستانه
                  </span>
                )}
              </div>

              <div className="court-divider" />

              {/* Per-court slot grids — airy */}
              <div className="space-y-5">
                {session.courts.map((court) => (
                  <div key={court.courtNumber} className="space-y-2.5">
                    <p className="text-[11px] font-bold text-slate-400">{court.courtName}</p>
                    <div className="grid grid-cols-4 gap-3">
                      {court.slots.map((slot) => {
                        const filled = Boolean(slot.playerId);
                        const isMe = slot.playerId === playerProfile.id;
                        return (
                          <div
                            key={slot.slotNumber}
                            className={`rounded-xl border p-2 text-center transition min-h-[86px] flex flex-col items-center justify-center gap-1 ${
                              isMe
                                ? 'border-[#ff2d55]/50 bg-[#ff2d55]/[0.07]'
                                : filled
                                ? 'border-white/10 bg-white/[0.03]'
                                : 'border-dashed border-white/15 hover:border-[#ff2d55]/50'
                            }`}
                          >
                            {filled ? (
                              <>
                                {slot.playerAvatar ? (
                                  <img
                                    src={slot.playerAvatar}
                                    alt=""
                                    aria-hidden="true"
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                    {avatarInitial(slot.playerName)}
                                  </div>
                                )}
                                <p className="text-[10px] font-bold text-slate-200 truncate w-full">
                                  {slot.playerName}
                                </p>
                                <GradeBadge
                                  grade={slot.playerLevel != null ? levelToGrade(slot.playerLevel) : '?'}
                                  className="text-[9px] min-w-[1.5rem]"
                                />
                                {isMe && (
                                  <button
                                    onClick={() =>
                                      leaveGroupSessionSlot(session.id, court.courtNumber, slot.slotNumber)
                                    }
                                    className="text-[9px] text-rose-400/80 hover:text-rose-300 font-bold cursor-pointer"
                                  >
                                    انصراف
                                  </button>
                                )}
                              </>
                            ) : isSampleSession ? (
                              <span
                                className="w-full h-full flex flex-col items-center justify-center gap-1 py-2 opacity-40"
                                title="سانس نمونه نمایشی — قابل پیوستن نیست"
                              >
                                <Plus className="w-4 h-4 text-slate-600" />
                                <span className="text-[9px] text-slate-600">نمونه</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  if (!user) { setAuthModalOpen(true); return; }
                                  joinGroupSessionSlot(session.id, court.courtNumber, slot.slotNumber);
                                }}
                                className="w-full h-full flex flex-col items-center justify-center gap-1 group cursor-pointer py-2"
                                title={slot.side === 'left' ? 'سمت چپ (Reves)' : 'سمت راست (Drive)'}
                              >
                                <Plus className="w-4 h-4 text-slate-600 group-hover:text-[#ff6b81] transition" />
                                <span className="text-[9px] text-slate-600 group-hover:text-slate-400">
                                  {slot.side === 'left' ? 'چپ' : 'راست'}
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer: status line + creator */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                {session.status === 'full' ? (
                  <span className="text-slate-400 font-bold">تکمیل شد</span>
                ) : isUserIn ? (
                  <span className="text-emerald-300/90 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    شما در این سانس هستید
                  </span>
                ) : !isLevelOk ? (
                  <span className="text-amber-400/80 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    سطح شما: {levelToGrade(playerProfile.level)}
                  </span>
                ) : isSampleSession ? (
                  <span className="text-slate-500">سانس نمونه نمایشی — قابل پیوستن نیست.</span>
                ) : (
                  <span className="text-slate-600">روی جای خالی بزنید تا ملحق شوید.</span>
                )}
                <span className="text-slate-600">سازنده: {session.creatorName}</span>
              </div>
            </LongPressable>
          );
        })}
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto menu-fade">
          <div className="w-full max-w-lg rounded-3xl glass-strong p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#ff6b81]" />
                <h3 className="text-lg font-black text-slate-100">سانس گروهی جدید</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-100 p-1 rounded-lg hover:bg-white/[0.04] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">عنوان سانس:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سانس گروهی جمعه‌شب پدل پوینت"
                  value={gTitle}
                  onChange={(e) => setGTitle(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">باشگاه میزبان:</label>
                <select
                  value={gClubId}
                  onChange={(e) => { setGClubId(e.target.value); setCreateGroupError(null); }}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                >
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">تعداد زمین:</label>
                <div className="flex gap-2">
                  {([2, 3, 4] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCourtCount(n)}
                      className={`flex-1 py-2.5 rounded-xl font-black border transition cursor-pointer ${
                        gCourtCount === n
                          ? 'bg-[#ff2d55] text-white border-[#ff2d55]'
                          : 'bg-white/[0.05] border-white/10 text-slate-400'
                      }`}
                    >
                      {n} زمین
                      <span className="block text-[10px] font-normal opacity-70">{n * 4} نفر</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">نام زمین‌ها:</label>
                <div className="grid grid-cols-2 gap-2">
                  {gCourtNames.map((name, i) => (
                    <input
                      key={i}
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setGCourtNames((prev) => prev.map((n, j) => (j === i ? e.target.value : n)))
                      }
                      placeholder={`زمین ${i + 1}`}
                      className="bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none menu-pop-item"
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">تاریخ:</label>
                  <input
                    type="text"
                    value={gDate}
                    onChange={(e) => setGDate(e.target.value)}
                    placeholder="مثال: جمعه - ۱۹:۰۰"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">ساعت سانس:</label>
                  <input
                    type="text"
                    value={gTime}
                    onChange={(e) => setGTime(e.target.value)}
                    placeholder="مثال: ۱۹:۰۰ - ۲۰:۳۰"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">نوع سانس:</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGType('friendly')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition cursor-pointer ${
                        gType === 'friendly'
                          ? 'bg-emerald-400 text-white border-emerald-400'
                          : 'bg-white/[0.05] border-white/10 text-slate-400'
                      }`}
                    >
                      دوستانه
                    </button>
                    <button
                      type="button"
                      onClick={() => setGType('competitive')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition cursor-pointer ${
                        gType === 'competitive'
                          ? 'bg-amber-400 text-white border-amber-400'
                          : 'bg-white/[0.05] border-white/10 text-slate-400'
                      }`}
                    >
                      رقابتی رنکینگ
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">هزینه هر بازیکن (تومان):</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={gPrice}
                    onChange={(e) => setGPrice(Number(e.target.value))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  محدوده سطح (
                  <GradeBadge grade={levelToGrade(gMinLevel)} className="text-[10px] min-w-[1.8rem] mx-0.5" />
                  تا
                  <GradeBadge grade={levelToGrade(gMaxLevel)} className="text-[10px] min-w-[1.8rem] mx-0.5" />
                  ):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 text-[10px] mb-0.5 block">حداقل سطح</span>
                    <input
                      type="range"
                      min="1.0"
                      max="6.0"
                      step="0.1"
                      value={gMinLevel}
                      onChange={(e) => setGMinLevel(Math.min(Number(e.target.value), gMaxLevel))}
                      className="w-full accent-[#ff2d55]"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] mb-0.5 block">حداکثر سطح</span>
                    <input
                      type="range"
                      min="2.0"
                      max="7.0"
                      step="0.1"
                      value={gMaxLevel}
                      onChange={(e) => setGMaxLevel(Math.max(Number(e.target.value), gMinLevel))}
                      className="w-full accent-[#ff2d55]"
                    />
                  </div>
                </div>
              </div>

              {createGroupError && (
                <p className="text-xs text-red-400 font-bold">{createGroupError}</p>
              )}

              <div className="pt-3 border-t border-white/10 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#ff2d55] text-white font-black rounded-xl transition active:scale-95 cursor-pointer"
                >
                  ثبت سانس گروهی
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 bg-white/[0.04] hover:bg-white/10 text-slate-400 font-bold rounded-xl transition cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!sessionToDelete}
        title="حذف سانس گروهی"
        message={sessionToDelete ? `سانس گروهی «${sessionToDelete.title}» حذف شود؟` : ''}
        confirmLabel="حذف سانس"
        onConfirm={() => {
          if (sessionToDelete) deleteGroupSession(sessionToDelete.id);
          setSessionToDelete(null);
        }}
        onCancel={() => setSessionToDelete(null)}
      />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};
