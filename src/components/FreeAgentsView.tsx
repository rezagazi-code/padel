import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { NeedPlayerPost, PlayerProfile, PlayingSide } from '../types';
import { PROVINCES_LIST } from '../mockData';
import GradeBadge from './GradeBadge';
import { levelToGrade, gradeBandFa } from '../utils/skillGrades';
import {
  UserCheck,
  Users,
  PlusCircle,
  MapPin,
  Calendar,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Star,
  Zap,
  Filter,
  Check,
  MessageSquare,
  Award,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FreeAgentsView: React.FC = () => {
  const {
    needPlayerPosts,
    createNeedPlayerPost,
    joinNeedPlayerPost,
    freeAgents,
    toggleFreeAgentStatus,
    inviteFreeAgent,
    playerProfile,
    openMatches,
    clubs
  } = usePadel();

  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'market'>('requests');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState('همه استان‌ها');
  const [selectedSideFilter, setSelectedSideFilter] = useState<'all' | PlayingSide>('all');
  
  // Modals
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState<PlayerProfile | null>(null);
  const [selectedMatchToInvite, setSelectedMatchToInvite] = useState('');

  // Create Need Player form
  const [reqClubName, setReqClubName] = useState(clubs[0]?.name || 'باشگاه پدل انقلاب تهران');
  const [reqDate, setReqDate] = useState('امروز - ۲۱:۰۰');
  const [reqTime, setReqTime] = useState('۲۱:۰۰ - ۲۲:۳۰');
  const [reqSpots, setReqSpots] = useState<number>(1);
  const [reqSide, setReqSide] = useState<PlayingSide>('left');
  const [reqMinLevel, setReqMinLevel] = useState<number>(3.2);
  const [reqMaxLevel, setReqMaxLevel] = useState<number>(4.2);
  const [reqCost, setReqCost] = useState<number>(220000);
  const [reqNote, setReqNote] = useState('');

  // Free agent status toggle form
  const [freeAgentNoteInput, setFreeAgentNoteInput] = useState(playerProfile.freeAgentNote || '');

  const filteredRequests = needPlayerPosts.filter((p) => {
    if (selectedProvinceFilter !== 'همه استان‌ها' && p.province !== selectedProvinceFilter) return false;
    return true;
  });

  const filteredAgents = freeAgents.filter((a) => {
    if (selectedProvinceFilter !== 'همه استان‌ها' && a.province !== selectedProvinceFilter) return false;
    if (selectedSideFilter !== 'all' && a.preferredSide !== selectedSideFilter && a.preferredSide !== 'both') return false;
    return true;
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    createNeedPlayerPost({
      clubName: reqClubName,
      province: playerProfile.province,
      date: reqDate,
      time: reqTime,
      spotsNeeded: reqSpots,
      preferredSide: reqSide,
      minLevel: Number(reqMinLevel),
      maxLevel: Number(reqMaxLevel),
      costPerPerson: Number(reqCost),
      hostPlayerId: playerProfile.id,
      hostName: playerProfile.name,
      hostAvatar: playerProfile.avatar,
      hostLevel: playerProfile.level,
      note: reqNote || `زمین رزرو شده و به ${reqSpots} بازیکن نیاز داریم.`,
    });
    setShowCreateRequestModal(false);
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  const handleSendInvite = () => {
    if (!showInviteModal) return;
    inviteFreeAgent(showInviteModal.id, selectedMatchToInvite || 'سانس رزرو شده پدل');
    setShowInviteModal(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#ff2d55]/15 via-white/[0.03] to-[#2f7bff]/15 border border-white/10 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              سامانه بازیکنان آزاد و تکمیل ظرفیت سانس‌ها
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              زمین اجاره کرده‌اید و به بازیکن نیاز دارید؟
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              دیگر هیچ سانسی به خاطر غیبت یا کسری بازیکن کنسل نمی‌شود. درخواست خود را ثبت کنید یا مستقیماً از میان صدها بازیکن آزاد آماده به بازی، هم‌بازی ایده‌آل خود را دعوت نمایید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreateRequestModal(true)}
              className="flex items-center gap-2 bg-[#ff2d55] hover:bg-[#8fd126] text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-[0_4px_20px_rgba(255,45,85,0.3)] transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>ثبت نیاز به بازیکن</span>
            </button>
          </div>
        </div>

        {/* User Free Agent Status Switch Banner */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              playerProfile.isFreeAgent
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/[0.04] text-slate-500 border-white/10'
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                وضعیت شما: {playerProfile.isFreeAgent ? 'بازیکن آزاد فعال (آماده به بازی)' : 'غیرفعال در لیست بازیکنان آزاد'}
              </h4>
              <p className="text-xs text-slate-500">
                {playerProfile.isFreeAgent
                  ? 'سایر بازیکنان و باشگاه‌ها می‌توانند شما را به سانس‌های خود دعوت کنند.'
                  : 'با فعال کردن این گزینه، در لیست بازیکن‌های آزاد در دسترس قرار می‌گیرید.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFreeAgentStatus(!playerProfile.isFreeAgent, freeAgentNoteInput)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                playerProfile.isFreeAgent
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  : 'btn-fire border-[#ff2d55]/60 hover:bg-[#8fd126]'
              }`}
            >
              {playerProfile.isFreeAgent ? 'غیرفعال‌سازی وضعیت آزاد' : 'من آماده بازی هستم (فعال‌سازی)'}
            </button>
          </div>
        </div>

        {/* Sub-Tabs: Requests vs Free Agents Market */}
        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeSubTab === 'requests'
                ? 'btn-fire shadow-sm'
                : 'bg-white/[0.04] text-slate-400 hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>آگهی‌های نیاز به بازیکن ({needPlayerPosts.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('market')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeSubTab === 'market'
                ? 'btn-fire shadow-sm'
                : 'bg-white/[0.04] text-slate-400 hover:bg-white/10'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>لیست بازیکنان آزاد آماده بازی ({freeAgents.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white/[0.04] p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 shrink-0">استان:</span>
          {PROVINCES_LIST.slice(0, 6).map((prov) => (
            <button
              key={prov}
              onClick={() => setSelectedProvinceFilter(prov)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
                selectedProvinceFilter === prov
                  ? 'btn-fire font-black'
                  : 'bg-white/[0.04] text-slate-400 hover:bg-white/10'
              }`}
            >
              {prov}
            </button>
          ))}
        </div>

        {activeSubTab === 'market' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">سمت بازی:</span>
            {[
              { id: 'all', label: 'همه' },
              { id: 'left', label: 'سمت چپ (Reves)' },
              { id: 'right', label: 'سمت راست (Drive)' },
            ].map((side) => (
              <button
                key={side.id}
                onClick={() => setSelectedSideFilter(side.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedSideFilter === side.id
                    ? 'bg-cyan-500 text-white font-bold'
                    : 'bg-white/[0.04] text-slate-500 hover:text-slate-100'
                }`}
              >
                {side.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sub-Tab 1: Need Player Posts */}
      {activeSubTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map((post) => {
            const isHost = post.hostPlayerId === playerProfile.id;
            const isJoined = post.joinedPlayers.some((j) => j.playerId === playerProfile.id);
            const isFilled = post.spotsNeeded <= post.joinedPlayers.length;

            return (
              <div
                key={post.id}
                className="rounded-3xl bg-white/[0.06] border border-white/10 p-5 space-y-4 hover:border-white/10 transition relative flex flex-col justify-between"
              >
                <div>
                  {/* Host info & Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.hostAvatar}
                        alt={post.hostName}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200/60"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-100">{post.hostName}</h4>
                          <GradeBadge grade={levelToGrade(post.hostLevel)} className="text-[10px] min-w-[1.8rem]" />
                        </div>
                        <p className="text-[10px] text-slate-500">میزبان سانس</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isFilled
                          ? 'bg-white/[0.04] text-slate-500 border-white/10'
                          : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {isFilled ? 'ظرفیت تکمیل' : `نیاز به ${post.spotsNeeded - post.joinedPlayers.length} بازیکن`}
                    </span>
                  </div>

                  {/* Match specifics */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-100 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-[#ff6b81]" />
                      <span>{post.clubName}</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        {post.time}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-slate-400 leading-relaxed italic">
                      "{post.note}"
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="bg-white/[0.04] p-2 rounded-xl">
                        <span className="text-slate-500 block text-[10px]">محدوده سطح بازی:</span>
                        <span className="font-bold text-slate-100">{post.minLevel} الی {post.maxLevel}</span>
                      </div>
                      <div className="bg-white/[0.04] p-2 rounded-xl">
                        <span className="text-slate-500 block text-[10px]">پست مورد نیاز:</span>
                        <span className="font-bold text-[#ff6b81]">
                          {post.preferredSide === 'left'
                            ? 'سمت چپ (Reves)'
                            : post.preferredSide === 'right'
                            ? 'سمت راست (Drive)'
                            : 'فرقی ندارد (هر دو)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action & Cost */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-slate-500 text-[10px] block">سهم پرداختی:</span>
                    <span className="text-sm font-black text-slate-100">
                      {post.costPerPerson.toLocaleString('fa-IR')}{' '}
                      <span className="text-[10px] text-slate-500">تومان</span>
                    </span>
                  </div>

                  {isHost ? (
                    <span className="text-xs text-slate-500 font-bold">آگهی شما</span>
                  ) : isJoined ? (
                    <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      شما ملحق شده‌اید
                    </span>
                  ) : isFilled ? (
                    <span className="text-xs text-slate-500 font-bold">تکمیل شده</span>
                  ) : (
                    <button
                      onClick={() => joinNeedPlayerPost(post.id)}
                      className="px-4 py-2 bg-[#ff2d55] hover:bg-[#8fd126] text-white font-black text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>اعلام آمادگی و پیوستن</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Sub-Tab 2: Free Agent Market Directory */}
      {activeSubTab === 'market' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredAgents.map((agent) => {
            const isMe = agent.id === playerProfile.id;
            return (
              <div
                key={agent.id}
                className="rounded-3xl bg-white/[0.06] border border-white/10 p-5 space-y-4 hover:border-white/10 transition relative flex flex-col justify-between shadow-md"
                style={{
                  borderTop: `4px solid ${agent.themeColor}`,
                }}
              >
                <div>
                  {/* Avatar & Level */}
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2"
                        style={{ borderColor: agent.themeColor }}
                      />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-black" />
                    </div>

                    <div className="text-left space-y-1">
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: agent.themeColor, color: '#000' }}
                      >
                        سطح {levelToGrade(agent.level)} · {gradeBandFa(levelToGrade(agent.level))}
                      </span>
                      <p className="text-[10px] text-slate-500 font-semibold">رنک #{agent.rankingPosition}</p>
                    </div>
                  </div>

                  {/* Name & Title */}
                  <div className="mt-3">
                    <h3 className="text-base font-black text-slate-100">{agent.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {agent.city} ({agent.province})
                    </p>
                  </div>

                  {/* Player Specifications */}
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">سمت ترجیحی:</span>
                      <span className="font-bold text-[#ff6b81]">
                        {agent.preferredSide === 'left'
                          ? 'Reves (سمت چپ)'
                          : agent.preferredSide === 'right'
                          ? 'Drive (سمت راست)'
                          : 'هر دو سمت'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">دست غالب:</span>
                      <span className="font-bold text-slate-300">
                        {agent.hand === 'right' ? 'راست‌دست' : 'چپ‌دست (گوهر پدل)'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">راکت:</span>
                      <span className="font-bold text-slate-400 truncate max-w-[130px]">
                        {agent.racketBrand} {agent.racketModel}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">اطمینان حضور:</span>
                      <span className="font-bold text-cyan-400">{agent.reliabilityScore}٪</span>
                    </div>

                    {agent.freeAgentNote && (
                      <p className="p-2.5 rounded-xl bg-white/[0.05] text-[11px] text-slate-400 border border-white/10 mt-2 leading-relaxed">
                        {agent.freeAgentNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Invite CTA Button */}
                <div className="pt-4 border-t border-white/10">
                  {isMe ? (
                    <span className="block text-center text-xs font-bold text-slate-500 py-1">
                      پروفایل شما
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowInviteModal(agent)}
                      className="w-full py-2.5 bg-[#ff2d55] hover:bg-[#8fd126] text-white font-black text-xs rounded-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>دعوت فوری به مسابقه / سانس</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Need Player Request */}
      {showCreateRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl glass-strong p-6 shadow-2xl space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#ff6b81]" />
                <h3 className="text-base font-black text-slate-100">ثبت آگهی نیاز به بازیکن آزاد</h3>
              </div>
              <button
                onClick={() => setShowCreateRequestModal(false)}
                className="text-slate-500 hover:text-slate-100 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">باشگاهی که زمین را رزرو کرده‌اید:</label>
                <input
                  type="text"
                  required
                  value={reqClubName}
                  onChange={(e) => setReqClubName(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">تاریخ سانس:</label>
                  <input
                    type="text"
                    value={reqDate}
                    onChange={(e) => setReqDate(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">ساعت سانس:</label>
                  <input
                    type="text"
                    value={reqTime}
                    onChange={(e) => setReqTime(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">تعداد بازیکن مورد نیاز:</label>
                  <select
                    value={reqSpots}
                    onChange={(e) => setReqSpots(Number(e.target.value))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value={1}>۱ نفر</option>
                    <option value={2}>۲ نفر</option>
                    <option value={3}>۳ نفر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">پست مورد نیاز:</label>
                  <select
                    value={reqSide}
                    onChange={(e) => setReqSide(e.target.value as PlayingSide)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="left">سمت چپ (Reves)</option>
                    <option value="right">سمت راست (Drive)</option>
                    <option value="both">فرقی ندارد</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">سهم هزینه هر نفر (تومان):</label>
                <input
                  type="number"
                  step="10000"
                  value={reqCost}
                  onChange={(e) => setReqCost(Number(e.target.value))}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">توضیحات و هماهنگی:</label>
                <textarea
                  rows={2}
                  value={reqNote}
                  onChange={(e) => setReqNote(e.target.value)}
                  placeholder="مثال: بازی سطح متوسط، دوستانه و پرانرژی..."
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#ff2d55] hover:bg-[#8fd126] text-white font-black rounded-xl cursor-pointer"
                >
                  ثبت در تابلوی بازیکنان آزاد
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateRequestModal(false)}
                  className="px-4 py-3 bg-white/[0.04] text-slate-400 font-bold rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Invite Free Agent */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl glass-strong p-6 shadow-2xl space-y-4 text-xs">
            <div className="text-center space-y-2">
              <img
                src={showInviteModal.avatar}
                alt={showInviteModal.name}
                className="w-16 h-16 rounded-2xl mx-auto object-cover ring-2"
                style={{ borderColor: showInviteModal.themeColor }}
              />
              <h3 className="text-base font-black text-slate-100">دعوت از {showInviteModal.name}</h3>
              <p className="text-slate-500 flex items-center justify-center gap-1.5">
                سطح بازی: <GradeBadge grade={levelToGrade(showInviteModal.level)} className="text-[10px] min-w-[1.8rem]" /> | پست: {showInviteModal.preferredSide === 'left' ? 'چپ' : 'راست'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-400 font-bold">انتخاب مسابقه یا سانس برای ارسال دعوت‌نامه:</label>
              <select
                value={selectedMatchToInvite}
                onChange={(e) => setSelectedMatchToInvite(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
              >
                <option value="">یک مسابقه انتخاب کنید...</option>
                {openMatches.map((m) => (
                  <option key={m.id} value={m.title}>
                    {m.title} ({m.date})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleSendInvite}
                className="flex-1 py-2.5 bg-[#ff2d55] hover:bg-[#8fd126] text-white font-black rounded-xl cursor-pointer"
              >
                ارسال دعوت‌نامه پیامکی و نوتیفیکیشن
              </button>
              <button
                onClick={() => setShowInviteModal(null)}
                className="px-4 py-2.5 bg-white/[0.04] text-slate-400 rounded-xl cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
