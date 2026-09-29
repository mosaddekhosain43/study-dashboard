export interface NCTBTopicDef {
  name: string;
}

export interface NCTBChapterOrModuleDef {
  name: string;
  topics: string[];
}

export interface NCTBSubjectDef {
  name: string;
  nameBn: string;
  slug: string;
  board: "madrasah";
  classLevel: "alim";
  streamGroup: "all" | "science" | "general_madrasah" | "quran_hadith";
  subjectType: "compulsory" | "group_elective" | "optional";
  structureType: "chapter" | "module";
  chaptersOrModules: NCTBChapterOrModuleDef[];
}

export const NCTB_CURRICULUM_DATA: NCTBSubjectDef[] = [
  {
    "name": "Alim Quran Mazid",
    "nameBn": "কুরআন মাজিদ (আলিম)",
    "slug": "alim-quran-mazid",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "উলূমুল কুরআন ও তাফসির পরিচিতি",
        "topics": [
          "ওহীর স্বরূপ ও কুরআন নাজিলের ক্রমধারা",
          "মুহকাম ও মুতাশাবিহাত আয়াতের ব্যাখ্যা",
          "নাসিখ ও মানসূখের শরয়ী নীতি",
          "প্রধান তাফসির গ্রন্থসমূহের পরিচিতি (জালালাইন, তাবারী, ইবনে কাসীর)"
        ]
      },
      {
        "name": "আল-কুরআনের নির্বাচিত অংশের তাফসির",
        "topics": [
          "সূরা আল-বাক্বারাহ (রুকূ' ১-৫ এর বিস্তারিত তাফসির)",
          "সূরা আন-নিসা: উত্তরাধিকার ও নারীদের অধিকার",
          "সূরা আল-মায়েদাহ: হালাল-হারাম ও পারস্পরিক চুক্তি",
          "সূরা আল-আনআম: তাওহীদ ও রিসালাতের প্রমাণ"
        ]
      }
    ]
  },
  {
    "name": "Alim Hadith Sharif",
    "nameBn": "হাদিস শরিফ (মিশকাতুল মাসাবীহ)",
    "slug": "alim-hadith",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "উসুলুল হাদিস (Principles of Hadith)",
        "topics": [
          "হাদিসের পরিভাষা: সনদ, মতন, রাবী ও রিজাল শাস্ত্র",
          "হাদিসের গ্রহণযোগ্যতা ভিত্তিক শ্রেণিবিভাগ (মুতাওয়াতির, আহাদ, মাশহুর)",
          "সহীহাইন ও সিহাহ সিত্তাহ সংকলকদের জীবনী"
        ]
      },
      {
        "name": "কিতাবুল ঈমান ও কিতাবুত তাহারাত",
        "topics": [
          "ঈমানের শাখা-প্রশাখা ও কবিরা গুনাহ",
          "তাহারাতের গুরুত্ব ও অজু-গোসলের বিস্তারিত হাদিস"
        ]
      },
      {
        "name": "কিতাবুল বুয়ূ ও মুআমালাত (লেনদেন ও সমাজনীতি)",
        "topics": [
          "ব্যবসা-বাণিজ্যের ইসলামিক শর্তাবলী",
          "সুদ, ঘুষ ও ধোঁকাবাজির নিষেধাজ্ঞা বিষয়ক হাদিস",
          "আমল ও চারিত্রিক সৌন্দর্যের হাদিসসমূহ"
        ]
      }
    ]
  },
  {
    "name": "Alim Fiqh 1st Paper",
    "nameBn": "ফিকহ ১ম পত্র (আল-হিদায়াহ)",
    "slug": "alim-fiqh-1",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "কিতাবুত তাহারাত ও কিতাবুস সালাত",
        "topics": [
          "পানির প্রকারভেদ ও কূয়ার বিধান",
          "তায়াম্মুম ও মোজার ওপর মাসেহ করার বিধান",
          "নামাজের ওয়াক্ত, শর্ত ও আরকানসমূহ",
          "ইমামত, জামাত ও সাহু সেজদার মাসআলা"
        ]
      },
      {
        "name": "কিতাবুয যাকাত ও কিতাবুস সাওম",
        "topics": [
          "যাকাত ফরজ হওয়ার শর্ত ও নিসাব",
          "যাকাতের ব্যয়ের খাতসমূহ (মাসারিফে যাকাত)",
          "রোজার কাজা ও কাফফারা সম্পর্কিত মাসআলা"
        ]
      }
    ]
  },
  {
    "name": "Alim Fiqh 2nd Paper",
    "nameBn": "ফিকহ ২য় পত্র (উসুলুশ শাশী ও সিরাজী ফারায়েজ)",
    "slug": "alim-fiqh-2",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "উসুলুল ফিকহ (উসুলুশ শাশী)",
        "topics": [
          "উসুলে ফিকহের সংজ্ঞা, লক্ষ্য ও উৎসসমূহ",
          "খাস ও আম-এর হুকুম ও প্রয়োগ",
          "মুশতারাক ও মুআউওয়াল-এর বিধান",
          "হাকিকত ও মাজায-এর নিয়মাবলী",
          "আমরের হুকুম ও নহীর হুকুম"
        ]
      },
      {
        "name": "ইলমুল ফারায়েজ (আস-সিরাজী ফিল ফারায়েজ)",
        "topics": [
          "ফারায়েজের মূলনীতি ও উত্তরাধিকারীদের শ্রেণিবিভাগ",
          "যাবিল ফুরূয (নির্দিষ্ট অংশীদার) এর অংশ নির্ণয়",
          "আসবাহ ও হাজব (উত্তরাধিকার থেকে বঞ্চিত হওয়ার নিয়ম)",
          "আউল ও রদ্দ-এর গাণিতিক বণ্টন পদ্ধতি",
          "মুনাসাখা ও বাস্তব মিরাস বণ্টন"
        ]
      }
    ]
  },
  {
    "name": "Alim Arabic 1st Paper",
    "nameBn": "আরবি ১ম পত্র (আদ-দুরূসুল আরাবিয়্যাহ)",
    "slug": "alim-arabic-1",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "আল-মাক্বালাত ওয়াল আদব (গদ্য সাহিত্য)",
        "topics": [
          "خطبة الوداع للرسول ﷺ (বিদায় হজ্বের ঐতিহাসিক ভাষণ)",
          "فضل العلم والعلماء (জ্ঞান ও ওলামায়ে কেরামের মর্যাদা)",
          "التسامح في الإسلام (ইসলামে পরমতসহিষ্ণুতা)",
          "الإسلام وبناء المجتمع (ইসলাম ও সমাজ গঠন)"
        ]
      },
      {
        "name": "ইনশা ও আরবি সাহিত্যকর্ম",
        "topics": [
          "আরবি পত্রলিখন ও প্রাতিষ্ঠানিক দরখাস্ত",
          "আরবি প্রবন্ধ রচনা ও সমসাময়িক বিষয়াবলী"
        ]
      }
    ]
  },
  {
    "name": "Alim Arabic 2nd Paper",
    "nameBn": "আরবি ২য় পত্র (কাওয়াইদুল লুগাহ ও তারকিব)",
    "slug": "alim-arabic-2",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "কাওয়ায়েদুন নাহু (উচ্চতর নাহু)",
        "topics": [
          "ইসমুল ফায়েল, মাফউল ও সিফাতে মুসাব্বাহা",
          "ইসমে তাফযীল ও ইসমে তাআজ্জুব",
          "হারফে জার ও মুদাফ-মুদাফ ইলাইহির নিয়ম",
          "তারকিব ও বাক্য বিশ্লেষণ পদ্ধতি"
        ]
      },
      {
        "name": "কাওয়ায়েদুস সরফ (উচ্চতর সরফ)",
        "topics": [
          "ছুলাছী মাজীদের বাবাসমূহ ও বৈশিষ্ট্য",
          "তালীলাতের নিয়মাবলী (তালীল)",
          "মাহমূজ ও মুদাআফ-এর রূপান্তর"
        ]
      }
    ]
  },
  {
    "name": "Alim Bangla 1st Paper",
    "nameBn": "বাংলা ১ম পত্র (সাহিত্য ও সহপাঠ)",
    "slug": "alim-bangla-1",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "গদ্যাংশ (Prose Selection)",
        "topics": [
          "অপরিচিতা — রবীন্দ্রনাথ ঠাকুর",
          "বিলাসী — শরৎচন্দ্র চট্টোপাধ্যায়",
          "আমার পথ — কাজী নজরুল ইসলাম",
          "মানব কল্যাণ — আবুল ফজল",
          "মাসি-পিসি — মানিক বন্দ্যোপাধ্যায়",
          "বায়ান্নর দিনগুলো — শেখ মুজিবুর রহমান",
          "রেইনকোট — আখতারুজ্জামান ইলিয়াস"
        ]
      },
      {
        "name": "কবিতাংশ (Poetry Selection)",
        "topics": [
          "ঐকতান — রবীন্দ্রনাথ ঠাকুর",
          "সাম্যবাদী — কাজী নজরুল ইসলাম",
          "তাহারেই পড়ে মনে — সুফিয়া কামাল",
          "সেই অস্ত্র — আহসান হাবীব",
          "আঠারো বছর বয়স — সুকান্ত ভট্টাচার্য",
          "ফেব্রুয়ারি ১৯৬৯ — শামসুর রাহমান",
          "আমি কিংবদন্তির কথা বলছি — আবু জাফর ওবায়দুল্লাহ"
        ]
      },
      {
        "name": "সহপাঠ: উপন্যাস ও নাটক",
        "topics": [
          "উপন্যাস: লালসালু — সৈয়দ ওয়ালীউল্লাহ (বিষয়বস্তু ও চরিত্র)",
          "নাটক: সিরাজউদ্দৌলা — সিকান্দার আবু জাফর (ঐতিহাসিক পটভূমি ও মূল্যায়ন)"
        ]
      }
    ]
  },
  {
    "name": "Alim Bangla 2nd Paper",
    "nameBn": "বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)",
    "slug": "alim-bangla-2",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "উচ্চ মাধ্যমিক বাংলা ব্যাকরণ",
        "topics": [
          "বাংলা উচ্চারণের নিয়ম (অ-ধ্বনি, এ-ধ্বনি, ব-ফলা, ম-ফলা)",
          "বাংলা বানানের নিয়ম (বাংলা একাডেমি প্রমিত বানানরীতি)",
          "বাংলা ব্যাকরণিক শব্দশ্রেণি (শ্রেণিবিভাগ ও শনাক্তকরণ)",
          "শব্দ গঠন: উপসর্গ ও প্রত্যয়",
          "শব্দ গঠন: সমাস (ব্যাসবাক্যসহ সমাস নির্ণয়)",
          "বাক্যতত্ত্ব: বাক্যের গঠন ও রূপান্তর",
          "বাংলা ভাষার অপপ্রয়োগ ও শুদ্ধ প্রয়োগ"
        ]
      },
      {
        "name": "নির্মিতি ও যোগাযোগ",
        "topics": [
          "পারিভাষিক শব্দ ও অনুবাদ",
          "দিনলিপি লিখন ও অভিজ্ঞতা বর্ণনা",
          "ভাষণ লিখন ও প্রতিবেদন প্রণয়ন",
          "বৈদ্যুতিন চিঠি (ই-মেইল) ও আবেদনপত্র",
          "সারাংশ, সারমর্ম ও ভাবসম্প্রসারণ",
          "সংলাপ লিখন ও খুদে গল্প রচনা"
        ]
      }
    ]
  },
  {
    "name": "Alim English 1st Paper",
    "nameBn": "ইংরেজি ১ম পত্র (English for Today)",
    "slug": "alim-english-1",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "English for Today Modules",
        "topics": [
          "People or Institutions Making History (Nelson Mandela, Bangabandhu)",
          "Traffic Education (Rules, Safety and Accidents)",
          "Food Adulteration (Health Concerns and Consumer Rights)",
          "Human Relationships (Family, Society and Empathy)",
          "Youthful Achievers & Pioneers",
          "Adolescence (Challenges and Mental Well-being)",
          "Human Rights & Injustice",
          "Environment and Ecosystem (Rivers, Forests, Pollution)",
          "Myths and Literature (Hercules, Bengal Folk Tales)",
          "Peace and Conflict (War, Non-violence & Harmony)"
        ]
      },
      {
        "name": "Guided Writing & Comprehension",
        "topics": [
          "Multiple Choice and Comprehension Questions",
          "Information Transfer and Flow Charts",
          "Summary Writing of Prose and Poems",
          "Theme Writing of Literary Poems",
          "Interpreting Graphs and Charts",
          "Story Writing with a Climax"
        ]
      }
    ]
  },
  {
    "name": "Alim English 2nd Paper",
    "nameBn": "ইংরেজি ২য় পত্র (Grammar & Composition)",
    "slug": "alim-english-2",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "Advanced Grammar",
        "topics": [
          "Gap Filling with Prepositions",
          "Special Phrases (as soon as, would rather, had better, let alone, what if)",
          "Completing Sentences with Clauses and Conditionals",
          "Right Form of Verbs and Subject-Verb Agreement",
          "Narrative Style (Direct and Indirect Speech Transformation)",
          "Use of Modifiers (Pre-modifiers and Post-modifiers)",
          "Sentence Connectors and Cohesion",
          "Synonyms and Antonyms",
          "Punctuation Marks and Capitalization"
        ]
      },
      {
        "name": "Formal Written Communication",
        "topics": [
          "Formal Letters and Official Applications",
          "Letters to Newspaper Editors and Complaints",
          "Paragraph Writing (Cause and Effect, Comparison and Contrast)"
        ]
      }
    ]
  },
  {
    "name": "Alim ICT",
    "nameBn": "তথ্য ও যোগাযোগ প্রযুক্তি (আইসিটি)",
    "slug": "alim-ict",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১: তথ্য ও যোগাযোগ প্রযুক্তি — বিশ্ব ও বাংলাদেশ প্রেক্ষিত",
        "topics": [
          "ভার্চুয়াল রিয়েলিটি, কৃত্রিম বুদ্ধিমত্তা ও রোবটিক্স",
          "ক্রায়োসার্জারি, মহাকাশ অভিযান ও বায়োমেট্রিক্স",
          "বায়োইনফরমেটিক্স, জেনেটিক ইঞ্জিনিয়ারিং ও ন্যানোপ্রযুক্তি"
        ]
      },
      {
        "name": "অধ্যায় ২: কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং",
        "topics": [
          "ডেটা ট্রান্সমিশন মেথড ও মোড (Simplex, Half/Full Duplex)",
          "কমিউনিকেশন মিডিয়া (অপটিক্যাল ফাইবার, ওয়াই-ফাই, ওয়াইম্যাক্স)",
          "নেটওয়ার্ক টপোলজি (বাস, স্টার, রিং, ট্রি, মেশ ও হাইব্রিড)"
        ]
      },
      {
        "name": "অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
        "topics": [
          "দশমিক, বাইনারি, অক্টাল ও হেক্সাডেসিমেল রূপান্তর",
          "২ এর পরিপূরক (2's Complement) পদ্ধতিতে যোগ-বিয়োগ",
          "লজিক গেট (AND, OR, NOT, NAND, NOR, XOR, XNOR)",
          "বুলিয়ান অ্যালজেব্রা, ডিমরগ্যানের উপপাদ্য ও সরলীকরণ",
          "এনকোডার, ডিকোডার, অ্যাডার ও ফ্লিপ-ফ্লপ"
        ]
      },
      {
        "name": "অধ্যায় ৪: ওয়েব ডিজাইন পরিচিতি এবং HTML",
        "topics": [
          "ওয়েবসাইটের কাঠামো (লিনিয়ার, হায়ারার্কিক্যাল, নেটওয়ার্ক)",
          "HTML ফরম্যাটিং ট্যাগ (হেডিং, প্যারাগ্রাফ, টেক্সট স্টাইল)",
          "HTML হাইপারলিঙ্ক ও ছবি যুক্তকরণ (a, img)",
          "HTML টেবিল তৈরি (table, tr, td, th, colspan, rowspan)"
        ]
      },
      {
        "name": "অধ্যায় ৫: প্রোগ্রামিং ভাষা (C Programming)",
        "topics": [
          "প্রোগ্রামিং ভাষার স্তর ও অনুবাদক প্রোগ্রাম (কম্পাইলার, ইন্টারপ্রেটার)",
          "অ্যালগরিদম ও ফ্লোচার্ট অঙ্কন",
          "C চলক, ডেটা টাইপ ও ইনপুট-আউটপুট (scanf, printf)",
          "কন্ডিশনাল স্টেটমেন্ট (if-else, switch-case)",
          "লুপ কন্ট্রোল স্টেটমেন্ট (for, while, do-while)",
          "ফাংশন ও অ্যারে (Array)"
        ]
      }
    ]
  },
  {
    "name": "Alim Balaghat & Mantiq",
    "nameBn": "বালাগাত ও মানতিক (সাধারণ বিভাগ)",
    "slug": "alim-balaghat-mantiq",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "general_madrasah",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ইলমুল বালাগাত (আরবি অলংকারশাস্ত্র)",
        "topics": [
          "ফাসাহাত ও বালাগাতের পরিচয় ও শর্তাবলী",
          "ইলমুল মাআনী: খবর ও ইনশা এর প্রকারভেদ",
          "ইলমুল বায়ান: তাশবীহ (উপমা) ও ইস্তিয়ারা (রূপক)",
          "হাকিকত ও মাজাযে মুরসাল",
          "ইলমুল বাদী': জিনাস, তিবাক ও সাজা'"
        ]
      },
      {
        "name": "ইলমুল মানতিক (যুক্তিবিদ্যা)",
        "topics": [
          "ইলম ও এর প্রকারভেদ (তাসাউর ও তাসদীক)",
          "দলালাত ও আলফাযের শ্রেণিবিভাগ",
          "কুল্লিয়াতুল খামস (জাতি, প্রজাতি, লক্ষণ, বিভেদক, অবান্তর লক্ষণ)",
          "তারিফ (সংজ্ঞা) ও কিয়াস (যুক্তি)"
        ]
      }
    ]
  },
  {
    "name": "Alim Islamic History",
    "nameBn": "ইসলামের ইতিহাস (সাধারণ বিভাগ)",
    "slug": "alim-islamic-history",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "general_madrasah",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "উমাইয়া খিলাফত ও সম্প্রসারণ",
        "topics": [
          "আমির মুয়াবিয়া (রা.) ও উমাইয়া খিলাফত প্রতিষ্ঠা",
          "আব্দুল মালিক ও ওয়ালিদের সংস্কারসমূহ",
          "উমর ইবনে আব্দুল আজিজ (রহ.)-এর শাসনামল"
        ]
      },
      {
        "name": "আব্বাসীয় খিলাফত ও স্পেন",
        "topics": [
          "আবু জাফর আল-মনসুর ও বাগদাদ নগরী প্রতিষ্ঠা",
          "হারুনুর রশীদ ও বায়তুল হিকমাহ (জ্ঞান-বিজ্ঞানের স্বর্ণযুগ)",
          "স্পেনে কর্ডোভা খিলাফত ও আন্দালুসের স্থাপত্যকলা"
        ]
      }
    ]
  },
  {
    "name": "Alim Physics 1st Paper",
    "nameBn": "পদার্থবিজ্ঞান ১ম পত্র (বিজ্ঞান বিভাগ)",
    "slug": "alim-physics-1",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ২: ভেক্টর (Vectors)",
        "topics": [
          "ভেক্টর রাশি ও সামান্তরিক সূত্র",
          "ভেক্টরের ডট গুণন ও ক্রস গুণন",
          "নদী ও নৌকার আপেক্ষিক বেগ",
          "ভেক্টর ক্যালকুলাস (গ্র্যাডিয়েন্ট, ডাইভারজেন্স, কার্ল)"
        ]
      },
      {
        "name": "অধ্যায় ৩ ও ৪: গতিবিদ্যা ও নিউটনিয়ান বলবিদ্যা",
        "topics": [
          "প্রাসের গতি ও সমীকরণ",
          "জড়তার ভ্রামক ও চক্রগতির ব্যাসার্ধ",
          "কৌণিক ভরবেগ ও টর্ক",
          "ঘর্ষণ ও ব্যাংকিং কোণ"
        ]
      },
      {
        "name": "অধ্যায় ৫: কাজ, শক্তি ও ক্ষমতা",
        "topics": [
          "পরিবর্তনশীল বল দ্বারা কৃতকাজ",
          "সরল দোলক ও শক্তির সংরক্ষণশীলতা",
          "স্প্রিং বল ও বিভবশক্তি",
          "কর্মদক্ষতা ও ক্ষমতা গণনা"
        ]
      },
      {
        "name": "অধ্যায় ৮ ও ১০: পর্যাবৃত্ত গতি ও আদর্শ গ্যাস",
        "topics": [
          "সরল ছন্দিত স্পন্দন গতি",
          "বয়েল, চার্লসের সূত্র ও PV = nRT",
          "গ্যাসের গতিতত্ত্ব ও RMS বেগ",
          "আপেক্ষিক আর্দ্রতা ও শিশিরাঙ্ক"
        ]
      }
    ]
  },
  {
    "name": "Alim Physics 2nd Paper",
    "nameBn": "পদার্থবিজ্ঞান ২য় পত্র (বিজ্ঞান বিভাগ)",
    "slug": "alim-physics-2",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১: তাপগতিবিদ্যা (Thermodynamics)",
        "topics": [
          "তাপগতিবিদ্যার ১ম সূত্র (dU = dQ - dW)",
          "সমোষ্ণ ও রুদ্ধতাপীয় প্রক্রিয়া",
          "কার্নো চক্র ও ইঞ্জিনের দক্ষতা",
          "এনট্রপি ও তাপগতিবিদ্যার ২য় সূত্র"
        ]
      },
      {
        "name": "অধ্যায় ২ ও ৩: স্থির ও চল তড়িৎ",
        "topics": [
          "কুলম্বের সূত্র ও তড়িৎ প্রাবল্য",
          "ধারকত্ব ও সমান্তরাল পাত ধারক",
          "কার্শফের সূত্রাবলী ও হুইটস্টোন ব্রিজ নীতি",
          "মিটার ব্রিজ ও পটেনশিওমিটার"
        ]
      },
      {
        "name": "অধ্যায় ৭ ও ৮: আলোকবিজ্ঞান ও আধুনিক পদার্থবিজ্ঞান",
        "topics": [
          "হাইগেনসের নীতি ও ব্যতিচার",
          "আইনস্টাইনের আপেক্ষিকতা তত্ত্ব",
          "ফটোইলেকট্রিক প্রভাব ও কার্য-অপেক্ষক"
        ]
      },
      {
        "name": "অধ্যায় ৯ ও ১০: পরমাণু ও সেমিকন্ডাক্টর",
        "topics": [
          "তেজস্ক্রিয় ক্ষয় সূত্র ও অর্ধায়ু",
          "p-n জংশন ডায়োড ও পূর্ণতরঙ্গ রেকটিফায়ার",
          "ট্রানজিস্টর ও লজিক গেট"
        ]
      }
    ]
  },
  {
    "name": "Alim Chemistry 1st Paper",
    "nameBn": "রসায়ন ১ম পত্র (বিজ্ঞান বিভাগ)",
    "slug": "alim-chemistry-1",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ২: গুণগত রসায়ন",
        "topics": [
          "কোয়ান্টাম সংখ্যা ও অরবিটাল চিত্র",
          "আউফবাউ নীতি, পাউলির নীতি ও হুন্ডের নীতি",
          "দ্রাব্যতা ও দ্রাব্যতা গুণফল (Ksp)",
          "শিখা পরীক্ষা ও ক্যাটায়ন শনাক্তকরণ"
        ]
      },
      {
        "name": "অধ্যায় ৩: পর্যায়বৃত্ত ধর্ম ও বন্ধন",
        "topics": [
          "s, p, d, f ব্লক মৌলের বৈশিষ্ট্য",
          "সংকরায়ন (sp, sp2, sp3) ও আণবিক গঠন",
          "হাইড্রোজেন বন্ধন ও পোলারিটি"
        ]
      },
      {
        "name": "অধ্যায় ৪: রাসায়নিক পরিবর্তন",
        "topics": [
          "লা-শাতেলিয়ার নীতি ও প্রয়োগ",
          "ভরক্রিয়া সূত্র ও সাম্যধ্রুবক (Kp, Kc)",
          "বাফার দ্রবণ ও রক্তের pH নিয়ন্ত্রণ"
        ]
      }
    ]
  },
  {
    "name": "Alim Chemistry 2nd Paper",
    "nameBn": "রসায়ন ২য় পত্র (বিজ্ঞান বিভাগ)",
    "slug": "alim-chemistry-2",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১: পরিবেশ রসায়ন",
        "topics": [
          "গ্যাসের সূত্রাবলি (বয়েল, চার্লস, অ্যাভোগাড্রো)",
          "ডাল্টনের আংশিক চাপ ও গ্রাহামের ব্যাপন সূত্র",
          "গ্রিনহাউস প্রভাব ও সিএফসি (CFC)"
        ]
      },
      {
        "name": "অধ্যায় ২: জৈব রসায়ন (Organic Chemistry)",
        "topics": [
          "জৈব যৌগের নামকরণ (IUPAC)",
          "সমাণুতা (গাঠনিক ও জ্যামিতিক)",
          "বেনজিন ও ইলেকট্রোফিলিক প্রতিস্থাপন বিক্রিয়া",
          "অ্যালকাইল হ্যালাইড ও অ্যালকোহল",
          "অ্যালডিহাইড, কিটোন ও অ্যামিন"
        ]
      },
      {
        "name": "অধ্যায় ৩ ও ৪: পরিমাণগত ও তড়িৎ রসায়ন",
        "topics": [
          "জারণ-বিজারণ সমতাকরণ পদ্ধতি",
          "অ্যাসিড-ক্ষার টাইট্রেশন ও মোলারিটি",
          "ফ্যারাডের তড়িৎ বিশ্লেষণ সূত্র",
          "তড়িৎ রাসায়নিক কোষ ও গ্যালভানিক সেল"
        ]
      }
    ]
  },
  {
    "name": "Alim Higher Mathematics 1st Paper",
    "nameBn": "উচ্চতর গণিত ১ম পত্র (বিজ্ঞান বিভাগ)",
    "slug": "alim-higher-math-1",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ম্যাট্রিক্স, সরলরেখা ও বৃত্ত",
        "topics": [
          "ম্যাট্রিক্সের প্রকারভেদ, গুণন ও বিপরীত ম্যাট্রিক্স",
          "নির্ণায়কের ধর্মাবলি ও ক্র্যামারের নিয়ম",
          "সরলরেখার ঢাল ও দুটি রেখার মধ্যবর্তী কোণ",
          "বৃত্তের সাধারণ সমীকরণ ও স্পর্শকের সমীকরণ"
        ]
      },
      {
        "name": "ত্রিকোণমিতি ও বিন্যাস-সমাবেশ",
        "topics": [
          "সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত সূত্রসমূহ",
          "বিন্যাস ও সমাবেশের পার্থক্য ও প্রয়োগ"
        ]
      },
      {
        "name": "ক্যালকুলাস (Calculus 1st Paper)",
        "topics": [
          "সীমা (Limit) ও অবিচ্ছিন্নতা",
          "অন্তরীকরণ (Differentiation) সূত্রাবলি",
          "গুরুমান ও লঘুমান (Maxima & Minima)",
          "অনির্দিষ্ট ও নির্দিষ্ট যোগজীকরণ (Integration)"
        ]
      }
    ]
  },
  {
    "name": "Alim Higher Mathematics 2nd Paper",
    "nameBn": "উচ্চতর গণিত ২য় পত্র (বিজ্ঞান বিভাগ)",
    "slug": "alim-higher-math-2",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "বীজগণিত ও ত্রিকোণমিতি",
        "topics": [
          "জটিল সংখ্যার মডুলাস, আর্গুমেন্ট ও সঞ্চারপথ",
          "বহুপদী সমীকরণ ও মূলের বৈশিষ্ট্য",
          "দ্বিপদী উপপাদ্য ও সাধারণ পদ",
          "বিপরীত ত্রিকোণমিতিক ফাংশন ও সমাধান"
        ]
      },
      {
        "name": "কণিক (Conics)",
        "topics": [
          "পরাবৃত্ত (Parabola) এর শীর্ষ ও উপকেন্দ্র",
          "উপবৃত্ত (Ellipse) এর উৎকেন্দ্রিকতা ও সমীকরণ",
          "অধিবৃত্ত (Hyperbola) এর বৈশিষ্ট্য ও সমীকরণ"
        ]
      },
      {
        "name": "বলবিদ্যা ও সম্ভাবনা",
        "topics": [
          "লামির উপপাদ্য ও বলের সাম্যাবস্থা",
          "সমতলে গতিশীল কণার গতি ও আপেক্ষিক বেগ",
          "সম্ভাবনার সূত্র ও গাণিতিক প্রত্যাশা"
        ]
      }
    ]
  },
  {
    "name": "Alim Biology 1st Paper",
    "nameBn": "জীববিজ্ঞান ১ম পত্র (বিজ্ঞান বিভাগ)",
    "slug": "alim-biology-1",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "science",
    "subjectType": "optional",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "কোষ ও কোষের গঠন",
        "topics": [
          "কোষ প্রাচীর ও প্লাজমামেমব্রেন (ফ্লুইড মোজাইক মডেল)",
          "ডিএনএ এর ডাবল হেলিক্স গঠন ও অনুলিপন",
          "মিয়োসিস-১ এর প্রফেজ-১ ও ক্রসিং ওভার"
        ]
      },
      {
        "name": "অণুজীব ও শারীরতত্ত্ব",
        "topics": [
          "ভাইরাস ও ব্যাকটেরিয়ার অর্থনৈতিক গুরুত্ব",
          "সালোকসংশ্লেষণ (C3 ও C4 চক্র) এবং শ্বসন",
          "টিস্যু কালচার ও রিকম্বিন্যান্ট ডিএনএ প্রযুক্তি"
        ]
      }
    ]
  },
  {
    "name": "Alim Biology 2nd Paper",
    "nameBn": "জীববিজ্ঞান ২য় পত্র (বিজ্ঞান বিভাগ)",
    "slug": "alim-biology-2",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "science",
    "subjectType": "optional",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস",
        "topics": [
          "নন-কর্ডাটা ও কর্ডাটা পর্বের বৈশিষ্ট্য",
          "হাইড্রার চলন ও নিডোসাইট কোষ",
          "ঘাসফড়িংয়ের পৌষ্টিকতন্ত্র ও রূপান্তর"
        ]
      },
      {
        "name": "মানব শারীরতত্ত্ব ও জিনতত্ত্ব",
        "topics": [
          "পরিপাক ও শোষণ (মুখগহ্বর, পাকস্থলী ও ক্ষুদ্রান্ত্র)",
          "রক্ত ও সংবহনতন্ত্র (হৃদপিণ্ডের গঠন ও কার্ডিয়াক চক্র)",
          "শ্বসন ও গ্যাসীয় বিনিময়",
          "মেন্ডেলের সূত্র ও সেক্স লিঙ্কড ডিজঅর্ডার"
        ]
      }
    ]
  },
  {
    "name": "Alim Tajweed 1st Paper",
    "nameBn": "তাজবিদ ১ম পত্র (মুজাব্বিদ গ্রুপ)",
    "slug": "alim-tajweed-1",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "quran_hadith",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "তাজভিদের মৌলিক নীতিমালা ও মাখরাজ",
        "topics": [
          "তাজভিদের পরিচয়, হুকুম ও গুরুত্ব",
          "১৭টি মাখরাজের সচিত্র বিবরণ ও উচ্চারণ স্থান",
          "লাহনে জলী ও লাহনে খফীর বিধান"
        ]
      },
      {
        "name": "সিফাতুল হুরূফ (অক্ষরের গুণাবলী)",
        "topics": [
          "সিফাতে লাযিমাহ মুতাদ্বাদ্দাহ (বিপরীতধর্মী সিফাত)",
          "সিফাতে লাযিমাহ গায়রে মুতাদ্বাদ্দাহ",
          "ইস্তি'লা ও ইস্তিফাল-এর হুকুম"
        ]
      }
    ]
  },
  {
    "name": "Alim Tajweed 2nd Paper",
    "nameBn": "তাজবিদ ২য় পত্র (মুজাব্বিদ গ্রুপ)",
    "slug": "alim-tajweed-2",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "quran_hadith",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ইলমুল ক্বিরাআত ও তারতম্য",
        "topics": [
          "ক্বিরাআতের ইতিহাস ও ৭ জন বিখ্যাত কারী",
          "আসহাবে কিরাত ও তাদের সনদ",
          "ক্বিরাআতে হাফসের বিস্তারিত উসুল"
        ]
      },
      {
        "name": "ওয়াকফ ও ইবতিদা (থামা ও শুরু করার নিয়ম)",
        "topics": [
          "ওয়াকফের প্রকারভেদ: তাম, কাফী, হাসান, কবীহ",
          "ওয়াকফে গফরান ও সুজূদে তিলাওয়াত",
          "মুসহাফে উসমানীর রসমুল খত"
        ]
      }
    ]
  }
];
