import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Booking,
  BracketMatch,
  Club,
  Coach,
  CoachBooking,
  Court,
  NeedPlayerPost,
  OpenMatch,
  PlayerProfile,
  RankingPlayer,
  Tournament,
  UserRole
} from '../types';
import {
  initialClubs,
  initialCoaches,
  initialFreeAgents,
  initialNeedPlayerPosts,
  initialOpenMatches,
  initialPlayerProfile,
  initialRankings,
  initialTournaments
} from '../mockData';

export type ActiveTab =
  | 'booking'
  | 'matchmaking'
  | 'free-agents'
  | 'tournaments'
  | 'coaches'
  | 'profile'
  | 'club-owner';

interface PadelContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileDeviceView: boolean;
  setIsMobileDeviceView: (val: boolean) => void;
  playerProfile: PlayerProfile;
  updatePlayerProfile: (updates: Partial<PlayerProfile>) => void;
  clubs: Club[];
  addClub: (club: Omit<Club, 'id' | 'rating' | 'reviewCount'>) => Club;
  addCourtToClub: (clubId: string, court: Omit<Court, 'id' | 'clubId'>) => void;
  bookings: Booking[];
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  cancelBooking: (bookingId: string) => void;
  openMatches: OpenMatch[];
  createOpenMatch: (matchData: Omit<OpenMatch, 'id' | 'slots' | 'status'>) => OpenMatch;
  joinMatchSlot: (matchId: string, slotNumber: number) => boolean;
  leaveMatchSlot: (matchId: string, slotNumber: number) => void;
  needPlayerPosts: NeedPlayerPost[];
  createNeedPlayerPost: (post: Omit<NeedPlayerPost, 'id' | 'joinedPlayers' | 'status'>) => void;
  joinNeedPlayerPost: (postId: string) => boolean;
  freeAgents: PlayerProfile[];
  toggleFreeAgentStatus: (available: boolean, note?: string) => void;
  inviteFreeAgent: (agentId: string, matchTitle: string) => void;
  coaches: Coach[];
  coachBookings: CoachBooking[];
  bookCoach: (booking: Omit<CoachBooking, 'id' | 'status'>) => CoachBooking;
  tournaments: Tournament[];
  createTournament: (tourn: Omit<Tournament, 'id' | 'registeredTeamsCount' | 'registeredTeams' | 'status'>) => Tournament;
  registerTournamentTeam: (tournId: string, teamName: string, partnerName: string, partnerLevel: number) => boolean;
  finalizeTournamentResults: (tournId: string, winnerTeamId: string, runnerUpTeamId: string) => void;
  updateTournamentBracketMatch: (tournId: string, matchId: string, winnerId: string, score: number[]) => void;
  // Role & Admin Permissions
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  adminClubId: string;
  setAdminClubId: (clubId: string) => void;
  adminProvince: string;
  setAdminProvince: (province: string) => void;
  rankings: RankingPlayer[];
  selectedProvince: string;
  setSelectedProvince: (prov: string) => void;
  // Supabase / Cloud config
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseConfig: { url: string; anonKey: string };
  setSupabaseConfig: (configOrUrl: { url: string; anonKey: string } | string, key?: string) => void;
  isSupabaseConfigured: boolean;
  isSupabaseConnected: boolean;
  syncNotification: string | null;
  setSyncNotification: (msg: string | null) => void;
  resetAllDataToDefaults: () => void;
}

const PadelContext = createContext<PadelContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'padelpro_v1_';

function getInitialData<T>(key: string, defaultVal: T): T {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
  }
  return defaultVal;
}

export const PadelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('booking');
  const [isMobileDeviceView, setIsMobileDeviceView] = useState<boolean>(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('همه استان‌ها');

  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() =>
    getInitialData('profile', initialPlayerProfile)
  );

  const [clubs, setClubs] = useState<Club[]>(() =>
    getInitialData('clubs', initialClubs)
  );

  const [bookings, setBookings] = useState<Booking[]>(() =>
    getInitialData('bookings', [])
  );

  const [openMatches, setOpenMatches] = useState<OpenMatch[]>(() =>
    getInitialData('open_matches', initialOpenMatches)
  );

  const [needPlayerPosts, setNeedPlayerPosts] = useState<NeedPlayerPost[]>(() =>
    getInitialData('need_players', initialNeedPlayerPosts)
  );

  const [freeAgents, setFreeAgents] = useState<PlayerProfile[]>(() =>
    getInitialData('free_agents', initialFreeAgents)
  );

  const [coaches] = useState<Coach[]>(() =>
    getInitialData('coaches', initialCoaches)
  );

  const [coachBookings, setCoachBookings] = useState<CoachBooking[]>(() =>
    getInitialData('coach_bookings', [])
  );

  const [tournaments, setTournaments] = useState<Tournament[]>(() =>
    getInitialData('tournaments', initialTournaments)
  );

  const [rankings, setRankings] = useState<RankingPlayer[]>(() =>
    getInitialData('rankings', initialRankings)
  );

  // Role Management State
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() =>
    (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'user_role') as UserRole) || 'player'
  );
  const [adminClubId, setAdminClubId] = useState<string>(() =>
    localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_club_id') || 'club-1'
  );
  const [adminProvince, setAdminProvince] = useState<string>(() =>
    localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_province') || 'تهران'
  );

  const [supabaseUrl, setSupabaseUrl] = useState<string>(() =>
    localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'sb_url') || ''
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>(() =>
    localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'sb_key') || ''
  );
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'user_role', currentUserRole);
  }, [currentUserRole]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_club_id', adminClubId);
  }, [adminClubId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_province', adminProvince);
  }, [adminProvince]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'profile', JSON.stringify(playerProfile));
  }, [playerProfile]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'clubs', JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'open_matches', JSON.stringify(openMatches));
  }, [openMatches]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'need_players', JSON.stringify(needPlayerPosts));
  }, [needPlayerPosts]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'free_agents', JSON.stringify(freeAgents));
  }, [freeAgents]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'coach_bookings', JSON.stringify(coachBookings));
  }, [coachBookings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'tournaments', JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'rankings', JSON.stringify(rankings));
  }, [rankings]);

  const updatePlayerProfile = (updates: Partial<PlayerProfile>) => {
    setPlayerProfile((prev) => {
      const updated = { ...prev, ...updates };
      // Also update in free agents if isFreeAgent
      if (updated.isFreeAgent) {
        setFreeAgents((agents) => {
          const exists = agents.some((a) => a.id === updated.id);
          if (exists) {
            return agents.map((a) => (a.id === updated.id ? updated : a));
          } else {
            return [updated, ...agents];
          }
        });
      } else {
        setFreeAgents((agents) => agents.filter((a) => a.id !== updated.id));
      }
      return updated;
    });
  };

  const addClub = (clubData: Omit<Club, 'id' | 'rating' | 'reviewCount'>): Club => {
    const newClub: Club = {
      ...clubData,
      id: `club-${Date.now()}`,
      rating: 5.0,
      reviewCount: 1,
    };
    setClubs((prev) => [newClub, ...prev]);
    setSyncNotification(`باشگاه «${newClub.name}» با موفقیت افزوده شد!`);
    return newClub;
  };

  const addCourtToClub = (clubId: string, courtData: Omit<Court, 'id' | 'clubId'>) => {
    const newCourt: Court = {
      ...courtData,
      id: `court-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      clubId,
    };

    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === clubId) {
          const updatedCourts = [...c.courts, newCourt];
          return {
            ...c,
            courtsCount: updatedCourts.length,
            courts: updatedCourts,
          };
        }
        return c;
      })
    );
    setSyncNotification(`زمین جدید به باشگاه اضافه شد.`);
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking => {
    const newBooking: Booking = {
      ...bookingData,
      id: `booking-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [newBooking, ...prev]);

    // If host needs players, automatically create a NeedPlayerPost!
    if (newBooking.playersNeeded > 0) {
      const needPost: NeedPlayerPost = {
        id: `np-${Date.now()}`,
        bookingId: newBooking.id,
        clubName: newBooking.clubName,
        province: playerProfile.province,
        date: newBooking.date,
        time: newBooking.timeSlot,
        spotsNeeded: newBooking.playersNeeded,
        preferredSide: 'both',
        minLevel: Math.max(1, playerProfile.level - 0.7),
        maxLevel: Math.min(7, playerProfile.level + 0.8),
        costPerPerson: newBooking.splitPricePerPerson,
        hostPlayerId: playerProfile.id,
        hostName: playerProfile.name,
        hostAvatar: playerProfile.avatar,
        hostLevel: playerProfile.level,
        note: `زمین توسط ${playerProfile.name} رزرو شده و به ${newBooking.playersNeeded} بازیکن هم‌سطح احتیاج داریم.`,
        joinedPlayers: [],
        status: 'active',
      };
      setNeedPlayerPosts((prev) => [needPost, ...prev]);
    }

    setSyncNotification(`زمین «${newBooking.courtName}» با موفقیت برای شما رزرو شد!`);
    return newBooking;
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    setSyncNotification('رزرو سانس با موفقیت لغو گردید.');
  };

  const createOpenMatch = (matchData: Omit<OpenMatch, 'id' | 'slots' | 'status'>): OpenMatch => {
    const newMatch: OpenMatch = {
      ...matchData,
      id: `match-${Date.now()}`,
      status: 'open',
      slots: [
        {
          slotNumber: 1,
          team: 1,
          side: playerProfile.preferredSide === 'both' ? 'left' : playerProfile.preferredSide,
          playerId: playerProfile.id,
          playerName: playerProfile.name,
          playerAvatar: playerProfile.avatar,
          playerLevel: playerProfile.level,
        },
        { slotNumber: 2, team: 1, side: playerProfile.preferredSide === 'left' ? 'right' : 'left' },
        { slotNumber: 3, team: 2, side: 'left' },
        { slotNumber: 4, team: 2, side: 'right' },
      ],
    };
    setOpenMatches((prev) => [newMatch, ...prev]);
    setSyncNotification(`مسابقه جدید در ${newMatch.clubName} ایجاد شد.`);
    return newMatch;
  };

  const joinMatchSlot = (matchId: string, slotNumber: number): boolean => {
    let success = false;
    setOpenMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          // Check if player already joined another slot
          const alreadyIn = m.slots.some((s) => s.playerId === playerProfile.id);
          if (alreadyIn) {
            setSyncNotification('شما قبلاً در این مسابقه شرکت کرده‌اید.');
            return m;
          }
          // Check level
          if (playerProfile.level < m.minLevel - 0.2 || playerProfile.level > m.maxLevel + 0.2) {
            setSyncNotification(`سطح شما (${playerProfile.level}) با محدوده این مسابقه (${m.minLevel} - ${m.maxLevel}) منطبق نیست.`);
          }

          const updatedSlots = m.slots.map((slot) => {
            if (slot.slotNumber === slotNumber && !slot.playerId) {
              success = true;
              return {
                ...slot,
                playerId: playerProfile.id,
                playerName: playerProfile.name,
                playerAvatar: playerProfile.avatar,
                playerLevel: playerProfile.level,
              };
            }
            return slot;
          });

          const isFull = updatedSlots.every((s) => s.playerId);

          return {
            ...m,
            slots: updatedSlots,
            status: isFull ? 'full' : 'open',
          };
        }
        return m;
      })
    );

    if (success) {
      setSyncNotification('شما با موفقیت به مسابقه پیوستید!');
    }
    return success;
  };

  const leaveMatchSlot = (matchId: string, slotNumber: number) => {
    setOpenMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          const updatedSlots = m.slots.map((s) => {
            if (s.slotNumber === slotNumber && s.playerId === playerProfile.id) {
              return {
                slotNumber: s.slotNumber,
                team: s.team,
                side: s.side,
              };
            }
            return s;
          });
          return {
            ...m,
            slots: updatedSlots,
            status: 'open',
          };
        }
        return m;
      })
    );
    setSyncNotification('شما از این مسابقه انصراف دادید.');
  };

  const createNeedPlayerPost = (postData: Omit<NeedPlayerPost, 'id' | 'joinedPlayers' | 'status'>) => {
    const newPost: NeedPlayerPost = {
      ...postData,
      id: `np-${Date.now()}`,
      joinedPlayers: [],
      status: 'active',
    };
    setNeedPlayerPosts((prev) => [newPost, ...prev]);
    setSyncNotification('آگهی نیاز به بازیکن با موفقیت منتشر شد.');
  };

  const joinNeedPlayerPost = (postId: string): boolean => {
    let success = false;
    setNeedPlayerPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          if (p.hostPlayerId === playerProfile.id) {
            setSyncNotification('شما خودتان میزبان این سانس هستید.');
            return p;
          }
          if (p.joinedPlayers.some((j) => j.playerId === playerProfile.id)) {
            setSyncNotification('شما قبلاً به این بازی پیوسته‌اید.');
            return p;
          }
          if (p.spotsNeeded <= p.joinedPlayers.length) {
            setSyncNotification('ظرفیت این درخواست تکمیل شده است.');
            return p;
          }

          success = true;
          const updatedJoined = [
            ...p.joinedPlayers,
            {
              playerId: playerProfile.id,
              playerName: playerProfile.name,
              avatar: playerProfile.avatar,
              level: playerProfile.level,
              side: playerProfile.preferredSide,
            },
          ];

          return {
            ...p,
            joinedPlayers: updatedJoined,
            status: updatedJoined.length >= p.spotsNeeded ? 'filled' : 'active',
          };
        }
        return p;
      })
    );
    if (success) {
      setSyncNotification('درخواست پیوستن شما به عنوان بازیکن آزاد ثبت شد!');
    }
    return success;
  };

  const toggleFreeAgentStatus = (available: boolean, note?: string) => {
    updatePlayerProfile({
      isFreeAgent: available,
      freeAgentNote: note || playerProfile.freeAgentNote,
    });
    setSyncNotification(
      available
        ? 'وضعیت شما به "بازیکن آزاد آماده به بازی" تغییر یافت.'
        : 'وضعیت بازیکن آزاد شما غیرفعال شد.'
    );
  };

  const inviteFreeAgent = (agentId: string, matchTitle: string) => {
    const agent = freeAgents.find((a) => a.id === agentId);
    if (agent) {
      setSyncNotification(`دعوت‌نامه بازی «${matchTitle}» برای ${agent.name} با موفقیت ارسال شد.`);
    }
  };

  const bookCoach = (bookingData: Omit<CoachBooking, 'id' | 'status'>): CoachBooking => {
    const newBooking: CoachBooking = {
      ...bookingData,
      id: `cb-${Date.now()}`,
      status: 'confirmed',
    };
    setCoachBookings((prev) => [newBooking, ...prev]);
    setSyncNotification(`جلسه تمرینی با مربی ${newBooking.coachName} تایید و رزرو شد!`);
    return newBooking;
  };

  const createTournament = (
    tournData: Omit<Tournament, 'id' | 'registeredTeamsCount' | 'registeredTeams' | 'status'>
  ): Tournament => {
    const newTourn: Tournament = {
      ...tournData,
      id: `tourn-${Date.now()}`,
      registeredTeamsCount: 0,
      registeredTeams: [],
      status: 'registration',
    };
    setTournaments((prev) => [newTourn, ...prev]);
    setSyncNotification(`تورنومنت «${newTourn.title}» توسط باشگاه ثبت شد!`);
    return newTourn;
  };

  const registerTournamentTeam = (
    tournId: string,
    teamName: string,
    partnerName: string,
    partnerLevel: number
  ): boolean => {
    let success = false;
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournId) {
          if (t.registeredTeamsCount >= t.maxTeams) {
            setSyncNotification('ظرفیت ثبت‌نام این تورنومنت تکمیل شده است.');
            return t;
          }
          const isRegistered = t.registeredTeams.some(
            (tm) => tm.player1Name === playerProfile.name || tm.player2Name === playerProfile.name
          );
          if (isRegistered) {
            setSyncNotification('شما قبلاً در این تورنومنت تیم ثبت کرده‌اید.');
            return t;
          }

          success = true;
          const newTeam = {
            id: `tm-${Date.now()}`,
            teamName,
            player1Name: playerProfile.name,
            player1Level: playerProfile.level,
            player2Name: partnerName,
            player2Level: partnerLevel,
          };

          return {
            ...t,
            registeredTeamsCount: t.registeredTeamsCount + 1,
            registeredTeams: [...t.registeredTeams, newTeam],
          };
        }
        return t;
      })
    );

    if (success) {
      setSyncNotification(`تیم «${teamName}» با موفقیت در تورنومنت ثبت شد.`);
    }
    return success;
  };

  const finalizeTournamentResults = (
    tournId: string,
    winnerTeamName: string,
    runnerUpTeamName: string
  ) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournId) {
          return {
            ...t,
            status: 'completed',
            winnerTeam: winnerTeamName,
            runnerUpTeam: runnerUpTeamName,
          };
        }
        return t;
      })
    );

    // Update provincial rankings: add points
    setRankings((prev) => {
      return prev
        .map((player) => {
          let extraPoints = 0;
          let wonTourn = 0;
          if (winnerTeamName.includes(player.name)) {
            extraPoints = 250;
            wonTourn = 1;
          } else if (runnerUpTeamName.includes(player.name)) {
            extraPoints = 150;
          } else {
            extraPoints = 50; // participation
          }

          const newPoints = player.points + extraPoints;
          return {
            ...player,
            points: newPoints,
            tournamentsPlayed: player.tournamentsPlayed + 1,
            tournamentsWon: player.tournamentsWon + wonTourn,
            form: (['W', ...player.form.slice(0, 4)] as ('W' | 'L')[]),
          };
        })
        .sort((a, b) => b.points - a.points)
        .map((p, idx) => ({
          ...p,
          rank: idx + 1,
        }));
    });

    setSyncNotification(`نتایج تورنومنت ثبت شد و جدول رنکینگ استانی و کشوری آپدیت گردید!`);
  };

  const updateTournamentBracketMatch = (
    tournId: string,
    matchId: string,
    winnerId: string,
    score: number[]
  ) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== tournId || !t.bracket) return t;

        const matchIdx = t.bracket.findIndex((m) => m.id === matchId);
        if (matchIdx === -1) return t;

        const currentMatch = t.bracket[matchIdx];
        const isTeam1Winner = currentMatch.team1?.id === winnerId;
        const winnerTeam = isTeam1Winner ? currentMatch.team1 : currentMatch.team2;

        const updatedMatches = [...t.bracket];
        updatedMatches[matchIdx] = {
          ...currentMatch,
          status: 'completed',
          winnerId,
          team1: currentMatch.team1
            ? { ...currentMatch.team1, score: [score[0], score[1]], isWinner: isTeam1Winner }
            : undefined,
          team2: currentMatch.team2
            ? { ...currentMatch.team2, score: [score[2], score[3]], isWinner: !isTeam1Winner }
            : undefined,
        };

        // Advance to next round if applicable (e.g. semi -> final)
        if (currentMatch.round === 'semi' && winnerTeam) {
          const finalMatch = updatedMatches.find((m) => m.round === 'final');
          if (finalMatch) {
            if (currentMatch.matchNumber === 1) {
              finalMatch.team1 = { id: winnerTeam.id, name: winnerTeam.name };
            } else {
              finalMatch.team2 = { id: winnerTeam.id, name: winnerTeam.name };
            }
          }
        } else if (currentMatch.round === 'final' && winnerTeam) {
          // Tournament winner determined!
          return {
            ...t,
            status: 'completed',
            winnerTeam: winnerTeam.name,
            runnerUpTeam: isTeam1Winner ? currentMatch.team2?.name : currentMatch.team1?.name,
            bracket: updatedMatches,
          };
        }

        return {
          ...t,
          bracket: updatedMatches,
        };
      })
    );

    setSyncNotification('نتیجه مسابقه جدول تورنومنت با موفقیت ثبت و مسابقه بعدی بروزرسانی شد.');
  };

  const setSupabaseConfig = (configOrUrl: { url: string; anonKey: string } | string, key?: string) => {
    let finalUrl = '';
    let finalKey = '';
    if (typeof configOrUrl === 'object') {
      finalUrl = configOrUrl.url;
      finalKey = configOrUrl.anonKey;
    } else {
      finalUrl = configOrUrl;
      finalKey = key || '';
    }
    setSupabaseUrl(finalUrl);
    setSupabaseAnonKey(finalKey);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'sb_url', finalUrl);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'sb_key', finalKey);
    setSyncNotification('اتصال و تنظیمات دیتابیس Supabase ذخیره شد.');
  };

  const resetAllDataToDefaults = () => {
    localStorage.clear();
    setPlayerProfile(initialPlayerProfile);
    setClubs(initialClubs);
    setBookings([]);
    setOpenMatches(initialOpenMatches);
    setNeedPlayerPosts(initialNeedPlayerPosts);
    setFreeAgents(initialFreeAgents);
    setTournaments(initialTournaments);
    setRankings(initialRankings);
    setSyncNotification('اطلاعات به وضعیت پیش‌فرض بازگردانی شد.');
  };

  return (
    <PadelContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isMobileDeviceView,
        setIsMobileDeviceView,
        playerProfile,
        updatePlayerProfile,
        clubs,
        addClub,
        addCourtToClub,
        bookings,
        createBooking,
        cancelBooking,
        openMatches,
        createOpenMatch,
        joinMatchSlot,
        leaveMatchSlot,
        needPlayerPosts,
        createNeedPlayerPost,
        joinNeedPlayerPost,
        freeAgents,
        toggleFreeAgentStatus,
        inviteFreeAgent,
        coaches,
        coachBookings,
        bookCoach,
        tournaments,
        createTournament,
        registerTournamentTeam,
        finalizeTournamentResults,
        updateTournamentBracketMatch,
        currentUserRole,
        setCurrentUserRole,
        adminClubId,
        setAdminClubId,
        adminProvince,
        setAdminProvince,
        rankings,
        selectedProvince,
        setSelectedProvince,
        supabaseUrl,
        supabaseAnonKey,
        supabaseConfig: { url: supabaseUrl, anonKey: supabaseAnonKey },
        setSupabaseConfig,
        isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
        isSupabaseConnected: Boolean(supabaseUrl && supabaseAnonKey),
        syncNotification,
        setSyncNotification,
        resetAllDataToDefaults,
      }}
    >
      {children}
    </PadelContext.Provider>
  );
};

export const usePadel = () => {
  const context = useContext(PadelContext);
  if (!context) {
    throw new Error('usePadel must be used within a PadelProvider');
  }
  return context;
};
