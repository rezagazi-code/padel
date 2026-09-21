export type PlayingSide = 'left' | 'right' | 'both'; // Reves (چپ) | Drive (راست) | هر دو
export type HandDominance = 'right' | 'left';
export type PlayingHand = HandDominance;
export type MatchType = 'competitive' | 'friendly';
export type CourtSurface = 'Mondo Supercourt 4NX' | 'Texturised Synthetic' | 'Classic Turf';
export type CourtType = 'panoramic' | 'indoor' | 'outdoor' | 'semi-covered';
export type TournamentCategory = 'Open' | 'Cat 1 (پیشرفته)' | 'Cat 2 (متوسط)' | 'Cat 3 (مبتدی)' | 'بانوان' | 'مختلط (Mixed)';
export type TournamentFormat = 'Knockout (تک‌حذفی)' | 'Americano (آمریکانو)' | 'Mexicano (مکزیکانو)' | 'Group + Knockout (گروهی و حذفی)';

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  themeColor: string; // Hex color for player card
  level: number; // e.g. 3.75 (from 1.00 to 7.00)
  levelTitle: string; // e.g. 'پیشرفته (Advanced)'
  hand: HandDominance;
  preferredSide: PlayingSide;
  racketBrand: string;
  racketModel: string;
  province: string;
  city: string;
  phone: string;
  email: string;
  bio: string;
  reliabilityScore: number; // e.g. 98%
  rankingPoints: number; // e.g. 1540 pts
  rankingPosition: number; // e.g. #4 in Province
  matchesPlayed: number;
  matchesWon: number;
  winRate?: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
  isFreeAgent: boolean; // آماده به عنوان بازیکن آزاد
  freeAgentNote?: string;
  availableDays?: string[];
  recentMatches?: {
    id: string;
    date: string;
    opponent: string;
    partner: string;
    score: string;
    won: boolean;
    levelChange: number;
  }[];
}

export interface Court {
  id: string;
  clubId: string;
  name: string;
  courtNumber: number;
  type: CourtType;
  surface: CourtSurface;
  turfColor: string;
  hourlyRate: number; // in Tomans
  peakHourlyRate: number;
  isAvailable: boolean;
  hasLighting?: boolean;
  hasCameras?: boolean;
}

export interface Club {
  id: string;
  name: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  coverImage: string;
  galleryImages: string[];
  rating: number;
  reviewCount: number;
  courtsCount: number;
  courts: Court[];
  amenities: string[]; // e.g. 'شیشه پانورامیک', 'سیستم نور LED 500 Lux', 'کافه و رستوران', 'پارکینگ اختصاصی', 'فروشگاه تجهیزات (Pro Shop)', 'رختکن و دوش آب گرم'
  openingHour: string; // e.g. "07:00"
  closingHour: string; // e.g. "24:00"
  ownerName: string;
  ownerPhone: string;
}

export interface TimeSlot {
  id: string;
  time: string; // e.g. "18:00 - 19:30"
  price: number;
  isPeak: boolean;
  status: 'available' | 'booked' | 'selected';
  bookedBy?: string;
}

export interface Booking {
  id: string;
  clubId: string;
  clubName: string;
  courtId: string;
  courtName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  durationMinutes: number;
  totalPrice: number;
  splitPricePerPerson: number;
  paymentStatus: 'paid' | 'pending' | 'split_active';
  bookedByPlayerId: string;
  bookedByPlayerName: string;
  playersNeeded: number; // e.g. if host needs players
  createdAt: string;
}

export interface OpenMatch {
  id: string;
  title: string;
  clubId: string;
  clubName: string;
  courtName: string;
  date: string;
  time: string;
  type: MatchType;
  minLevel: number;
  maxLevel: number;
  pricePerPlayer: number;
  gender: 'all' | 'men' | 'women' | 'mixed';
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorLevel: number;
  // 4 Player Slots (2 vs 2)
  slots: {
    slotNumber: number;
    team: 1 | 2;
    side: PlayingSide;
    playerId?: string;
    playerName?: string;
    playerAvatar?: string;
    playerLevel?: number;
  }[];
  status: 'open' | 'full' | 'in_progress' | 'completed';
  result?: {
    team1Score: number[];
    team2Score: number[];
  };
}

export interface NeedPlayerPost {
  id: string;
  bookingId?: string;
  clubName: string;
  province: string;
  date: string;
  time: string;
  spotsNeeded: number;
  preferredSide: PlayingSide;
  minLevel: number;
  maxLevel: number;
  costPerPerson: number;
  hostPlayerId: string;
  hostName: string;
  hostAvatar: string;
  hostLevel: number;
  note: string;
  joinedPlayers: {
    playerId: string;
    playerName: string;
    avatar: string;
    level: number;
    side: PlayingSide;
  }[];
  status: 'active' | 'filled';
}

export interface Coach {
  id: string;
  name: string;
  avatar: string;
  title: string;
  fipCertification: string; // e.g. 'مدرک بین‌المللی FIP سطح ۲'
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  province: string;
  clubs: string[]; // Club names they operate at
  hourlyRate: number;
  bio: string;
  specialties: string[];
  availableDays: string[];
  availableHours: string[];
}

export interface CoachBooking {
  id: string;
  coachId: string;
  coachName: string;
  clubName: string;
  date: string;
  time: string;
  sessionType: '1-on-1' | 'Duo Clinic' | 'Group Clinic' | 'Tactical Assessment';
  price: number;
  playerName: string;
  playerPhone: string;
  status: 'confirmed' | 'pending';
}

export type UserRole = 'player' | 'club_admin' | 'province_admin' | 'super_admin';

export interface BracketMatch {
  id: string;
  round: 'round_16' | 'quarter' | 'semi' | 'final';
  roundName: string;
  matchNumber: number;
  team1?: {
    id: string;
    name: string;
    score?: number[];
    isWinner?: boolean;
    seed?: number;
  };
  team2?: {
    id: string;
    name: string;
    score?: number[];
    isWinner?: boolean;
    seed?: number;
  };
  courtName?: string;
  scheduledTime?: string;
  status: 'pending' | 'in_progress' | 'completed';
  winnerId?: string;
}

export interface Tournament {
  id: string;
  title: string;
  clubId: string;
  clubName: string;
  province: string;
  category: TournamentCategory;
  format: TournamentFormat;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  entryFee: number;
  prizePool: string;
  maxTeams: number;
  registeredTeamsCount: number;
  levelRange: string;
  status: 'registration' | 'ongoing' | 'completed';
  bannerImage: string;
  rules: string[];
  registeredTeams: {
    id: string;
    teamName: string;
    player1Name: string;
    player1Level: number;
    player2Name: string;
    player2Level: number;
    pointsWon?: number;
  }[];
  winnerTeam?: string;
  runnerUpTeam?: string;
  organizerType?: 'club' | 'province'; // Created by club admin or provincial federative admin
  organizerName?: string;
  bracket?: BracketMatch[];
}

export interface RankingPlayer {
  rank: number;
  provinceRank: number;
  id: string;
  name: string;
  avatar: string;
  province: string;
  level: number;
  points: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
  winRate: number;
  form: ('W' | 'L')[];
}
