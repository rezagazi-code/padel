import { Club, Coach, NeedPlayerPost, OpenMatch, PlayerProfile, RankingPlayer, Tournament } from './types';

export const initialPlayerProfile: PlayerProfile = {
  id: 'player-me',
  name: '',
  avatar: '',
  themeColor: '#ff2d55', // Electric Lime
  level: 3.85,
  levelTitle: 'متوسط (C+)',
  hand: 'right',
  preferredSide: 'left', // Reves player
  racketBrand: 'Babolat',
  racketModel: 'Technical Viper Juan Lebrón Edition',
  province: 'تهران',
  city: 'تهران',
  phone: '',
  email: '',
  bio: '',
  reliabilityScore: 98,
  rankingPoints: 1640,
  rankingPosition: 4,
  matchesPlayed: 48,
  matchesWon: 34,
  tournamentsPlayed: 6,
  tournamentsWon: 2,
  isFreeAgent: true,
  freeAgentNote: '',
  availableDays: ['شنبه', 'دوشنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'],
  recentMatches: [
    {
      id: 'rm-1',
      date: '۱۴۰۳/۰۶/۲۵',
      opponent: 'سهراب مرادی & علی شایان',
      partner: 'مهدی کریمی',
      score: '۶-۴ , ۷-۵',
      won: true,
      levelChange: +0.08
    },
    {
      id: 'rm-2',
      date: '۱۴۰۳/۰۶/۲۱',
      opponent: 'کامیار رهنما & پویا فرهمند',
      partner: 'سامان فتاحی',
      score: '۴-۶ , ۶-۳ , ۶-۴',
      won: true,
      levelChange: +0.06
    },
    {
      id: 'rm-3',
      date: '۱۴۰۳/۰۶/۱۷',
      opponent: 'امیرحسین زارعی & نیما نوری',
      partner: 'مهدی کریمی',
      score: '۵-۷ , ۴-۶',
      won: false,
      levelChange: -0.05
    }
  ]
};

export const initialClubs: Club[] = [
  {
    id: 'club-padelpoint',
    name: 'باشگاه پدل پوینت',
    province: 'اصفهان',
    city: 'اصفهان - حیدرآباد',
    address: 'اصفهان، دهکده باغ ویلایی حیدرآباد',
    phone: '۰۹۱۳۱۱۷۲۵۳۸',
    coverImage: '/clubs/padelpoint-1.jpg',
    galleryImages: [
      '/clubs/padelpoint-1.jpg',
      '/clubs/padelpoint-2.jpg',
      '/clubs/padelpoint-3.jpg'
    ],
    rating: 5.0,
    reviewCount: 0,
    courtsCount: 6,
    openingHour: '08:00',
    closingHour: '24:00',
    ownerName: 'مدیریت باشگاه پدل پوینت',
    ownerPhone: '۰۹۱۳۱۱۷۲۵۳۸',
    amenities: [
      '۶ زمین پدل سرپوشیده با چمن آبی',
      'سالن بزرگ با سقف سازه فلزی',
      'لانژ و فضای استراحت بازیکنان',
      'برگزاری تورنمنت‌های هفتگی',
      'رزرو آنلاین زمین'
    ],
    courts: [
      {
        id: 'court-pp-1',
        clubId: 'club-padelpoint',
        name: 'زمین ۱ (سرپوشیده)',
        courtNumber: 1,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 600000,
        peakHourlyRate: 800000,
        isAvailable: true
      },
      {
        id: 'court-pp-2',
        clubId: 'club-padelpoint',
        name: 'زمین ۲ (سرپوشیده)',
        courtNumber: 2,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 600000,
        peakHourlyRate: 800000,
        isAvailable: true
      },
      {
        id: 'court-pp-3',
        clubId: 'club-padelpoint',
        name: 'زمین ۳ (سرپوشیده)',
        courtNumber: 3,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 600000,
        peakHourlyRate: 800000,
        isAvailable: true
      },
      {
        id: 'court-pp-4',
        clubId: 'club-padelpoint',
        name: 'زمین ۴ (سرپوشیده)',
        courtNumber: 4,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 600000,
        peakHourlyRate: 800000,
        isAvailable: true
      },
      {
        id: 'court-pp-5',
        clubId: 'club-padelpoint',
        name: 'زمین ۵ (سرپوشیده)',
        courtNumber: 5,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 600000,
        peakHourlyRate: 800000,
        isAvailable: true
      },
      {
        id: 'court-pp-6',
        clubId: 'club-padelpoint',
        name: 'زمین ۶ (سرپوشیده)',
        courtNumber: 6,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 600000,
        peakHourlyRate: 800000,
        isAvailable: true
      }
    ]
  },
  {
    id: 'club-tikpadel',
    name: 'باشگاه تیک پدل',
    province: 'اصفهان',
    city: 'اصفهان - سپاهان‌شهر',
    address: 'اصفهان، سپاهان‌شهر، خیابان ایثار',
    phone: '۰۹۱۳۳۱۳۱۷۷۱',
    coverImage: '/clubs/tikpadel-1.jpg',
    galleryImages: [
      '/clubs/tikpadel-1.jpg',
      '/clubs/tikpadel-2.jpg',
      '/clubs/tikpadel-3.jpg'
    ],
    rating: 5.0,
    reviewCount: 0,
    courtsCount: 3,
    openingHour: '08:00',
    closingHour: '24:00',
    ownerName: 'مدیریت باشگاه تیک پدل',
    ownerPhone: '۰۹۱۳۳۱۳۱۷۷۱',
    amenities: [
      'اولین مجموعه استاندارد سرپوشیده پدل اصفهان',
      'زمین‌های استاندارد سرپوشیده با چمن آبی',
      'کافه تیک',
      'برگزاری تورنمنت و کلاس آموزشی',
      'زیر نظر انجمن پدل و هیات تنیس استان اصفهان'
    ],
    courts: [
      {
        id: 'court-tp-1',
        clubId: 'club-tikpadel',
        name: 'زمین ۱ (استاندارد سرپوشیده)',
        courtNumber: 1,
        type: 'indoor',
        surface: 'Mondo Supercourt 4NX',
        turfColor: '#1d4ed8',
        hourlyRate: 650000,
        peakHourlyRate: 850000,
        isAvailable: true
      },
      {
        id: 'court-tp-2',
        clubId: 'club-tikpadel',
        name: 'زمین ۲ (استاندارد سرپوشیده)',
        courtNumber: 2,
        type: 'indoor',
        surface: 'Mondo Supercourt 4NX',
        turfColor: '#1d4ed8',
        hourlyRate: 650000,
        peakHourlyRate: 850000,
        isAvailable: true
      },
      {
        id: 'court-tp-3',
        clubId: 'club-tikpadel',
        name: 'زمین ۳ (استاندارد سرپوشیده)',
        courtNumber: 3,
        type: 'indoor',
        surface: 'Mondo Supercourt 4NX',
        turfColor: '#1d4ed8',
        hourlyRate: 650000,
        peakHourlyRate: 850000,
        isAvailable: true
      }
    ]
  },
  {
    id: 'club-negaristan',
    name: 'باشگاه پدل نگارستان',
    province: 'اصفهان',
    city: 'کاشان',
    address: 'کاشان، بلوار قطب راوندی، بلوار نگارستان',
    phone: '۰۹۹۲۱۰۰۳۴۱۴',
    coverImage: '/clubs/negaristan-1.jpg',
    galleryImages: [
      '/clubs/negaristan-1.jpg',
      '/clubs/negaristan-2.jpg'
    ],
    rating: 5.0,
    reviewCount: 0,
    courtsCount: 3,
    openingHour: '18:00',
    closingHour: '24:00',
    ownerName: 'مدیریت باشگاه پدل نگارستان',
    ownerPhone: '۰۹۹۲۱۰۰۳۴۱۴',
    amenities: [
      '۳ زمین پدل سرپوشیده',
      'مجموعه ورزشی تفریحی نگارستان',
      'کافه',
      'رختکن و حمام',
      'مربیان مجرب',
      'والیبال ساحلی، تنیس ساحلی و اسنوکر'
    ],
    courts: [
      {
        id: 'court-ng-1',
        clubId: 'club-negaristan',
        name: 'زمین ۱ (سرپوشیده)',
        courtNumber: 1,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 550000,
        peakHourlyRate: 700000,
        isAvailable: true
      },
      {
        id: 'court-ng-2',
        clubId: 'club-negaristan',
        name: 'زمین ۲ (سرپوشیده)',
        courtNumber: 2,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 550000,
        peakHourlyRate: 700000,
        isAvailable: true
      },
      {
        id: 'court-ng-3',
        clubId: 'club-negaristan',
        name: 'زمین ۳ (سرپوشیده)',
        courtNumber: 3,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 550000,
        peakHourlyRate: 700000,
        isAvailable: true
      }
    ]
  }
];

export const initialOpenMatches: OpenMatch[] = [];

export const initialNeedPlayerPosts: NeedPlayerPost[] = [];

export const initialFreeAgents: PlayerProfile[] = [];

export const initialCoaches: Coach[] = [];

export const initialTournaments: Tournament[] = [];

export const initialRankings: RankingPlayer[] = [];

export const PROVINCES_LIST = [
  'همه استان‌ها',
  'تهران',
  'اصفهان',
  'هرمزگان',
  'البرز',
  'فارس',
  'خراسان رضوی',
  'مازندران',
  'گیلان',
  'آذربایجان شرقی'
];
