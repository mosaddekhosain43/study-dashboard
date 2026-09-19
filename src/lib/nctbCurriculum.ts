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
  board: "general" | "madrasah" | "both";
  classLevel: "class_10" | "ssc" | "dakhil" | "hsc" | "alim";
  streamGroup: "all" | "science" | "humanities" | "business_studies" | "general_madrasah" | "quran_hadith";
  subjectType: "compulsory" | "group_elective" | "optional";
  structureType: "chapter" | "module";
  chaptersOrModules: NCTBChapterOrModuleDef[];
}

export const NCTB_CURRICULUM_DATA: NCTBSubjectDef[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // GENERAL BOARD (SCHOOL) — SSC & CLASS 10
  // ──────────────────────────────────────────────────────────────────────────

  // Bangla 1st Paper (Chapter / Gadya & Padya based)
  {
    name: "Bangla 1st Paper",
    nameBn: "বাংলা ১ম পত্র",
    slug: "ssc-bangla-1",
    board: "general",
    classLevel: "ssc",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "গদ্যাংশ (Prose Selection)",
        topics: [
          "শুভা — রবীন্দ্রনাথ ঠাকুর",
          "বই পড়া — প্রমথ চৌধুরী",
          "আম-আঁটির ভেঁপু — বিভূতিভূষণ বন্দ্যোপাধ্যায়",
          "মানুষ মুহাম্মদ (স.) — মোহাম্মদ ওয়াজেদ আলী",
          "নিমগাছ — বনফুল",
          "শিক্ষা ও মনুষ্যত্ব — মোতাহের হোসেন চৌধুরী",
          "প্রবাস বন্ধু — সৈয়দ মুজতবা আলী",
          "একাত্তরের দিনগুলি — জাহানারা ইমাম",
          "সাহিত্যের রূপ ও রীতি — হায়াৎ মামুদ",
        ],
      },
      {
        name: "কবিতাংশ (Poetry Selection)",
        topics: [
          "বঙ্গবাণী — আব্দুল হাকিম",
          "কপোতাক্ষ নদ — মাইকেল মধুসূদন দত্ত",
          "জীবন-সঙ্গীত — হেমচন্দ্র বন্দ্যোপাধ্যায়",
          "জুতো আবিষ্কার — রবীন্দ্রনাথ ঠাকুর",
          "মানুষ — কাজী নজরুল ইসলাম",
          "পল্লীজননী — জসীমউদ্দীন",
          "তোমাকে পাওয়ার জন্যে, হে স্বাধীনতা — শামসুর রাহমান",
          "সাহসী জননী বাংলা — কামাল চৌধুরী",
        ],
      },
      {
        name: "সহপাঠ — উপন্যাস ও নাটক",
        topics: [
          "কাকতাড়ুয়া (উপন্যাস) — সেলিনা হোসেন",
          "বহিপীর (নাটক) — সৈয়দ ওয়ালীউল্লাহ",
        ],
      },
    ],
  },

  // Bangla 2nd Paper (Skills & Module based)
  {
    name: "Bangla 2nd Paper",
    nameBn: "বাংলা ২য় পত্র",
    slug: "ssc-bangla-2",
    board: "general",
    classLevel: "ssc",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "module",
    chaptersOrModules: [
      {
        name: "ক-অংশ: ব্যাকরণ (Grammar Skills)",
        topics: [
          "ধ্বনি ও বর্ণ প্রকরণ",
          "সন্ধি ও ণত্ব/ষত্ব বিধান",
          "শব্দ গঠন ও উপসর্গ",
          "সমাস প্রকরণ ও পদ বিশ্লেষণ",
          "বাক্য রূপান্তর ও বাচ্য",
          "বিরামচিহ্নের ব্যবহার ও শুদ্ধাশুদ্ধি",
        ],
      },
      {
        name: "খ-অংশ: নির্মিতি ও অনুধাবন (Composition & Writing)",
        topics: [
          "ভাব-সম্প্রসারণ (Explication)",
          "অনুচ্ছেদ রচনা (Paragraph Writing)",
          "সারাংশ ও সারমর্ম (Summary Writing)",
          "আবেদনপত্র ও দাপ্তরিক চিঠি (Formal Applications)",
          "প্রতিবেদন প্রণয়ন (Report Writing)",
          "প্রবন্ধ রচনা (Essay Writing)",
        ],
      },
    ],
  },

  // English 1st Paper (Skills & Module based)
  {
    name: "English 1st Paper",
    nameBn: "ইংরেজি ১ম পত্র",
    slug: "ssc-english-1",
    board: "general",
    classLevel: "ssc",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "module",
    chaptersOrModules: [
      {
        name: "Part A: Reading Comprehension & Vocabulary",
        topics: [
          "Seen Passage 1: Multiple Choice & Open-ended Questions",
          "Seen Passage 2: Information Transfer & Flow Chart",
          "Unseen Passage: Summary Writing",
          "Cloze Test with Clues (Vocabulary)",
          "Cloze Test without Clues (Contextual Lexis)",
          "Rearranging Sentences in Order",
        ],
      },
      {
        name: "Part B: Guided & Free Writing",
        topics: [
          "Paragraph Writing (Descriptive / Argumentative)",
          "Completing an Incomplete Story",
          "Describing Graphs & Charts",
          "Informal Letter & Email Writing",
          "Dialogue Writing on Contemporary Issues",
        ],
      },
    ],
  },

  // English 2nd Paper (Skills & Module based)
  {
    name: "English 2nd Paper",
    nameBn: "ইংরেজি ২য় পত্র",
    slug: "ssc-english-2",
    board: "general",
    classLevel: "ssc",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "module",
    chaptersOrModules: [
      {
        name: "Part A: Grammar (Items 1–9)",
        topics: [
          "Gap Filling with Articles, Prepositions & Parts of Speech",
          "Right Form of Verbs & Subject-Verb Agreement",
          "Changing Sentences (Voice, Degree, Affirmative to Negative, Simple-Complex-Compound)",
          "Completing Sentences with Clauses/Phrases",
          "Use of Suffixes & Prefixes",
          "Tag Questions Rules & Practice",
          "Sentence Connectors & Linkers",
          "Punctuation Marks & Capitalization",
        ],
      },
      {
        name: "Part B: Composition (Items 10–13)",
        topics: [
          "Curriculum Vitae (CV) Writing with Cover Letter",
          "Formal Letters & Complaints / Notice / Applications",
          "Descriptive & Cause-Effect Paragraphs",
          "Composition & Short Essays",
        ],
      },
    ],
  },

  // Mathematics (Chapter based)
  {
    name: "General Mathematics",
    nameBn: "সাধারণ গণিত",
    slug: "ssc-general-math",
    board: "general",
    classLevel: "ssc",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: বাস্তব সংখ্যা (Real Numbers)",
        topics: ["মূলদ ও অমূলদ সংখ্যা", "আবৃত দশমিক", "বাস্তব সংখ্যার সমাধান"],
      },
      {
        name: "অধ্যায় ২: সেট ও ফাংশন (Sets & Functions)",
        topics: ["সেট ও তার প্রকাশ পদ্ধতি", "ভেনচিত্র", "ফাংশন ও ডোমেন-রেঞ্জ"],
      },
      {
        name: "অধ্যায় ৩: বীজগাণিতিক রাশি (Algebraic Expressions)",
        topics: ["বর্গ ও ঘন সংবলিত সূত্রাবলী", "উৎপাদকে বিশ্লেষণ", "ভাগশেষ উপপাদ্য"],
      },
      {
        name: "অধ্যায় ৪: সূচক ও লগারিদম (Exponents & Logarithms)",
        topics: ["সূচকের সূত্রাবলী", "লগারিদম ও সাধারণ লগ", "বৈজ্ঞানিক রূপ"],
      },
      {
        name: "অধ্যায় ৭: ব্যবহারিক জ্যামিতি (Practical Geometry)",
        topics: ["ত্রিভুজ অঙ্কন", "চতুর্ভুজ ও ট্রাপিজিয়াম অঙ্কন"],
      },
      {
        name: "অধ্যায় ৮: বৃত্ত (Circles)",
        topics: ["বৃত্তের উপপাদ্য ও স্পর্শক", "জ্যা ও পরিধি সংক্রান্ত সমস্যা"],
      },
      {
        name: "অধ্যায় ৯: ত্রিকোণমিতিক অনুপাত (Trigonometry)",
        topics: ["ত্রিকোণমিতিক অনুপাত ও কোণ", "ত্রিকোণমিতিক অভেদাবলী"],
      },
      {
        name: "অধ্যায় ১৬: পরিমিতি (Mensuration)",
        topics: ["ত্রিভুজ ও চতুর্ভুজের ক্ষেত্রফল", "সিলিন্ডার ও ঘনবস্তুর পরিমাপ"],
      },
      {
        name: "অধ্যায় ১৭: পরিসংখ্যান (Statistics)",
        topics: ["গড়, মধ্যক ও প্রচুরক নির্ণয়", "আয়তলেখ ও অজিভ রেখা"],
      },
    ],
  },

  // ICT (Chapter based)
  {
    name: "Information & Communication Technology (ICT)",
    nameBn: "তথ্য ও যোগাযোগ প্রযুক্তি",
    slug: "ssc-ict",
    board: "general",
    classLevel: "ssc",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: তথ্য ও যোগাযোগ প্রযুক্তি এবং আমাদের বাংলাদেশ",
        topics: ["ই-লার্নিং ও ই-গভর্ন্যান্স", "ডিজিটাল বাংলাদেশ ধারণা ও কর্মসংস্থান"],
      },
      {
        name: "অধ্যায় ২: কম্পিউটার ও কম্পিউটার ব্যবহারকারীর নিরাপত্তা",
        topics: ["সফটওয়্যার ইনস্টলেশন ও রক্ষণাবেক্ষণ", "কম্পিউটার ভাইরাস ও অ্যান্টিভাইরাস", "পাসওয়ার্ড ও সাইবার নিরাপত্তা"],
      },
      {
        name: "অধ্যায় ৩: আমার শিক্ষায় ইন্টারনেট",
        topics: ["ডিজিটাল কনটেন্ট ও ই-বুক", "শিক্ষায় ইন্টারনেটের ব্যবহার ও কপিরাইট"],
      },
      {
        name: "অধ্যায় ৪: আমার লেখালেখি ও হিসাব",
        topics: ["ওয়ার্ড প্রসেসিং বেসিকস", "স্প্রেডশিটের ব্যবহার ও হিসাব"],
      },
      {
        name: "অধ্যায় ৫: মাল্টিমিডিয়া ও গ্রাফিক্স",
        topics: ["মাল্টিমিডিয়া প্রেজেন্টেশন (পাওয়ারপয়েন্ট)", "গ্রাফিক্স ডিজাইন ও ইলাস্ট্রেশন বেসিক"],
      },
      {
        name: "অধ্যায় ৬: ডেটাবেজ-এর ব্যবহার",
        topics: ["ডেটাবেজ ও টেবিল তৈরি", "কুয়েরি ও রিপোর্ট তৈরি"],
      },
    ],
  },

  // SCIENCE GROUP ELECTIVES (SSC)
  {
    name: "Physics",
    nameBn: "পদার্থবিজ্ঞান",
    slug: "ssc-physics",
    board: "general",
    classLevel: "ssc",
    streamGroup: "science",
    subjectType: "group_elective",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: ভৌত রাশি ও পরিমাপ (Physical Quantities & Measurement)",
        topics: ["পদার্থবিজ্ঞানের পরিসর ও ক্রমবিকাশ", "পরিমাপের যন্ত্রপাতি (ভার্নিয়ার ক্যালিপার্স, স্ক্রু গজ)", "পরিমাপের ত্রুটি ও নির্ভুলতা"],
      },
      {
        name: "অধ্যায় ২: গতি (Motion)",
        topics: ["দূরত্ব, সরণ, বেগ ও ত্বরণ", "গতির সমীকরণসমূহ ও গ্রাফিকাল বিশ্লেষণ", "পরন্ত বস্তুর সূত্র ও গাণিতিক সমস্যা"],
      },
      {
        name: "অধ্যায় ৩: বল (Force)",
        topics: ["নিউটনের গতির সূত্রাবলী", "ভরবেগ ও ভরবেগের সংরক্ষণ সূত্র", "ঘর্ষণ বল ও নিরাপদ ভ্রমণ"],
      },
      {
        name: "অধ্যায় ৪: কাজ, ক্ষমতা ও শক্তি (Work, Power & Energy)",
        topics: ["কাজের ধারণা ও শক্তির রূপান্তর", "গতিশক্তি ও বিভব শক্তি", "কর্মদক্ষতা (Efficiency) ও ক্ষমতা"],
      },
      {
        name: "অধ্যায় ৫: পদার্থের অবস্থা ও চাপ (State of Matter & Pressure)",
        topics: ["চাপ ও ঘনত্ব", "প্যাসকেলের সূত্র ও হাইড্রোলিক প্রেস", "আর্কিমিডিসের নীতি ও প্লবতা"],
      },
      {
        name: "অধ্যায় ৭: তরঙ্গ ও শব্দ (Waves & Sound)",
        topics: ["তরঙ্গের প্রকারভেদ ও বৈশিষ্ট্য", "শব্দোত্তর ও শব্দেতর তরঙ্গ", "প্রতিধ্বনি ও তার ব্যবহার"],
      },
      {
        name: "অধ্যায় ৮: আলোর প্রতিফলন (Reflection of Light)",
        topics: ["সমতল ও গোলীয় দর্পণ", "প্রতিবিম্ব গঠন ও রৈখিক বিবর্ধন"],
      },
      {
        name: "অধ্যায় ১১: চলবিদ্যুৎ (Current Electricity)",
        topics: ["তড়িৎ প্রবাহ ও ওহমের সূত্র", "রোধের সমবায় (শ্রেণি ও সমান্তরাল)", "তড়িৎ ক্ষমতা ও বিদ্যুৎ বিলের হিসাব"],
      },
    ],
  },

  {
    name: "Chemistry",
    nameBn: "রসায়ন",
    slug: "ssc-chemistry",
    board: "general",
    classLevel: "ssc",
    streamGroup: "science",
    subjectType: "group_elective",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: রসায়নের ধারণা (Concepts of Chemistry)",
        topics: ["রসায়নের পরিধি ও শাখা", "রসায়ন পরীক্ষাগারে সতর্কতামূলক ব্যবস্থা ও সাংকেতিক চিহ্ন"],
      },
      {
        name: "অধ্যায় ২: পদার্থের অবস্থা (States of Matter)",
        topics: ["পদার্থের তিন অবস্থা ও গতিতত্ত্ব", "ব্যাপন ও নিঃসরণ", "গলনাঙ্ক, স্ফুটনাঙ্ক ও পাতন"],
      },
      {
        name: "অধ্যায় ৩: পদার্থের গঠন (Structure of Matter)",
        topics: ["মৌলিক ও যৌগিক কণা (ইলেকট্রন, প্রোটন, নিউট্রন)", "রাদারফোর্ড ও বোর পরমাণু মডেল", "আইসোটোপ ও তার ব্যবহার", "ইলেকট্রন বিন্যাস নিয়মাবলী"],
      },
      {
        name: "অধ্যায় ৪: পর্যায় সারণি (Periodic Table)",
        topics: ["পর্যায় সারণির পটভূমি ও বৈশিষ্ট্য", "মৌলের পর্যায়বৃত্ত ধর্ম (পারমাণবিক ব্যাসার্ধ, আয়নিকরণ শক্তি, তড়িৎ ঋণাত্মকতা)"],
      },
      {
        name: "অধ্যায় ৫: রাসায়নিক বন্ধন (Chemical Bonds)",
        topics: ["যোজ্যতা ইলেকট্রন ও অষ্টক নিয়ম", "আয়নিক বন্ধন ও সমযোজী বন্ধন", "আয়নিক ও সমযোজী যৌগের বৈশিষ্ট্য"],
      },
      {
        name: "অধ্যায় ৬: মোলের ধারণা ও রাসায়নিক গণনা (Mole & Stoichiometry)",
        topics: ["মোল ও মোলার আয়তন", "মোলার দ্রবণ ও মোলারিটি", "শতকরা সংযুতি ও স্থূল/আণবিক সংকেত", "লিমিটিং বিক্রিয়ক"],
      },
      {
        name: "অধ্যায় ৭: রাসায়নিক বিক্রিয়া (Chemical Reactions)",
        topics: ["রাসায়নিক পরিবর্তন ও বিক্রিয়ার শ্রেণিবিভাগ", "রেডক্স বিক্রিয়া (জারণ-বিজারণ)", "লা-শাতেলিয়ারের নীতি"],
      },
      {
        name: "অধ্যায় ১১: খনিজ সম্পদ — জীবাশ্ম (Organic Chemistry)",
        topics: ["হাইড্রোকার্বন শ্রেণিবিভাগ (অ্যালকেন, অ্যালকিন, অ্যালকাইন)", "অ্যালকোহল, অ্যালডিহাইড ও ফ্যাটি এসিড", "পলিমার ও প্লাস্টিক"],
      },
    ],
  },

  {
    name: "Biology",
    nameBn: "জীববিজ্ঞান",
    slug: "ssc-biology",
    board: "general",
    classLevel: "ssc",
    streamGroup: "science",
    subjectType: "group_elective",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: জীবন পাঠ (Life Lesson)",
        topics: ["জীববিজ্ঞানের ধারণা ও শ্রেণিবিন্যাস", "দ্বিপদ নামকরণ পদ্ধতি"],
      },
      {
        name: "অধ্যায় ২: জীবকোষ ও টিস্যু (Cells & Tissues)",
        topics: ["উদ্ভিদ ও প্রাণিকোষের গঠন অঙ্গাণু", "উদ্ভিদ ও প্রাণি টিস্যুর শ্রেণিবিভাগ"],
      },
      {
        name: "অধ্যায় ৪: জীবনীশক্তি (Bioenergetics)",
        topics: ["ATP ও জীবনীশক্তি", "সালোকসংশ্লেষণ প্রক্রিয়া", "শ্বসন (অবাধ ও সবাত শ্বসন)"],
      },
      {
        name: "অধ্যায় ১১: জীবের প্রজনন (Reproduction in Organisms)",
        topics: ["উদ্ভিদের প্রজনন ও পরাগায়ন", "মানুষের প্রজনন ও ভ্রূণের বিকাশ"],
      },
      {
        name: "অধ্যায় ১২: জীবের বংশগতি ও বিবর্তন (Genetics & Evolution)",
        topics: ["ক্রোমোজোম, DNA ও RNA", "মেন্ডেলের বংশগতির সূত্র", "DNA অনুলিপন ও ডারউইনের তত্ত্ব"],
      },
    ],
  },

  {
    name: "Higher Mathematics",
    nameBn: "উচ্চতর গণিত",
    slug: "ssc-higher-math",
    board: "general",
    classLevel: "ssc",
    streamGroup: "science",
    subjectType: "optional",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ২: বীজগাণিতিক রাশি (Algebraic Expressions)",
        topics: ["বহুপদী ও চক্র-ক্রমিক রাশি", "আংশিক ভগ্নাংশ"],
      },
      {
        name: "অধ্যায় ৭: অসীম ধারা (Infinite Series)",
        topics: ["গুণোত্তর ধারা", "অসীমতক সমষ্টি নির্ণয়"],
      },
      {
        name: "অধ্যায় ৮: ত্রিকোণমিতি (Trigonometry)",
        topics: ["রেডিয়ান কোণ পরিমাপ", "ত্রিকোণমিতিক অনুপাত ও কোয়্যাড্রেন্ট সূত্র"],
      },
      {
        name: "অধ্যায় ৯: সূচকীয় ও লগারিদমীয় ফাংশন",
        topics: ["সূচক ও লগারিদমের প্রমাণ ও লেখচিত্র"],
      },
      {
        name: "অধ্যায় ১১: স্থানাঙ্ক জ্যামিতি (Coordinate Geometry)",
        topics: ["দুই বিন্দুর দূরত্ব", "সরলরেখার ঢাল ও সমীকরণ", "বহুভুজের ক্ষেত্রফল"],
      },
      {
        name: "অধ্যায় ১৪: সম্ভাবনা (Probability)",
        topics: ["সম্ভাবনার মৌলিক ধারণা ও প্রবাবিলিটি ট্রি"],
      },
    ],
  },

  // BUSINESS STUDIES GROUP (COMMERCE)
  {
    name: "Accounting",
    nameBn: "হিসাববিজ্ঞান",
    slug: "ssc-accounting",
    board: "general",
    classLevel: "ssc",
    streamGroup: "business_studies",
    subjectType: "group_elective",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ২: লেনদেন (Transactions)",
        topics: ["লেনদেনের প্রকৃতি ও শ্রেণিবিভাগ", "হিসাব সমীকরণ ও তার প্রভাব"],
      },
      {
        name: "অধ্যায় ৩: দু'তরফা দাখিলা পদ্ধতি (Double Entry System)",
        topics: ["ডেবিট-ক্রেডিট নির্ণয়ের নিয়মাবলী", "হিসাবের প্রকারভেদ"],
      },
      {
        name: "অধ্যায় ৪: মূলধন ও মুনাফাজাতীয় লেনদেন",
        topics: ["মূলধন ও মুনাফাজাতীয় প্রাপ্তি ও আয়", "মূলধন ও মুনাফাজাতীয় ব্যয়"],
      },
      {
        name: "অধ্যায় ৫: হিসাব (Accounts)",
        topics: ["হিসাবের শ্রেণিবিভাগ ও টি-ছক / চলমান জের ছক"],
      },
      {
        name: "অধ্যায় ৬: জাবেদা (Journal)",
        topics: ["সাধারণ জাবেদা", "ক্রয় ও বিক্রয় জাবেদা", "নগদান বহি জাবেদা"],
      },
      {
        name: "অধ্যায় ৭: খতিয়ান (Ledger)",
        topics: ["খতিয়ান প্রস্তুতকরণ ও জের নির্ণয়"],
      },
      {
        name: "অধ্যায় ৮: নগদান বহি (Cash Book)",
        topics: ["একঘরা, দু'ঘরা ও তিনঘরা নগদান বহি"],
      },
      {
        name: "অধ্যায় ৯: রেওয়ামিল (Trial Balance)",
        topics: ["রেওয়ামিল প্রস্তুতকরণ ও অশুদ্ধি সংশোধন"],
      },
      {
        name: "অধ্যায় ১০: আর্থিক বিবরণী (Financial Statements)",
        topics: ["বিসদ আয় বিবরণী", "মালিকানাস্বত্ব বিবরণী", "আর্থিক অবস্থার বিবরণী"],
      },
    ],
  },

  {
    name: "Finance & Banking",
    nameBn: "ফিন্যান্স ও ব্যাংকিং",
    slug: "ssc-finance",
    board: "general",
    classLevel: "ssc",
    streamGroup: "business_studies",
    subjectType: "group_elective",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: অর্থায়ন ও ব্যবসায় অর্থায়ন",
        topics: ["অর্থায়নের নীতি ও কার্যাবলী", "অর্থায়নের উৎসসমূহ"],
      },
      {
        name: "অধ্যায় ৩: অর্থের সময়মূল্য (Time Value of Money)",
        topics: ["ভবিষ্যৎ মূল্য ও চক্রবৃদ্ধিকরণ", "বর্তমান মূল্য ও বাট্টাকরণ"],
      },
      {
        name: "অধ্যায় ৫: মূলধনি আয়-ব্যয় প্রাক্কলন",
        topics: ["পে-ব্যাক সময় পদ্ধতি", "গড় মুনাফার হার পদ্ধতি"],
      },
      {
        name: "অধ্যায় ৯: ব্যাংকিং ব্যবসায় ও তার ধরন",
        topics: ["ব্যাংকের উদ্দেশ্য ও শ্রেণিবিভাগ"],
      },
      {
        name: "অধ্যায় ১০: বাণিজ্যিক ব্যাংক ও তার পরিচিতি",
        topics: ["বাণিজ্যিক ব্যাংকের কার্যাবলী ও আয়ের উৎস"],
      },
    ],
  },

  // HUMANITIES GROUP (ARTS)
  {
    name: "History of Bangladesh & World Civilization",
    nameBn: "বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা",
    slug: "ssc-history",
    board: "general",
    classLevel: "ssc",
    streamGroup: "humanities",
    subjectType: "group_elective",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: ইতিহাস পরিচিতি",
        topics: ["ইতিহাসের ধারণা ও উপাদান", "ইতিহাস পাঠের গুরুত্ব"],
      },
      {
        name: "অধ্যায় ২: বিশ্বসভ্যতা",
        topics: ["মিশরীয়, সিন্ধু, গ্রিক ও রোমান সভ্যতা"],
      },
      {
        name: "অধ্যায় ১১: ভাষা আন্দোলন ও পরবর্তী রাজনৈতিক ঘটনাপ্রবাহ",
        topics: ["১৯৫২-এর ভাষা আন্দোলন", "যুক্তফ্রন্ট সরকার ও ১৯৫৮-এর সামরিক শাসন"],
      },
      {
        name: "অধ্যায় ১২: সামরিক শাসন ও স্বাধিকার আন্দোলন",
        topics: ["ছয় দফা আন্দোলন (১৯৬৬)", "ঊনসত্তরের গণঅভ্যুত্থান ও ১৯৭০-এর নির্বাচন"],
      },
      {
        name: "অধ্যায় ১৩: ১৯৭১ সালের মুক্তিযুদ্ধ ও স্বাধীনতা",
        topics: ["বঙ্গবন্ধুর ৭ই মার্চের ভাষণ", "অপারেশন সার্চলাইট ও মুক্তিযুদ্ধ পরিচালনা", "চূড়ান্ত বিজয় ও স্বাধীন বাংলাদেশ"],
      },
    ],
  },

  {
    name: "Civics & Citizenship",
    nameBn: "পৌরনীতি ও নাগরিকতা",
    slug: "ssc-civics",
    board: "general",
    classLevel: "ssc",
    streamGroup: "humanities",
    subjectType: "group_elective",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: পৌরনীতি ও নাগরিকতা",
        topics: ["পৌরনীতির বিষয়বস্তু ও পরিবার"],
      },
      {
        name: "অধ্যায় ২: নাগরিক ও নাগরিকতা",
        topics: ["নাগরিকতার ধারণা, অধিকার ও কর্তব্য"],
      },
      {
        name: "অধ্যায় ৪: রাষ্ট্র ও সরকার ব্যবস্থা",
        topics: ["গণতন্ত্র, একনায়কতন্ত্র ও সংসদীয় সরকার"],
      },
      {
        name: "অধ্যায় ৬: বাংলাদেশের সরকার ব্যবস্থা",
        topics: ["রাষ্ট্রপতি, প্রধানমন্ত্রী ও বিচার বিভাগ"],
      },
      {
        name: "অধ্যায় ১০: স্বাধীন বাংলাদেশের অভ্যুদয়ে নাগরিক চেতনা",
        topics: ["ঐতিহাসিক পটভূমি ও সংবিধানের মূলনীতি"],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // MADRASAH BOARD — DAKHIL & ALIM
  // ──────────────────────────────────────────────────────────────────────────

  // Dakhil Quran Mazid & Tajweed (Chapter based)
  {
    name: "Quran Mazid & Tajweed",
    nameBn: "কুরআন মাজিদ ও তাজভিদ",
    slug: "dakhil-quran",
    board: "madrasah",
    classLevel: "dakhil",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "হিফজ ও তিলাওয়াত অংশ (Recitation & Tajweed Rules)",
        topics: [
          "মাখরাজ ও সিফাত পরিচিতি",
          "নূন সাকিন ও তানভীনের নিয়মাবলী (ইযহার, ইদগাম, ইকলাব, ইখফা)",
          "মীমে সাকিনের হুকুমসমূহ",
          "মাদের প্রকারভেদ ও ওয়াক্ফের বিধান",
        ],
      },
      {
        name: "অনুবাদ ও ব্যাখ্যা (Selected Surahs & Verses)",
        topics: [
          "সূরা আল-বাক্বারাহ (নির্বাচিত আয়াতসমূহ)",
          "সূরা আল-ইমরান ও সূরা আন-নিসা (নির্বাচিত অংশ)",
          "সূরা হুজুরাত: পারস্পরিক আচরণ ও শিষ্টাচার",
          "সূরা লোকমান: পিতা-মাতার প্রতি দায়িত্ব ও নৈতিক শিক্ষা",
        ],
      },
    ],
  },

  // Dakhil Hadith Sharif (Chapter based)
  {
    name: "Hadith Sharif",
    nameBn: "হাদিস শরিফ",
    slug: "dakhil-hadith",
    board: "madrasah",
    classLevel: "dakhil",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "হাদিসের মৌলিক পরিভাষা ও কিতাবুল ঈমান",
        topics: [
          "হাদিস ও সুন্নাহর সংজ্ঞা ও প্রকারভেদ (সহীহ, হাসান, জয়িফ)",
          "ঈমান ও ইসলামের স্তম্ভসমূহ সংবলিত হাদিস",
          "নিয়তের গুরুত্ব (ইন্নামাল আ'মালু বিন নিয়্যাত)",
        ],
      },
      {
        name: "কিতাবুস সালাত ও কিতাবুয যাকাত",
        topics: [
          "নামাজের গুরুত্ব ও জামাতে সালাতের ফজিলত",
          "যাকাত প্রদান ও সামাজিক ন্যায়বিচার",
        ],
      },
      {
        name: "আখলাক ও শিষ্টাচার বিষয়ক হাদিস",
        topics: [
          "সততা, আমানতদারী ও মানবসেবা",
          "পিতামাতা ও প্রতিবেশীর অধিকার রক্ষা",
        ],
      },
    ],
  },

  // Dakhil Aqaid & Fiqh (Chapter based)
  {
    name: "Aqaid & Fiqh",
    nameBn: "আকাইদ ও ফিকহ",
    slug: "dakhil-aqaid-fiqh",
    board: "madrasah",
    classLevel: "dakhil",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "প্রথম খণ্ড: আকাইদ (Islamic Theology)",
        topics: [
          "তাওহিদ, রিসালাত ও আখিরাতের স্বরূপ",
          "ফেরেশতা, আসমানি কিতাব ও তকদিরে বিশ্বাস",
          "কুফর, শিরক ও নিফাকের ভয়াবহতা",
        ],
      },
      {
        name: "দ্বিতীয় খণ্ড: ফিকহ — তাহারাত ও সালাত",
        topics: [
          "তাহারাত (পবিত্রতা), অজু, গোসল ও তায়াম্মুমের ফরজসমূহ",
          "সালাতের শর্তাবলী, ওয়াজিবাত ও মাকরূহাত",
          "সাজদায়ে সাহু ও জানাজার সালাতের নিয়ম",
        ],
      },
      {
        name: "তৃতীয় খণ্ড: সাওম ও মুয়ামালাত",
        topics: [
          "সাওমের শর্ত, রোজা ভঙ্গের কারণ ও কাজা-কাফফারা",
          "হালাল-হারাম উপার্জন ও লেনদেনের ইসলামি নীতিমালা",
        ],
      },
    ],
  },

  // Dakhil Arabic 1st Paper (Skills & Module based)
  {
    name: "Arabic 1st Paper (Al-Lughat)",
    nameBn: "আরবি ১ম পত্র",
    slug: "dakhil-arabic-1",
    board: "madrasah",
    classLevel: "dakhil",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "module",
    chaptersOrModules: [
      {
        name: "আল-জুজ আল-আউয়াল: পাঠ অনুধাবন (Text Comprehension)",
        topics: [
          "দরস ১–৫: নির্বাচিত গদ্যাংশের অনুবাদ ও শব্দার্থ",
          "দরস ৬–১০: প্রশ্নোত্তর ও বহু নির্বাচনী অনুধাবন",
          "হিওয়ার ও দৈনন্দিন সংলাপ (Daily Dialogue)",
        ],
      },
      {
        name: "আল-জুজ আস-সানি: কবিতা ও প্রবন্ধ",
        topics: [
          "নির্বাচিত কাসিদাহ ও নাত বিশ্লেষণ",
          "সংক্ষিপ্ত আরবি অনুচ্ছেদ লিখন (Insha / Composition)",
        ],
      },
    ],
  },

  // Dakhil Arabic 2nd Paper (Qawaid & Grammar Module based)
  {
    name: "Arabic 2nd Paper (Qawaid)",
    nameBn: "আরবি ২য় পত্র",
    slug: "dakhil-arabic-2",
    board: "madrasah",
    classLevel: "dakhil",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "module",
    chaptersOrModules: [
      {
        name: "আল-জুজ আল-আউয়াল: ইলমুন নাহু (Syntax)",
        topics: [
          "কালেমা ও তার প্রকারভেদ (ইসিম, ফেল, হরফ)",
          "মুররাব ও মাবনির বিস্তারিত নিয়ম",
          "মারফুয়াত, মানসুবাত ও মাজরুরাত বিশ্লেষণ",
          "জুমলা ইসমিয়্যাহ ও জুমলা ফেলিয়্যাহ",
        ],
      },
      {
        name: "আল-জুজ আস-সানি: ইলমুস সরফ (Morphology)",
        topics: [
          "মীযান ও সরফে সগীর / কবীর",
          "বাবসমূহের বৈশিষ্ট্য ও পরিচয়",
          "সহীহ ও গায়রে সহীহ রূপান্তর",
        ],
      },
      {
        name: "আল-জুজ আস-সালিস: দরখাস্ত ও অনুবাদ",
        topics: [
          "আরবি পত্র লিখন ও দরখাস্ত",
          "বাংলা থেকে আরবি অনুবাদ ও তারকীব",
        ],
      },
    ],
  },
];
