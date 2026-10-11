import { Club, Coach, GroupSession, NeedPlayerPost, OpenMatch, PlayerProfile, RankingPlayer, Tournament } from './types';

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
  },

  // ─── باشگاه‌های جدید — تحقیق اینستاگرام ۲۰۲۶-۱۰-۱۱ ───
  // قیمت‌های estimate با کامنت مشخص شده‌اند؛ فقط موارد تأییدشده بدون کامنت‌اند
  {
    id: 'club-teh-arenapadel',
    name: 'پدل آرنا',
    province: 'تهران',
    city: 'تهران',
    address: 'تهران، ورزشگاه آزادی، ورودی غربی، مجموعه فرشتگان میناب',
    phone: '09017498259',
    coverImage: '/clubs/ppadelarena-1.jpg',
    galleryImages: [
      '/clubs/ppadelarena-1.jpg'
    ],
    rating: 5.0,
    reviewCount: 0,
    courtsCount: 8,
    openingHour: '08:00',
    closingHour: '24:00',
    ownerName: 'مدیریت باشگاه پدل آرنا',
    ownerPhone: '09017498259',
    amenities: [
      'اینستاگرام: @ppadelarena',
      '۸ زمین سرپوشیده',
      'برگزارکننده تورنمنت'
    ],
    courts: [
      {
        id: 'court-arena-1',
        clubId: 'club-teh-arenapadel',
        name: 'زمین ۱ (سرپوشیده)',
        courtNumber: 1,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      },
      {
        id: 'court-arena-2',
        clubId: 'club-teh-arenapadel',
        name: 'زمین ۲ (سرپوشیده)',
        courtNumber: 2,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      },
      {
        id: 'court-arena-3',
        clubId: 'club-teh-arenapadel',
        name: 'زمین ۳ (سرپوشیده)',
        courtNumber: 3,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      },
      {
        id: 'court-arena-4',
        clubId: 'club-teh-arenapadel',
        name: 'زمین ۴ (سرپوشیده)',
        courtNumber: 4,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      },
      {
        id: 'court-arena-5',
        clubId: 'club-teh-arenapadel',
        name: 'زمین ۵ (سرپوشیده)',
        courtNumber: 5,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      },
      {
        id: 'court-arena-6',
        clubId: 'club-teh-arenapadel',
        name: 'زمین ۶ (سرپوشیده)',
        courtNumber: 6,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      },
      {
        id: 'court-arena-7',
        clubId: 'club-teh-arenapadel',
        name: 'زمین ۷ (سرپوشیده)',
        courtNumber: 7,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      },
      {
        id: 'court-arena-8',
        clubId: 'club-teh-arenapadel',
        name: 'زمین ۸ (سرپوشیده)',
        courtNumber: 8,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      }
    ]
  },
  {
    id: 'club-teh-fgb',
    name: 'FGB Padel Club',
    province: 'تهران',
    city: 'تهران',
    address: 'تهران، مجموعه ورزشی انقلاب، ضلع شمال غربی',
    phone: '02122664603',
    coverImage: '/clubs/fgbpadelclub-2.jpg',
    galleryImages: [
      '/clubs/fgbpadelclub-2.jpg'
    ],
    rating: 5.0,
    reviewCount: 0,
    courtsCount: 2, // placeholder — تعداد زمین تأیید نشده
    openingHour: '08:00',
    closingHour: '24:00',
    ownerName: 'مدیریت باشگاه FGB',
    ownerPhone: '02122664603',
    amenities: [
      'اینستاگرام: @fgbpadelclub',
      'قدیمی‌ترین باشگاه پدل ایران',
      'برگزارکننده تورنمنت‌های هفتگی'
    ],
    courts: [
      {
        id: 'court-fgb-1',
        clubId: 'club-teh-fgb',
        name: 'زمین ۱',
        courtNumber: 1,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      },
      {
        id: 'court-fgb-2',
        clubId: 'club-teh-fgb',
        name: 'زمین ۲',
        courtNumber: 2,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      }
    ]
  },
  {
    id: 'club-teh-hills',
    name: 'پدل هیلز',
    province: 'تهران',
    city: 'تهران',
    address: 'تهران، سعادت‌آباد، مجموعه تنیس خداداد',
    phone: '',
    coverImage: '/covers/club-1.jpg',
    galleryImages: [
      '/covers/club-1.jpg'
    ],
    rating: 5.0,
    reviewCount: 0,
    courtsCount: 2, // placeholder — تعداد زمین تأیید نشده
    openingHour: '08:00',
    closingHour: '24:00',
    ownerName: 'مدیریت باشگاه پدل هیلز',
    ownerPhone: '',
    amenities: [
      'اینستاگرام: @padelhillss',
      'میزبان لیگ پدل تهران'
    ],
    courts: [
      {
        id: 'court-hills-1',
        clubId: 'club-teh-hills',
        name: 'زمین ۱',
        courtNumber: 1,
        type: 'outdoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      },
      {
        id: 'court-hills-2',
        clubId: 'club-teh-hills',
        name: 'زمین ۲',
        courtNumber: 2,
        type: 'outdoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      }
    ]
  },
  {
    id: 'club-teh-land',
    name: 'پدل لند',
    province: 'تهران',
    city: 'تهران',
    address: 'تهران',
    phone: '',
    coverImage: '/covers/club-2.jpg',
    galleryImages: [
      '/covers/club-2.jpg'
    ],
    rating: 5.0,
    reviewCount: 0,
    courtsCount: 2, // placeholder — تعداد زمین تأیید نشده
    openingHour: '08:00',
    closingHour: '24:00',
    ownerName: 'مدیریت باشگاه پدل لند',
    ownerPhone: '',
    amenities: [
      'اینستاگرام: @padellandclub',
      'آکادمی پدل (کودک و بزرگسال)'
    ],
    courts: [
      {
        id: 'court-land-1',
        clubId: 'club-teh-land',
        name: 'زمین ۱',
        courtNumber: 1,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      },
      {
        id: 'court-land-2',
        clubId: 'club-teh-land',
        name: 'زمین ۲',
        courtNumber: 2,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      }
    ]
  },
  {
    id: 'club-teh-courtina',
    name: 'کورتینا',
    province: 'تهران',
    city: 'تهران',
    address: 'تهران، خیابان ازگل، کوچه آبشار شرقی، مجموعه کورتینا',
    phone: '09121971827',
    coverImage: '/covers/club-3.jpg',
    galleryImages: [
      '/covers/club-3.jpg'
    ],
    rating: 5.0,
    reviewCount: 0,
    courtsCount: 2,
    openingHour: '07:00',
    closingHour: '22:00',
    ownerName: 'مدیریت باشگاه کورتینا',
    ownerPhone: '09121971827',
    amenities: [
      'اینستاگرام: @playatcourtina',
      '۲ زمین پدل',
      'شروع قیمت از ۱٬۸۰۰٬۰۰۰ تومان'
    ],
    courts: [
      {
        id: 'court-courtina-1',
        clubId: 'club-teh-courtina',
        name: 'زمین ۱',
        courtNumber: 1,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1800000,
        peakHourlyRate: 2200000,
        isAvailable: true
      },
      {
        id: 'court-courtina-2',
        clubId: 'club-teh-courtina',
        name: 'زمین ۲',
        courtNumber: 2,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1800000,
        peakHourlyRate: 2200000,
        isAvailable: true
      }
    ]
  },
  {
    id: 'club-teh-t10',
    name: 'T10 Club',
    province: 'تهران',
    city: 'تهران',
    address: 'تهران',
    phone: '09021972588',
    coverImage: '/clubs/t10_club-1.jpg',
    galleryImages: [
      '/clubs/t10_club-1.jpg'
    ],
    rating: 5.0,
    reviewCount: 0,
    courtsCount: 2, // placeholder — تعداد زمین تأیید نشده (باشگاه می‌گوید ۷ ولی پست «به‌زودی» دارد)
    openingHour: '08:00',
    closingHour: '24:00',
    ownerName: 'مدیریت باشگاه T10',
    ownerPhone: '09021972588',
    amenities: [
      'اینستاگرام: @t10_club',
      'در حال افتتاح'
    ],
    courts: [
      {
        id: 'court-t10-1',
        clubId: 'club-teh-t10',
        name: 'زمین ۱ (روباز)',
        courtNumber: 1,
        type: 'outdoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      },
      {
        id: 'court-t10-2',
        clubId: 'club-teh-t10',
        name: 'زمین ۲ (روباز)',
        courtNumber: 2,
        type: 'outdoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 1500000, // estimate
        peakHourlyRate: 2000000, // estimate
        isAvailable: true
      }
    ]
  },
  {
    id: 'club-shz-racketpark',
    name: 'راکت پارک VIP',
    province: 'فارس',
    city: 'شیراز',
    address: 'شیراز، کوی وحدت، خیابان فرشته ۲',
    phone: '',
    coverImage: '/covers/club-4.jpg',
    galleryImages: [
      '/covers/club-4.jpg'
    ],
    rating: 5.0,
    reviewCount: 0,
    courtsCount: 2, // placeholder — تعداد زمین تأیید نشده
    openingHour: '08:00',
    closingHour: '24:00',
    ownerName: 'مدیریت باشگاه راکت پارک',
    ownerPhone: '',
    amenities: [
      'اینستاگرام: @racketpark.vip',
      'اسکواش و پدل'
    ],
    courts: [
      {
        id: 'court-rp-1',
        clubId: 'club-shz-racketpark',
        name: 'زمین ۱',
        courtNumber: 1,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 900000, // estimate
        peakHourlyRate: 1200000, // estimate
        isAvailable: true
      },
      {
        id: 'court-rp-2',
        clubId: 'club-shz-racketpark',
        name: 'زمین ۲',
        courtNumber: 2,
        type: 'indoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 900000, // estimate
        peakHourlyRate: 1200000, // estimate
        isAvailable: true
      }
    ]
  },
  {
    id: 'club-krj-padelzone',
    name: 'پدل زون کردان',
    province: 'البرز',
    city: 'کردان',
    address: 'کردان، جاده ملک‌آباد، بلوار اصلی اقدسیه، مجموعه ورزشی پدل زون کردان',
    phone: '09127030716',
    coverImage: '/clubs/padelzone-1.jpg',
    galleryImages: [
      '/clubs/padelzone-1.jpg',
      '/clubs/padelzone-2.jpg'
    ],
    rating: 5.0,
    reviewCount: 0,
    courtsCount: 2, // placeholder — تعداد زمین تأیید نشده
    openingHour: '08:00',
    closingHour: '24:00',
    ownerName: 'مدیریت باشگاه پدل زون کردان',
    ownerPhone: '09127030716',
    amenities: [
      'وب‌سایت: padelzone.ir',
      'برگزارکننده تورنمنت‌های هفتگی'
    ],
    courts: [
      {
        id: 'court-pz-1',
        clubId: 'club-krj-padelzone',
        name: 'زمین ۱',
        courtNumber: 1,
        type: 'outdoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 900000, // estimate
        peakHourlyRate: 1200000, // estimate
        isAvailable: true
      },
      {
        id: 'court-pz-2',
        clubId: 'club-krj-padelzone',
        name: 'زمین ۲',
        courtNumber: 2,
        type: 'outdoor',
        surface: 'Texturised Synthetic',
        turfColor: '#1d4ed8',
        hourlyRate: 900000, // estimate
        peakHourlyRate: 1200000, // estimate
        isAvailable: true
      }
    ]
  }
];

export const initialOpenMatches: OpenMatch[] = [];

// نمونه نمایشی سانس گروهی — sample data so the «سانس گروهی» tab isn't empty on first run
export const initialGroupSessions: GroupSession[] = [
  {
    id: 'gs-sample-1',
    title: 'سانس گروهی جمعه‌شب (نمونه)',
    clubId: 'club-padelpoint',
    clubName: 'پدل پوینت',
    date: 'جمعه - ۱۹:۰۰',
    time: '۱۹:۰۰ - ۲۰:۳۰',
    type: 'friendly',
    minLevel: 3.0,
    maxLevel: 4.5,
    pricePerPlayer: 220000,
    gender: 'all',
    creatorId: 'player-sample-host',
    creatorName: 'میزبان نمونه',
    creatorAvatar: '',
    creatorLevel: 3.8,
    status: 'open',
    createdAt: new Date().toISOString(),
    courts: [
      {
        courtNumber: 1,
        courtName: 'زمین ۱',
        slots: [
          { slotNumber: 1, team: 1, side: 'left', playerId: 'player-sample-host', playerName: 'میزبان نمونه', playerAvatar: '', playerLevel: 3.8 },
          { slotNumber: 2, team: 1, side: 'right', playerId: 'player-sample-2', playerName: 'بازیکن نمونه ۲', playerAvatar: '', playerLevel: 4.0 },
          { slotNumber: 3, team: 2, side: 'left' },
          { slotNumber: 4, team: 2, side: 'right' },
        ],
      },
      {
        courtNumber: 2,
        courtName: 'زمین ۲',
        slots: [
          { slotNumber: 1, team: 1, side: 'left', playerId: 'player-sample-3', playerName: 'بازیکن نمونه ۳', playerAvatar: '', playerLevel: 3.2 },
          { slotNumber: 2, team: 1, side: 'right' },
          { slotNumber: 3, team: 2, side: 'left' },
          { slotNumber: 4, team: 2, side: 'right' },
        ],
      },
    ],
  },
];

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
