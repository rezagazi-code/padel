import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { Tournament, TournamentCategory, TournamentFormat, UserRole } from '../types';
import { PROVINCES_LIST } from '../mockData';
import { TournamentBracket } from './TournamentBracket';
import {
  Trophy,
  Award,
  Medal,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  PlusCircle,
  TrendingUp,
  MapPin,
  Sparkles,
  ShieldAlert,
  Flame,
  X,
  Play,
  ShieldCheck,
  Building2,
  Landmark,
  Eye,
  Info,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TournamentsView: React.FC = () => {
  const {
    tournaments,
    createTournament,
    registerTournamentTeam,
    finalizeTournamentResults,
    updateTournamentBracketMatch,
    rankings,
    playerProfile,
    clubs,
    selectedProvince,
    setSelectedProvince,
    currentUserRole,
    setCurrentUserRole,
    adminClubId,
    setAdminClubId,
    adminProvince,
    setAdminProvince
  } = usePadel();

  const [activeTab, setActiveTab] = useState<'tournaments' | 'rankings'>('tournaments');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [expandedBracketTournId, setExpandedBracketTournId] = useState<string | null>('tourn-1');
  
  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState<Tournament | null>(null);
  const [teamNameInput, setTeamNameInput] = useState('');
  const [partnerNameInput, setPartnerNameInput] = useState('');
  const [partnerLevelInput, setPartnerLevelInput] = useState<number>(3.6);

  const [showCreateTournModal, setShowCreateTournModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState<Tournament | null>(null);
  const [winnerTeamInput, setWinnerTeamInput] = useState('');
  const [runnerUpTeamInput, setRunnerUpTeamInput] = useState('');

  // Create Tournament Form
  const [newTitle, setNewTitle] = useState('');
  const [newClubId, setNewClubId] = useState(adminClubId || clubs[0]?.id || '');
  const [newOrganizerType, setNewOrganizerType] = useState<'club' | 'province'>('club');
  const [newCategory, setNewCategory] = useState<TournamentCategory>('Cat 1 (پیشرفته)');
  const [newFormat, setNewFormat] = useState<TournamentFormat>('Group + Knockout (گروهی و حذفی)');
  const [newStartDate, setNewStartDate] = useState('۱۴۰۳/۰۷/۱۵');
  const [newEndDate, setNewEndDate] = useState('۱۴۰۳/۰۷/۱۷');
  const [newDeadline, setNewDeadline] = useState('۱۴۰۳/۰۷/۱۲');
  const [newEntryFee, setNewEntryFee] = useState<number>(1500000);
  const [newPrizePool, setNewPrizePool] = useState('۵۰,۰۰۰,۰۰۰ تومان وجه نقد + مدال');
  const [newMaxTeams, setNewMaxTeams] = useState<number>(16);

  // Check RBAC permission for tournament creation
  const canCreateTournament =
    currentUserRole === 'club_admin' ||
    currentUserRole === 'province_admin' ||
    currentUserRole === 'super_admin';

  const canManageTournament = (tourn: Tournament) => {
    if (currentUserRole === 'super_admin') return true;
    if (currentUserRole === 'province_admin' && tourn.province === adminProvince) return true;
    if (currentUserRole === 'club_admin' && tourn.clubId === adminClubId) return true;
    return false;
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (selectedProvince !== 'همه استان‌ها' && t.province !== selectedProvince) return false;
    return true;
  });

  const filteredRankings = rankings.filter((r) => {
    if (selectedProvince !== 'همه استان‌ها' && r.province !== selectedProvince) return false;
    return true;
  });

  const handleRegisterTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRegisterModal) return;

    const success = registerTournamentTeam(
      showRegisterModal.id,
      teamNameInput || `تیم ${playerProfile.name}`,
      partnerNameInput || 'هم‌تیمی انتخابی',
      partnerLevelInput
    );

    if (success) {
      setShowRegisterModal(null);
      setTeamNameInput('');
      setPartnerNameInput('');
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    const club = clubs.find((c) => c.id === newClubId) || clubs[0];

    createTournament({
      title: newTitle || `جام پدل ${club.name}`,
      clubId: club.id,
      clubName: club.name,
      province: club.province,
      category: newCategory,
      format: newFormat,
      startDate: newStartDate,
      endDate: newEndDate,
      registrationDeadline: newDeadline,
      entryFee: Number(newEntryFee),
      prizePool: newPrizePool,
      maxTeams: Number(newMaxTeams),
      levelRange: '۳.۰۰+',
      bannerImage: club.coverImage,
      rules: [
        'مسابقات تحت استانداردهای فدراسیون بین‌المللی پدل FIP برگزار می‌شود.',
        'نتایج مستقیماً در رنکینگ رسمی استانی اعمال می‌گردد.',
      ],
    });

    setShowCreateTournModal(false);
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch {}
  };

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFinalizeModal) return;

    finalizeTournamentResults(showFinalizeModal.id, winnerTeamInput, runnerUpTeamInput);
    setShowFinalizeModal(null);
    try {
      confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 } });
    } catch {}
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/50 border border-slate-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              مرکز مسابقات رسمی، جام‌های استانی و رنکینگ کشوری
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              جام‌ها، تورنومنت‌های باشگاهی و رتبه‌بندی بازیکنان پدل
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              برگزاری تورنومنت و جدول‌های حذفی بر اساس سطح دسترسی (ادمین هر باشگاه برای مسابقات داخلی باشگاه، و ادمین استان برای جام‌های استانی) محدود شده است.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {canCreateTournament ? (
              <button
                onClick={() => setShowCreateTournModal(true)}
                className="glow-btn-lime flex items-center justify-center gap-2 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span>
                  {currentUserRole === 'province_admin'
                    ? 'ایجاد تورنومنت استانی (ادمین استان)'
                    : 'ایجاد تورنومنت باشگاهی (ادمین باشگاه)'}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ساخت تورنومنت مختص ادمین باشگاه یا استان است (برای تست نقش خود را تغییر دهید)</span>
              </div>
            )}
          </div>
        </div>

        {/* RBAC Role Switcher Bar */}
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#a3e635]" />
            <span className="text-slate-400 font-bold">نقش فعال کاربری شما (RBAC):</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-white font-black">
              {currentUserRole === 'player' && '🎾 بازیکن عادی (Player)'}
              {currentUserRole === 'club_admin' && '🏢 مدیر باشگاه پدل (Club Admin)'}
              {currentUserRole === 'province_admin' && '🏛️ مدیر و ناظر استان (Provincial Admin)'}
              {currentUserRole === 'super_admin' && '⚡ ادمین ارشد سراسری (Super Admin)'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 text-[11px]">تغییر نقش برای تست دسترسی‌ها:</span>
            <button
              onClick={() => setCurrentUserRole('player')}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-xs cursor-pointer ${
                currentUserRole === 'player' ? 'bg-white text-slate-950 font-black' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              بازیکن
            </button>
            <button
              onClick={() => {
                setCurrentUserRole('club_admin');
                setAdminClubId('club-1');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-xs cursor-pointer ${
                currentUserRole === 'club_admin' ? 'bg-[#a3e635] text-slate-950 font-black' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              ادمین باشگاه انقلاب
            </button>
            <button
              onClick={() => {
                setCurrentUserRole('province_admin');
                setAdminProvince('تهران');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-xs cursor-pointer ${
                currentUserRole === 'province_admin' ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              ادمین استان تهران
            </button>
          </div>
        </div>

        {/* Tab switcher: Tournaments vs Ranking */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'tournaments'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>تقویم تورنومنت‌های باشگاهی ({tournaments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'rankings'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Award className="w-4 h-4 text-[#a3e635]" />
              <span>جدول رنکینگ رسمی استانی و کشوری</span>
            </button>
          </div>

          {/* Province Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">استان:</span>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:border-[#a3e635] focus:outline-none"
            >
              {PROVINCES_LIST.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sub-Tab 1: Tournaments List */}
      {activeTab === 'tournaments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTournaments.map((tourn) => {
            const isFull = tourn.registeredTeamsCount >= tourn.maxTeams;
            const isCompleted = tourn.status === 'completed';

            return (
              <div
                key={tourn.id}
                className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden hover:border-slate-700 transition space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Tournament Banner Cover */}
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={tourn.bannerImage}
                      alt={tourn.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="bg-[#090d16]/80 backdrop-blur-md border border-slate-700 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                        {tourn.category}
                      </span>
                      <span className="bg-amber-500/90 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full">
                        {tourn.format}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-4 left-4">
                      <h3 className="text-lg font-black text-white drop-shadow-md">{tourn.title}</h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#a3e635]" />
                        {tourn.clubName} ({tourn.province})
                      </p>
                    </div>
                  </div>

                  {/* Details Content */}
                  <div className="p-5 space-y-4 text-xs">
                    
                    {/* Prize pool & Fee */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">مجموع جوایز و پاداش:</span>
                        <span className="text-sm font-black text-amber-400">{tourn.prizePool}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">ورودی تیم (دونفره):</span>
                        <span className="text-sm font-black text-white">
                          {(tourn.entryFee).toLocaleString('fa-IR')}{' '}
                          <span className="text-[10px] text-slate-400">تومان</span>
                        </span>
                      </div>
                    </div>

                    {/* Dates & Status */}
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        تاریخ برگزاری: {tourn.startDate} الی {tourn.endDate}
                      </span>

                      <span className="text-slate-400 font-bold">
                        تیم‌ها: {tourn.registeredTeamsCount} از {tourn.maxTeams}
                      </span>
                    </div>

                    {/* Progress Bar for Registration */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-[#a3e635]"
                        style={{
                          width: `${(tourn.registeredTeamsCount / tourn.maxTeams) * 100}%`,
                        }}
                      />
                    </div>

                    {/* If Completed, show Winner banner */}
                    {isCompleted && tourn.winnerTeam && (
                      <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-amber-400" />
                          <div>
                            <span className="text-[10px] text-amber-300/80 font-bold block">تیم قهرمان تورنومنت:</span>
                            <span className="text-xs font-black text-white">{tourn.winnerTeam}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                          +۲۵۰ امتیاز رنکینگ
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    {isCompleted ? (
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        این مسابقات با ثبت رسمی رنکینگ خاتمه یافته است.
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowRegisterModal(tourn)}
                          disabled={isFull}
                          className={`flex-1 py-3 font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            isFull
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'glow-btn-lime text-slate-950 font-black'
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          <span>{isFull ? 'ظرفیت تکمیل' : 'ثبت‌نام تیم در تورنومنت'}</span>
                        </button>

                        {/* RBAC Protected Finalize Button: only allowed for that club's admin or province admin */}
                        {canManageTournament(tourn) && (
                          <button
                            onClick={() => {
                              setShowFinalizeModal(tourn);
                              setWinnerTeamInput(tourn.registeredTeams[0]?.teamName || 'تیم قهرمان');
                              setRunnerUpTeamInput(tourn.registeredTeams[1]?.teamName || 'تیم نایب‌قهرمان');
                            }}
                            className="px-3.5 py-3 glow-btn-gold text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
                            title="ثبت نتایج توسط مسئول باشگاه و افزایش امتیازات رنکینگ بازیکنان"
                          >
                            ثبت نتایج و آپدیت رنک
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Toggle Bracket Display Button */}
                  <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between">
                    <button
                      onClick={() =>
                        setExpandedBracketTournId(
                          expandedBracketTournId === tourn.id ? null : tourn.id
                        )
                      }
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>
                        {expandedBracketTournId === tourn.id
                          ? 'بستن جدول و براکت حذفی'
                          : 'مشاهده جدول و خط‌کشی براکت مسابقات (Bracket)'}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedBracketTournId === tourn.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <span className="text-[10px] text-slate-400">
                      برگزارکننده: {tourn.organizerType === 'province' ? 'ادمین هیات استان' : `باشگاه ${tourn.clubName}`}
                    </span>
                  </div>

                  {/* Collapsible Tournament Bracket UI */}
                  {expandedBracketTournId === tourn.id && (
                    <div className="pt-3 border-t border-slate-800/80">
                      <TournamentBracket
                        bracket={tourn.bracket}
                        canManage={canManageTournament(tourn)}
                        onUpdateMatch={(matchId, winnerId, score) =>
                          updateTournamentBracketMatch(tourn.id, matchId, winnerId, score)
                        }
                        tournamentTitle={tourn.title}
                      />
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Sub-Tab 2: Official Rankings Table */}
      {activeTab === 'rankings' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Medal className="w-5 h-5 text-amber-400" />
                جدول رنکینگ رسمی بازیکنان پدل (مردان و آزاد)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                محاسبه خودکار امتیازات پس از هر تورنومنت در باشگاه‌های {selectedProvince}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <Sparkles className="w-4 h-4 text-[#a3e635]" />
              <span>موقعیت شما: رتبه #{playerProfile.rankingPosition} در {playerProfile.province}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">رتبه</th>
                  <th className="py-3.5 px-4">مشخصات بازیکن</th>
                  <th className="py-3.5 px-4">استان</th>
                  <th className="py-3.5 px-4">سطح پدل</th>
                  <th className="py-3.5 px-4">امتیاز رنکینگ</th>
                  <th className="py-3.5 px-4">تورنومنت‌ها (برد/بازی)</th>
                  <th className="py-3.5 px-4">درصد برد</th>
                  <th className="py-3.5 px-4">فرم اخیر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRankings.map((player) => {
                  const isMe = player.id === playerProfile.id;
                  return (
                    <tr
                      key={player.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isMe ? 'bg-[#a3e635]/10 font-bold' : ''
                      }`}
                    >
                      {/* Rank Position */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          {player.rank === 1 ? (
                            <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                              ۱
                            </span>
                          ) : player.rank === 2 ? (
                            <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-950 flex items-center justify-center font-black">
                              ۲
                            </span>
                          ) : player.rank === 3 ? (
                            <span className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center font-black">
                              ۳
                            </span>
                          ) : (
                            <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold">
                              {player.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Player */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                          />
                          <div>
                            <span className="font-bold text-white block">
                              {player.name} {isMe && <span className="text-[#a3e635] text-[10px]">(شما)</span>}
                            </span>
                            <span className="text-[10px] text-slate-400">رنک استان #{player.provinceRank}</span>
                          </div>
                        </div>
                      </td>

                      {/* Province */}
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                          {player.province}
                        </span>
                      </td>

                      {/* Level */}
                      <td className="py-4 px-4">
                        <span className="font-black text-[#a3e635]">
                          {player.level.toFixed(2)}
                        </span>
                      </td>

                      {/* Points */}
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm font-black text-cyan-400">
                          {player.points.toLocaleString('fa-IR')}{' '}
                          <span className="text-[10px] text-slate-400 font-sans">امتیاز</span>
                        </span>
                      </td>

                      {/* Tournaments */}
                      <td className="py-4 px-4 text-slate-300">
                        {player.tournamentsWon} قهرمانی / {player.tournamentsPlayed} جام
                      </td>

                      {/* Win Rate */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-emerald-400">{player.winRate}٪</span>
                      </td>

                      {/* Form */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          {player.form.map((res, i) => (
                            <span
                              key={i}
                              className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center ${
                                res === 'W'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              }`}
                            >
                              {res === 'W' ? 'W' : 'L'}
                            </span>
                          ))}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Modal: Register Team in Tournament */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">ثبت‌نام تیم در {showRegisterModal.title}</h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterTeam} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">نام انتخابی تیم:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تیم شاهین پایتخت"
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-400 block text-[11px]">بازیکن شماره ۱ (کاپیتان):</span>
                <div className="flex items-center justify-between text-white font-bold">
                  <span>{playerProfile.name}</span>
                  <span className="text-[#a3e635]">سطح {playerProfile.level.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نام پارتنر (بازیکن ۲):</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: علی شایان"
                    value={partnerNameInput}
                    onChange={(e) => setPartnerNameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">سطح پارتنر:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="7.0"
                    value={partnerLevelInput}
                    onChange={(e) => setPartnerLevelInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                مبلغ ورودی تیم: {showRegisterModal.entryFee.toLocaleString('fa-IR')} تومان به حساب باشگاه منظور خواهد شد.
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#a3e635] hover:bg-[#8fd126] text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  تایید و ثبت نهایی تیم در جدول
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(null)}
                  className="px-4 py-3 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Finalize Tournament Results */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">ثبت نتایج نهایی و آپدیت رنکینگ استانی</h3>
              </div>
              <button
                onClick={() => setShowFinalizeModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-400 text-[11px]">
              با ثبت نتایج، مسابقات {showFinalizeModal.title} به پایان رسیده و امتیازات به رنکینگ رسمی افزوده خواهد شد.
            </p>

            <form onSubmit={handleFinalize} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">تیم قهرمان (مقام اول - ۲۵۰ امتیاز):</label>
                <input
                  type="text"
                  required
                  value={winnerTeamInput}
                  onChange={(e) => setWinnerTeamInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">تیم نایب‌قهرمان (مقام دوم - ۱۵۰ امتیاز):</label>
                <input
                  type="text"
                  required
                  value={runnerUpTeamInput}
                  onChange={(e) => setRunnerUpTeamInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  ثبت نتایج و بروزرسانی جدول رنکینگ
                </button>
                <button
                  type="button"
                  onClick={() => setShowFinalizeModal(null)}
                  className="px-4 py-3 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Tournament by Club */}
      {showCreateTournModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#a3e635]" />
                <div>
                  <h3 className="text-base font-black text-white">
                    {currentUserRole === 'province_admin'
                      ? 'ایجاد تورنومنت استانی رسمی (سطح استان)'
                      : 'ایجاد تورنومنت باشگاهی (ویژه باشگاه)'}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    مجوز صادر شده برای: {currentUserRole === 'province_admin' ? `هیات پدل استان ${adminProvince}` : 'مدیریت باشگاه'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCreateTournModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان تورنومنت:</label>
                <input
                  type="text"
                  required
                  placeholder={currentUserRole === 'province_admin' ? 'مثال: مسابقات قهرمانی پدل استان تهران - جام فجر' : 'مثال: کاپ پاییزه پدل مارینا'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Organizer Scope Indicator */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-bold">سطح برگزاری و ناظر:</span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#a3e635]/15 text-[#a3e635] font-black border border-[#a3e635]/30">
                    {currentUserRole === 'province_admin' ? `🏛️ استانی (${adminProvince})` : '🏢 داخلی باشگاهی'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">باشگاه میزبان بازی‌ها:</label>
                  <select
                    value={newClubId}
                    onChange={(e) => setNewClubId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.province})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">فرمت مسابقه:</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as TournamentFormat)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Knockout (تک‌حذفی)">تک‌حذفی (Knockout با جدول خط‌کشی‌شده)</option>
                    <option value="Group + Knockout (گروهی و حذفی)">گروهی و حذفی</option>
                    <option value="Americano (آمریکانو)">آمریکانو (Americano)</option>
                    <option value="Mexicano (مکزیکانو)">مکزیکانو (Mexicano)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رده / سطح مسابقه:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TournamentCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Cat 1 (پیشرفته)">رده ۱ (پیشرفته)</option>
                    <option value="Cat 2 (متوسط)">رده ۲ (متوسط)</option>
                    <option value="بانوان">بانوان</option>
                    <option value="مختلط (Mixed)">مختلط (Mixed)</option>
                    <option value="Open">اوپن (آزاد سراسری)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">ظرفیت تیم‌ها:</label>
                  <select
                    value={newMaxTeams}
                    onChange={(e) => setNewMaxTeams(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value={8}>۸ تیم (دونفره)</option>
                    <option value={12}>۱۲ تیم</option>
                    <option value={16}>۱۶ تیم</option>
                    <option value={32}>۳۲ تیم</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ورودی هر تیم (تومان):</label>
                  <input
                    type="number"
                    step="100000"
                    value={newEntryFee}
                    onChange={(e) => setNewEntryFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">جوایز و پاداش نقدی:</label>
                  <input
                    type="text"
                    value={newPrizePool}
                    onChange={(e) => setNewPrizePool(e.target.value)}
                    placeholder="مثال: ۴۰ میلیون تومان وجه نقد"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#a3e635] hover:bg-[#8fd126] text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  ثبت رسمی تورنومنت در تقویم
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTournModal(false)}
                  className="px-4 py-3 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
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
