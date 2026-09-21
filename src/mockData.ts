import { Club, Coach, NeedPlayerPost, OpenMatch, PlayerProfile, RankingPlayer, Tournament } from './types';

export const initialPlayerProfile: PlayerProfile = {
  id: 'player-me',
  name: 'رضا قاضی',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  themeColor: '#a3e635', // Electric Lime
  level: 3.85,
  levelTitle: 'پیشرفته (Advanced)',
  hand: 'right',
  preferredSide: 'left', // Reves player
  racketBrand: 'Babolat',
  racketModel: 'Technical Viper Juan Lebrón Edition',
  province: 'تهران',
  city: 'تهران',
  phone: '۰۹۱۲۳۴۵۶۷۸۹',
  email: 'RezaGazi@gmail.com',
  bio: 'علاقه‌مند به بازی‌های تهاجمی در سمت Reves (چپ)، اسمش‌های Bandeja و Vibora دقیق. به دنبال بازی‌های رقابتی و تورنومنت‌های هفتگی.',
  reliabilityScore: 98,
  rankingPoints: 1640,
  rankingPosition: 4,
  matchesPlayed: 48,
  matchesWon: 34,
  tournamentsPlayed: 6,
  tournamentsWon: 2,
  isFreeAgent: true,
  freeAgentNote: 'آماده بازی در سانس‌های عصر و شب در باشگاه‌های انقلاب، شاهین و درکه. پست Reves ترجیحی.',
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
    id: 'club-1',
    name: 'باشگاه پدل مجموعه ورزشی انقلاب',
    province: 'تهران',
    city: 'تهران - ونک',
    address: 'خیابان سئول، جنب درب جنوبی مجموعه ورزشی انقلاب',
    phone: '۰۲۱-۲۶۲۱۶۰۰۱',
    coverImage: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewCount: 142,
    courtsCount: 4,
    openingHour: '07:00',
    closingHour: '24:00',
    ownerName: 'مهندس آرش ناصری',
    ownerPhone: '۰۹۱۲۱۱۱۰۰۲۲',
    amenities: [
      'شیشه پانورامیک فوق شفاف',
      'چمن تخصصی Mondo Supercourt',
      'نورپردازی استاندارد جهانی ۵۰۰ لوکس',
      'کافه و رستوران ارگانیک',
      'رختکن VIP و دوش آب گرم',
      'فروشگاه اختصاصی پرو شاپ (Pro Shop)',
      'پارکینگ اختصاصی رایگان'
    ],
    courts: [
      {
        id: 'court-1-1',
        clubId: 'club-1',
        name: 'زمین ۱ (سنترال پانورامیک)',
        courtNumber: 1,
        type: 'panoramic',
        surface: 'Mondo Supercourt 4NX',
        turfColor: '#1d4ed8', // Electric Blue
        hourlyRate: 750000,
        peakHourlyRate: 950000,
        isAvailable: true
      },
      {
        id: 'court-1-2',
        clubId: 'club-1',
        name: 'زمین ۲ (سرپوشیده Indoor)',
        courtNumber: 2,
        type: 'indoor',
        surface: 'Mondo Supercourt 4NX',
        turfColor: '#1d4ed8',
        hourlyRate: 700000,
        peakHourlyRate: 900000,
        isAvailable: true
      },
      {
        id: 'court-1-3',
        clubId: 'club-1',
        name: 'زمین ۳ (پانورامیک روباز)',
        courtNumber: 3,
        type: 'panoramic',
        surface: 'Texturised Synthetic',
        turfColor: '#15803d', // Lawn Green
        hourlyRate: 650000,
        peakHourlyRate: 850000,
        isAvailable: true
      },
      {
        id: 'court-1-4',
        clubId: 'club-1',
        name: 'زمین ۴ (استاندارد)',
        courtNumber: 4,
        type: 'semi-covered',
        surface: 'Classic Turf',
        turfColor: '#1d4ed8',
        hourlyRate: 600000,
        peakHourlyRate: 800000,
        isAvailable: true
      }
    ]
  },
  {
    id: 'club-2',
    name: 'باشگاه پدل شاهین پاسداران',
    province: 'تهران',
    city: 'تهران - پاسداران',
    address: 'پاسداران، انتهای خیابان گلستان پنجم، مجتمع ورزشی شاهین',
    phone: '۰۲۱-۲۲۵۵۳۳۴۴',
    coverImage: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewCount: 98,
    courtsCount: 3,
    openingHour: '07:30',
    closingHour: '23:30',
    ownerName: 'پژمان کاظمی',
    ownerPhone: '۰۹۱۲۲۲۳۳۴۴۵',
    amenities: [
      'شیشه نشکن سکوریت ۱۰ میل',
      'کافه تخصصی بار گرم و سرد',
      'فروشگاه راکت و توپ',
      'مربیان بین‌المللی مقیم',
      'رختکن و سونا خشک'
    ],
    courts: [
      {
        id: 'court-2-1',
        clubId: 'club-2',
        name: 'زمین شماره ۱ (شیشه‌ای پانورامیک)',
        courtNumber: 1,
        type: 'panoramic',
        surface: 'Mondo Supercourt 4NX',
        turfColor: '#0284c7',
        hourlyRate: 700000,
        peakHourlyRate: 900000,
        isAvailable: true
      },
      {
        id: 'court-2-2',
        clubId: 'club-2',
        name: 'زمین شماره ۲ (سرپوشیده مدرن)',
        courtNumber: 2,
        type: 'indoor',
        surface: 'Mondo Supercourt 4NX',
        turfColor: '#0284c7',
        hourlyRate: 700000,
        peakHourlyRate: 900000,
        isAvailable: true
      },
      {
        id: 'court-2-3',
        clubId: 'club-2',
        name: 'زمین شماره ۳ (تمرینی و مچ)',
        courtNumber: 3,
        type: 'outdoor',
        surface: 'Texturised Synthetic',
        turfColor: '#b45309', // Terracotta
        hourlyRate: 600000,
        peakHourlyRate: 780000,
        isAvailable: true
      }
    ]
  },
  {
    id: 'club-3',
    name: 'مجموعه بین‌المللی پدل مارینا کیش',
    province: 'هرمزگان',
    city: 'جزیره کیش',
    address: 'بلوار مرجان، مارینا پارک هتل، کلاب اختصاصی پدل ساحلی',
    phone: '۰۷۶-۴۴۴۶۵۰۰۰',
    coverImage: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.95,
    reviewCount: 210,
    courtsCount: 3,
    openingHour: '08:00',
    closingHour: '01:00',
    ownerName: 'کیوان صادقیان',
    ownerPhone: '۰۹۳۴۷۶۸۹۰۰۰',
    amenities: [
      'چشم‌انداز رویایی به خلیج فارس',
      'ورزش بادشکن اختصاصی Windproof',
      'نورپردازی مسابقات جهانی FIP',
      'کافه لانژ ساحلی با نوشیدنی‌های اسموتی',
      'کمپینگ و تورنومنت‌های ملی'
    ],
    courts: [
      {
        id: 'court-3-1',
        clubId: 'club-3',
        name: 'زمین سنترال مارینا (رو به دریا)',
        courtNumber: 1,
        type: 'panoramic',
        surface: 'Mondo Supercourt 4NX',
        turfColor: '#0284c7',
        hourlyRate: 850000,
        peakHourlyRate: 1100000,
        isAvailable: true
      },
      {
        id: 'court-3-2',
        clubId: 'club-3',
        name: 'زمین نسیم ۲',
        courtNumber: 2,
        type: 'panoramic',
        surface: 'Mondo Supercourt 4NX',
        turfColor: '#0284c7',
        hourlyRate: 800000,
        peakHourlyRate: 1000000,
        isAvailable: true
      }
    ]
  },
  {
    id: 'club-4',
    name: 'آکادمی پدل اسپادانا اصفهان',
    province: 'اصفهان',
    city: 'اصفهان - مرداویج',
    address: 'بلوار شیخ کلینی، مجتمع تنیس و پدل پرواز',
    phone: '۰۳۱-۳۶۶۸۹۰۰۲',
    coverImage: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.85,
    reviewCount: 88,
    courtsCount: 2,
    openingHour: '08:00',
    closingHour: '23:30',
    ownerName: 'دکتر علیرضا فروغی',
    ownerPhone: '۰۹۱۳۱۱۸۷۶۵۴',
    amenities: [
      '۲ کورت تمام شیشه با استانداردهای اسپانیایی',
      'کلینیک‌های تخصصی تاکتیک پدل',
      'فروشگاه و تست راکت رایگان',
      'کافی‌شاپ اختصاصی'
    ],
    courts: [
      {
        id: 'court-4-1',
        clubId: 'club-4',
        name: 'زمین ۱ اسپادانا',
        courtNumber: 1,
        type: 'panoramic',
        surface: 'Mondo Supercourt 4NX',
        turfColor: '#1e3a8a',
        hourlyRate: 650000,
        peakHourlyRate: 800000,
        isAvailable: true
      },
      {
        id: 'court-4-2',
        clubId: 'club-4',
        name: 'زمین ۲ اسپادانا',
        courtNumber: 2,
        type: 'semi-covered',
        surface: 'Texturised Synthetic',
        turfColor: '#15803d',
        hourlyRate: 600000,
        peakHourlyRate: 750000,
        isAvailable: true
      }
    ]
  }
];

export const initialOpenMatches: OpenMatch[] = [
  {
    id: 'match-1',
    title: 'مسابقه رقابتی سطح ۴ - پدل انقلاب (یک جای خالی)',
    clubId: 'club-1',
    clubName: 'باشگاه پدل انقلاب تهران',
    courtName: 'زمین ۱ (سنترال پانورامیک)',
    date: 'فردا - ۱۸:۳۰',
    time: '۱۸:۳۰ - ۲۰:۰۰',
    type: 'competitive',
    minLevel: 3.4,
    maxLevel: 4.3,
    pricePerPlayer: 235000,
    gender: 'men',
    creatorId: 'p-2',
    creatorName: 'سهراب مرادی',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    creatorLevel: 3.9,
    slots: [
      {
        slotNumber: 1,
        team: 1,
        side: 'left',
        playerId: 'p-2',
        playerName: 'سهراب مرادی',
        playerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        playerLevel: 3.9
      },
      {
        slotNumber: 2,
        team: 1,
        side: 'right',
        playerId: 'p-3',
        playerName: 'مهدی کریمی',
        playerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        playerLevel: 3.7
      },
      {
        slotNumber: 3,
        team: 2,
        side: 'right',
        playerId: 'p-4',
        playerName: 'نوید اسدی',
        playerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        playerLevel: 4.1
      },
      {
        slotNumber: 4,
        team: 2,
        side: 'left' // Empty slot for Reves!
      }
    ],
    status: 'open'
  },
  {
    id: 'match-2',
    title: 'مچ دوستانه پدل شاهین پاسداران - سطح متوسط',
    clubId: 'club-2',
    clubName: 'باشگاه پدل شاهین پاسداران',
    courtName: 'زمین شماره ۱ (شیشه‌ای)',
    date: 'پنج‌شنبه - ۲۰:۰۰',
    time: '۲۰:۰۰ - ۲۱:۳۰',
    type: 'friendly',
    minLevel: 2.8,
    maxLevel: 3.6,
    pricePerPlayer: 220000,
    gender: 'all',
    creatorId: 'p-5',
    creatorName: 'سپیده دانایی',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    creatorLevel: 3.2,
    slots: [
      {
        slotNumber: 1,
        team: 1,
        side: 'right',
        playerId: 'p-5',
        playerName: 'سپیده دانایی',
        playerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        playerLevel: 3.2
      },
      {
        slotNumber: 2,
        team: 1,
        side: 'left',
        playerId: 'p-6',
        playerName: 'فرهاد طاهری',
        playerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        playerLevel: 3.4
      },
      {
        slotNumber: 3,
        team: 2,
        side: 'left'
      },
      {
        slotNumber: 4,
        team: 2,
        side: 'right'
      }
    ],
    status: 'open'
  },
  {
    id: 'match-3',
    title: 'نبرد تاپ رنکینگ مارینا کیش (شب مهتابی)',
    clubId: 'club-3',
    clubName: 'مجموعه پدل مارینا کیش',
    courtName: 'زمین سنترال مارینا',
    date: 'جمعه - ۲۱:۳۰',
    time: '۲۱:۳۰ - ۲۳:۰۰',
    type: 'competitive',
    minLevel: 4.2,
    maxLevel: 5.5,
    pricePerPlayer: 275000,
    gender: 'men',
    creatorId: 'p-7',
    creatorName: 'کیارش آریافر',
    creatorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    creatorLevel: 4.8,
    slots: [
      {
        slotNumber: 1,
        team: 1,
        side: 'left',
        playerId: 'p-7',
        playerName: 'کیارش آریافر',
        playerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        playerLevel: 4.8
      },
      {
        slotNumber: 2,
        team: 1,
        side: 'right'
      },
      {
        slotNumber: 3,
        team: 2,
        side: 'left'
      },
      {
        slotNumber: 4,
        team: 2,
        side: 'right'
      }
    ],
    status: 'open'
  }
];

export const initialNeedPlayerPosts: NeedPlayerPost[] = [
  {
    id: 'np-1',
    clubName: 'باشگاه پدل انقلاب تهران',
    province: 'تهران',
    date: 'امروز - ساعت ۲۱:۰۰',
    time: '۲۱:۰۰ - ۲۲:۳۰',
    spotsNeeded: 1,
    preferredSide: 'right', // Drive
    minLevel: 3.5,
    maxLevel: 4.2,
    costPerPerson: 220000,
    hostPlayerId: 'p-host-1',
    hostName: 'فرزین معتمدی',
    hostAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    hostLevel: 3.8,
    note: 'زمین رو رزرو کردیم و سه نفریم. به یک بازیکن خوش‌اخلاق برای سمت راست (Drive) احتیاج داریم. لطفا سطح حدود ۳.۵ تا ۴ باشه.',
    joinedPlayers: [],
    status: 'active'
  },
  {
    id: 'np-2',
    clubName: 'باشگاه پدل شاهین پاسداران',
    province: 'تهران',
    date: 'فردا - ساعت ۱۹:۳۰',
    time: '۱۹:۳۰ - ۲۱:۰۰',
    spotsNeeded: 2,
    preferredSide: 'both',
    minLevel: 3.0,
    maxLevel: 3.8,
    costPerPerson: 200000,
    hostPlayerId: 'p-host-2',
    hostName: 'امیررضا صابری',
    hostAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    hostLevel: 3.4,
    note: 'دو نفر همراهیم، زمین شماره ۲ شاهین رزروه. دو تا هم‌تیمی پایه و پرانرژی میخوایم برای بازی سرعتی و جذاب.',
    joinedPlayers: [],
    status: 'active'
  },
  {
    id: 'np-3',
    clubName: 'آکادمی اسپادانا اصفهان',
    province: 'اصفهان',
    date: 'جمعه - ساعت ۱۰:۰۰ صبح',
    time: '۱۰:۰۰ - ۱۱:۳۰',
    spotsNeeded: 1,
    preferredSide: 'left', // Reves
    minLevel: 3.2,
    maxLevel: 4.0,
    costPerPerson: 175000,
    hostPlayerId: 'p-host-3',
    hostName: 'محمد جواد بهرامی',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    hostLevel: 3.6,
    note: 'جمعه صبح بعد از قهوه یه مچ عالی و سرعتی میخوایم بزنیم. پارتنر سمت چپ من کنسل کرد، بازیکن آزاد لطفا ملحق بشه.',
    joinedPlayers: [],
    status: 'active'
  }
];

export const initialFreeAgents: PlayerProfile[] = [
  {
    id: 'fa-1',
    name: 'آرمان مهرپویا',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    themeColor: '#38bdf8',
    level: 4.15,
    levelTitle: 'پیشرفته (Cat 1)',
    hand: 'right',
    preferredSide: 'left', // Reves
    racketBrand: 'Bullpadel',
    racketModel: 'Vertex 04 Comfort',
    province: 'تهران',
    city: 'تهران',
    phone: '۰۹۱۲۸۸۸۹۹۰۰',
    email: 'arman@padel.ir',
    bio: 'بازیکن آماده به بازی سمت چپ، تخصص در واله‌های فورهند و لوپ بک‌هند. آماده برای بازی‌های فوری در تهران.',
    reliabilityScore: 99,
    rankingPoints: 1790,
    rankingPosition: 2,
    matchesPlayed: 64,
    matchesWon: 48,
    tournamentsPlayed: 9,
    tournamentsWon: 3,
    isFreeAgent: true,
    freeAgentNote: 'امروز عصر از ساعت ۱۸ به بعد آزادم، اگر کسی پارتنر یا حریف کم داره پیام بده.',
    availableDays: ['امروز', 'فردا', 'جمعه']
  },
  {
    id: 'fa-2',
    name: 'سارا نیک‌زاد',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    themeColor: '#f43f5e',
    level: 3.6,
    levelTitle: 'متوسط پیشرفته (Cat 2)',
    hand: 'right',
    preferredSide: 'right', // Drive
    racketBrand: 'Nox',
    racketModel: 'ML10 Pro Cup Luxury',
    province: 'تهران',
    city: 'تهران',
    phone: '۰۹۱۹۳۳۳۲۲۱۱',
    email: 'sara.nik@gmail.com',
    bio: 'عاشق بازی تاکتیکی و دفاعی در سمت راست، رالی‌های طولانی و اسمش کنترل‌شده. همیشه آن‌تایم و پرانرژی.',
    reliabilityScore: 97,
    rankingPoints: 1380,
    rankingPosition: 8,
    matchesPlayed: 38,
    matchesWon: 25,
    tournamentsPlayed: 4,
    tournamentsWon: 1,
    isFreeAgent: true,
    freeAgentNote: 'آماده برای مسابقات دونفره میکس یا بانوان در باشگاه شاهین یا انقلاب.',
    availableDays: ['پنج‌شنبه', 'جمعه']
  },
  {
    id: 'fa-3',
    name: 'بردیا کیانی',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    themeColor: '#a855f7',
    level: 4.6,
    levelTitle: 'نخبه و قهرمان استانی (Pro)',
    hand: 'left', // Left-handed jewel for right side!
    preferredSide: 'right',
    racketBrand: 'Wilson',
    racketModel: 'Bela Pro v2.5',
    province: 'اصفهان',
    city: 'اصفهان',
    phone: '۰۹۱۳۵۵۵۴۴۳۳',
    email: 'bardia.padel@yahoo.com',
    bio: 'چپ‌دست تخصصی سمت راست (Drive). زاویه‌سازی تیز با دیوار شیشه‌ای. رنک یک استان اصفهان.',
    reliabilityScore: 100,
    rankingPoints: 2150,
    rankingPosition: 1,
    matchesPlayed: 82,
    matchesWon: 68,
    tournamentsPlayed: 12,
    tournamentsWon: 5,
    isFreeAgent: true,
    freeAgentNote: 'برای مچ‌های سطح ۴ به بالا در اسپادانا و پرواز آماده‌ام.',
    availableDays: ['همه‌روزه']
  },
  {
    id: 'fa-4',
    name: 'شهاب حسامی',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    themeColor: '#eab308',
    level: 3.3,
    levelTitle: 'متوسط (Cat 3)',
    hand: 'right',
    preferredSide: 'both',
    racketBrand: 'Head',
    racketModel: 'Speed Pro X',
    province: 'هرمزگان',
    city: 'کیش',
    phone: '۰۹۳۴۹۹۹۸۸۷۷',
    email: 'shahab.kish@gmail.com',
    bio: 'ساکن کیش، هر شب در کورت‌های مارینا بازی می‌کنم. به دنبال بازی‌های سرگرم‌کننده و پیشرفت سطح بازی.',
    reliabilityScore: 95,
    rankingPoints: 1120,
    rankingPosition: 6,
    matchesPlayed: 29,
    matchesWon: 17,
    tournamentsPlayed: 2,
    tournamentsWon: 0,
    isFreeAgent: true,
    freeAgentNote: 'مسافران و کیشوندان محترم هر زمان بازیکن خواستید در خدمتم.',
    availableDays: ['هر شب از ساعت ۲۰']
  }
];

export const initialCoaches: Coach[] = [
  {
    id: 'coach-1',
    name: 'استاد مازیار فلاحی',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
    title: 'سرمربی بین‌المللی و مدرس رسمی FIP',
    fipCertification: 'مدرک بین‌المللی FIP Level 2 اسلواکی و اسپانیا',
    experienceYears: 9,
    rating: 4.96,
    reviewsCount: 84,
    province: 'تهران',
    clubs: ['باشگاه پدل انقلاب تهران', 'باشگاه پدل شاهین پاسداران'],
    hourlyRate: 950000,
    bio: 'تمرکز بر اصول حرفه‌ای بازی شیشه، ضربات Bandeja و Vibora، تصحیح زاویه ایستادن و ساخت تاکتیک تیمی زوج‌های پدل. سابقه هدایت قهرمانان کشوری.',
    specialties: ['اصلاح تکنیک پایه', 'استراتژی و حرکت با شیشه', 'اسمش و والی سرعتی', 'آماده‌سازی مسابقات'],
    availableDays: ['شنبه', 'دوشنبه', 'چهارشنبه', 'جمعه'],
    availableHours: ['۰۸:۰۰', '۰۹:۳۰', '۱۶:۰۰', '۱۷:۳۰', '۱۹:۰۰']
  },
  {
    id: 'coach-2',
    name: 'کاپیتان پریسا شریفی',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    title: 'مربی اسبق تیم ملی پدل و قهرمان لیگ برتر',
    fipCertification: 'مدرک مربیگری درجه ۱ فدراسیون و آکادمی مادرید',
    experienceYears: 7,
    rating: 4.92,
    reviewsCount: 65,
    province: 'تهران',
    clubs: ['باشگاه پدل شاهین پاسداران', 'مجموعه پدل درکه'],
    hourlyRate: 850000,
    bio: 'متخصص در افزایش اعتماد به نفس در دفاع، بازی خوانی و ریتم ضربات. برگزاری کلینیک‌های ویژه بانوان و دونفره‌های هماهنگ.',
    specialties: ['دفاع و دیوار شیشه‌ای', 'کلینیک دونفره هماهنگ', 'آمادگی جسمانی اختصاصی پدل', 'تاکتیک ضد حمله'],
    availableDays: ['یک‌شنبه', 'سه‌شنبه', 'پنج‌شنبه'],
    availableHours: ['۰۹:۰۰', '۱۰:۳۰', '۱۵:۰۰', '۱۶:۳۰', '۱۸:۰۰']
  },
  {
    id: 'coach-3',
    name: 'سامان یزدانی',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    title: 'مربی رسمی و سرپرست آکادمی اسپادانا',
    fipCertification: 'مدرک مربیگری پدل فدراسیون بین‌المللی FIP',
    experienceYears: 5,
    rating: 4.88,
    reviewsCount: 47,
    province: 'اصفهان',
    clubs: ['آکادمی پدل اسپادانا اصفهان', 'مجموعه پرواز'],
    hourlyRate: 750000,
    bio: 'رویکرد تحلیلی به پدل مدرن، آنالیز ویدیویی ضربات شاگردان، برنامه‌ریزی تمرینات پرتاب توپ و موقعیت‌سنجی هوشمندانه در زمین.',
    specialties: ['آنالیز تصویری بازی', 'شات‌سلکشن (Shot Selection)', 'سرویس و ریترن تهاجمی'],
    availableDays: ['شنبه', 'سه‌شنبه', 'چهارشنبه', 'جمعه'],
    availableHours: ['۰۸:۳۰', '۱۰:۰۰', '۱۷:۰۰', '۱۸:۳۰', '۲۰:۰۰']
  },
  {
    id: 'coach-4',
    name: 'مهرشاد کیان‌پور',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    title: 'مربی آکادمی مارینا کیش و متخصص استعدادیابی',
    fipCertification: 'مدرک مربیگری پیشرفته FIP Level 1',
    experienceYears: 6,
    rating: 4.9,
    reviewsCount: 52,
    province: 'هرمزگان',
    clubs: ['مجموعه بین‌المللی پدل مارینا کیش'],
    hourlyRate: 850000,
    bio: 'تجربه سال‌ها تمرین در آب‌وهوای ساحلی، بهینه‌سازی تنفس، بازی سرعتی نزدیک تور و آموزش تکنیک‌های پرطرفدار Bajada و Rulo.',
    specialties: ['ضربات نمایشی و کاربردی', 'کلینیک فشرده مسافرین کیش', 'قدرت و سرعت عکس‌العمل'],
    availableDays: ['همه‌روزه'],
    availableHours: ['۰۸:۰۰', '۰۹:۳۰', '۱۸:۰۰', '۱۹:۳۰', '۲۱:۰۰']
  }
];

export const initialTournaments: Tournament[] = [
  {
    id: 'tourn-1',
    title: 'جام ستارگان پدل پایتخت (پاییزه)',
    clubId: 'club-1',
    clubName: 'باشگاه پدل مجموعه انقلاب تهران',
    province: 'تهران',
    category: 'Cat 1 (پیشرفته)',
    format: 'Group + Knockout (گروهی و حذفی)',
    startDate: '۱۴۰۳/۰۷/۱۰',
    endDate: '۱۴۰۳/۰۷/۱۲',
    registrationDeadline: '۱۴۰۳/۰۷/۰۷',
    entryFee: 1800000, // For pair
    prizePool: '۷۰,۰۰۰,۰۰۰ تومان جوایز نقدی + راکت‌های Babolat',
    maxTeams: 16,
    registeredTeamsCount: 12,
    levelRange: '۳.۵۰ تا ۵.۵۰',
    status: 'ongoing',
    organizerType: 'club',
    organizerName: 'مدیریت باشگاه انقلاب تهران',
    bannerImage: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&auto=format&fit=crop&q=80',
    rules: [
      'مسابقات زیر نظر فدراسیون و طبق قوانین رسمی FIP برگزار می‌شود.',
      'هر تیم شامل دو بازیکن ثابت و یک بازیکن ذخیره مجاز است.',
      'امتیازات این مسابقات مستقیماً در رنکینگ رسمی استانی تهران و کشوری اعمال می‌گردد.',
      'توپ رسمی مسابقات Head Padel Pro S می‌باشد.'
    ],
    registeredTeams: [
      {
        id: 't-1',
        teamName: 'تیم شاهین طلایی',
        player1Name: 'رضا قاضی',
        player1Level: 3.85,
        player2Name: 'مهدی کریمی',
        player2Level: 3.7
      },
      {
        id: 't-2',
        teamName: 'تندیس پدل',
        player1Name: 'آرمان مهرپویا',
        player1Level: 4.15,
        player2Name: 'نوید اسدی',
        player2Level: 4.1
      },
      {
        id: 't-3',
        teamName: 'مدافعان آتشین',
        player1Name: 'سهراب مرادی',
        player1Level: 3.9,
        player2Name: 'علی شایان',
        player2Level: 3.8
      },
      {
        id: 't-4',
        teamName: 'عقاب‌های البرز',
        player1Name: 'پویا درخشان',
        player1Level: 4.2,
        player2Name: 'کیوان صفایی',
        player2Level: 4.0
      }
    ],
    bracket: [
      {
        id: 'm-semi-1',
        round: 'semi',
        roundName: 'نیمه‌نهایی ۱',
        matchNumber: 1,
        team1: { id: 't-1', name: 'شاهین طلایی', score: [6, 7], isWinner: true, seed: 1 },
        team2: { id: 't-3', name: 'مدافعان آتشین', score: [4, 5], isWinner: false, seed: 4 },
        courtName: 'کورت ۱ سنتر کورت شیشه‌ای',
        scheduledTime: 'پنج‌شنبه ۱۷:۰۰',
        status: 'completed',
        winnerId: 't-1'
      },
      {
        id: 'm-semi-2',
        round: 'semi',
        roundName: 'نیمه‌نهایی ۲',
        matchNumber: 2,
        team1: { id: 't-2', name: 'تندیس پدل', score: [6, 6], isWinner: true, seed: 2 },
        team2: { id: 't-4', name: 'عقاب‌های البرز', score: [3, 4], isWinner: false, seed: 3 },
        courtName: 'کورت ۲ پانورامیک',
        scheduledTime: 'پنج‌شنبه ۱۸:۳۰',
        status: 'completed',
        winnerId: 't-2'
      },
      {
        id: 'm-final',
        round: 'final',
        roundName: 'فینال مسابقات',
        matchNumber: 3,
        team1: { id: 't-1', name: 'شاهین طلایی', score: [6, 4], isWinner: false },
        team2: { id: 't-2', name: 'تندیس پدل', score: [7, 6], isWinner: true },
        courtName: 'سنتر کورت اصلی استادیومی',
        scheduledTime: 'جمعه ۲۰:۰۰',
        status: 'completed',
        winnerId: 't-2'
      }
    ],
    winnerTeam: 'تندیس پدل (آرمان مهرپویا & نوید اسدی)',
    runnerUpTeam: 'شاهین طلایی (رضا قاضی & مهدی کریمی)'
  },
  {
    id: 'tourn-prov-1',
    title: 'المپیاد پدل قهرمانی استان تهران (انتخابی کشوری)',
    clubId: 'club-1',
    clubName: 'باشگاه انقلاب & شاهین (مشترک هیئت استان)',
    province: 'تهران',
    category: 'Open',
    format: 'Knockout (تک‌حذفی)',
    startDate: '۱۴۰۳/۰۸/۱۵',
    endDate: '۱۴۰۳/۰۸/۱۸',
    registrationDeadline: '۱۴۰۳/۰۸/۱۰',
    entryFee: 2200000,
    prizePool: '۱۰۰,۰۰۰,۰۰۰ تومان + تندیس قهرمانی استان',
    maxTeams: 32,
    registeredTeamsCount: 18,
    levelRange: 'رده آزاد استانی',
    status: 'registration',
    organizerType: 'province',
    organizerName: 'هیات پدل استان تهران',
    bannerImage: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=900&auto=format&fit=crop&q=80',
    rules: [
      'برگزارکننده رسمی: هیات پدل و اسکواش استان تهران.',
      'تنها بازیکنان دارای بیمه ورزشی و کارت عضویت استانی مجاز به حضور هستند.',
      'تیم‌های اول و دوم سهمیه مستقیم انتخابی تیم ملی را کسب می‌کنند.'
    ],
    registeredTeams: [
      { id: 'tp-1', teamName: 'آریا پدل تهران', player1Name: 'شایان معتمد', player1Level: 4.4, player2Name: 'فرزین داوودی', player2Level: 4.3 },
      { id: 'tp-2', teamName: 'طوفان پایتخت', player1Name: 'کامران یوسفی', player1Level: 4.1, player2Name: 'آرش کیانی', player2Level: 4.0 }
    ],
    bracket: [
      {
        id: 'm-prov-semi-1',
        round: 'semi',
        roundName: 'نیمه‌نهایی ۱ استان',
        matchNumber: 1,
        team1: { id: 'tp-1', name: 'آریا پدل تهران' },
        team2: { id: 'tp-3', name: 'پدل کلاب پاسداران' },
        courtName: 'کورت ۱ انقلاب',
        scheduledTime: 'پنج‌شنبه ۱۶:۰۰',
        status: 'pending'
      },
      {
        id: 'm-prov-semi-2',
        round: 'semi',
        roundName: 'نیمه‌نهایی ۲ استان',
        matchNumber: 2,
        team1: { id: 'tp-2', name: 'طوفان پایتخت' },
        team2: { id: 'tp-4', name: 'تیم نگین فرمانیه' },
        courtName: 'کورت ۲ انقلاب',
        scheduledTime: 'پنج‌شنبه ۱۷:۳۰',
        status: 'pending'
      },
      {
        id: 'm-prov-final',
        round: 'final',
        roundName: 'فینال قهرمانی استان',
        matchNumber: 3,
        courtName: 'سنتر کورت مرکزی',
        scheduledTime: 'جمعه ۱۹:۰۰',
        status: 'pending'
      }
    ]
  },
  {
    id: 'tourn-2',
    title: 'تورنومنت آمریکانو آخر هفته شاهین (سریع و هیجان‌انگیز)',
    clubId: 'club-2',
    clubName: 'باشگاه پدل شاهین پاسداران',
    province: 'تهران',
    category: 'مختلط (Mixed)',
    format: 'Americano (آمریکانو)',
    startDate: '۱۴۰۳/۰۶/۳۰',
    endDate: '۱۴۰۳/۰۶/۳۰',
    registrationDeadline: '۱۴۰۳/۰۶/۲۹',
    entryFee: 950000,
    prizePool: '۲۰,۰۰۰,۰۰۰ تومان + بن خرید پرو شاپ',
    maxTeams: 12,
    registeredTeamsCount: 10,
    levelRange: '۲.۸۰ تا ۳.۸۰',
    status: 'registration',
    organizerType: 'club',
    organizerName: 'مدیریت باشگاه شاهین پاسداران',
    bannerImage: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=900&auto=format&fit=crop&q=80',
    rules: [
      'فرمت آمریکانو: هر بازیکن با پارتنرهای مختلف ۳۲ امتیاز بازی می‌کند.',
      'مجموع امتیازات هر شخص ثبت و رتبه نهایی محاسبه می‌شود.',
      'پذیرایی ردبول و مکمل‌های ایزوتونیک در طول مسابقه رایگان است.'
    ],
    registeredTeams: []
  },
  {
    id: 'tourn-3',
    title: 'مسابقات قهرمانی جایزه بزرگ خلیج فارس (مارینا کیش)',
    clubId: 'club-3',
    clubName: 'مجموعه پدل مارینا کیش',
    province: 'هرمزگان',
    category: 'Open',
    format: 'Knockout (تک‌حذفی)',
    startDate: '۱۴۰۳/۰۸/۰۲',
    endDate: '۱۴۰۳/۰۸/۰۴',
    registrationDeadline: '۱۴۰۳/۰۷/۲۵',
    entryFee: 2500000,
    prizePool: '۱۲۰,۰۰۰,۰۰۰ تومان وجه نقد + کاپ نفیس زرین',
    maxTeams: 32,
    registeredTeamsCount: 26,
    levelRange: 'آزاد (رده ۱ تا ۳ کشوری)',
    status: 'registration',
    organizerType: 'province',
    organizerName: 'هیات ورزش‌های راکتی استان هرمزگان و کیش',
    bannerImage: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=900&auto=format&fit=crop&q=80',
    rules: [
      'بالاترین ضریب امتیاز رنکینگ در تقویم مسابقاتی کشور.',
      'پخش زنده اینترنتی مراحل نیمه‌نهایی و فینال.',
      'تسهیلات اقامت هتل ۵ ستاره مارینا پارک برای بازیکنان خارج از استان.'
    ],
    registeredTeams: []
  },
  {
    id: 'tourn-4',
    title: 'کاپ زاینده‌رود اصفهان (پایان یافته)',
    clubId: 'club-4',
    clubName: 'آکادمی پدل اسپادانا اصفهان',
    province: 'اصفهان',
    category: 'Cat 1 (پیشرفته)',
    format: 'Knockout (تک‌حذفی)',
    startDate: '۱۴۰۳/۰۵/۱۵',
    endDate: '۱۴۰۳/۰۵/۱۷',
    registrationDeadline: '۱۴۰۳/۰۵/۱۰',
    entryFee: 1500000,
    prizePool: '۴۰,۰۰۰,۰۰۰ تومان',
    maxTeams: 16,
    registeredTeamsCount: 16,
    levelRange: '۳.۵۰+',
    status: 'completed',
    organizerType: 'club',
    organizerName: 'باشگاه اسپادانا اصفهان',
    bannerImage: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=900&auto=format&fit=crop&q=80',
    winnerTeam: 'بردیا کیانی & سامان یزدانی',
    runnerUpTeam: 'فرشاد حسینی & نیما ارجمند',
    rules: ['پایان یافته با ثبت نتایج رسمی و آپدیت رنکینگ استان اصفهان.'],
    registeredTeams: [],
    bracket: [
      {
        id: 'm-isf-semi-1',
        round: 'semi',
        roundName: 'نیمه‌نهایی ۱ اصفهان',
        matchNumber: 1,
        team1: { id: 'isf-1', name: 'کیانی & یزدانی', score: [6, 6], isWinner: true },
        team2: { id: 'isf-3', name: 'بهرامی & صادقی', score: [2, 3], isWinner: false },
        courtName: 'کورت ۱ زاینده‌رود',
        scheduledTime: '۱۶:۰۰',
        status: 'completed',
        winnerId: 'isf-1'
      },
      {
        id: 'm-isf-semi-2',
        round: 'semi',
        roundName: 'نیمه‌نهایی ۲ اصفهان',
        matchNumber: 2,
        team1: { id: 'isf-2', name: 'حسینی & ارجمند', score: [7, 6], isWinner: true },
        team2: { id: 'isf-4', name: 'مرادی & فیروزیان', score: [5, 4], isWinner: false },
        courtName: 'کورت ۲ پرواز',
        scheduledTime: '۱۷:۳۰',
        status: 'completed',
        winnerId: 'isf-2'
      },
      {
        id: 'm-isf-final',
        round: 'final',
        roundName: 'فینال کاپ زاینده‌رود',
        matchNumber: 3,
        team1: { id: 'isf-1', name: 'کیانی & یزدانی', score: [6, 7], isWinner: true },
        team2: { id: 'isf-2', name: 'حسینی & ارجمند', score: [3, 5], isWinner: false },
        courtName: 'سنتر کورت اسپادانا',
        scheduledTime: '۱۹:۳۰',
        status: 'completed',
        winnerId: 'isf-1'
      }
    ]
  }
];

export const initialRankings: RankingPlayer[] = [
  {
    rank: 1,
    provinceRank: 1,
    id: 'rp-1',
    name: 'بردیا کیانی',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    province: 'اصفهان',
    level: 4.6,
    points: 2150,
    tournamentsPlayed: 12,
    tournamentsWon: 5,
    winRate: 83,
    form: ['W', 'W', 'W', 'W', 'W']
  },
  {
    rank: 2,
    provinceRank: 1,
    id: 'rp-2',
    name: 'آرمان مهرپویا',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    province: 'تهران',
    level: 4.15,
    points: 1790,
    tournamentsPlayed: 9,
    tournamentsWon: 3,
    winRate: 75,
    form: ['W', 'W', 'L', 'W', 'W']
  },
  {
    rank: 3,
    provinceRank: 2,
    id: 'rp-3',
    name: 'کیارش آریافر',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    province: 'هرمزگان',
    level: 4.8,
    points: 1720,
    tournamentsPlayed: 8,
    tournamentsWon: 3,
    winRate: 78,
    form: ['W', 'L', 'W', 'W', 'W']
  },
  {
    rank: 4,
    provinceRank: 2,
    id: 'player-me',
    name: 'رضا قاضی (شما)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    province: 'تهران',
    level: 3.85,
    points: 1640,
    tournamentsPlayed: 6,
    tournamentsWon: 2,
    winRate: 71,
    form: ['W', 'W', 'L', 'W', 'W']
  },
  {
    rank: 5,
    provinceRank: 3,
    id: 'rp-4',
    name: 'نوید اسدی',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    province: 'تهران',
    level: 4.1,
    points: 1580,
    tournamentsPlayed: 7,
    tournamentsWon: 1,
    winRate: 69,
    form: ['L', 'W', 'W', 'W', 'L']
  },
  {
    rank: 6,
    provinceRank: 1,
    id: 'rp-5',
    name: 'سهراب مرادی',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    province: 'البرز',
    level: 3.9,
    points: 1510,
    tournamentsPlayed: 7,
    tournamentsWon: 1,
    winRate: 67,
    form: ['W', 'L', 'W', 'L', 'W']
  },
  {
    rank: 7,
    provinceRank: 1,
    id: 'rp-6',
    name: 'سارا نیک‌زاد',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    province: 'فارس',
    level: 3.6,
    points: 1380,
    tournamentsPlayed: 4,
    tournamentsWon: 1,
    winRate: 66,
    form: ['W', 'W', 'L', 'W', 'L']
  }
];

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
