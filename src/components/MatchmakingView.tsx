import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { MatchType, OpenMatch, PlayingSide } from '../types';
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
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MatchmakingView: React.FC = () => {
  const {
    openMatches,
    createOpenMatch,
    joinMatchSlot,
    leaveMatchSlot,
    playerProfile,
    clubs
  } = usePadel();

  const [filterType, setFilterType] = useState<'all' | MatchType>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Match Form State
  const [newTitle, setNewTitle] = useState('');
  const [newClubId, setNewClubId] = useState(clubs[0]?.id || '');
  const [newCourtName, setNewCourtName] = useState('زمین سنترال ۱');
  const [newDate, setNewDate] = useState('فردا - ۱۹:۰۰');
  const [newTime, setNewTime] = useState('۱۹:۰۰ - ۲۰:۳۰');
  const [newType, setNewType] = useState<MatchType>('competitive');
  const [newMinLevel, setNewMinLevel] = useState<number>(3.0);
  const [newMaxLevel, setNewMaxLevel] = useState<number>(4.2);
  const [newPrice, setNewPrice] = useState<number>(220000);
  const [newGender, setNewGender] = useState<'all' | 'men' | 'women' | 'mixed'>('all');

  const filteredMatches = openMatches.filter((m) => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  const handleJoinSlot = (matchId: string, slotNumber: number) => {
    const success = joinMatchSlot(matchId, slotNumber);
    if (success) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {
        // safe
      }
    }
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const club = clubs.find((c) => c.id === newClubId) || clubs[0];

    createOpenMatch({
      title: newTitle || `مسابقه پدل در ${club.name}`,
      clubId: club.id,
      clubName: club.name,
      courtName: newCourtName,
      date: newDate,
      time: newTime,
      type: newType,
      minLevel: Number(newMinLevel),
      maxLevel: Number(newMaxLevel),
      pricePerPlayer: Number(newPrice),
      gender: newGender,
      creatorId: playerProfile.id,
      creatorName: playerProfile.name,
      creatorAvatar: playerProfile.avatar,
      creatorLevel: playerProfile.level,
    });

    setShowCreateModal(false);
    setNewTitle('');
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch {
      // safe
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#ff2d55]/12 via-white/[0.03] to-[#2f7bff]/12 border border-white/10 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              سیستم مچ‌میکینگ زنده (Playtomic Open Matches)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              مسابقات باز پدل؛ حریف و هم‌تیمی هم‌سطح خود را پیدا کنید
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              دیگر نگران کمبود بازیکن یا لغو بازی نباشید. در مسابقات عمومی شرکت کرده یا خودتان یک مسابقه ایجاد کنید، اسلات‌های خالی را پر کنید و در سطح بازی خود بدرخشید.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
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
                  ? 'btn-fire'
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
            <span className="btn-fire font-black px-2 py-0.5 rounded">
              {playerProfile.level.toFixed(2)} ({playerProfile.preferredSide === 'left' ? 'سمت چپ Reves' : 'سمت راست Drive'})
            </span>
          </div>
        </div>
      </div>

      {/* Matches Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMatches.map((match) => {
          const filledSlotsCount = match.slots.filter((s) => s.playerId).length;
          const isUserInMatch = match.slots.some((s) => s.playerId === playerProfile.id);
          const isLevelCompatible =
            playerProfile.level >= match.minLevel - 0.25 &&
            playerProfile.level <= match.maxLevel + 0.25;

          return (
            <div
              key={match.id}
              className="rounded-3xl bg-white/[0.06] border border-white/10 p-6 space-y-5 hover:border-white/10 transition relative overflow-hidden shadow-lg"
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

                    <span className="text-xs text-slate-500 font-medium">
                      سطح: {match.minLevel.toFixed(1)} تا {match.maxLevel.toFixed(1)}
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
                                  alt={slot.playerName}
                                  className="w-8 h-8 rounded-full mx-auto object-cover ring-1 ring-slate-600"
                                />
                                <p className="text-[11px] font-bold text-slate-100 truncate">{slot.playerName}</p>
                                <span className="text-[9px] bg-white/[0.05] text-[#ff6b81] px-1 rounded font-black">
                                  {slot.playerLevel?.toFixed(2)}
                                </span>
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
                                  alt={slot.playerName}
                                  className="w-8 h-8 rounded-full mx-auto object-cover ring-1 ring-slate-600"
                                />
                                <p className="text-[11px] font-bold text-slate-100 truncate">{slot.playerName}</p>
                                <span className="text-[9px] bg-white/[0.05] text-[#ff6b81] px-1 rounded font-black">
                                  {slot.playerLevel?.toFixed(2)}
                                </span>
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
                    اختلاف سطح بازی (سطح شما: {playerProfile.level})
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

            </div>
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
                    onChange={(e) => setNewClubId(e.target.value)}
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
                    step="10000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  محدوده مجاز سطح بازیکنان ({newMinLevel.toFixed(1)} تا {newMaxLevel.toFixed(1)}):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-0.5">حداقل سطح:</span>
                    <input
                      type="range"
                      min="1.0"
                      max="6.0"
                      step="0.1"
                      value={newMinLevel}
                      onChange={(e) => setNewMinLevel(Number(e.target.value))}
                      className="w-full accent-[#ff2d55]"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-0.5">حداکثر سطح:</span>
                    <input
                      type="range"
                      min="2.0"
                      max="7.0"
                      step="0.1"
                      value={newMaxLevel}
                      onChange={(e) => setNewMaxLevel(Number(e.target.value))}
                      className="w-full accent-[#ff2d55]"
                    />
                  </div>
                </div>
              </div>

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

    </div>
  );
};
