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
  classLevel: "ssc" | "hsc" | "dakhil" | "alim";
  streamGroup: "all" | "science" | "humanities" | "business_studies" | "general_madrasah" | "quran_hadith";
  subjectType: "compulsory" | "group_elective" | "optional";
  structureType: "chapter" | "module";
  chaptersOrModules: NCTBChapterOrModuleDef[];
}

export const NCTB_CURRICULUM_DATA: NCTBSubjectDef[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // 1. GENERAL EDUCATION BOARD (SCHOOL) — SSC
  // ══════════════════════════════════════════════════════════════════════════

  // Bangla 1st Paper
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
          "ধ্বনি ও বর্ণ প্রকরণ (ধ্বনি পরিবর্তন ও ণত্ব/ষত্ব বিধান)",
          "সন্ধি (স্বরসন্ধি ও ব্যঞ্জনসন্ধি)",
          "শব্দ গঠন, উপসর্গ ও অনুসর্গ",
          "সমাস প্রকরণ ও পদ বিশ্লেষণ",
          "বাক্য রূপান্তর, যোজক ও বাচ্য",
          "বিরামচিহ্নের ব্যবহার ও প্রমিত বাংলা বানানের নিয়ম",
        ],
      },
      {
        name: "খ-অংশ: নির্মিতি ও অনুধাবন (Composition & Writing)",
        topics: [
          "ভাব-সম্প্রসারণ (Explication of Themes)",
          "অনুচ্ছেদ রচনা (Paragraph Writing)",
          "সারাংশ ও সারমর্ম (Summary & Substance Writing)",
          "আবেদনপত্র ও দাপ্তরিক চিঠি (Formal Applications & Letters)",
          "প্রতিবেদন প্রণয়ন (Report Writing for Media & Office)",
          "প্রবন্ধ রচনা (Essay Writing on Science, Culture & Economy)",
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
          "Seen Passage 1: Multiple Choice & Open-ended Comprehension",
          "Seen Passage 2: Information Transfer & Flow Chart Construction",
          "Unseen Passage: Summary Writing & Critical Understanding",
          "Cloze Test with Clues (Grammatical Vocabulary)",
          "Cloze Test without Clues (Contextual Lexis & Idioms)",
          "Rearranging Sentences in Coherent Logical Order",
        ],
      },
      {
        name: "Part B: Guided & Free Writing",
        topics: [
          "Paragraph Writing (Descriptive, Narrative & Cause-Effect)",
          "Completing an Incomplete Story with Creative Climax",
          "Describing Graphs & Charts (Statistical Interpretation)",
          "Informal Letter & Formal Email Writing",
          "Dialogue Writing on Contemporary Social Issues",
        ],
      },
    ],
  },

  // English 2nd Paper (Grammar & Composition Module based)
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
        name: "Part A: Applied Grammar",
        topics: [
          "Gap Filling with Articles & Prepositions",
          "Right Form of Verbs & Subject-Verb Agreement",
          "Changing Sentences (Voice, Degree, Affirmative/Negative, Simple/Complex/Compound)",
          "Completing Sentences with Conditionals & Clauses",
          "Use of Suffixes & Prefixes",
          "Tag Questions & Sentence Completion",
          "Sentence Connectors & Linking Devices",
          "Punctuation & Capitalization Rules",
        ],
      },
      {
        name: "Part B: Composition & Creative Writing",
        topics: [
          "Writing Formal Letters (Job Applications & Complaint Letters)",
          "Writing Academic CV with Cover Letter",
          "Writing Paragraphs by Answering Questions",
          "Composition on National & Global Themes",
        ],
      },
    ],
  },

  // General Mathematics (Chapter based)
  {
    name: "General Mathematics",
    nameBn: "সাধারণ গণিত",
    slug: "ssc-math",
    board: "general",
    classLevel: "ssc",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: বাস্তব সংখ্যা",
        topics: ["স্বাভাবিক সংখ্যা, পূর্ণসংখ্যা ও মূলদ-অমূলদ সংখ্যা", "আবৃত দশমিক ভগ্নাংশ ও আসন্ন মান"],
      },
      {
        name: "অধ্যায় ২: সেট ও ফাংশন",
        topics: ["সেটের প্রকাশ পদ্ধতি ও অপারেশন", "ভেনচিত্র ও ফাংশনের ডোমেন-রেঞ্জ"],
      },
      {
        name: "অধ্যায় ৩: বীজগাণিতিক রাশি",
        topics: ["বর্গ ও ঘন সংবলিত সূত্রাবলী", "উৎপাদকে বিশ্লেষণ ও ভাগশেষ উপপাদ্য", "বাস্তব সমস্যা সমাধানে বীজগাণিতিক সূত্র"],
      },
      {
        name: "অধ্যায় ৪: সূচক ও লগারিদম",
        topics: ["সূচকের সূত্রাবলী ও প্রয়োগ", "লগারিদমের ভিত্তি ও সাধারণ-প্রাকৃতিক লগ"],
      },
      {
        name: "অধ্যায় ৫: এক চলকবিশিষ্ট সমীকরণ",
        topics: ["সমীকরণ ও অভেদ", "দ্বিঘাত সমীকরণ ও বাস্তব প্রয়োগ"],
      },
      {
        name: "অধ্যায় ৭: ব্যবহারিক জ্যামিতি",
        topics: ["ত্রিভুজ অঙ্কন ও শর্তাবলী", "চতুর্ভুজ ও ট্রাপিজিয়াম অঙ্কন"],
      },
      {
        name: "অধ্যায় ৮: বৃত্ত",
        topics: ["বৃত্ত সংক্রান্ত উপপাদ্য ও স্পর্শক", "বৃত্তে অন্তর্লিখিত চতুর্ভুজ ও জ্যামিতিক প্রমাণ"],
      },
      {
        name: "অধ্যায় ৯: ত্রিকোণমিতিক অনুপাত",
        topics: ["সূক্ষ্মকোণের ত্রিকোণমিতিক অনুপাত", "ত্রিকোণমিতিক অভেদাবলী ও প্রমাণ"],
      },
      {
        name: "অধ্যায় ১০: দূরত্ব ও উচ্চতা",
        topics: ["উন্নতি কোণ ও অবনতি কোণ", "দূরত্ব ও উচ্চতা বিষয়ক গানিতিক সমস্যা"],
      },
      {
        name: "অধ্যায় ১৩: সসীম ধারা",
        topics: ["সমান্তর ধারা ও n-তম পদের সমষ্টি", "গুণোত্তর ধারা ও অনন্ত ধারার ধারণা"],
      },
      {
        name: "অধ্যায় ১৬: পরিমিতি",
        topics: ["ত্রিভুজ ও চতুর্ভুজক্ষেত্রের ক্ষেত্রফল", "বৃত্তাকার ক্ষেত্র ও ঘনবস্তুর পৃষ্ঠতলের ক্ষেত্রফল"],
      },
      {
        name: "অধ্যায় ১৭: পরিসংখ্যান",
        topics: ["শ্রেণিবিন্যাস ও গণসংখ্যা নিবেশন সারণি", "গড়, মধ্যক ও প্রচুরক নির্ণয়", "আয়তলেখ, বহুভুজ ও ওজাইভ রেখা"],
      },
    ],
  },

  // ICT (Chapter based)
  {
    name: "Information & Communication Technology",
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
        topics: ["ই-লার্নিং, ই-গভর্ন্যান্স ও ই-সার্ভিস", "ডিজিটাল বাংলাদেশ ও কর্মক্ষেত্রে আইসিটি"],
      },
      {
        name: "অধ্যায় ২: কম্পিউটার ও কম্পিউটার ব্যবহারকারীর নিরাপত্তা",
        topics: ["সফটওয়্যার ইনস্টলেশন ও আনইনস্টল", "কম্পিউটার ভাইরাস, অ্যান্টিভাইরাস ও পাসওয়ার্ড নিরাপত্তা"],
      },
      {
        name: "অধ্যায় ৩: আমার শিক্ষায় ইন্টারনেট",
        topics: ["ডিজিটাল কনটেন্ট ও ই-বুক", "শিক্ষায় ইন্টারনেটের ব্যবহার ও ক্যারিয়ার"],
      },
      {
        name: "অধ্যায় ৪: আমার লেখালেখি ও হিসাব",
        topics: ["ওয়ার্ড প্রসেসিংয়ে ডকুমেন্ট ফরম্যাটিং", "স্প্রেডশিটের মৌলিক ধারণা ও সূত্রের ব্যবহার"],
      },
      {
        name: "অধ্যায় ৫: মাল্টিমিডিয়া ও গ্রাফিক্স",
        topics: ["মাল্টিমিডিয়ার ধারণা ও প্রেজেন্টেশন সফটওয়্যার", "ফটোশপ ও ইলাস্ট্রেটরের প্রাথমিক পরিচিতি"],
      },
      {
        name: "অধ্যায় ৬: ডেটাবেজ-এর ব্যবহার",
        topics: ["ডেটাবেজের ধারণা ও টেবিল তৈরি", "কোয়েরি ও রিপোর্ট তৈরি"],
      },
    ],
  },

  // Physics (SSC Science)
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
        name: "অধ্যায় ১: ভৌত রাশি ও পরিমাপ",
        topics: ["পদার্থবিজ্ঞানের পরিসর ও ক্রমবিকাশ", "পরিমাপের যন্ত্রপাতি: স্লাইড ক্যালিপার্স ও স্ক্রু গজ"],
      },
      {
        name: "অধ্যায় ২: গতি",
        topics: ["স্কেলার ও ভেক্টর রাশি", "গতির সমীকরণ ও লেখচিত্র", "পরন্ত বস্তুর সূত্রাবলী"],
      },
      {
        name: "অধ্যায় ৩: বল",
        topics: ["জড়তা ও নিউটনের গতির সূত্রসমূহ", "ভরবেগ ও ভরবেগের সংরক্ষণ সূত্র", "ঘর্ষণ বল ও ঘর্ষণের প্রভাব"],
      },
      {
        name: "অধ্যায় ৪: কাজ, ক্ষমতা ও শক্তি",
        topics: ["কাজ ও গতিশক্তি-বিভবশক্তি", "শক্তির রূপান্তর ও সংরক্ষণশীলতা", "কর্মদক্ষতা ও ক্ষমতা"],
      },
      {
        name: "অধ্যায় ৫: পদার্থের অবস্থা ও চাপ",
        topics: ["চাপ ও ঘনত্ব", "প্যাসকেলের সূত্র ও হাইড্রোলিক প্রেস", "আর্কিমিডিসের সূত্র ও প্লবতা"],
      },
      {
        name: "অধ্যায় ৭: তরঙ্গ ও শব্দ",
        topics: ["সরল স্পন্দন গতি ও তরঙ্গের বৈশিষ্ট্য", "শব্দোত্তর তরঙ্গ ও প্রতিধ্বনি"],
      },
      {
        name: "অধ্যায় ৮: আলোর প্রতিফলন",
        topics: ["সমতল ও গোলীয় দর্পণে প্রতিফলন", "প্রতিবিম্ব গঠন ও বিবর্ধন"],
      },
      {
        name: "অধ্যায় ৯: আলোর প্রতিসরণ",
        topics: ["প্রতিসরণের নিয়ম ও প্রতিসরাঙ্ক", "পূর্ণ অভ্যন্তরীণ প্রতিফলন ও সংকট কোণ", "লেন্স ও চোখের ত্রুটি"],
      },
      {
        name: "অধ্যায় ১০: স্থির বিদ্যুৎ",
        topics: ["চার্জ ও আধানের প্রকৃতি", "কুলম্বের সূত্র ও তড়িৎ তীব্রতা"],
      },
      {
        name: "অধ্যায় ১১: চল বিদ্যুৎ",
        topics: ["ওহমের সূত্র ও রোধের সূত্রাবলী", "তুল্যরোধ ও বর্তনীর হিসাব", "তড়িৎ ক্ষমতা ও নিরাপদ ব্যবহার"],
      },
    ],
  },

  // Chemistry (SSC Science)
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
        name: "অধ্যায় ১: রসায়নের ধারণা",
        topics: ["রসায়নের পরিধি ও গবেষণার ধাপসমূহ", "পরীক্ষাগারে ব্যবহৃত রাসায়নিক দ্রব্যের ঝুঁকি ও প্রতীক"],
      },
      {
        name: "অধ্যায় ২: পদার্থের অবস্থা",
        topics: ["কণার গতিতত্ত্ব ও ব্যাপন-নিঃসরণ", "গলন, স্ফুটন ও পাতন প্রক্রিয়া"],
      },
      {
        name: "অধ্যায় ৩: পদার্থের গঠন",
        topics: ["পরমাণুর মূল কণিকাসমূহ ও পারমাণবিক সংখ্যা", "রাদারফোর্ড ও বোর পরমাণু মডেল", "আইসোটোপ ও ইলেকট্রন বিন্যাস"],
      },
      {
        name: "অধ্যায় ৪: পর্যায় সারণি",
        topics: ["পর্যায় সারণির মূল ভিত্তি ও বৈশিষ্ট্য", "পর্যায়বৃত্ত ধর্ম: ধাতব ধর্ম, পারমাণবিক ব্যাসার্ধ ও তড়িৎ ঋণাত্মকতা"],
      },
      {
        name: "অধ্যায় ৫: রাসায়নিক বন্ধন",
        topics: ["যোজ্যতা ইলেকট্রন ও রাসায়নিক নিষ্ক্রিয়তা", "আয়নিক ও সমযোজী বন্ধন গঠন ও বৈশিষ্ট্য"],
      },
      {
        name: "অধ্যায় ৬: মোলের ধারণা ও রাসায়নিক গণনা",
        topics: ["মোল ও আণবিক ভর", "মোলার দ্রবণ ও মোলারিটি", "লিমিটিং বিক্রিয়ক ও স্টয়কিওমিতি"],
      },
      {
        name: "অধ্যায় ৭: রাসায়নিক বিক্রিয়া",
        topics: ["বিক্রিয়ার শ্রেণিবিভাগ (সংযোজন, দহন, বিযোজন, প্রতিস্থাপন)", "জারণ-বিজারণ (Redox) ও ইলেকট্রন স্থানান্তর"],
      },
      {
        name: "অধ্যায় ৮: রসায়ন ও শক্তি",
        topics: ["তাপোৎপাদী ও তাপহারী বিক্রিয়া", "তড়িৎ রাসায়নিক কোষ ও ব্যাটারি"],
      },
      {
        name: "অধ্যায় ১১: খনিজ সম্পদ: জীবাশ্ম",
        topics: ["হাইড্রোকার্বনের শ্রেণিবিভাগ (অ্যালকেন, অ্যালকিন, অ্যালকাইন)", "অ্যালকোহল ও জৈব এসিড প্রস্তুতি"],
      },
    ],
  },

  // Biology (SSC Science)
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
        name: "অধ্যায় ১: জীবন পাঠ",
        topics: ["জীববিজ্ঞানের শাখা ও শ্রেণিবিভাগ", "দ্বিপদ নামকরণ পদ্ধতি"],
      },
      {
        name: "অধ্যায় ২: জীবকোষ ও টিস্যু",
        topics: ["উদ্ভিদ ও প্রাণিকোষের অঙ্গাণুসমূহ", "সরল ও জটিল টিস্যুর গঠন"],
      },
      {
        name: "অধ্যায় ৩: কোষ বিভাজন",
        topics: ["অ্যামাইটোসিস ও মাইটোসিস বিভাজন", "মিয়োসিস বিভাজনের গুরুত্ব"],
      },
      {
        name: "অধ্যায় ৪: জীবনীশক্তি",
        topics: ["সালোকসংশ্লেষণ প্রক্রিয়া ও প্রভাবক", "শ্বসন প্রক্রিয়া ও অবাত-সবাত শ্বসন"],
      },
      {
        name: "অধ্যায় ৫: খাদ্য, পুষ্টি এবং পরিপাক",
        topics: ["পুষ্টি উপাদান ও ক্যালরি মান", "মানব পরিপাকতন্ত্র ও রোগব্যাধি"],
      },
      {
        name: "অধ্যায় ৬: জীবে পরিবহন",
        topics: ["উদ্ভিদে পানি ও খনিজ লবণ পরিবহন", "মানব সংবহনতন্ত্র ও রক্তের উপাদান"],
      },
      {
        name: "অধ্যায় ১১: জীবের প্রজনন",
        topics: ["পরাগায়ন ও নিষেকের কৌশল", "মানব প্রজনন ও ভ্রূণের বিকাশ"],
      },
      {
        name: "অধ্যায় ১২: জীবের বংশগতি ও বিবর্তন",
        topics: ["ডিএনএ ও আরএনএ অণু", "মেন্ডেলের বংশগতির সূত্র"],
      },
    ],
  },

  // Higher Mathematics (SSC Science Elective / Optional)
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
        name: "অধ্যায় ১: সেট ও ফাংশন",
        topics: ["উপসেট ও শক্তি সেট", "এক-এক ও সার্বিক ফাংশন"],
      },
      {
        name: "অধ্যায় ২: বীজগাণিতিক রাশি",
        topics: ["বহুপদী ও চলক", "সমমাত্রিক ও প্রতিসম রাশি"],
      },
      {
        name: "অধ্যায় ৩: জ্যামিতি",
        topics: ["অ্যাপোলোনিয়াসের উপপাদ্য", "টলেমির উপপাদ্য ও ব্রহ্মগুপ্তের সূত্র"],
      },
      {
        name: "অধ্যায় ৭: অসীম ধারা",
        topics: ["অনন্ত গুণোত্তর ধারা", "সীমা ও অসীমতক সমষ্টি"],
      },
      {
        name: "অধ্যায় ৮: ত্রিকোণমিতি",
        topics: ["রেডিয়ান কোণ ও বৃত্তচাপের দৈর্ঘ্য", "ত্রিকোণমিতিক অনুপাতের মান"],
      },
      {
        name: "অধ্যায় ১০: দ্বিপদী বিস্তৃতি",
        topics: ["প্যাসকেলের ত্রিভুজ", "দ্বিপদী উপপাদ্য ও সাধারণ পদ"],
      },
      {
        name: "অধ্যায় ১১: স্থানাঙ্ক জ্যামিতি",
        topics: ["দুই বিন্দুর দূরত্ব ও ক্ষেত্রফল", "সরলরেখার ঢাল ও সমীকরণ"],
      },
      {
        name: "অধ্যায় ১৪: সম্ভাবনা",
        topics: ["নমুনা ক্ষেত্র ও ঘটনা", "সম্ভাবনা নির্ণয়ের নিয়মাবলী"],
      },
    ],
  },

  // Accounting (SSC Business Studies)
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
        name: "অধ্যায় ১: হিসাববিজ্ঞান পরিচিতি",
        topics: ["হিসাববিজ্ঞানের ধারণা ও উদ্দেশ্য", "হিসাব তথ্যের ব্যবহারকারী"],
      },
      {
        name: "অধ্যায় ২: লেনদেন",
        topics: ["লেনদেনের প্রকৃতি ও হিসাব সমীকরণ (A = L + E)", "চালান, ভাউচার ও ক্যাশ মেমো"],
      },
      {
        name: "অধ্যায় ৩: দুতরফা দাখিলা পদ্ধতি",
        topics: ["দুতরফা দাখিলার মূলনীতি", "ডেবিট ও ক্রেডিট নির্ণয়ের নিয়ম"],
      },
      {
        name: "অধ্যায় ৬: জাবেদা",
        topics: ["ক্রয় ও বিক্রয় জাবেদা", "নগদান বহি ও সমন্বয় জাবেদা"],
      },
      {
        name: "অধ্যায় ৭: খতিয়ান",
        topics: ["টি-ছক ও চলমান জের ছক", "খতিয়ানের জের টানা ও সমাপনী"],
      },
      {
        name: "অধ্যায় ৮: রেওয়ামিল",
        topics: ["রেওয়ামিল প্রস্তুত ও অশুদ্ধি সংশোধন"],
      },
      {
        name: "অধ্যায় ৯: আর্থিক বিবরণী",
        topics: ["বিবরণী ও লাভ-ক্ষতি নির্ণয়", "উদ্বৃত্তপত্র ও আর্থিক অবস্থা"],
      },
    ],
  },

  // Finance & Banking (SSC Business Studies)
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
        topics: ["অর্থায়নের ধারণা ও ক্রমবিকাশ", "অর্থায়নের নীতি ও সামাজিক দায়বদ্ধতা"],
      },
      {
        name: "অধ্যায় ৩: অর্থের সময়মূল্য",
        topics: ["ভবিষ্যৎ মূল্য ও চক্রবৃদ্ধিকরণ", "বর্তমান মূল্য ও বাট্টাকরণ পদ্ধতি"],
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

  // History (SSC Humanities)
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
        name: "অধ্যায় ১১: ভাষা আন্দোলন ও পরবর্তী ঘটনাপ্রবাহ",
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

  // Civics (SSC Humanities)
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

  // ══════════════════════════════════════════════════════════════════════════
  // 2. GENERAL EDUCATION BOARD (SCHOOL/COLLEGE) — HSC
  // ══════════════════════════════════════════════════════════════════════════

  // HSC Bangla 1st Paper
  {
    name: "HSC Bangla 1st Paper",
    nameBn: "বাংলা ১ম পত্র (উচ্চ মাধ্যমিক)",
    slug: "hsc-bangla-1",
    board: "general",
    classLevel: "hsc",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "গদ্যাংশ (HSC Sahitya Path Prose)",
        topics: [
          "অপরিচিতা — রবীন্দ্রনাথ ঠাকুর",
          "বিলাসী — শরৎচন্দ্র চট্টোপাধ্যায়",
          "আমার পথ — কাজী নজরুল ইসলাম",
          "মানব-কল্যাণ — আবুল ফজল",
          "মাসি-পিসি — মানিক বন্দ্যোপাধ্যায়",
          "বায়ান্নর দিনগুলো — শেখ মুজিবুর রহমান",
          "রেইনকোট — আখতারুজ্জামান ইলিয়াস",
        ],
      },
      {
        name: "কবিতাংশ (HSC Poetry)",
        topics: [
          "সোনার তরী — রবীন্দ্রনাথ ঠাকুর",
          "বিদ্রোহী — কাজী নজরুল ইসলাম",
          "প্রতিদান — জসীমউদ্দীন",
          "তাহারেই পড়ে মনে — সুফিয়া কামাল",
          "সেই অস্ত্র — আহসান হাবীব",
          "ফেব্রুয়ারি ১৯৬৯ — শামসুর রাহমান",
          "আমি কিংবদন্তির কথা বলছি — আবু জাফর ওবায়দুল্লাহ",
        ],
      },
      {
        name: "সহপাঠ — নাটক ও উপন্যাস",
        topics: [
          "সিরাজউদ্দৌলা (নাটক) — সিকান্দার আবু জাফর",
          "লালসালু (উপন্যাস) — সৈয়দ ওয়ালীউল্লাহ",
        ],
      },
    ],
  },

  // HSC Bangla 2nd Paper (Module based)
  {
    name: "HSC Bangla 2nd Paper",
    nameBn: "বাংলা ২য় পত্র (উচ্চ মাধ্যমিক)",
    slug: "hsc-bangla-2",
    board: "general",
    classLevel: "hsc",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "module",
    chaptersOrModules: [
      {
        name: "ক-অংশ: ব্যাকরণ (Grammar Skills)",
        topics: [
          "বাংলা উচ্চারণের নিয়ম (অ-ধ্বনি, এ-ধ্বনি, ব/ম ফলা)",
          "বাংলা বানানের নিয়ম (নিয়ম ও শুদ্ধরূপ)",
          "ব্যাকরণিক শব্দশ্রেণি ও রূপতত্ত্ব",
          "শব্দ গঠন (উপসর্গ, প্রত্যয় ও সমাস)",
          "বাক্যতত্ত্ব (বাক্যের গঠন ও রূপান্তর)",
          "বাংলা ভাষার অপপ্রয়োগ ও শুদ্ধ প্রয়োগ",
        ],
      },
      {
        name: "খ-অংশ: নির্মিতি (Composition)",
        topics: [
          "পারিভাষিক শব্দ ও ইংরেজি থেকে বাংলা অনুবাদ",
          "দিনলিপি লিখন ও প্রতিবেদন প্রণয়ন",
          "বৈদ্যুতিন চিঠি (ই-মেইল) ও আবেদনপত্র লিখন",
          "সারাংশ/সারমর্ম লিখন ও ভাবসম্প্রসারণ",
          "সংলাপ লিখন ও খুদে গল্প রচনা",
          "প্রবন্ধ রচনা (বিজ্ঞান, সাহিত্য ও জাতীয় উন্নয়ন)",
        ],
      },
    ],
  },

  // HSC English 1st Paper (Module based)
  {
    name: "HSC English 1st Paper",
    nameBn: "ইংরেজি ১ম পত্র (উচ্চ মাধ্যমিক)",
    slug: "hsc-english-1",
    board: "general",
    classLevel: "hsc",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "module",
    chaptersOrModules: [
      {
        name: "Part A: Reading Comprehension & Textual Analysis",
        topics: [
          "Unit 1: People or Institutions Making History (Nelson Mandela, Bangabandhu)",
          "Unit 2: Art & Music (Folk Music, Craft)",
          "Unit 3: Dreams (What is a Dream, Dream Poems)",
          "Unit 4: Youthful Achievers & Adolescence",
          "Unit 5: Environment & Climate Change (Rivers, Forests)",
          "Unit 6: World Heritage & Tours",
          "Seen Comprehension: Multiple Choice & Short Answer Questions",
          "Flow Chart Construction & Information Transfer",
          "Summary Writing of Literary Poems & Passages",
          "Theme Writing & Critical Interpretation",
        ],
      },
      {
        name: "Part B: Guided & Free Writing",
        topics: [
          "Completing a Story from a Given Prompt",
          "Describing Graphs and Charts with Accurate Analytical Data",
          "Writing Formal & Informal Letters",
        ],
      },
    ],
  },

  // HSC English 2nd Paper (Module based)
  {
    name: "HSC English 2nd Paper",
    nameBn: "ইংরেজি ২য় পত্র (উচ্চ মাধ্যমিক)",
    slug: "hsc-english-2",
    board: "general",
    classLevel: "hsc",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "module",
    chaptersOrModules: [
      {
        name: "Part A: Grammar Mastery",
        topics: [
          "Gap Filling with Prepositions and Articles",
          "Gap Filling with Suitable Words/Phrases (was born, have to, would rather, as soon as, etc.)",
          "Completing Sentences with Conditionals and Clauses",
          "Right Forms of Verbs and Subject-Verb Agreement",
          "Narrative Style / Direct to Indirect Speech",
          "Use of Pronoun Reference and Clear Antecedents",
          "Use of Modifiers (Pre-modifiers & Post-modifiers)",
          "Sentence Connectors and Cohesive Conjunctions",
          "Synonyms and Antonyms in Context",
          "Punctuation and Capitalization Mechanics",
        ],
      },
      {
        name: "Part B: Composition & Written Communication",
        topics: [
          "Formal Letters and Official Applications",
          "Writing Descriptive and Cause-Effect Paragraphs",
          "Writing Comparison and Contrast Paragraphs",
        ],
      },
    ],
  },

  // HSC Information & Communication Technology (ICT)
  {
    name: "HSC ICT",
    nameBn: "তথ্য ও যোগাযোগ প্রযুক্তি (উচ্চ মাধ্যমিক)",
    slug: "hsc-ict",
    board: "general",
    classLevel: "hsc",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: বিশ্ব ও বাংলাদেশ প্রেক্ষিত",
        topics: ["ভার্চুয়াল রিয়েলিটি, কৃত্রিম বুদ্ধিমত্তা ও বায়োমেট্রিক্স", "ন্যানোটেকনোলজি ও ক্রায়োসার্জারি"],
      },
      {
        name: "অধ্যায় ২: কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং",
        topics: ["ডেটা কমিউনিকেশনের মাধ্যম ও ওয়্যারলেস প্রযুক্তি (WiFi, WiMax)", "নেটওয়ার্ক টপোলজি ও ক্লাউড কম্পিউটিং"],
      },
      {
        name: "অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
        topics: ["বাইনারি, অকটাল ও হেক্সাডেসিমেল রূপান্তর", "লজিক গেট, বুলিয়ান অ্যালজেব্রা ও এনকোডার-ডিকোডার"],
      },
      {
        name: "অধ্যায় ৪: ওয়েব ডিজাইন পরিচিতি ও HTML",
        topics: ["ওয়েবসাইটের কাঠামো ও হোস্টিং", "HTML ট্যাগ, টেবিল, হাইপারলিংক ও ফর্ম তৈরি"],
      },
      {
        name: "অধ্যায় ৫: প্রোগ্রামিং ভাষা (C Programming)",
        topics: ["অ্যালগরিদম, ফ্লোচার্ট ও সি প্রোগ্রামিংয়ের গঠন", "কন্ডিশনাল স্টেটমেন্ট ও লুপের ব্যবহার"],
      },
      {
        name: "অধ্যায় ৬: ডেটাবেজ ম্যানেজমেন্ট সিস্টেম",
        topics: ["রিলেশনাল ডেটাবেজ (RDBMS) ও কোয়েরি ল্যাঙ্গুয়েজ (SQL)", "ডেটাবেজ নিরাপত্তা ও প্রাইমারি কি"],
      },
    ],
  },

  // HSC Physics 1st Paper (Science)
  {
    name: "HSC Physics 1st Paper",
    nameBn: "পদার্থবিজ্ঞান ১ম পত্র (উচ্চ মাধ্যমিক)",
    slug: "hsc-physics-1",
    board: "general",
    classLevel: "hsc",
    streamGroup: "science",
    subjectType: "group_elective",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ২: ভেক্টর",
        topics: ["ভেক্টরের যোগ, বিয়োগ ও ডট-ক্রস গুণন", "নৌকা ও নদীর সমস্যা", "ক্যালকুলাস প্রয়োগ: গ্রেডিয়েন্ট, ডাইভারজেন্স ও কার্ল"],
      },
      {
        name: "অধ্যায় ৩: গতিবিদ্যা",
        topics: ["প্রাসের গতি ও সর্বোচ্চ উচ্চতা নির্ণয়", "গতি সংক্রান্ত গাণিতিক লেখচিত্র"],
      },
      {
        name: "অধ্যায় ৪: নিউটনিয়ান বলবিদ্যা",
        topics: ["কৌণিক ভরবেগ ও টর্ক", "জড়তার ভ্রামক ও চক্রগতির ব্যাসার্ধ", "রাস্তার ব্যাংকিং ও কেন্দ্রমুখী বল"],
      },
      {
        name: "অধ্যায় ৫: কাজ, শক্তি ও ক্ষমতা",
        topics: ["পরিবর্তনশীল বল দ্বারা কৃতকাজ", "স্প্রিং বল ও বিভবশক্তি", "সংরক্ষণশীল বল ও কর্মদক্ষতা"],
      },
      {
        name: "অধ্যায় ৬: মহাকর্ষ ও অভিকর্ষ",
        topics: ["কেপলারের সূত্রাবলী", "মুক্তিবেগ ও কৃত্রিম উপগ্রহের বেগ নির্ণয়"],
      },
      {
        name: "অধ্যায় ৭: পদার্থের গাঠনিক ধর্ম",
        topics: ["হুকের সূত্র ও ইয়ংয়ের গুণাঙ্ক", "সান্দ্রতা, সান্দ্রতাঙ্ক ও পৃষ্ঠটান"],
      },
      {
        name: "অধ্যায় ৮: পর্যাবৃত্ত গতি",
        topics: ["সরল দোলকের সূত্র ও সময়কাল নির্ণয়", "সরল স্পন্দনশীল কণার শক্তি"],
      },
      {
        name: "অধ্যায় ১০: আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব",
        topics: ["বয়েল ও চার্লসের সমন্বয় সূত্র", "গড় বর্গবেগ (RMS) ও আপেক্ষিক আর্দ্রতা"],
      },
    ],
  },

  // HSC Physics 2nd Paper (Science)
  {
    name: "HSC Physics 2nd Paper",
    nameBn: "পদার্থবিজ্ঞান ২য় পত্র (উচ্চ মাধ্যমিক)",
    slug: "hsc-physics-2",
    board: "general",
    classLevel: "hsc",
    streamGroup: "science",
    subjectType: "group_elective",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: তাপগতিবিদ্যা",
        topics: ["তাপগতিবিদ্যার ১ম ও ২য় সূত্র", "কার্নো চক্র ও ইঞ্জিনের দক্ষতা", "এনট্রপির পরিবর্তন"],
      },
      {
        name: "অধ্যায় ২: স্থির তড়িৎ",
        topics: ["তড়িৎ ক্ষেত্র ও বিভব", "ধারকের ধারকত্ব ও সঞ্চিত শক্তি"],
      },
      {
        name: "অধ্যায় ৩: চল তড়িৎ",
        topics: ["কার্শফের সূত্রাবলী", "হুইটস্টোন ব্রিজ ও পটেনশিওমিটার"],
      },
      {
        name: "অধ্যায় ৭: ভৌত আলোকবিজ্ঞান",
        topics: ["হাইজেনের নীতি", "ব্যতিচার ও ইয়ংয়ের দ্বি-চির পরীক্ষা", "অপবর্তন ও সমবর্তন"],
      },
      {
        name: "অধ্যায় ৮: আধুনিক পদার্থবিজ্ঞানের সূচনা",
        topics: ["আপেক্ষিকতার বিশেষ তত্ত্ব (দৈর্ঘ্য সংকোচন, কাল দীর্ঘায়ন)", "আলোক তড়িৎ ক্রিয়া ও আইনস্টাইনের সমীকরণ"],
      },
      {
        name: "অধ্যায় ৯: পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান",
        topics: ["তেজস্ক্রিয় ক্ষয় সূত্র ও অর্ধায়ু", "ভর ত্রুটি ও নিউক্লীয় বন্ধন শক্তি"],
      },
      {
        name: "অধ্যায় ১০: সেমিকন্ডাক্টর ও ইলেকট্রনিক্স",
        topics: ["p-n জংশন ডায়োড ও রেকটিফায়ার", "ট্রানজিস্টর ও লজিক গেট"],
      },
    ],
  },

  // HSC Chemistry 1st Paper (Science)
  {
    name: "HSC Chemistry 1st Paper",
    nameBn: "রসায়ন ১ম পত্র (উচ্চ মাধ্যমিক)",
    slug: "hsc-chemistry-1",
    board: "general",
    classLevel: "hsc",
    streamGroup: "science",
    subjectType: "group_elective",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ২: গুণগত রসায়ন",
        topics: ["কোয়ান্টাম সংখ্যা ও পলির বর্জন নীতি", "আউফবাউ ও হুন্ডের নীতি", "দ্রাব্যতা ও দ্রাব্যতা গুণফল (Ksp)", "শিখা পরীক্ষা ও বর্ণালী"],
      },
      {
        name: "অধ্যায় ৩: মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন",
        topics: ["সংকরায়ন (sp, sp2, sp3)", "অণুর আকৃতি ও বন্ধন কোণ", "হাইড্রোজেন বন্ধন ও পোলারিটি"],
      },
      {
        name: "অধ্যায় ৪: রাসায়নিক পরিবর্তন",
        topics: ["লা শাতেলিয়ারের নীতি", "ভরক্রিয়া সূত্র ও সাম্যাবস্থা (Kp, Kc)", "বাফার দ্রবণ ও পিএইচ (pH) গণনা"],
      },
      {
        name: "অধ্যায় ৫: কর্মমুখী রসায়ন",
        topics: ["খাদ্য নিরাপত্তা ও প্রিজারভেটিভস", "সাসপেনশন ও কোলয়েড"],
      },
    ],
  },

  // HSC Chemistry 2nd Paper (Science)
  {
    name: "HSC Chemistry 2nd Paper",
    nameBn: "রসায়ন ২য় পত্র (উচ্চ মাধ্যমিক)",
    slug: "hsc-chemistry-2",
    board: "general",
    classLevel: "hsc",
    streamGroup: "science",
    subjectType: "group_elective",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: পরিবেশ রসায়ন",
        topics: ["গ্যাসের সূত্রাবলী ও গ্রাহামের ব্যাপন সূত্র", "ভ্যান ডার ওয়ালস সমীকরণ", "এসিড বৃষ্টি ও গ্রিনহাউস গ্যাস"],
      },
      {
        name: "অধ্যায় ২: জৈব রসায়ন",
        topics: ["জৈব যৌগের সমাণুতা (গাঠনিক ও স্টেরিও)", "বেনজিন ও ইলেকট্রোফিলিক প্রতিস্থাপন", "অ্যালকাইল হ্যালাইড ও Sn1-Sn2 বিক্রিয়া", "অ্যালডিহাইড-কিটোন ও পলিমার"],
      },
      {
        name: "অধ্যায় ৩: পরিমাণগত রসায়ন",
        topics: ["জারণ সংখ্যা ও আয়ন-ইলেকট্রন পদ্ধতি", "টাইট্রেশন ও নির্দেশকের ভূমিকা", "বিয়ার-ল্যাম্বার্ট সূত্র"],
      },
      {
        name: "অধ্যায় ৪: তড়িৎ রসায়ন",
        topics: ["ফ্যারাডের সূত্র", "গ্যালভানিক কোষ ও নার্নস্ট সমীকরণ"],
      },
    ],
  },

  // HSC Higher Mathematics 1st Paper (Science)
  {
    name: "HSC Higher Mathematics 1st Paper",
    nameBn: "উচ্চতর গণিত ১ম পত্র (উচ্চ মাধ্যমিক)",
    slug: "hsc-higher-math-1",
    board: "general",
    classLevel: "hsc",
    streamGroup: "science",
    subjectType: "group_elective",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: ম্যাট্রিক্স ও নির্ণায়ক",
        topics: ["ম্যাট্রিক্সের প্রকারভেদ ও গুণন", "নির্ণায়কের অনুরাশি ও সহগুণক", "বিপরীত ম্যাট্রিক্স ও ক্র্যামারের নিয়ম"],
      },
      {
        name: "অধ্যায় ৩: সরলরেখা",
        topics: ["বিভক্তিকরণ বিন্দু ও ত্রিভুজের ক্ষেত্রফল", "সরলরেখার বিভিন্ন সমীকরণ ও লম্ব দূরত্ব"],
      },
      {
        name: "অধ্যায় ৪: বৃত্ত",
        topics: ["বৃত্তের সাধারণ সমীকরণ ও কেন্দ্র-ব্যাসার্ধ", "স্পর্শক ও অভিলম্বের সমীকরণ"],
      },
      {
        name: "অধ্যায় ৭: সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত",
        topics: ["যৌগিক কোণের ত্রিকোণমিতি", "গুণিতক ও উপগুণিতক কোণ"],
      },
      {
        name: "অধ্যায় ৯: অন্তরীকরণ (Differentiation)",
        topics: ["সীমা ও লিমিটের মূল সূত্র", "ফাংশনের অন্তরজ নির্ণয়", "গুরুমান ও লঘুমান নির্ণয়"],
      },
      {
        name: "অধ্যায় ১০: যোগজীকরণ (Integration)",
        topics: ["অনির্দিষ্ট যোগজীকরণ ও প্রতিস্থাপন পদ্ধতি", "নির্দিষ্ট যোগজীকরণ ও ক্ষেত্রফল নির্ণয়"],
      },
    ],
  },

  // HSC Higher Mathematics 2nd Paper (Science)
  {
    name: "HSC Higher Mathematics 2nd Paper",
    nameBn: "উচ্চতর গণিত ২য় পত্র (উচ্চ মাধ্যমিক)",
    slug: "hsc-higher-math-2",
    board: "general",
    classLevel: "hsc",
    streamGroup: "science",
    subjectType: "group_elective",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: বাস্তব সংখ্যা ও অসমতা",
        topics: ["বাস্তব সংখ্যার স্বতঃসিদ্ধ", "পরমমান ও অসমতার সমাধান"],
      },
      {
        name: "অধ্যায় ৩: জটিল সংখ্যা",
        topics: ["জটিল সংখ্যার মডুলাস ও আর্গুমেন্ট", "এককের ঘনমূল ও চতুর্মূল"],
      },
      {
        name: "অধ্যায় ৪: বহুপদী ও বহুপদী সমীকরণ",
        topics: ["দ্বিঘাত ও ত্রিঘাত সমীকরণের মূল ও সহগ সম্পর্ক", "মূলের প্রকৃতি নির্ণয়"],
      },
      {
        name: "অধ্যায় ৬: কণিক (Conics)",
        topics: ["পরাবৃত্ত (Parabola) সমীকরণ ও বৈশিষ্ট্য", "উপবৃত্ত (Ellipse) ও অধিবৃত্ত (Hyperbola)"],
      },
      {
        name: "অধ্যায় ৭: বিপরীত ত্রিকোণমিতিক ফাংশন ও সমীকরণ",
        topics: ["বিপরীত বৃত্তীয় ফাংশনের রূপান্তর", "ত্রিকোণমিতিক সমীকরণের সাধারণ সমাধান"],
      },
      {
        name: "অধ্যায় ৮: স্থিতিবিদ্যা",
        topics: ["বলের সাম্যাবস্থা ও লামির উপপাদ্য", "সমান্তরাল বল ও সদৃশ-বিসদৃশ বল"],
      },
      {
        name: "অধ্যায় ৯: সমতলে বস্তুকণার গতি",
        topics: ["সরলরেখায় গতি ও আপেক্ষিক বেগ", "অভিকর্ষের অধীনে গতি"],
      },
    ],
  },

  // HSC Biology 1st Paper - Botany (Science)
  {
    name: "HSC Biology 1st Paper (Botany)",
    nameBn: "জীববিজ্ঞান ১ম পত্র — উদ্ভিদবিজ্ঞান",
    slug: "hsc-biology-1",
    board: "general",
    classLevel: "hsc",
    streamGroup: "science",
    subjectType: "optional",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: কোষ ও এর গঠন",
        topics: ["কোষ প্রাচীর, প্লাজমামেমব্রেন ও রাইবোসোম", "ডিএনএ অনুলিপন ও প্রোটিন সংশ্লেষণ"],
      },
      {
        name: "অধ্যায় ২: কোষ বিভাজন",
        topics: ["মাইটোসিসের পর্যায়সমূহ", "মিয়োসিস ক্রসিং ওভার ও গুরুত্ব"],
      },
      {
        name: "অধ্যায় ৪: অণুজীব",
        topics: ["ভাইরাসের গঠন ও T2 ব্যাকটেরিওফায", "ব্যাকটেরিয়ার জনন ও ম্যালেরিয়া জীবাণু"],
      },
      {
        name: "অধ্যায় ৭: নগ্নবীজী ও আবৃতবীজী উদ্ভিদ",
        topics: ["সাইকাসের বৈশিষ্ট্য", "পোয়াসিয়া ও মালভেসি গোত্রের শনাক্তকারী বৈশিষ্ট্য"],
      },
      {
        name: "অধ্যায় ৯: উদ্ভিদ শারীরতত্ত্ব",
        topics: ["প্রস্বেদন ও পত্ররন্ধ্র খোলা-বন্ধের কৌশল", "কেলভিন চক্র (C3) ও হ্যাচ-স্ল্যাক চক্র (C4)"],
      },
      {
        name: "অধ্যায় ১১: জীবপ্রযুক্তি",
        topics: ["টিস্যু কালচার প্রযুক্তি", "রিকম্বিনেন্ট ডিএনএ প্রযুক্তি ও জিনোম সিকোয়েন্সিং"],
      },
    ],
  },

  // HSC Biology 2nd Paper - Zoology (Science)
  {
    name: "HSC Biology 2nd Paper (Zoology)",
    nameBn: "জীববিজ্ঞান ২য় পত্র — প্রাণিবিজ্ঞান",
    slug: "hsc-biology-2",
    board: "general",
    classLevel: "hsc",
    streamGroup: "science",
    subjectType: "optional",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস",
        topics: ["শ্রেণিবিন্যাসের ভিত্তি ও প্রধান পর্বসমূহ", "কর্ডাটা পর্বের উপপর্ব ও শ্রেণি"],
      },
      {
        name: "অধ্যায় ২: প্রাণীর পরিচিতি",
        topics: ["হাইড্রার বহির্ত্বক, নিডোসাইট ও মিথোজীবিতা", "ঘাসফড়িংয়ের পৌষ্টিকতন্ত্র ও রূপান্তর"],
      },
      {
        name: "অধ্যায় ৩: মানব শারীরতত্ত্ব: পরিপাক ও শোষণ",
        topics: ["মুখবিবর, পাকস্থলী ও অন্ত্রে খাদ্য পরিপাক", "যকৃতের সঞ্চয়ী ও বিপাকীয় ভূমিকা"],
      },
      {
        name: "অধ্যায় ৪: মানব শারীরতত্ত্ব: রক্ত ও সংবহন",
        topics: ["রক্তকণিকা ও রক্ততঞ্চন প্রক্রিয়া", "হৃৎপিণ্ডের গঠন ও কার্ডিয়াক চক্র"],
      },
      {
        name: "অধ্যায় ১১: জিনতত্ত্ব ও বিবর্তন",
        topics: ["মেন্ডেলের ১ম ও ২য় সূত্রের ব্যতিক্রম", "সেক্স-লিংকড ডিসঅর্ডার ও ডারউইনবাদ"],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. MADRASAH EDUCATION BOARD — DAKHIL
  // ══════════════════════════════════════════════════════════════════════════

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

  // Dakhil Islamic History
  {
    name: "Islamic History",
    nameBn: "ইসলামের ইতিহাস",
    slug: "dakhil-islamic-history",
    board: "madrasah",
    classLevel: "dakhil",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: প্রাক-ইসলামি আরব ও মহানবী (সা.)-এর মক্কী জীবন",
        topics: ["আইয়ামে জাহেলিয়াত ও তৎকালীন আরবের অবস্থা", "হিলফুল ফুজুল ও নবুওয়াত লাভ", "ইসলাম প্রচার ও মদিনায় হিজরত"],
      },
      {
        name: "অধ্যায় ২: মহানবী (সা.)-এর মাদানী জীবন ও রাষ্ট্র প্রতিষ্ঠা",
        topics: ["মদিনা সনদ ও প্রথম ইসলামি রাষ্ট্র", "বদর, ওহুদ ও খন্দকের যুদ্ধ", "হুদাইবিয়ার সন্ধি ও মক্কা বিজয়", "বিদায় হজের ঐতিহাসিক ভাষণ"],
      },
      {
        name: "অধ্যায় ৩: খোলাফায়ে রাশেদীনের শাসনকাল",
        topics: ["হযরত আবু বকর (রা.) — ভণ্ড নবীদের দমন", "হযরত ওমর (রা.) — প্রশাসনিক সংস্কার ও বিজয়", "হযরত ওসমান (রা.) ও কুরআন সংকলন", "হযরত আলী (রা.)-এর খেলাফত ও অন্তর্দ্বন্দ্ব"],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. MADRASAH EDUCATION BOARD — ALIM
  // ══════════════════════════════════════════════════════════════════════════

  // Alim Quran Mazid
  {
    name: "Alim Quran Mazid",
    nameBn: "কুরআন মাজিদ (আলিম)",
    slug: "alim-quran",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "সূরা আল-বাক্বারাহ (নির্বাচিত রুকু ও আয়াত)",
        topics: [
          "রুকু ১–৫: মুত্তাকী, কাফের ও মুনাফিকদের গুণাবলী",
          "রুকু ৬–১০: আদম (আ.)-এর সৃষ্টি ও বনি ইসরাইলের বিবরণ",
          "রুকু ১৬–২০: কাবাঘর নির্মাণ ও কিবলা পরিবর্তন",
          "রুকু ২১–২৫: রোজা ও হজের হুকুম",
          "আয়াতুল কুরসী ও দ্বীনের স্বাধীনতা",
        ],
      },
      {
        name: "সূরা আলে-ইমরান ও উসুলুত তাফসির",
        topics: [
          "সূরা আলে-ইমরানের গুরুত্বপূর্ণ ঘটনাবলী ও ওহুদের শিক্ষা",
          "তাফসিরের পরিভাষা ও উলুমুল কুরআনের মৌলিক নীতিমালা",
        ],
      },
    ],
  },

  // Alim Hadith Sharif
  {
    name: "Alim Hadith Sharif",
    nameBn: "হাদিস শরিফ (মিশকাতুল মাসাবীহ)",
    slug: "alim-hadith",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "কিতাবুল ঈমান ও কিতাবুল ইলম",
        topics: [
          "হাদিসে জিবরীল (ঈমান, ইসলাম, ইহসান ও কিয়ামত)",
          "ইলম অর্জন ও প্রচারের অপরিহার্য দায়িত্ব",
          "বিদআত ও ধর্মের নামে বিকৃতির প্রতিবাদ",
        ],
      },
      {
        name: "কিতাবুস সালাত ও কিতাবুয যাকাত",
        topics: [
          "সালাতের গুরুত্ব ও খুশু-খুজুর ফজিলত",
          "যাকাত আদায় ও বায়তুল মালের ভূমিকা",
        ],
      },
      {
        name: "কিতাবুল জিহাদ ও কিতাবুল আদাব",
        topics: [
          "ইসলামে জিহাদের প্রকৃতি ও শান্তি রক্ষা",
          "আখলাক, পিতা-মাতা, ভ্রাতৃত্ব ও সমাজ সংস্কার",
        ],
      },
    ],
  },

  // Alim Fiqh 1st Paper (Al-Hidayah)
  {
    name: "Alim Fiqh 1st Paper",
    nameBn: "ফিকহ ১ম পত্র (আল-হিদায়াহ)",
    slug: "alim-fiqh-1",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "কিতাবুত তাহারাত (পবিত্রতা বিধান)",
        topics: [
          "পানির প্রকারভেদ ও পবিত্রতা অর্জনের মাধ্যম",
          "অজু, গোসল ও তায়াম্মুমের মাসায়েল",
          "নাজাসাত ও তা থেকে পাক হওয়ার বিধান",
        ],
      },
      {
        name: "কিতাবুস সালাত (নামাজের বিধান)",
        topics: [
          "সালাতের শর্ত, রুকন ও ওয়াজিবাত",
          "ইমামত, জামাত ও মাসবুকের বিধান",
          "মুসাফিরের সালাত ও কাজা সালাতের নিয়ম",
        ],
      },
      {
        name: "কিতাবুয যাকাত ও কিতাবুস সাওম",
        topics: [
          "যাকাতযোগ্য সম্পদ ও নিসাব",
          "সাওমের শর্ত, কাফফারা ও ফেতরা প্রদান",
        ],
      },
    ],
  },

  // Alim Fiqh 2nd Paper (Usul & Miras)
  {
    name: "Alim Fiqh 2nd Paper",
    nameBn: "ফিকহ ২য় পত্র (উসুল ও ফারায়েজ)",
    slug: "alim-fiqh-2",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "প্রথম অংশ: উসুলুল ফিকহ (নুরুল আনোয়ার)",
        topics: [
          "কিতাবুল্লাহ ও সুন্নাহর ভাষাগত বিন্যাস (খাস, আম, মুশতাকার, মুয়াওয়াল)",
          "আমরের হুকুম ও নাহী-এর তাৎপর্য",
          "হাকীকত ও মাজায, সরীহ ও কেনায়াহ",
          "ইজমা ও কিয়াসের প্রামাণিকতা",
        ],
      },
      {
        name: "দ্বিতীয় অংশ: ফারায়েজ (সিরাজী — উত্তরাধিকার আইন)",
        topics: [
          "উত্তরাধিকারীদের পরিচিতি ও শর্তাবলী",
          "আসহাবুল ফুরুজের অংশ বণ্টন",
          "আসাবা ও যাওইল আরহামের অংশ",
          "আউল ও রদ্দ সমস্যার সমাধান",
        ],
      },
    ],
  },

  // Alim Arabic 1st Paper (Insha & Adab Module based)
  {
    name: "Alim Arabic 1st Paper",
    nameBn: "আরবি ১ম পত্র (আলিম)",
    slug: "alim-arabic-1",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "module",
    chaptersOrModules: [
      {
        name: "আল-জুজ আল-আউয়াল: পাঠ অনুধাবন ও সাহিত্য",
        topics: [
          "নির্বাচিত ইসলামি ও ধ্রুপদী আরবি গদ্য",
          "কুরআনিক ও হাদিস সাহিত্যের ভাষা বিশ্লেষণ",
          "আধুনিক আরবি প্রবন্ধ ও সাময়িকী পাঠ",
        ],
      },
      {
        name: "আল-জুজ আস-সানি: ইনশা ও সৃজনশীল রচনা",
        topics: [
          "আরবি পত্র লিখন (ব্যক্তিগত ও ব্যবসায়িক)",
          "আরবি প্রতিবেদন ও দরখাস্ত প্রণয়ন",
          "সমসাময়িক বিষয়ে মুক্ত অনুচ্ছেদ রচনা",
        ],
      },
    ],
  },

  // Alim Arabic 2nd Paper (Balaghat & Mantiq Module based)
  {
    name: "Alim Arabic 2nd Paper",
    nameBn: "আরবি ২য় পত্র — বালাগাত ও মানতিক",
    slug: "alim-arabic-2",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "module",
    chaptersOrModules: [
      {
        name: "প্রথম অংশ: ইলমুল বালাগাত (Rhetoric)",
        topics: [
          "ফাসাহাত ও বালাগাতের সংজ্ঞা",
          "ইলমুল মা'আনি: কালামের প্রকারভেদ (খবর ও ইনশা)",
          "ইলমুল বায়ান: তাশবীহ, হাকীকত ও মাজায",
          "ইস্তি'আরাহ ও কেনায়াহ",
          "ইলমুল বাদী: বিভিন্ন সাহিত্যিক অলংকার",
        ],
      },
      {
        name: "দ্বিতীয় অংশ: ইলমুল মানতিক (Logic)",
        topics: [
          "ইলম ও তার প্রকারভেদ (তাসাউর ও তাসদীক)",
          "দলালাত ও আলফায পরিচিতি",
          "কুল্লিয়্যাতে খামসাহ (পাঁচটি সর্বজনীন ধারণা)",
          "ক্বদিয়্যাহ ও ক্বিয়াসের প্রাথমিক নিয়মাবলী",
        ],
      },
    ],
  },

  // Alim Islamic History
  {
    name: "Alim Islamic History",
    nameBn: "ইসলামের ইতিহাস (আলিম)",
    slug: "alim-islamic-history",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "অধ্যায় ১: উমাইয়া খিলাফত",
        topics: [
          "হযরত মুয়াবিয়া (রা.) ও উমাইয়া খিলাফত প্রতিষ্ঠা",
          "আব্দুল মালিক ও ওয়ালিদের রাজত্বকাল",
          "হযরত ওমর বিন আব্দুল আজিজ (রহ.)-এর সংস্কার",
          "উমাইয়া খিলাফতের পতনের কারণ",
        ],
      },
      {
        name: "অধ্যায় ২: আব্বাসীয় খিলাফত",
        topics: [
          "আব্বাসীয় খিলাফত প্রতিষ্ঠা ও আবুল আব্বাস আস-সাফফাহ",
          "খলিফা আবু জাফর আল-মানসুর ও বাগদাদ নগরী প্রতিষ্ঠা",
          "হারুনুর রশিদ ও বায়তুল হিকমাহ (জ্ঞানের বিকাশ)",
        ],
      },
      {
        name: "অধ্যায় ৩: স্পেনে মুসলিম শাসন (আন্দালুসিয়া)",
        topics: [
          "তারেক বিন জিয়াদ ও স্পেন বিজয়",
          "প্রথম আব্দুর রহমান ও কর্ডোভার খিলাফত",
          "মুসলিম স্পেনের স্থাপত্য, বিজ্ঞান ও পতন",
        ],
      },
    ],
  },
];
