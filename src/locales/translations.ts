import { Language, AppCategory } from '../types';

export interface TranslationSchema {
  appName: string;
  tagline: string;
  searchPlaceholder: string;
  home: string;
  search: string;
  upload: string;
  myApps: string;
  profile: string;
  adminPanel: string;
  trending: string;
  newReleases: string;
  topRated: string;
  mostDownloaded: string;
  allApps: string;
  viewAll: string;
  download: string;
  downloading: string;
  installWarning: string;
  playProtectVerified: string;
  verifiedDeveloper: string;
  size: string;
  version: string;
  downloadsCount: string;
  rating: string;
  reviews: string;
  writeReview: string;
  editReview: string;
  deleteReview: string;
  submitReview: string;
  reviewSubmitted: string;
  whatsNew: string;
  aboutApp: string;
  screenshots: string;
  similarApps: string;
  reportApp: string;
  shareApp: string;
  copiedLink: string;
  uploadTitle: string;
  uploadSubtitle: string;
  appNameLabel: string;
  categoryLabel: string;
  shortDescLabel: string;
  fullDescLabel: string;
  versionLabel: string;
  packageLabel: string;
  whatsNewLabel: string;
  appIconLabel: string;
  screenshotsLabel: string;
  apkFileLabel: string;
  uploadButton: string;
  uploadingNotice: string;
  dailyLimitNotice: string;
  pendingNotice: string;
  memberSince: string;
  editProfile: string;
  displayName: string;
  bio: string;
  websiteLink: string;
  saveProfile: string;
  appsUploaded: string;
  totalAppDownloads: string;
  avgRating: string;
  publishedTab: string;
  pendingTab: string;
  rejectedTab: string;
  rejectionReason: string;
  editApp: string;
  deleteApp: string;
  confirmDeleteApp: string;
  settings: string;
  darkMode: string;
  language: string;
  notifications: string;
  changePassword: string;
  logout: string;
  deleteAccount: string;
  confirmDeleteAccount: string;
  loginPrompt: string;
  loginSubtitle: string;
  continueWithGoogle: string;
  orWithEmail: string;
  email: string;
  password: string;
  signIn: string;
  signUp: string;
  noAccount: string;
  alreadyAccount: string;
  forgotPassword: string;
  resetEmailSent: string;
  pendingApps: string;
  reportedApps: string;
  userManagement: string;
  approve: string;
  reject: string;
  enterRejectionReason: string;
  banUser: string;
  unbanUser: string;
  dismissReport: string;
  totalStats: string;
  totalApps: string;
  totalUsers: string;
  totalDownloads: string;
  noAppsFound: string;
  installPWA: string;
  guide: string;
  terms: string;
  privacy: string;
  dmca: string;
  categories: Record<AppCategory, string>;
}

const enBase: TranslationSchema = {
  appName: "App Public Life",
  tagline: "Android APK & Games Marketplace",
  searchPlaceholder: "Search apps, games, puzzle, adventure...",
  home: "Home",
  search: "Search",
  upload: "Upload",
  myApps: "My Apps",
  profile: "Profile",
  adminPanel: "Admin Panel",
  trending: "Trending Games",
  newReleases: "New & Updated",
  topRated: "Top Rated",
  mostDownloaded: "Most Downloaded",
  allApps: "Explore All Apps",
  viewAll: "See All",
  download: "Download APK",
  downloading: "Preparing Download...",
  installWarning: "Only install apps from developers you trust.",
  playProtectVerified: "Play Protect Verified Safe",
  verifiedDeveloper: "Verified Developer",
  size: "Size",
  version: "Version",
  downloadsCount: "Downloads",
  rating: "Rating",
  reviews: "Reviews",
  writeReview: "Rate & Review this app",
  editReview: "Edit Your Review",
  deleteReview: "Delete Review",
  submitReview: "Submit Review",
  reviewSubmitted: "Thank you for your review!",
  whatsNew: "What's New",
  aboutApp: "About this app",
  screenshots: "Screenshots",
  similarApps: "Similar Apps",
  reportApp: "Report this app",
  shareApp: "Share",
  copiedLink: "Link copied to clipboard!",
  uploadTitle: "Publish an Android APK",
  uploadSubtitle: "Share your app with millions of Android users worldwide",
  appNameLabel: "App Name",
  categoryLabel: "Category",
  shortDescLabel: "Short Description (max 80 chars)",
  fullDescLabel: "Full Description",
  versionLabel: "Version (e.g., 1.0.0)",
  packageLabel: "Package Name (e.g., com.studio.game)",
  whatsNewLabel: "What's New in this version",
  appIconLabel: "App Icon (PNG/JPEG/WebP, max 5MB)",
  screenshotsLabel: "Screenshots (Up to 9 images)",
  apkFileLabel: "APK / Game Package (Max 100MB file or unlimited GB via direct link)",
  uploadButton: "Publish App",
  uploadingNotice: "Uploading files and registering your app...",
  dailyLimitNotice: "Daily upload limit: 10 apps per day.",
  pendingNotice: "New apps are verified and published live immediately.",
  memberSince: "Member since",
  editProfile: "Edit Profile",
  displayName: "Display Name",
  bio: "Bio (max 150 characters)",
  websiteLink: "Website / Social Link",
  saveProfile: "Save Changes",
  appsUploaded: "Apps Uploaded",
  totalAppDownloads: "Total Downloads",
  avgRating: "Avg Rating",
  publishedTab: "Published",
  pendingTab: "Pending Review",
  rejectedTab: "Rejected",
  rejectionReason: "Rejection Reason",
  editApp: "Edit App",
  deleteApp: "Delete App",
  confirmDeleteApp: "Are you sure you want to permanently delete this app?",
  settings: "Settings",
  darkMode: "Dark Mode",
  language: "Language",
  notifications: "Notifications",
  changePassword: "Change Password",
  logout: "Log Out",
  deleteAccount: "Delete My Account",
  confirmDeleteAccount: "Are you sure? This will delete your profile and public records.",
  loginPrompt: "Log in or Create an Account",
  loginSubtitle: "Sign in to upload apps, leave reviews, and track downloads.",
  continueWithGoogle: "Continue with Google",
  orWithEmail: "Or with Email",
  email: "Email Address",
  password: "Password",
  signIn: "Sign In",
  signUp: "Create Account",
  noAccount: "Don't have an account?",
  alreadyAccount: "Already have an account?",
  forgotPassword: "Forgot Password?",
  resetEmailSent: "Password reset instructions sent to your email.",
  pendingApps: "Pending Apps",
  reportedApps: "Reports",
  userManagement: "User Management",
  approve: "Approve App",
  reject: "Reject App",
  enterRejectionReason: "Provide a reason for rejection:",
  banUser: "Ban User",
  unbanUser: "Unban User",
  dismissReport: "Dismiss Report",
  totalStats: "Store Overview",
  totalApps: "Total Apps",
  totalUsers: "Registered Users",
  totalDownloads: "Global Downloads",
  noAppsFound: "No apps found matching your query.",
  installPWA: "Install App Public Life",
  guide: "Firebase Setup Guide",
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  dmca: "DMCA / Copyright",
  categories: {
    Games: "Games",
    Puzzle: "Puzzle",
    Adventure: "Adventure",
    Action: "Action",
    Racing: "Racing",
    Strategy: "Strategy",
    RPG: "RPG",
    Simulation: "Simulation",
    Arcade: "Arcade",
    Sports: "Sports",
    Casual: "Casual",
    Apps: "Apps",
    Tools: "Tools",
    Education: "Education",
    Social: "Social",
    Entertainment: "Entertainment",
    'Board & Card': "Board & Card",
    'Trivia & Word': "Trivia & Word",
    'Horror & Mystery': "Horror & Mystery",
    'Survival & Craft': "Survival & Craft",
    Productivity: "Productivity",
    Personalization: "Personalization"
  }
};

export const translations: Record<Language, TranslationSchema> = {
  en: enBase,
  ur: {
    ...enBase,
    appName: "App Public Life",
    tagline: "اینڈرائیڈ اے پی کے اور گیمز اسٹور",
    searchPlaceholder: "ایپس، گیمز، پزل، ایڈونچر تلاش کریں...",
    home: "ہوم",
    search: "تلاش",
    upload: "اپ لوڈ",
    myApps: "میری ایپس",
    profile: "پروفائل",
    adminPanel: "ایڈمن پینل",
    trending: "مقبول گیمز",
    newReleases: "نئی ریلیز",
    topRated: "ٹاپ ریٹیڈ",
    mostDownloaded: "سب سے زیادہ ڈاؤن لوڈ",
    allApps: "تمام ایپس دیکھیں",
    viewAll: "سب دیکھیں",
    download: "ڈاؤن لوڈ APK",
    downloading: "ڈاؤن لوڈ تیار ہو رہا ہے...",
    installWarning: "صرف قابل اعتماد ڈویلپرز کی ایپس انسٹال کریں۔",
    playProtectVerified: "Play Protect سے محفوظ اور تصدیق شدہ",
    verifiedDeveloper: "تصدیق شدہ ڈویلپر",
    size: "سائز",
    version: "ورژن",
    downloadsCount: "ڈاؤن لوڈز",
    rating: "ریٹنگ",
    reviews: "تبصرے",
    writeReview: "ریٹنگ اور تبصرہ لکھیں",
    editReview: "تبصرہ تبدیل کریں",
    deleteReview: "تبصرہ ڈیلیٹ کریں",
    submitReview: "تبصرہ بھیجیں",
    reviewSubmitted: "تبصرہ کرنے کا شکریہ!",
    whatsNew: "نیا کیا ہے",
    aboutApp: "ایپ کے بارے میں",
    screenshots: "اسکرین شاٹس",
    similarApps: "ملتی جلتی ایپس",
    reportApp: "رپورٹ کریں",
    shareApp: "شیئر کریں",
    copiedLink: "لنک کاپی ہو گیا!",
    uploadTitle: "اینڈرائیڈ APK پبلش کریں",
    uploadSubtitle: "اپنی ایپ لاکھوں صارفین تک پہنچائیں",
    appNameLabel: "ایپ کا نام",
    categoryLabel: "کیٹیگری (Category)",
    shortDescLabel: "مختصر تفصیل",
    fullDescLabel: "مکمل تفصیل",
    versionLabel: "ورژن (مثلاً 1.0.0)",
    packageLabel: "پیکیج نام (مثلاً com.studio.game)",
    whatsNewLabel: "اس ورژن میں نیا کیا ہے",
    appIconLabel: "ایپ آئیکن (زیادہ سے زیادہ 5MB)",
    screenshotsLabel: "اسکرین شاٹس (زیادہ سے زیادہ 9 تصاویر)",
    apkFileLabel: "APK یا گیم فائل (فائل یا ڈائریکٹ ڈاؤن لوڈ لنک)",
    uploadButton: "ایپ پبلش کریں",
    uploadingNotice: "فائلیں تیز رفتار اپ لوڈ ہو رہی ہیں...",
    dailyLimitNotice: "روزانہ کی حد: 10 ایپس۔",
    pendingNotice: "نئی ایپس فوری پبلک اور لائیو کر دی جاتی ہیں۔",
    publishedTab: "پبلک",
    pendingTab: "پینڈنگ",
    rejectedTab: "مسترد",
    settings: "ترتیبات",
    darkMode: "ڈارک موڈ",
    language: "زبان",
    logout: "لاگ آؤٹ",
    loginPrompt: "لاگ ان یا نیا اکاؤنٹ بنائیں",
    signIn: "سائن ان",
    signUp: "اکاؤنٹ بنائیں",
    categories: {
      Games: "گیمز",
      Puzzle: "پزل (Puzzle)",
      Adventure: "ایڈونچر (Adventure)",
      Action: "ایکشن (Action)",
      Racing: "ریسنگ (Racing)",
      Strategy: "اسٹریٹجی",
      RPG: "آر پی جی",
      Simulation: "سمولیشن",
      Arcade: "آرکیڈ",
      Sports: "کھیل",
      Casual: "کیژول",
      Apps: "ایپس",
      Tools: "ٹولز",
      Education: "تعلیم",
      Social: "سوشل",
      Entertainment: "تفریح"
    }
  },
  hi: {
    ...enBase,
    appName: "App Public Life",
    tagline: "एंड्रॉइड APK और गेम्स मार्केटप्लेस",
    searchPlaceholder: "ऐप्स, गेम्स, पहेली (Puzzle) और एडवेंचर खोजें...",
    home: "होम",
    search: "खोजें",
    upload: "अपलोड",
    myApps: "मेरे ऐप्स",
    profile: "प्रोफ़ाइल",
    adminPanel: "एडमिन पैनल",
    trending: "ट्रेंडिंग गेम्स",
    newReleases: "नए और अपडेटेड",
    topRated: "टॉप रेटेड",
    mostDownloaded: "सबसे ज्यादा डाउनलोड",
    allApps: "सभी ऐप्स एक्सप्लोर करें",
    viewAll: "सभी देखें",
    download: "APK डाउनलोड करें",
    downloading: "डाउनलोड तैयार हो रहा है...",
    size: "साइज",
    version: "वर्जन",
    downloadsCount: "डाउनलोड्स",
    rating: "रेटिंग",
    reviews: "समीक्षाएं",
    uploadTitle: "एंड्रॉइड APK प्रकाशित करें",
    uploadSubtitle: "दुनिया भर के उपयोगकर्ताओं के साथ ऐप साझा करें",
    appNameLabel: "ऐप का नाम",
    categoryLabel: "श्रेणी (Category)",
    shortDescLabel: "संक्षिप्त विवरण",
    fullDescLabel: "विस्तृत विवरण",
    appIconLabel: "ऐप आइकन (अधिकतम 5MB)",
    screenshotsLabel: "स्क्रीनशॉट (अधिकतम 9 तस्वीरें)",
    uploadButton: "ऐप पब्लिश करें",
    uploadingNotice: "फाइलें प्रोसेस हो रही हैं...",
    publishedTab: "लाइव",
    pendingTab: "पेंडिंग",
    settings: "सेटिंग्स",
    darkMode: "डार्क मोड",
    language: "भाषा",
    logout: "लॉग आउट",
    signIn: "साइन इन करें",
    signUp: "अकाउंट बनाएं",
    categories: {
      Games: "गेम्स",
      Puzzle: "पहेली (Puzzle)",
      Adventure: "एडवेंचर (Adventure)",
      Action: "एक्शन (Action)",
      Racing: "रेसिंग (Racing)",
      Strategy: "रणनीति (Strategy)",
      RPG: "आरपीजी",
      Simulation: "सिमुलेशन",
      Arcade: "आर्केड",
      Sports: "स्पोर्ट्स",
      Casual: "कैजुअल",
      Apps: "ऐप्स",
      Tools: "टूल्स",
      Education: "शिक्षा",
      Social: "सोशल",
      Entertainment: "मनोरंजन"
    }
  },
  ja: {
    ...enBase,
    appName: "App Public Life",
    tagline: "Android APK & ゲームストア",
    searchPlaceholder: "アプリ、ゲーム、パズル、冒険を検索...",
    home: "ホーム",
    search: "検索",
    upload: "アップロード",
    myApps: "マイアプリ",
    profile: "プロフィール",
    trending: "トレンドゲーム",
    newReleases: "新着・更新",
    download: "APKダウンロード",
    downloading: "ダウンロード準備中...",
    screenshotsLabel: "スクリーンショット (最大9枚)",
    uploadButton: "アプリを公開",
    categories: {
      ...enBase.categories,
      Games: "ゲーム",
      Puzzle: "パズル",
      Adventure: "アドベンチャー",
      Action: "アクション",
      Racing: "レース",
      Strategy: "戦略",
      Sports: "スポーツ",
      Casual: "カジュアル"
    }
  },
  ar: {
    ...enBase,
    appName: "App Public Life",
    tagline: "سوق ألعاب وتطبيقات أندرويد",
    searchPlaceholder: "ابحث عن التطبيقات، الألعاب، الألغاز...",
    home: "الرئيسية",
    search: "بحث",
    upload: "رفع",
    myApps: "تطبيقاتي",
    profile: "الملف الشخصي",
    trending: "ألعاب رائجة",
    newReleases: "جديد ومحدث",
    download: "تحميل APK",
    downloading: "جار التحضير...",
    screenshotsLabel: "لقطات الشاشة (حتى 9 صور)",
    uploadButton: "نشر التطبيق",
    categories: {
      ...enBase.categories,
      Games: "ألعاب",
      Puzzle: "ألغاز",
      Adventure: "مغامرات",
      Action: "أكشن",
      Racing: "سباق",
      Sports: "رياضة"
    }
  },
  es: {
    ...enBase,
    searchPlaceholder: "Buscar apps, juegos, puzles, aventura...",
    home: "Inicio",
    search: "Buscar",
    upload: "Publicar",
    myApps: "Mis Apps",
    download: "Descargar APK",
    screenshotsLabel: "Capturas de pantalla (hasta 9 imágenes)",
    categories: {
      ...enBase.categories,
      Games: "Juegos",
      Puzzle: "Puzles",
      Adventure: "Aventura",
      Action: "Acción",
      Racing: "Carreras"
    }
  },
  fr: {
    ...enBase,
    searchPlaceholder: "Rechercher des applications, jeux, puzzle...",
    home: "Accueil",
    search: "Recherche",
    upload: "Publier",
    myApps: "Mes Apps",
    download: "Télécharger APK",
    screenshotsLabel: "Captures d'écran (jusqu'à 9 images)",
    categories: {
      ...enBase.categories,
      Games: "Jeux",
      Puzzle: "Puzzle",
      Adventure: "Aventure",
      Action: "Action",
      Racing: "Course"
    }
  },
  de: {
    ...enBase,
    searchPlaceholder: "Apps, Spiele, Rätsel suchen...",
    home: "Startseite",
    search: "Suche",
    upload: "Hochladen",
    myApps: "Meine Apps",
    download: "APK herunterladen",
    screenshotsLabel: "Screenshots (bis zu 9 Bilder)",
    categories: {
      ...enBase.categories,
      Games: "Spiele",
      Puzzle: "Rätsel",
      Adventure: "Abenteuer",
      Action: "Action",
      Racing: "Rennspiele"
    }
  },
  ru: {
    ...enBase,
    searchPlaceholder: "Поиск игр, приложений, головоломок...",
    home: "Главная",
    search: "Поиск",
    upload: "Загрузить",
    myApps: "Мои приложения",
    download: "Скачать APK",
    screenshotsLabel: "Скриншоты (до 9 изображений)",
    categories: {
      ...enBase.categories,
      Games: "Игры",
      Puzzle: "Головоломки",
      Adventure: "Приключения",
      Action: "Экшен",
      Racing: "Гонки"
    }
  },
  zh: {
    ...enBase,
    searchPlaceholder: "搜索应用、游戏、益智、冒险...",
    home: "首页",
    search: "搜索",
    upload: "上传",
    myApps: "我的应用",
    download: "下载 APK",
    screenshotsLabel: "应用截图 (最多9张)",
    categories: {
      ...enBase.categories,
      Games: "游戏",
      Puzzle: "解谜益智",
      Adventure: "冒险",
      Action: "动作",
      Racing: "竞速"
    }
  },
  pt: {
    ...enBase,
    searchPlaceholder: "Pesquisar apps, jogos, quebra-cabeças...",
    home: "Início",
    search: "Buscar",
    upload: "Publicar",
    myApps: "Meus Apps",
    download: "Baixar APK",
    screenshotsLabel: "Capturas de tela (até 9 imagens)",
    categories: {
      ...enBase.categories,
      Games: "Jogos",
      Puzzle: "Quebra-cabeça",
      Adventure: "Aventura",
      Action: "Ação",
      Racing: "Corrida"
    }
  },
  tr: {
    ...enBase,
    searchPlaceholder: "Uygulamalar, oyunlar, bulmacalar ara...",
    home: "Ana Sayfa",
    search: "Ara",
    upload: "Yükle",
    myApps: "Uygulamalarım",
    download: "APK İndir",
    screenshotsLabel: "Ekran Görüntüleri (en fazla 9 resim)",
    categories: {
      ...enBase.categories,
      Games: "Oyunlar",
      Puzzle: "Bulmaca",
      Adventure: "Macera",
      Action: "Aksiyon",
      Racing: "Yarış"
    }
  },
  it: {
    ...enBase,
    searchPlaceholder: "Cerca app, giochi, puzzle, avventura...",
    home: "Home",
    search: "Cerca",
    upload: "Carica",
    myApps: "Le mie app",
    download: "Scarica APK",
    screenshotsLabel: "Screenshot (fino a 9 immagini)",
    categories: {
      ...enBase.categories,
      Games: "Giochi",
      Puzzle: "Puzzle",
      Adventure: "Avventura",
      Action: "Azione",
      Racing: "Corse"
    }
  },
  ko: {
    ...enBase,
    searchPlaceholder: "앱, 게임, 퍼즐, 어드벤처 검색...",
    home: "홈",
    search: "검색",
    upload: "업로드",
    myApps: "내 앱",
    download: "APK 다운로드",
    screenshotsLabel: "스크린샷 (최대 9장)",
    categories: {
      ...enBase.categories,
      Games: "게임",
      Puzzle: "퍼즐",
      Adventure: "어드벤처",
      Action: "액션",
      Racing: "레이싱"
    }
  },
  id: {
    ...enBase,
    searchPlaceholder: "Cari aplikasi, game, teka-teki...",
    home: "Beranda",
    search: "Cari",
    upload: "Unggah",
    myApps: "Aplikasi Saya",
    download: "Unduh APK",
    screenshotsLabel: "Tangkapan Layar (hingga 9 gambar)",
    categories: {
      ...enBase.categories,
      Games: "Game",
      Puzzle: "Teka-teki",
      Adventure: "Petualangan",
      Action: "Aksi",
      Racing: "Balapan"
    }
  },
  bn: {
    ...enBase,
    searchPlaceholder: "অ্যাপ, গেম, ধাঁধা অনুসন্ধান করুন...",
    home: "হোম",
    search: "খুঁজুন",
    upload: "আপলোড",
    myApps: "আমার অ্যাপস",
    download: "APK ডাউনলোড করুন",
    screenshotsLabel: "স্ক্রিনশট (সর্বোচ্চ ৯টি ছবি)",
    categories: {
      ...enBase.categories,
      Games: "গেমস",
      Puzzle: "ধাঁধা (Puzzle)",
      Adventure: "অ্যাডভেঞ্চার",
      Action: "অ্যাকশন",
      Racing: "রেসিং"
    }
  },
  pa: {
    ...enBase,
    searchPlaceholder: "ਐਪਸ, ਗੇਮਾਂ, ਬੁਝਾਰਤਾਂ ਖੋਜੋ...",
    home: "ਹੋਮ",
    search: "ਖੋਜ",
    upload: "ਅੱਪਲੋਡ",
    myApps: "ਮੇਰੀਆਂ ਐਪਸ",
    download: "APK ਡਾਊਨਲੋਡ ਕਰੋ",
    screenshotsLabel: "ਸਕ੍ਰੀਨਸ਼ੌਟਸ (ਵੱਧ ਤੋਂ ਵੱਧ 9 ਤਸਵੀਰਾਂ)",
    categories: {
      ...enBase.categories,
      Games: "ਗੇਮਾਂ",
      Puzzle: "ਬੁਝਾਰਤਾਂ",
      Adventure: "ਐਡਵੈਂਚਰ",
      Action: "ਐਕਸ਼ਨ",
      Racing: "ਰੇਸਿੰਗ"
    }
  },
  fa: {
    ...enBase,
    searchPlaceholder: "جستجوی برنامه‌ها، بازی‌ها، پازل...",
    home: "خانه",
    search: "جستجو",
    upload: "بارگذاری",
    myApps: "برنامه‌های من",
    download: "دانلود APK",
    screenshotsLabel: "اسکرین‌شات‌ها (حداکثر ۹ تصویر)",
    categories: {
      ...enBase.categories,
      Games: "بازی‌ها",
      Puzzle: "پازل",
      Adventure: "ماجراجویی",
      Action: "اکشن",
      Racing: "مسابقه‌ای"
    }
  },
  vi: {
    ...enBase,
    searchPlaceholder: "Tìm kiếm ứng dụng, trò chơi, câu đố...",
    home: "Trang chủ",
    search: "Tìm kiếm",
    upload: "Tải lên",
    myApps: "Ứng dụng của tôi",
    download: "Tải APK",
    screenshotsLabel: "Ảnh chụp màn hình (tối đa 9 ảnh)",
    categories: {
      ...enBase.categories,
      Games: "Trò chơi",
      Puzzle: "Câu đố",
      Adventure: "Phiêu lưu",
      Action: "Hành động",
      Racing: "Đua xe"
    }
  },
  th: {
    ...enBase,
    searchPlaceholder: "ค้นหาแอป, เกม, ปริศนา, ผจญภัย...",
    home: "หน้าแรก",
    search: "ค้นหา",
    upload: "อัปโหลด",
    myApps: "แอปของฉัน",
    download: "ดาวน์โหลด APK",
    screenshotsLabel: "ภาพหน้าจอ (สูงสุด 9 ภาพ)",
    categories: {
      ...enBase.categories,
      Games: "เกม",
      Puzzle: "ปริศนา",
      Adventure: "ผจญภัย",
      Action: "แอ็กชัน",
      Racing: "แข่งรถ"
    }
  }
};
