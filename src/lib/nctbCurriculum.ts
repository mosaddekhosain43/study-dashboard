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
  {
    "name": "Bangla 1st Paper",
    "nameBn": "বাংলা ১ম পত্র (সাহিত্য ও সহপাঠ)",
    "slug": "ssc-bangla-1",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "গদ্যাংশ (Prose Selection 2026)",
        "topics": [
          "শুভা — রবীন্দ্রনাথ ঠাকুর",
          "বই পড়া — প্রমথ চৌধুরী",
          "আম-আঁটির ভেঁপু — বিভূতিভূষণ বন্দ্যোপাধ্যায়",
          "মানুষ মুহাম্মদ (স.) — মোহাম্মদ ওয়াজেদ আলী",
          "নিমগাছ — বনফুল",
          "শিক্ষা ও মনুষ্যত্ব — মোতাহের হোসেন চৌধুরী",
          "প্রবাস বন্ধু — সৈয়দ মুজতবা আলী",
          "একাত্তরের দিনগুলি — জাহানারা ইমাম",
          "সাহিত্যের রূপ ও রীতি — হায়াৎ মামুদ",
          "নিয়ামত ও চব্বিশের গণজাগরণ — সমকালীন সাহিত্য"
        ]
      },
      {
        "name": "কবিতাংশ (Poetry Selection 2026)",
        "topics": [
          "বঙ্গবাণী — আব্দুল হাকিম",
          "কপোতাক্ষ নদ — মাইকেল মধুসূদন দত্ত",
          "জীবন-সঙ্গীত — হেমচন্দ্র বন্দ্যোপাধ্যায়",
          "জুতো আবিষ্কার — রবীন্দ্রনাথ ঠাকুর",
          "মানুষ — কাজী নজরুল ইসলাম",
          "সেইদিন এই মাঠ — জীবনানন্দ দাশ",
          "পল্লীজননী — জসীমউদ্দীন",
          "আশা — সিকান্দার আবু জাফর",
          "তোমাকে পাওয়ার জন্যে হে স্বাধীনতা — শামসুর রাহমান",
          "সাহসী জননী বাংলা — কামাল চৌধুরী"
        ]
      },
      {
        "name": "সহপাঠ: উপন্যাস ও নাটক (Novel & Drama)",
        "topics": [
          "উপন্যাস: কাকতাড়ুয়া — সেলিনা হোসেন (পটভূমি ও চরিত্র বিশ্লেষণ)",
          "উপন্যাস: কাকতাড়ুয়া — সেলিনা হোসেন (মূল বিষয়বস্তু ও মুক্তিযুদ্ধ)",
          "নাটক: বহিপীর — সৈয়দ ওয়ালীউল্লাহ (বিষয়বস্তু ও তাহেরা চরিত্র)",
          "নাটক: বহিপীর — সৈয়দ ওয়ালীউল্লাহ (সামাজিক প্রেক্ষাপট ও প্রশ্নোত্তর)"
        ]
      }
    ]
  },
  {
    "name": "Bangla 2nd Paper",
    "nameBn": "বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)",
    "slug": "ssc-bangla-2",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "বাংলা ব্যাকরণ অংশ (Grammar)",
        "topics": [
          "ভাষা ও বাংলা ভাষা",
          "বাংলা ব্যাকরণ ও এর আলোচ্য বিষয়",
          "ধ্বনি ও বর্ণ প্রকরণ",
          "ধ্বনির পরিবর্তন ও ণ-ত্ব এবং ষ-ত্ব বিধান",
          "সন্ধি (স্বরসন্ধি ও ব্যঞ্জনসন্ধি)",
          "শব্দ ও পদের শ্রেণিবিভাগ (বিশেষ্য, বিশেষণ, সর্বনাম, ক্রিয়া, অব্যয়)",
          "উপসর্গ, প্রত্যয় ও ধাতু",
          "সমাস (দ্বন্দ্ব, কর্মধারয়, তৎপুরুষ, বহুব্রীহি, দ্বিগু, অব্যয়ীভাব)",
          "বাক্য প্রকরণ ও বাক্য রূপান্তর",
          "বিরামচিহ্ন বা যতিচিহ্নের সঠিক ব্যবহার",
          "বাগধারা ও প্রবাদ-প্রবচন",
          "শব্দের অপপ্রয়োগ ও শুদ্ধ প্রয়োগ"
        ]
      },
      {
        "name": "নির্মিতি ও রচনা অংশ (Composition & Writing)",
        "topics": [
          "অনুচ্ছেদ লিখন (Paragraph Writing)",
          "সারাংশ ও সারমর্ম লিখন",
          "ভাবসম্প্রসারণ (Amplification)",
          "আবেদনপত্র ও প্রাতিষ্ঠানিক পত্র (Formal Letters)",
          "সংবাদপত্রে প্রকাশের জন্য প্রতিবেদন (Report Writing)",
          "প্রবন্ধ ও রচনা লিখন (Essay Writing)"
        ]
      }
    ]
  },
  {
    "name": "English 1st Paper",
    "nameBn": "ইংরেজি ১ম পত্র (English for Today)",
    "slug": "ssc-english-1",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "English for Today Core Units (2026 Edition)",
        "topics": [
          "Unit 1: Good Citizens (Responsibilities & Rights)",
          "Unit 2: Pastimes (Habits & Modern Recreation)",
          "Unit 3: Events and Festivals (National & Cultural)",
          "Unit 4: Are We Aware? (Traffic, Food Adulteration, Ethics)",
          "Unit 5: Nature and Environment (Climate Change & Ecology)",
          "Unit 6: Our Neighbours (South Asian Culture & Cooperation)",
          "Unit 7: People Who Stand Out (Inspirational Figures)",
          "Unit 8: World Heritage (Shat Gombuj Mosque & Sundarbans)",
          "Unit 9: Unconventional Jobs (Passion & Career)",
          "Unit 10: Dreams (Visionaries & Trailblazers)",
          "Unit 11: Renewable Energy (Green Technology & Sustainability)",
          "Unit 12: Roots (Identity & Migration)",
          "Unit 13: Media and E-communications (Internet, AI & Digital Era)",
          "Unit 14: Pleasure and Purpose (Art, Literature & Leisure)"
        ]
      },
      {
        "name": "Reading Comprehension & Guided Writing",
        "topics": [
          "Seen Passage: MCQ & Open-ended Comprehensive Questions",
          "Information Transfer & Flow Chart Construction",
          "Summary Writing from Text",
          "Unseen Comprehension & Cloze Test with/without Clues",
          "Rearranging Sentences into Meaningful Sequence",
          "Describing Graphs and Charts",
          "Story Writing with Clues & Creative Titles",
          "Informal Letters and E-mails"
        ]
      }
    ]
  },
  {
    "name": "English 2nd Paper",
    "nameBn": "ইংরেজি ২য় পত্র (Grammar & Composition)",
    "slug": "ssc-english-2",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "Core Grammar Topics",
        "topics": [
          "Gap Filling Activities with Prepositions and Articles",
          "Right Form of Verbs (Subject-Verb Agreement & Conditionals)",
          "Changing Sentences: Voice Change (Active & Passive)",
          "Changing Sentences: Degrees of Comparison (Positive, Comparative, Superlative)",
          "Changing Sentences: Affirmative, Negative, Interrogative, Exclamatory",
          "Changing Sentences: Simple, Complex and Compound",
          "Completing Sentences with Clauses and Phrases",
          "Use of Suffixes and Prefixes in Word Formation",
          "Tag Questions Rules and Practice",
          "Sentence Connectors and Linkers",
          "Punctuation Marks and Capitalization"
        ]
      },
      {
        "name": "Composition & Formal Communication",
        "topics": [
          "Curriculum Vitae (CV) Writing with Cover Letter",
          "Formal Letters: Applications to Head of Institution",
          "Formal Letters: Complaint and Municipal Letters",
          "Paragraph Writing (Descriptive, Cause & Effect, Problem Solution)",
          "Descriptive and Analytical Composition Writing"
        ]
      }
    ]
  },
  {
    "name": "General Mathematics",
    "nameBn": "সাধারণ গণিত",
    "slug": "ssc-general-math",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১: বাস্তব সংখ্যা (Real Numbers)",
        "topics": [
          "বাস্তব সংখ্যার শ্রেণিবিভাগ ও মূলদ-অমূলদ সংখ্যার ধারণা",
          "আবৃত দশমিক ভগ্নাংশ ও সাধারণ ভগ্নাংশে রূপান্তর",
          "সদৃশ ও অসদৃশ আবৃত দশমিকের যোগ, বিয়োগ, গুণ ও ভাগ"
        ]
      },
      {
        "name": "অধ্যায় ২: সেট ও ফাংশন (Sets & Functions)",
        "topics": [
          "সেট প্রকাশের পদ্ধতি, সসীম ও অসীম সেট",
          "সংযোগ, ছেদ, অন্তর ও পূরক সেট",
          "কার্তেসীয় গুণজ, অন্বয় এবং ফাংশনের ডোমেন ও রেঞ্জ"
        ]
      },
      {
        "name": "অধ্যায় ৩: বীজগাণিতিক রাশি (Algebraic Expressions)",
        "topics": [
          "বর্গ সংবলিত সূত্রাবলি ও এর প্রয়োগ",
          "ঘন সংবলিত সূত্রাবলি ও মান নির্ণয়",
          "উৎপাদকে বিশ্লেষণ ও ভাগশেষ উপপাদ্য (Remainder Theorem)",
          "বাস্তব সমস্যা সমাধানে বীজগাণিতিক সূত্র গঠন"
        ]
      },
      {
        "name": "অধ্যায় ৪: সূচক ও লগারিদম (Exponents & Logarithms)",
        "topics": [
          "সূচকীয় নিয়মাবলি ও বাস্তব প্রয়োগ",
          "লগারিদমের ভিত্তি ও বৈশিষ্ট্যসমূহ",
          "সাধারণ লগারিদম, পূর্ণক ও অংশক নির্ণয়"
        ]
      },
      {
        "name": "অধ্যায় ৫: এক চলকবিশিষ্ট সমীকরণ (Linear Equations in One Variable)",
        "topics": [
          "চলক ও অভেদ সম্পর্কিত ধারণা",
          "একঘাত সমীকরণ সমাধান ও বাস্তব সমস্যার গাণিতিক সমাধান"
        ]
      },
      {
        "name": "অধ্যায় ৬: রেখা, কোণ ও ত্রিভুজ (Lines, Angles & Triangles)",
        "topics": [
          "সমান্তরাল সরলরেখা ও ছেদক দ্বারা উৎপন্ন কোণসমূহ",
          "ত্রিভুজের সর্বসমতা ও সাদৃশ্য সংক্রান্ত উপপাদ্য"
        ]
      },
      {
        "name": "অধ্যায় ৭: ব্যবহারিক জ্যামিতি (Practical Geometry)",
        "topics": [
          "ত্রিভুজ সংক্রান্ত মৌলিক সম্পাদ্যসমূহ",
          "চতুর্ভুজ, সামান্তরিক ও ট্রাপিজিয়াম অঙ্কন"
        ]
      },
      {
        "name": "অধ্যায় ৮: বৃত্ত (Circle)",
        "topics": [
          "বৃত্তের জ্যা, ব্যাস ও বৃত্তচাপ সম্পর্কিত উপপাদ্য",
          "বৃত্তস্থ কোণ ও কেন্দ্রস্থ কোণের পারস্পরিক সম্পর্ক",
          "বৃত্তের স্পর্শক ও সাধারণ স্পর্শক অঙ্কন"
        ]
      },
      {
        "name": "অধ্যায় ৯: ত্রিকোণমিতিক অনুপাত (Trigonometric Ratios)",
        "topics": [
          "সমকোণী ত্রিভুজের বাহু ও সূক্ষ্মকোণের ত্রিকোণমিতিক অনুপাত",
          "0°, 30°, 45°, 60° ও 90° কোণের ত্রিকোণমিতিক মানসমূহ",
          "ত্রিকোণমিতিক অভেদাবলি প্রমাণ ও প্রয়োগ"
        ]
      },
      {
        "name": "অধ্যায় ১০: দূরত্ব ও উচ্চতা (Distance & Elevation)",
        "topics": [
          "উন্নতি কোণ ও অবনতি কোণের জ্যামিতিক ধারণা",
          "দূরত্ব ও উচ্চতা বিষয়ক বাস্তব গাণিতিক সমস্যা"
        ]
      },
      {
        "name": "অধ্যায় ১১: বীজগাণিতিক অনুপাত ও সমানুপাত (Ratio & Proportion)",
        "topics": [
          "অনুপাত ও সমানুপাতের বিভিন্ন রূপান্তর (যোজন, বিয়োজন)",
          "ধারাবাহিক অনুপাত ও বাস্তব গাণিতিক সমস্যা"
        ]
      },
      {
        "name": "অধ্যায় ১২: দুই চলকবিশিষ্ট সরল সহসমীকরণ (Simultaneous Equations)",
        "topics": [
          "সহসমীকরণের সঙ্গতি ও নির্ভরশীলতা যাচাই",
          "প্রতিস্থাপন, অপনয়ন ও আরজগুণন পদ্ধতিতে সমাধান",
          "লেখচিত্রের সাহায্যে সহসমীকরণ সমাধান"
        ]
      },
      {
        "name": "অধ্যায় ১৩: সসীম ধারা (Finite Series)",
        "topics": [
          "সমান্তর ধারার n-তম পদ ও সমষ্টি নির্ণয়",
          "গুণোত্তর ধারার n-তম পদ ও সমষ্টি নির্ণয়"
        ]
      },
      {
        "name": "অধ্যায় ১৪: অনুপাত, সদৃশতা ও প্রতিসমতা (Symmetry & Similarity)",
        "topics": [
          "সদৃশকোণী ত্রিভুজ সংক্রান্ত উপপাদ্য",
          "প্রতিসমতা ও রেখা প্রতিসমতার ধারণা"
        ]
      },
      {
        "name": "অধ্যায় ১৫: ক্ষেত্রফল সম্পর্কিত উপপাদ্য ও সম্পাদ্য (Area Theorems)",
        "topics": [
          "পিথাগোরাসের উপপাদ্য ও এর বিপরীত উপপাদ্য প্রমাণ",
          "ত্রিভুজ ও চতুর্ভুজাকার ক্ষেত্রের ক্ষেত্রফল সম্পর্কিত উপপাদ্য"
        ]
      },
      {
        "name": "অধ্যায় ১৬: পরিমিতি (Mensuration)",
        "topics": [
          "ত্রিভুজাকার ও চতুর্ভুজাকার ক্ষেত্রের ক্ষেত্রফল",
          "বৃত্তের পরিধি, ক্ষেত্রফল ও বৃত্তাংশের ক্ষেত্রফল",
          "আয়তাকার ঘনবস্তু, ঘনক ও বেলনের আয়তন ও সমগ্রতলের ক্ষেত্রফল"
        ]
      },
      {
        "name": "অধ্যায় ১৭: পরিসংখ্যান (Statistics)",
        "topics": [
          "গণসংখ্যা নিবেশন সারণি তৈরি ও ক্রমযোজিত গণসংখ্যা",
          "সংক্ষিপ্ত পদ্ধতিতে গাণিতিক গড় নির্ণয়",
          "মধ্যক ও প্রচুরক নির্ণয়ের সূত্র ও প্রয়োগ",
          "আয়তলেখ, বহুভুজ ও ওজাইভ রেখা অঙ্কন"
        ]
      }
    ]
  },
  {
    "name": "Information & Communication Technology",
    "nameBn": "তথ্য ও যোগাযোগ প্রযুক্তি",
    "slug": "ssc-ict",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১: তথ্য ও যোগাযোগ প্রযুক্তি এবং আমাদের বাংলাদেশ",
        "topics": [
          "একুশ শতক এবং তথ্য ও যোগাযোগ প্রযুক্তির বিকাশ",
          "ই-লার্নিং, ই-গভর্ন্যান্স ও ই-সার্ভিসেস ইন বাংলাদেশ",
          "ডিজিটাল বাংলাদেশ, স্মার্ট নাগরিক ও কর্মসংস্থান"
        ]
      },
      {
        "name": "অধ্যায় ২: কম্পিউটার ও কম্পিউটার ব্যবহারকারীর নিরাপত্তা",
        "topics": [
          "সফটওয়্যার ইনস্টল, আনইনস্টল ও ট্রাবলশুটিং",
          "কম্পিউটার ভাইরাস ও ম্যালওয়্যার প্রতিরোধ",
          "পাসওয়ার্ড নিরাপত্তা, পাইরেসি ও সাইবার অপরাধ"
        ]
      },
      {
        "name": "অধ্যায় ৩: আমার শিক্ষায় ইন্টারনেট",
        "topics": [
          "ডিজিটাল কন্টেন্টের প্রকারভেদ ও ব্যবহার",
          "ই-বুক ও ইন্টারনেটে শিক্ষা সম্পর্কিত তথ্যানুসন্ধান",
          "তথ্য অধিকার আইন ও অনলাইন শিক্ষা পোর্টাল"
        ]
      },
      {
        "name": "অধ্যায় ৪: আমার লেখালেখি ও হিসাব",
        "topics": [
          "ওয়ার্ড প্রসেসরে সম্পাদনা, প্যারাগ্রাফ ও ফন্ট ফরম্যাটিং",
          "স্প্রেডশিটের ধারণা এবং সূত্র ও ফাংশন (SUM, AVERAGE, IF)",
          "স্প্রেডশিটে হিসাব-নিকাশ ও ফলাফল তৈরি"
        ]
      },
      {
        "name": "অধ্যায় ৫: মাল্টিমিডিয়া ও গ্রাফিক্স",
        "topics": [
          "মাল্টিমিডিয়ার মাধ্যমসমূহ (টেক্সট, গ্রাফিক্স, অডিও, ভিডিও)",
          "পাওয়ারপয়েন্ট প্রেজেন্টেশন স্লাইড তৈরি ও ট্রানজিশন",
          "ফটোশপে ছবি সম্পাদনা ও সিলেকশন টুলসের ব্যবহার"
        ]
      },
      {
        "name": "অধ্যায় ৬: ডেটাবেজ-এর ব্যবহার",
        "topics": [
          "ডেটাবেজ ও আরডিবিএমএস (RDBMS) মৌলিক ধারণা",
          "ডেটাবেজ টেবিল তৈরি, ফিল্ড ডেটা টাইপ ও কুয়েরি (Query)",
          "ফর্ম তৈরি ও রিপোর্ট প্রিন্ট করার নিয়মাবলী"
        ]
      }
    ]
  },
  {
    "name": "Bangladesh & Global Studies",
    "nameBn": "বাংলাদেশ ও বিশ্বপরিচয়",
    "slug": "ssc-bgs",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "science",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১ ও ২: ইতিহাস ও মুক্তিযুদ্ধ",
        "topics": [
          "পূর্ব বাংলার আন্দোলন ও জাতীয়তাবাদের উত্থান (১৯৪৭-১৯৭০)",
          "১৯৭১ সালের মহান মুক্তিযুদ্ধ ও স্বাধীন বাংলাদেশ"
        ]
      },
      {
        "name": "অধ্যায় ৩ ও ৪: ভূগোল ও পরিবেশ",
        "topics": [
          "সৌরজগৎ ও ভূমণ্ডল",
          "বাংলাদেশের ভূপ্রকৃতি ও জলবায়ু"
        ]
      },
      {
        "name": "অধ্যায় ৬ ও ৭: রাষ্ট্র, আইন ও সরকার",
        "topics": [
          "রাষ্ট্র, নাগরিকতা ও আইন",
          "বাংলাদেশ সরকারের অঙ্গসমূহ ও প্রশাসন ব্যবস্থা"
        ]
      },
      {
        "name": "অধ্যায় ৯ ও ১৬: অর্থনীতি ও সামাজিক সমস্যা",
        "topics": [
          "বাংলাদেশের অর্থনৈতিক ব্যবস্থা ও জাতীয় সম্পদ",
          "বাংলাদেশের সামাজিক সমস্যা ও এর প্রতিকার"
        ]
      }
    ]
  },
  {
    "name": "General Science",
    "nameBn": "সাধারণ বিজ্ঞান",
    "slug": "ssc-general-science",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "business_studies",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১ ও ২: পুষ্টি ও পানি",
        "topics": [
          "উন্নততর জীবনধারা (খাদ্য, পুষ্টি ও ভিটামিন)",
          "জীবনের জন্য পানি ও পানির বিশুদ্ধকরণ"
        ]
      },
      {
        "name": "অধ্যায় ৩ ও ৪: স্বাস্থ্য ও বিকাশ",
        "topics": [
          "হৃদযন্ত্রের যত কথা (রক্তচাপ, হৃদরোগ ও প্রতিকার)",
          "নবজীবনের সূচনা (বয়ঃসন্ধিকাল ও স্বাস্থ্য)"
        ]
      },
      {
        "name": "অধ্যায় ৫ ও ৬: পদার্থ ও আলো",
        "topics": [
          "দেখতে হলে আলোচাই (চোখের যত্ন ও লেন্স)",
          "পলিমার ও প্লাস্টিক পণ্যের পরিবেশগত প্রভাব"
        ]
      },
      {
        "name": "অধ্যায় ৭ ও ৯: সম্পদ ও দুর্যোগ",
        "topics": [
          "অম্ল, ক্ষারক ও লবণের দৈনন্দিন ব্যবহার",
          "আমাদের প্রাকৃতিক সম্পদ ও দুর্যোগের সাথে বসবাস"
        ]
      }
    ]
  },
  {
    "name": "Physics",
    "nameBn": "পদার্থবিজ্ঞান",
    "slug": "ssc-physics",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১: ভৌত রাশি ও পরিমাপ",
        "topics": [
          "পদার্থবিজ্ঞানের ক্রমবিকাশ ও পরিসর",
          "মৌলিক ও লব্ধ রাশি, একক ও মাত্রা",
          "পরিমাপের যন্ত্রপাতি: ভার্নিয়ার ক্যালি釐ার্স ও স্ক্রু গজ"
        ]
      },
      {
        "name": "অধ্যায় ২: গতি (Motion)",
        "topics": [
          "গতির প্রকারভেদ: চলন, ঘূর্ণন, পর্যাবৃত্ত ও স্পন্দন গতি",
          "দূরত্ব, সরণ, দ্রুতি, বেগ ও ত্বরণ",
          "গতির সমীকরণসমূহ প্রমাণ ও গ্রাফিক্যাল বিশ্লেষণ",
          "পরন্ত বস্তুর সূত্রাবলী (Galileo's Laws)"
        ]
      },
      {
        "name": "অধ্যায় ৩: বল (Force)",
        "topics": [
          "জড়তা ও নিউটনের ১ম গতিসূত্র",
          "ভরবেগ ও নিউটনের ২য় গতিসূত্র (F = ma)",
          "নিউটনের ৩য় গতিসূত্র ও ক্রিয়া-প্রতিক্রিয়া",
          "ভরবেগের সংরক্ষণ সূত্র ও শক্তির রূপান্তর",
          "ঘর্ষণ বলের প্রকারভেদ ও প্রভাব"
        ]
      },
      {
        "name": "অধ্যায় ৪: কাজ, ক্ষমতা ও শক্তি",
        "topics": [
          "কাজের সংজ্ঞা, ধনাত্মক ও ঋণাত্মক কাজ",
          "গতিশক্তি (Ek = 1/2 mv²) ও বিভবশক্তি (Ep = mgh)",
          "শক্তির সংরক্ষণশীলতা নীতি ও রূপান্তর",
          "ক্ষমতা ও কর্মদক্ষতা (Efficiency) গাণিতিক হিসাব"
        ]
      },
      {
        "name": "অধ্যায় ৫: পদার্থের অবস্থা ও চাপ",
        "topics": [
          "চাপ ও ঘনত্ব (P = hρg)",
          "প্যাসকেলের সূত্র ও হাইড্রোলিক প্রেস",
          "আর্কিমিডিসের নীতি ও বস্তুর প্লবতা",
          "হুকের সূত্র ও পদার্থের স্থিতিস্থাপকতা"
        ]
      },
      {
        "name": "অধ্যায় ৬: বস্তুর ওপর তাপের প্রভাব",
        "topics": [
          "তাপ ও তাপমাত্রা, বিভিন্ন স্কেলের সম্পর্ক",
          "পদার্থের তাপীয় প্রসারণ (দৈর্ঘ্য, ক্ষেত্র ও আয়তন)",
          "আপেক্ষিক তাপ ও ক্যালরিমেত্রির মূলনীতি"
        ]
      },
      {
        "name": "অধ্যায় ৭: তরঙ্গ ও শব্দ",
        "topics": [
          "সরল স্পন্দন গতি ও তরঙ্গের বৈশিষ্ট্য",
          "শব্দ তরঙ্গ, প্রতিধ্বনি ও শব্দের বেগ",
          "শ্রুতিগম্যতার সীমা ও শব্দের ব্যবহার"
        ]
      },
      {
        "name": "অধ্যায় ৮: আলোর প্রতিফলন",
        "topics": [
          "আলোর প্রতিফলনের সূত্র ও দর্পণ",
          "সমতল ও গোলীয় দর্পণে প্রতিবিম্ব গঠন",
          "দর্পণের সমীকরণ ও বিবর্ধন (Magnification)"
        ]
      },
      {
        "name": "অধ্যায় ৯: আলোর প্রতিসরণ",
        "topics": [
          "প্রতিসরণের সূত্রাবলী ও স্নেলের সূত্র",
          "ক্রান্তি কোণ ও পূর্ণ অভ্যন্তরীণ প্রতিফলন",
          "লেন্স দ্বারা প্রতিবিম্ব গঠন ও চোখের ত্রুটি"
        ]
      },
      {
        "name": "অধ্যায় ১০ ও ১১: স্থির ও চল বিদ্যুৎ",
        "topics": [
          "কুলম্বের সূত্র ও তড়িৎ তীব্রতা",
          "ওহমের সূত্র ও তুল্যরোধ (শ্রেণি ও সমান্তরাল)",
          "তড়িৎ ক্ষমতা ও বাড়ির বিদ্যুৎ সংযোগের নিরাপত্তা"
        ]
      }
    ]
  },
  {
    "name": "Chemistry",
    "nameBn": "রসায়ন",
    "slug": "ssc-chemistry",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১ ও ২: রসায়নের ধারণা ও পদার্থের অবস্থা",
        "topics": [
          "রসায়নের পরিধি ও গবেষণাগারের নিরাপত্তা প্রতীক",
          "পদার্থের কণার গতিতত্ত্ব ও ব্যাপন-নিঃসরণ",
          "গলন, স্ফুটন ও পাতন প্রক্রিয়া"
        ]
      },
      {
        "name": "অধ্যায় ৩: পদার্থের গঠন",
        "topics": [
          "পরমাণুর মৌলিক কণিকাসমূহ ও পারমাণবিক সংখ্যা",
          "রাদারফোর্ড ও বোর পরমাণু মডেল",
          "আইসোটোপ ও ইলেকট্রন বিন্যাসের নিয়ম (Aufbau Rule)"
        ]
      },
      {
        "name": "অধ্যায় ৪: পর্যায় সারণি",
        "topics": [
          "পর্যায় সারণির মূল ভিত্তি ও মৌলসমূহের অবস্থান",
          "পর্যায়বৃত্ত ধর্ম: পরমাণুর আকার ও আয়নীকরণ শক্তি",
          "তড়িৎ ঋণাত্মকতা ও ইলেকট্রন আসক্তি"
        ]
      },
      {
        "name": "অধ্যায় ৫: রাসায়নিক বন্ধন",
        "topics": [
          "যোজ্যতা ইলেকট্রন ও রাসায়নিক নিষ্ক্রিয়তা",
          "আয়নিক বন্ধন ও সমযোজী বন্ধন গঠন প্রক্রিয়া",
          "ধাতব বন্ধন ও যৌগের বিদ্যুৎ পরিবাহিতা"
        ]
      },
      {
        "name": "অধ্যায় ৬: মোলের ধারণা ও রাসায়নিক গণনা",
        "topics": [
          "মোল ও অ্যাভোগাড্রো সংখ্যা",
          "মোলার আয়তন ও গ্যাসের সূত্রাবলি",
          "যৌগে মৌলের শতকরা সংযুতি ও স্থূল সংকেত",
          "স্টয়কিওমিতি ও লিমিটিং বিক্রিয়ক"
        ]
      },
      {
        "name": "অধ্যায় ৭: রাসায়নিক বিক্রিয়া",
        "topics": [
          "বিক্রিয়ার শ্রেণিবিভাগ ও তাপের পরিবর্তন",
          "জারণ-বিজারণ (Redox) বিক্রিয়া ও ইলেকট্রন স্থানান্তর",
          "লা-শাতেলিয়ার নীতি ও বিক্রিয়ার সাম্যাবস্থা"
        ]
      },
      {
        "name": "অধ্যায় ৮ ও ৯: রসায়ন-শক্তি ও এসিড-ক্ষার",
        "topics": [
          "তড়িৎ বিশ্লেষ্য ও গ্যালভানিক কোষ",
          "এসিড ও ক্ষারকের বৈশিষ্ট্য এবং pH স্কেল"
        ]
      },
      {
        "name": "অধ্যায় ১১: খনিজ সম্পদ — জীবাশ্ম (Organic Chemistry)",
        "topics": [
          "হাইড্রোকার্বনের শ্রেণিবিভাগ ও জৈব যৌগ",
          "অ্যালকেন, অ্যালকিন ও অ্যালকাইন প্রস্তুতি ও ধর্ম",
          "অ্যালকোহল, অ্যালডিহাইড ও ফ্যাটি এসিড",
          "পলিমারকরণ বিক্রিয়া ও প্লাস্টিকের ব্যবহার"
        ]
      }
    ]
  },
  {
    "name": "Biology",
    "nameBn": "জীববিজ্ঞান",
    "slug": "ssc-biology",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১ ও ২: জীবন পাঠ ও কোষ-টিস্যু",
        "topics": [
          "জীববিজ্ঞানের শাখা ও দ্বিপদ নামকরণ পদ্ধতি",
          "উদ্ভিদ ও প্রাণিকোষের সাইটোপ্লাজমীয় অঙ্গাণু",
          "উদ্ভিদ ও প্রাণি টিস্যুর শ্রেণিবিভাগ ও কার্যাবলি"
        ]
      },
      {
        "name": "অধ্যায় ৩ ও ৪: কোষ বিভাজন ও জীবনীশক্তি",
        "topics": [
          "মাইটোসিস কোষ বিভাজনের পর্যায়সমূহ",
          "মিয়োসিসের তাৎপর্য ও গুরুত্ব",
          "সালোকসংশ্লেষণ প্রক্রিয়া (আলোক ও অন্ধকার পর্যায়)",
          "সবাত ও অবাত শ্বসনের ধাপসমূহ"
        ]
      },
      {
        "name": "অধ্যায় ৫ ও ৬: পরিপাক ও পরিবহন",
        "topics": [
          "মানবদেহের পরিপাকতন্ত্র ও খাদ্য উপাদান",
          "উদ্ভিদে পানি ও খনিজ লবণ পরিবহন এবং প্রস্বেদন",
          "রক্ত সংবহনতন্ত্র, রক্তের গ্রুপ ও মানব হৃৎপিণ্ড"
        ]
      },
      {
        "name": "অধ্যায় ৮ ও ১১: রেচন ও প্রজনন",
        "topics": [
          "বৃক্ক ও নেফ্রনের গঠন এবং রেচন প্রক্রিয়া",
          "উদ্ভিদের পরাগায়ন, নিষেক ও মানব প্রজনন"
        ]
      },
      {
        "name": "অধ্যায় ১২ ও ১৪: বংশগতি ও জীবপ্রযুক্তি",
        "topics": [
          "ডিএনএ অনুলিপন ও মেন্ডেলের বংশগতির সূত্র",
          "টিস্যু কালচার ও রিকম্বিন্যান্ট ডিএনএ প্রযুক্তি"
        ]
      }
    ]
  },
  {
    "name": "Higher Mathematics",
    "nameBn": "উচ্চতর গণিত",
    "slug": "ssc-higher-math",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "science",
    "subjectType": "optional",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "বীজগণিত অংশ (Algebra)",
        "topics": [
          "সেট ও ফাংশন (অন-টু ফাংশন, বিপরীত ফাংশন)",
          "বীজগাণিতিক রাশি ও চক্রক্রমিক রাশির উৎপাদক",
          "দ্বিপদী বিস্তার ও প্যাসকেলের ত্রিভুজ সূত্র",
          "অসীম ধারা ও অসীমতক সমষ্টি"
        ]
      },
      {
        "name": "জ্যামিতি ও ভেক্টর অংশ (Geometry & Vector)",
        "topics": [
          "অ্যাপোলোনিয়াসের উপপাদ্য ও টলেমির উপপাদ্য",
          "জ্যামিতিক অঙ্কন ও সম্পাদ্য",
          "সমতলীয় ভেক্টর: যোগ, বিয়োগ ও অবস্থান ভেক্টর"
        ]
      },
      {
        "name": "স্থানাঙ্ক জ্যামিতি ও ত্রিকোণমিতি",
        "topics": [
          "কার্তেসীয় স্থানাঙ্ক ও দূরত্ব নির্ণয়",
          "রেখার ঢাল ও সরলরেখার সমীকরণ",
          "কোণের রেডিয়ান পরিমাপ ও ত্রিকোণমিতিক সমীকরণ"
        ]
      },
      {
        "name": "সম্ভাবনা (Probability)",
        "topics": [
          "সম্ভাবনার মৌলিক ধারণা ও নিশ্চিত-অসম্ভব ঘটনা",
          "Probability Tree ও বাস্তব সমস্যার সমাধান"
        ]
      }
    ]
  },
  {
    "name": "Accounting",
    "nameBn": "হিসাববিজ্ঞান",
    "slug": "ssc-accounting",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "business_studies",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১ ও ২: হিসাববিজ্ঞান পরিচিতি ও লেনদেন",
        "topics": [
          "হিসাববিজ্ঞানের ধারণা, উদ্দেশ্য ও প্রয়োজনীয়তা",
          "লেনদেনের প্রকৃতি ও হিসাব সমীকরণ (A = L + E)"
        ]
      },
      {
        "name": "অধ্যায় ৩ ও ৪: দুতরফা দাখিলা ও মূলধন-মুনাফা",
        "topics": [
          "দুতরফা দাখিলা পদ্ধতির মূলনীতি ও ডেবিট-ক্রেডিট নির্ণয়",
          "মূলধনজাতীয় ও মুনাফাজাতীয় আয়-ব্যয় চিহ্নিতকরণ"
        ]
      },
      {
        "name": "অধ্যায় ৬, ৭ ও ৮: জাবেদা, খতিয়ান ও নগদান বই",
        "topics": [
          "জাবেদার প্রকারভেদ ও বিশেষ জাবেদা",
          "খতিয়ান প্রস্তুতকরণ ও টি-ছক/চলমান জের ছক",
          "একঘরা, দুঘরা ও তিনঘরা নগদান বই"
        ]
      },
      {
        "name": "অধ্যায় ৯ ও ১০: রেওয়ামিল ও আর্থিক বিবরণী",
        "topics": [
          "রেওয়ামিল প্রস্তুত ও ভুল সংশোধনী দাখিলা",
          "বিশদ আয় বিবরণী ও মালিকানাস্বত্ব বিবরণী",
          "আর্থিক অবস্থার বিবরণী ও উদ্বৃত্তপত্র"
        ]
      }
    ]
  },
  {
    "name": "Finance & Banking",
    "nameBn": "ফিন্যান্স ও ব্যাংকিং",
    "slug": "ssc-finance-banking",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "business_studies",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ফিন্যান্স অংশ (Finance Section)",
        "topics": [
          "অর্থায়ন ও ব্যবসায় অর্থায়নের স্বরূপ ও নীতি",
          "অর্থের সময়মূল্য (Time Value of Money Formulas)",
          "ঝুঁকি ও অনিশ্চয়তা পরিমাপ ও আদর্শ বিচ্যুতি",
          "মূলধনী আয়-ব্যয় প্রাক্কলন (Payback Period Method)"
        ]
      },
      {
        "name": "ব্যাংকিং অংশ (Banking Section)",
        "topics": [
          "ব্যাংক ব্যবস্থার প্রাথমিক ধারণা ও ইতিহাস",
          "কেন্দ্রীয় ব্যাংক ও বাণিজ্যিক ব্যাংকের কার্যাবলি",
          "ব্যাংক হিসাবের প্রকারভেদ ও ইলেকট্রনিক ব্যাংকিং"
        ]
      }
    ]
  },
  {
    "name": "Business Entrepreneurship",
    "nameBn": "ব্যবসায় উদ্যোগ",
    "slug": "ssc-business-entrepreneurship",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "business_studies",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ব্যবসায় ও উদ্যোক্তার ধারণা",
        "topics": [
          "ব্যবসায় পরিচিতি ও ব্যবসায়ের পরিবেশ",
          "আত্মকর্মসংস্থান ও ব্যবসায় উদ্যোগের গুণাবলি",
          "ব্যবসায় পরিকল্পনা প্রণয়ন ও প্রকল্প নির্বাচন"
        ]
      },
      {
        "name": "ব্যবসায়ের পরিচালনা ও ব্যবস্থাপনা",
        "topics": [
          "মালিকানার ভিত্তিতে ব্যবসায় (একমালিকানা ও অংশীদারি)",
          "যৌথ মূলধনী কোম্পানি ও সমবায় সমিতি",
          "ব্যবসায়ের আইনগত দিক (ট্রেড লাইসেন্স, পেটেন্ট, কপিরাইট)",
          "বিপণন ও বাজারজাতকরণের কার্যাবলি"
        ]
      }
    ]
  },
  {
    "name": "History of Bangladesh & World Civilization",
    "nameBn": "বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা",
    "slug": "ssc-history",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "humanities",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ইতিহাস ও প্রাচীন বিশ্বসভ্যতা",
        "topics": [
          "ইতিহাসের ধারণা ও ঐতিহাসিক উৎসের প্রকারভেদ",
          "বিশ্বসভ্যতা: মিশরীয়, সিন্ধু, গ্রিক ও রোমান সভ্যতা",
          "প্রাচীন বাংলার জনপদ ও রাজনৈতিক ইতিহাস"
        ]
      },
      {
        "name": "স্বাধীন বাংলাদেশ ও মুক্তি সংগ্রাম",
        "topics": [
          "ব্রিটিশবিরোধী আন্দোলন ও বঙ্গভঙ্গ",
          "ভাষা আন্দোলন ও বাঙালি জাতীয়তাবাদের বিকাশ",
          "ঐতিহাসিক ছয় দফা, ঊনসত্তরের গণঅভ্যুত্থান ও ৭০-এর নির্বাচন",
          "১৯৭১ সালের মহান মুক্তিযুদ্ধ ও স্বাধীন বাংলাদেশের অভ্যুদয়"
        ]
      }
    ]
  },
  {
    "name": "Geography & Environment",
    "nameBn": "ভূগোল ও পরিবেশ",
    "slug": "ssc-geography",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "humanities",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "প্রাকৃতিক ভূগোল ও ভূমণ্ডল",
        "topics": [
          "মহাবিশ্ব ও আমাদের সৌরজগৎ",
          "মানচিত্রের প্রকারভেদ ও স্কেল ব্যবহার",
          "পৃথিবীর অভ্যন্তরীণ গঠন ও ভূত্বকের পরিবর্তন",
          "বায়ুমণ্ডলের স্তরবিন্যাস ও জলবায়ু"
        ]
      },
      {
        "name": "বাংলাদেশ ভূগোল ও পরিবেশ ব্যবস্থাপনা",
        "topics": [
          "বাংলাদেশের ভৌগোলিক অবস্থান ও নদ-নদী",
          "প্রাকৃতিক দুর্যোগ (ঘূর্ণিঝড়, বন্যা, খরা) ও ব্যবস্থাপনা",
          "পরিবেশ দূষণ ও টেকসই উন্নয়নের গুরুত্ব"
        ]
      }
    ]
  },
  {
    "name": "Civics & Citizenship",
    "nameBn": "পৌরনীতি ও নাগরিকতা",
    "slug": "ssc-civics",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "humanities",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "নাগরিক ও রাষ্ট্র ব্যবস্থা",
        "topics": [
          "পৌরনীতি ও নাগরিকতার মৌলিক ধারণা",
          "নাগরিকের অধিকার ও দায়িত্ব-কর্তব্য",
          "আইন, স্বাধীনতা ও সাম্যের পারস্পরিক সম্পর্ক",
          "রাষ্ট্রের উপাদান ও সরকার ব্যবস্থার রূপরেখা"
        ]
      },
      {
        "name": "বাংলাদেশের সরকার ও প্রশাসন",
        "topics": [
          "বাংলাদেশের সংবিধান ও এর মূল বৈশিষ্ট্যসমূহ",
          "আইন বিভাগ, শাসন বিভাগ ও বিচার বিভাগ",
          "স্থানীয় সরকার কাঠামো (ইউপি, পৌরসভা, সিটি কর্পোরেশন)",
          "বাংলাদেশের নির্বাচনী ব্যবস্থা ও গণতান্ত্রিক চর্চা"
        ]
      }
    ]
  },
  {
    "name": "Economics",
    "nameBn": "অর্থনীতি",
    "slug": "ssc-economics",
    "board": "general",
    "classLevel": "ssc",
    "streamGroup": "humanities",
    "subjectType": "optional",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "মৌলিক অর্থনীতি ও বাজার",
        "topics": [
          "অর্থনীতির সংজ্ঞা ও মৌলিক অর্থনৈতিক সমস্যা",
          "সম্পদ, উপযোগ ও সুযোগ ব্যয়",
          "চাহিদা, জোগান ও ভারসাম্য দাম নির্ধারণ",
          "উৎপাদনের উপকরণসমূহ (ভূমি, শ্রম, মূলধন, সংগঠন)"
        ]
      },
      {
        "name": "জাতীয় আয় ও সরকারি অর্থব্যবস্থা",
        "topics": [
          "মোট দেশজ উৎপাদন (GDP) ও জাতীয় আয় (GNI)",
          "মুদ্রা, ব্যাংকিং ও বাংলাদেশ ব্যাংকের ভূমিকা",
          "সরকারি আয় ও ব্যয়ের খাত এবং জাতীয় বাজেট"
        ]
      }
    ]
  },
  {
    "name": "HSC Bangla 1st Paper",
    "nameBn": "বাংলা ১ম পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-bangla-1",
    "board": "general",
    "classLevel": "hsc",
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
    "name": "HSC Bangla 2nd Paper",
    "nameBn": "বাংলা ২য় পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-bangla-2",
    "board": "general",
    "classLevel": "hsc",
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
    "name": "HSC English 1st Paper",
    "nameBn": "ইংরেজি ১ম পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-english-1",
    "board": "general",
    "classLevel": "hsc",
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
    "name": "HSC English 2nd Paper",
    "nameBn": "ইংরেজি ২য় পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-english-2",
    "board": "general",
    "classLevel": "hsc",
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
    "name": "HSC ICT",
    "nameBn": "তথ্য ও যোগাযোগ প্রযুক্তি (উচ্চ মাধ্যমিক)",
    "slug": "hsc-ict",
    "board": "general",
    "classLevel": "hsc",
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
          "ওয়েবসাইটের কাঠামো ও প্রকারভেদ (Static vs Dynamic)",
          "HTML ট্যাগ, ফরম্যাটিং, লিংক ও ইমেজ সংযোজন",
          "HTML টেবিল তৈরি ও ওয়েব পাবলিশিং"
        ]
      },
      {
        "name": "অধ্যায় ৫: প্রোগ্রামিং ভাষা (C Programming)",
        "topics": [
          "অ্যালগরিদম ও ফ্লোচার্ট অঙ্কন",
          "সি ভাষার ডেটা টাইপ, চলক ও ইনপুট-আউটপুট (scanf, printf)",
          "কন্ডিশনাল স্টেটমেন্ট (if-else, switch) ও লুপ (for, while)",
          "অ্যারে (Array) ও ফাংশনের ব্যবহার"
        ]
      },
      {
        "name": "অধ্যায় ৬: ডেটাবেজ ম্যানেজমেন্ট সিস্টেম (DBMS)",
        "topics": [
          "রিলেশনাল ডেটাবেজ (RDBMS) ও কি-ফিল্ড (Primary/Foreign Key)",
          "SQL কুয়েরি (SELECT, INSERT, UPDATE, DELETE)",
          "ডেটা সিকিউরিটি ও ব্যাকআপ"
        ]
      }
    ]
  },
  {
    "name": "HSC Physics 1st Paper",
    "nameBn": "পদার্থবিজ্ঞান ১ম পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-physics-1",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ২: ভেক্টর (Vectors)",
        "topics": [
          "ভেক্টরের যোগ, বিয়োগ ও সামান্তরিক সূত্র",
          "ভেক্টরের ডট ও ক্রস গুণন",
          "ভেক্টর ক্যালকুলাস: গ্র্যাডিয়েন্ট, ডাইভারজেন্স ও কার্ল"
        ]
      },
      {
        "name": "অধ্যায় ৩: গতিবিদ্যা (Dynamics)",
        "topics": [
          "দ্বিমাত্রিক গতি ও প্রক্ষেপক (Projectile Motion)",
          "বৃত্তীয় গতি ও কৌণিক বেগ-ত্বরণ"
        ]
      },
      {
        "name": "অধ্যায় ৪: নিউটনিয়ান বলবিদ্যা",
        "topics": [
          "জড়তার ভ্রামক ও চক্রগতির ব্যাসার্ধ",
          "কৌণিক ভরবেগ ও টর্ক",
          "ভরবেগের সংরক্ষণ সূত্র ও রকেটের গতি",
          "কেন্দ্রমুখী ও কেন্দ্রবিমুখী বল"
        ]
      },
      {
        "name": "অধ্যায় ৫: কাজ, শক্তি ও ক্ষমতা",
        "topics": [
          "পরিবর্তনশীল বল দ্বারা কাজ ও স্প্রিং বল",
          "সংরক্ষণশীল ও অসংরক্ষণশীল বল",
          "কর্মদক্ষতা ও ক্ষমতার গাণিতিক সমস্যা"
        ]
      },
      {
        "name": "অধ্যায় ৮ ও ১০: পর্যাবৃত্ত গতি ও আদর্শ গ্যাস",
        "topics": [
          "সরল ছন্দিত স্পন্দন ও সরল দোলক",
          "বয়েল, চার্লস ও অ্যাভোগাড্রোর সূত্র",
          "গ্যাসের গতিতত্ত্ব ও স্বাধীনতার মাত্রা",
          "আপেক্ষিক আর্দ্রতা ও শিশিরাংক নির্ণয়"
        ]
      }
    ]
  },
  {
    "name": "HSC Physics 2nd Paper",
    "nameBn": "পদার্থবিজ্ঞান ২য় পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-physics-2",
    "board": "general",
    "classLevel": "hsc",
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
          "গাউসের সূত্র ও ধারকত্ব (Capacitance)",
          "কার্শফের সূত্রাবলী ও হুইটস্টোন ব্রিজ নীতি",
          "পটেনশিওমিটার ও মিটার ব্রিজ"
        ]
      },
      {
        "name": "অধ্যায় ৭ ও ৮: আলোকবিজ্ঞান ও আধুনিক পদার্থবিজ্ঞান",
        "topics": [
          "হাইগেনসের নীতি ও আলোর ব্যতিচার (Interference)",
          "আইনস্টাইনের আপেক্ষিকতা তত্ত্ব (কাল দীর্ঘায়ন, দৈর্ঘ্য সংকোচন)",
          "ফটোইলেকট্রিক প্রভাব ও কম্পটন ক্রিয়া"
        ]
      },
      {
        "name": "অধ্যায় ৯ ও ১০: পরমাণু মডেল ও ইলেকট্রনিক্স",
        "topics": [
          "তেজস্ক্রিয় ক্ষয় সূত্র ও অর্ধায়ু",
          "সেমিকন্ডাক্টর ডায়োড ও রেকটিফায়ার",
          "ট্রানজিস্টর ও লজিক সার্কিট"
        ]
      }
    ]
  },
  {
    "name": "HSC Chemistry 1st Paper",
    "nameBn": "রসায়ন ১ম পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-chemistry-1",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ২: গুণগত রসায়ন",
        "topics": [
          "কোয়ান্টাম সংখ্যা ও অরবিটাল চিত্র",
          "আউফবাউ নীতি, পাউলির বর্জন নীতি ও হুন্ডের নীতি",
          "দ্রাব্যতা ও দ্রাব্যতা গুণফল (Ksp)",
          "আয়ন শনাক্তকরণ ও ক্রোমাটোগ্রাফি"
        ]
      },
      {
        "name": "অধ্যায় ৩: মৌলের পর্যায়বৃত্ত ধর্ম ও বন্ধন",
        "topics": [
          "s, p, d, f ব্লক মৌলের বৈশিষ্ট্য",
          "সংকরায়ন (sp, sp2, sp3, dsp2, sp3d2)",
          "হাইড্রোজেন বন্ধন ও ভ্যান্ডার ওয়ালস বল"
        ]
      },
      {
        "name": "অধ্যায় ৪: রাসায়নিক পরিবর্তন",
        "topics": [
          "লা-শাতেলিয়ার নীতি ও প্রভাবক",
          "ভরক্রিয়া সূত্র ও সাম্যধ্রুবক (Kp, Kc)",
          "বাফার দ্রবণ ও হেনডারসন সমীকরণ"
        ]
      }
    ]
  },
  {
    "name": "HSC Chemistry 2nd Paper",
    "nameBn": "রসায়ন ২য় পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-chemistry-2",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১: পরিবেশ রসায়ন",
        "topics": [
          "বয়েল, চার্লস ও ডাল্টনের আংশিক চাপ সূত্র",
          "গ্রাহামের ব্যাপন সূত্র ও ভ্যান্ডার ওয়ালস সমীকরণ",
          "গ্রিনহাউস গ্যাস ও এসিড বৃষ্টি"
        ]
      },
      {
        "name": "অধ্যায় ২: জৈব রসায়ন (Organic Chemistry)",
        "topics": [
          "জৈব যৌগের নামকরণ (IUPAC পদ্ধতি)",
          "সমাণুতা (গাঠনিক ও স্টেরিও সমাণুতা)",
          "বেনজিন ও অ্যারোমেটিক প্রতিস্থাপন বিক্রিয়া",
          "অ্যালকাইল হ্যালাইড ও SN1/SN2 বিক্রিয়া",
          "অ্যালডিহাইড, কিটোন ও কার্বক্সিলিক এসিড"
        ]
      },
      {
        "name": "অধ্যায় ৩ ও ৪: পরিমাণগত ও তড়িৎ রসায়ন",
        "topics": [
          "জারণ-বিজারণ সমতাকরণ পদ্ধতি",
          "অ্যাসিড-ক্ষার টাইট্রেশন ও মোলারিটি",
          "ফ্যারাডের সূত্র ও নার্নস্ট সমীকরণ"
        ]
      }
    ]
  },
  {
    "name": "HSC Higher Mathematics 1st Paper",
    "nameBn": "উচ্চতর গণিত ১ম পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-higher-math-1",
    "board": "general",
    "classLevel": "hsc",
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
    "name": "HSC Higher Mathematics 2nd Paper",
    "nameBn": "উচ্চতর গণিত ২য় পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-higher-math-2",
    "board": "general",
    "classLevel": "hsc",
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
    "name": "HSC Biology 1st Paper (Botany)",
    "nameBn": "জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)",
    "slug": "hsc-biology-1",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "science",
    "subjectType": "optional",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১ ও ২: কোষ ও কোষ বিভাজন",
        "topics": [
          "কোষ প্রাচীর, প্লাজমামেমব্রেন ও ফ্লুইড মোজাইক মডেল",
          "ডিএনএ এর ডাবল হেলিক্স গঠন ও অনুলিপন",
          "মিয়োসিস-১ এর প্রফেজ-১ উপপর্যায়সমূহ ও ক্রসিং ওভার"
        ]
      },
      {
        "name": "অধ্যায় ৪ ও ৭: অণুজীব ও আবৃতবীজী",
        "topics": [
          "ভাইরাস (টি-২ ফায) ও ব্যাকটেরিয়ার গঠন",
          "মালভেসি ও পোয়েসি গোত্রের শনাক্তকারী বৈশিষ্ট্য"
        ]
      },
      {
        "name": "অধ্যায় ৮ ও ৯: টিস্যুতন্ত্র ও শারীরতত্ত্ব",
        "topics": [
          "ভাস্কুলার বান্ডলের প্রকারভেদ ও পাতার অন্তর্গঠন",
          "প্রস্বেদনের প্রকারভেদ ও পত্ররন্ধ্র খোলা-বন্ধের কৌশল",
          "C3 ও C4 চক্র এবং ক্র্যাবস চক্র"
        ]
      },
      {
        "name": "অধ্যায় ১১: জীবপ্রযুক্তি",
        "topics": [
          "টিস্যু কালচার প্রযুক্তির ধাপসমূহ",
          "রিকম্বিন্যান্ট ডিএনএ প্রযুক্তি ও প্লাজমিড"
        ]
      }
    ]
  },
  {
    "name": "HSC Biology 2nd Paper (Zoology)",
    "nameBn": "জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান)",
    "slug": "hsc-biology-2",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "science",
    "subjectType": "optional",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অধ্যায় ১ ও ২: প্রাণীর বিভিন্নতা ও পরিচিতি",
        "topics": [
          "শ্রেণিবিন্যাসের ভিত্তি ও প্রধান পর্বসমূহ",
          "হাইড্রার গঠন ও নিডোসাইট কোষ",
          "ঘাসফড়িংয়ের মুখোপাঙ্গ ও রূপান্তর",
          "রুই মাছের রক্ত সংবহনতন্ত্র"
        ]
      },
      {
        "name": "অধ্যায় ৩ ও ৪: মানব শারীরতত্ত্ব (পরিপাক ও রক্ত)",
        "topics": [
          "পাকস্থলী ও ক্ষুদ্রান্ত্রে পরিপাক ক্রিয়া",
          "রক্ত জমাট বাঁধার কৌশল ও কার্ডিয়াক চক্র"
        ]
      },
      {
        "name": "অধ্যায় ৫ ও ১১: শ্বসন, রেচন ও জিনতত্ত্ব",
        "topics": [
          "ফুসফুসের গঠন ও গ্যাসীয় পরিবহন",
          "নেফ্রনের গঠন ও মূত্র সৃষ্টির কৌশল",
          "মেন্ডেলের সূত্র ও সেক্স লিংকড ডিসঅর্ডার"
        ]
      }
    ]
  },
  {
    "name": "HSC Accounting 1st Paper",
    "nameBn": "হিসাববিজ্ঞান ১ম পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-accounting-1",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "business_studies",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "হিসাব চক্র ও বইসমূহ",
        "topics": [
          "হিসাববিজ্ঞান নীতিমালা ও GAAP এর ধারণা",
          "হিসাবের বইসমূহ: বিশেষ জাবেদা ও বাট্টা",
          "ব্যাংক সমন্বয় বিবরণী (উভয় জের সংশোধন পদ্ধতি)",
          "রেওয়ামিল ও অনিশ্চিত হিসাব"
        ]
      },
      {
        "name": "কার্যপত্র ও আর্থিক বিবরণী",
        "topics": [
          "সমন্বয় দাখিলা ও কার্যপত্র (Worksheet)",
          "দৃশ্যমান ও অদৃশ্যমান সম্পত্তির অবচয় হিসাবরক্ষণ",
          "একতরফা দাখিলা পদ্ধতি ও প্রারম্ভিক মূলধন",
          "আর্থিক বিবরণী প্রস্তুতকরণ"
        ]
      }
    ]
  },
  {
    "name": "HSC Accounting 2nd Paper",
    "nameBn": "হিসাববিজ্ঞান ২য় পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-accounting-2",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "business_studies",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অংশীদারি ও কোম্পানি হিসাব",
        "topics": [
          "অংশীদারি ব্যবসায়ের লাভ-লোকসান বণ্টন হিসাব",
          "যৌথ মূলধনী কোম্পানির শেয়ার ইস্যু (সমহার, অধিহার, অবহার)",
          "যৌথ মূলধনী কোম্পানির আর্থিক বিবরণী"
        ]
      },
      {
        "name": "ব্যয় ও অনুপাত বিশ্লেষণ",
        "topics": [
          "অনুপাত বিশ্লেষণ (চলতি অনুপাত, তারল্য অনুপাত, দেনাদার আবর্তন)",
          "উৎপাদন ব্যয় বিবরণী ও টেন্ডার মূল্য নির্ধারণ",
          "মজুত পণ্যের হিসাবরক্ষণ (FIFO, LIFO, Weighted Average)"
        ]
      }
    ]
  },
  {
    "name": "HSC Business Organization & Management 1st Paper",
    "nameBn": "ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম পত্র",
    "slug": "hsc-business-org-1",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "business_studies",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ব্যবসায়ের রূপরেখা ও সংগঠন",
        "topics": [
          "ব্যবসায়ের ধারণা, আওতা ও আধুনিক ব্যবসায়",
          "একমালিকানা ও অংশীদারি ব্যবসায় চুক্তিপত্র",
          "যৌথ মূলধনী কোম্পানির গঠন ও স্মারকলিপি",
          "সমবায় সমিতি ও রাষ্ট্রীয় ব্যবসায়"
        ]
      },
      {
        "name": "ব্যবসায় পরিবেশ ও ই-কমার্স",
        "topics": [
          "ব্যবসায় পরিবেশের উপাদানসমূহ",
          "ব্যবসায়িক নৈতিকতা ও সামাজিক দায়বদ্ধতা",
          "ইলেকট্রনিক ব্যবসায় (ই-বিজনেস ও ই-কমার্স)"
        ]
      }
    ]
  },
  {
    "name": "HSC Business Organization & Management 2nd Paper",
    "nameBn": "ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র (ব্যবস্থাপনা)",
    "slug": "hsc-business-org-2",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "business_studies",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ব্যবস্থাপনার নীতিমালা ও পরিকল্পনা",
        "topics": [
          "হেনরি ফেয়লের ব্যবস্থাপনার ১৪টি নীতি",
          "পরিকল্পনা প্রণয়ন ও সিদ্ধান্ত গ্রহণ প্রক্রিয়া",
          "সংগঠন কাঠামো ও বিকেন্দ্রীকরণ"
        ]
      },
      {
        "name": "কর্মীসংস্থান ও নেতৃত্ব",
        "topics": [
          "কর্মী নির্বাচন ও প্রশিক্ষণ পদ্ধতি",
          "নেতৃত্বের প্রকারভেদ ও প্রেষণা তত্ত্ব (Maslow & Herzberg)",
          "যোগাযোগ ও নিয়ন্ত্রণ প্রক্রিয়া"
        ]
      }
    ]
  },
  {
    "name": "HSC Finance, Banking & Insurance 1st Paper",
    "nameBn": "ফিন্যান্স, ব্যাংকিং ও বিমা ১ম পত্র (ফিন্যান্স)",
    "slug": "hsc-finance-1",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "business_studies",
    "subjectType": "optional",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "অর্থায়ন নীতি ও মূল্যায়ন",
        "topics": [
          "আর্থিক বাজার ও আর্থিক ব্যবস্থাপকের ভূমিকা",
          "অর্থের সময়মূল্য: চক্রবৃদ্ধিকরণ ও বর্তমান মূল্য",
          "বন্ড মূল্যায়ন ও শেয়ার মূল্যায়ন সূত্রাবলী"
        ]
      },
      {
        "name": "মূলধন বাজেটিং ও ঝুঁকি",
        "topics": [
          "মূলধন বাজেটিং পদ্ধতি (NPV, IRR, Payback Period)",
          "ঝুঁকি ও মুনাফার হার এবং CAPM মডেল",
          "স্বল্পমেয়াদি ও দীর্ঘমেয়াদি অর্থায়ন"
        ]
      }
    ]
  },
  {
    "name": "HSC Finance, Banking & Insurance 2nd Paper",
    "nameBn": "ফিন্যান্স, ব্যাংকিং ও বিমা ২য় পত্র (ব্যাংকিং ও বিমা)",
    "slug": "hsc-finance-2",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "business_studies",
    "subjectType": "optional",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ব্যাংকিং ব্যবস্থা",
        "topics": [
          "বাণিজ্যিক ব্যাংকের ঋণ আমানত সৃষ্টি কৌশল",
          "কেন্দ্রীয় ব্যাংকের ঋণ নিয়ন্ত্রণ পদ্ধতি",
          "চেক, পে-অর্ডার ও ইলেকট্রনিক ফান্ড ট্রান্সফার"
        ]
      },
      {
        "name": "বিমা চুক্তি ও নীতিমালা",
        "topics": [
          "বিমা চুক্তির মূলনীতি ও বিমার শ্রেণিবিভাগ",
          "জীবন বিমা ও নৌ বিমার ক্ষতিপূরণ দাবি",
          "অগ্নি বিমা ও আধুনিক মাইক্রো-ইন্সুরেন্স"
        ]
      }
    ]
  },
  {
    "name": "HSC Economics 1st Paper",
    "nameBn": "অর্থনীতি ১ম পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-economics-1",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "humanities",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ভোক্তার আচরণ ও বাজার",
        "topics": [
          "মৌলিক অর্থনৈতিক সমস্যা ও বিভিন্ন অর্থনৈতিক ব্যবস্থা",
          "ক্রমহ্রাসমান প্রান্তিক উপযোগ বিধি ও চাহিদা রেখা",
          "চাহিদার স্থিতিস্থাপকতা ও জোগানের স্থিতিস্থাপকতা",
          "পূর্ণাঙ্গ ও অপূর্ণাঙ্গ প্রতিযোগিতামূলক বাজার"
        ]
      },
      {
        "name": "উৎপাদন ও সামগ্রিক অর্থনীতি",
        "topics": [
          "উৎপাদনের উপকরণ ও ক্রমহ্রাসমান প্রান্তিক উৎপাদন বিধি",
          "জাতীয় আয়ের পরিমাপ পদ্ধতিসমূহ",
          "অর্থের মূল্য ও ফিশারের সমীকরণ"
        ]
      }
    ]
  },
  {
    "name": "HSC Economics 2nd Paper",
    "nameBn": "অর্থনীতি ২য় পত্র (উচ্চ মাধ্যমিক)",
    "slug": "hsc-economics-2",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "humanities",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "বাংলাদেশের খাতওয়ারি অর্থনীতি",
        "topics": [
          "কৃষি খাতের ভূমিকা, শস্য বহুমুখীকরণ ও কৃষিঋণ",
          "শিল্প কাঠামো ও ক্ষুদ্র ও মাঝারি শিল্প (SME)",
          "জনসংখ্যা সমস্যা ও মানবসম্পদ উন্নয়ন"
        ]
      },
      {
        "name": "বাণিজ্য ও বাজেট",
        "topics": [
          "সরকারি বাজেট ও কর ব্যবস্থার কাঠামো",
          "রপ্তানি বহুমুখীকরণ ও রেমিট্যান্স প্রবাহ",
          "আন্তর্জাতিক বাণিজ্য বনাম অভ্যন্তরীণ বাণিজ্য"
        ]
      }
    ]
  },
  {
    "name": "HSC Civics & Good Governance 1st Paper",
    "nameBn": "পৌরনীতি ও সুশাসন ১ম পত্র",
    "slug": "hsc-civics-1",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "humanities",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "পৌরনীতি, সুশাসন ও মূল্যবোধ",
        "topics": [
          "সুশাসনের উপাদান ও প্রতিষ্ঠায় প্রতিবন্ধকতা",
          "আইন, স্বাধীনতা, সাম্য ও ন্যায়ের সম্পর্ক",
          "ই-গভর্ন্যান্স ও ডিজিটাল সুশাসন",
          "মূল্যবোধ, অধিকার ও কর্তব্য"
        ]
      },
      {
        "name": "সরকার ও রাজনৈতিক দল",
        "topics": [
          "সংসদীয় বনাম রাষ্ট্রপতিশাসিত সরকার ব্যবস্থা",
          "রাজনৈতিক দল ও জনমত গঠনের মাধ্যম",
          "চাপসৃষ্টিকারী গোষ্ঠী ও আমলাতন্ত্রের ভূমিকা"
        ]
      }
    ]
  },
  {
    "name": "HSC Civics & Good Governance 2nd Paper",
    "nameBn": "পৌরনীতি ও সুশাসন ২য় পত্র",
    "slug": "hsc-civics-2",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "humanities",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ব্রিটিশ ও পাকিস্তান পর্ব",
        "topics": [
          "১৯৩৫ সালের ভারত শাসন আইন ও লাহোর প্রস্তাব",
          "ভাষা আন্দোলন ও ১৯৫৪ সালের যুক্তফ্রন্ট নির্বাচন",
          "১৯৬৬ এর ছয় দফা ও ১৯৭১ এর মুক্তিযুদ্ধ"
        ]
      },
      {
        "name": "বাংলাদেশের সাংবিধানিক ব্যবস্থা",
        "topics": [
          "১৯৭২ সালের সংবিধান ও মৌলিক অধিকারসমূহ",
          "নির্বাহী বিভাগ, আইনসভা ও বিচার বিভাগের স্বাধীনতা",
          "নাগরিক সমস্যা: দুর্নীতি, পরিবেশ দূষণ ও সমাধান"
        ]
      }
    ]
  },
  {
    "name": "HSC Islamic History & Culture 1st Paper",
    "nameBn": "ইসলামের ইতিহাস ও সংস্কৃতি ১ম পত্র",
    "slug": "hsc-islamic-history-1",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "humanities",
    "subjectType": "optional",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "প্রাক-ইসলাম ও নবুওয়াত যুগ",
        "topics": [
          "আইয়ামে জাহেলিয়াত ও ইসলাম পূর্ব আরবের সমাজ",
          "হযরত মুহাম্মদ (সা.) এর হিজরত ও মদিনা সনদ",
          "বদর, ওহুদ ও খন্দকের যুদ্ধ এবং হুদায়বিয়ার সন্ধি"
        ]
      },
      {
        "name": "খুলাফায়ে রাশেদীন ও খিলাফত",
        "topics": [
          "হযরত আবু বকর (রা.) ও ভণ্ড নবীদের দমন",
          "হযরত ওমর (রা.) এর শাসন সংস্কার ও বিস্তার",
          "উমাইয়া খিলাফত ও স্পেনে মুসলিম সভ্যতার স্বর্ণযুগ"
        ]
      }
    ]
  },
  {
    "name": "HSC Islamic History & Culture 2nd Paper",
    "nameBn": "ইসলামের ইতিহাস ও সংস্কৃতি ২য় পত্র",
    "slug": "hsc-islamic-history-2",
    "board": "general",
    "classLevel": "hsc",
    "streamGroup": "humanities",
    "subjectType": "optional",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ভারতে মুসলিম শাসন",
        "topics": [
          "মুহাম্মদ বিন কাসিমের সিন্ধু বিজয় ও সুলতান মাহমুদ",
          "দিল্লি সালতানাত প্রতিষ্ঠা ও গিয়াসউদ্দিন বলবন",
          "আলাউদ্দিন খলজির মূল্য নিয়ন্ত্রণ ও শাসন"
        ]
      },
      {
        "name": "মুঘল সাম্রাজ্য ও বাংলা",
        "topics": [
          "বাবর ও পানিপথের যুদ্ধসমূহ",
          "সম্রাট আকবরের দ্বীন-ই-ইলাহি ও রাজস্ব সংস্কার",
          "বাংলার বারো ভূঁইয়া ও নবাব সিরাজউদ্দৌলার পলাশী ট্র্যাজেডি"
        ]
      }
    ]
  },
  {
    "name": "Quran Mazid & Tajweed",
    "nameBn": "কুরআন মাজিদ ও তাজভিদ (দাখিল)",
    "slug": "dakhil-quran-mazid",
    "board": "madrasah",
    "classLevel": "dakhil",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "হিফজ, তিলাওয়াত ও তাজভিদ অংশ",
        "topics": [
          "মাখরাজ ও সিফাত পরিচিতি",
          "নূন সাকিন ও তানভীনের নিয়মাবলী (ইযহার, ইদগাম, ইকলাব, ইখফা)",
          "মীম সাকিনের নিয়ম ও মাদ্দ-এর প্রকারভেদ",
          "ওয়াকফ ও রামযুল আওকাফের নিয়ম"
        ]
      },
      {
        "name": "কুরআনের নির্বাচিত সূরা ও আয়াতসমূহের অনুবাদ ও শিক্ষা",
        "topics": [
          "সূরা আল-বাক্বারাহর নির্বাচিত রুকূ'র তাফসির",
          "সূরা আল-হুজুরাত: সামাজিক শিষ্টাচার ও নৈতিক শিক্ষা",
          "সূরা লুকমান: পিতা-পুত্রের উপদেশ ও তাওহীদের শিক্ষা",
          "আয়াতুল কুরসী ও শেষ তিনটি সূরার ফযিলত"
        ]
      }
    ]
  },
  {
    "name": "Hadith Sharif",
    "nameBn": "হাদিস শরিফ (দাখিল)",
    "slug": "dakhil-hadith",
    "board": "madrasah",
    "classLevel": "dakhil",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "মুস্তালাহুল হাদিস ও পরিচিতি",
        "topics": [
          "হাদিস ও সুন্নাহর পরিচিতি ও সংকলনের ইতিহাস",
          "সিহাহ সিত্তাহ ও প্রধান হাদীস গ্রন্থসমূহ",
          "সহীহ, হাসান ও যয়ীফ হাদিসের পরিচয়"
        ]
      },
      {
        "name": "ঈমান, ইলম ও সালাত বিষয়ক হাদিস",
        "topics": [
          "কিতাবুল ঈমান — নিয়ত ও আমলের গুরুত্ব",
          "কিতাবুল ইলম — জ্ঞান অর্জনের গুরুত্ব",
          "কিতাবুস সালাত — নামাজের গুরুত্ব ও আদব"
        ]
      },
      {
        "name": "মুআমালাত ও চরিত্রগঠন বিষয়ক হাদিস",
        "topics": [
          "সততা ও আমানতদারী বিষয়ক হাদিস",
          "পিতামাতা ও প্রতিবেশীর অধিকার বিষয়ক হাদিস",
          "মানবসেবা ও ভ্রাতৃত্ববোধ বিষয়ক হাদিস"
        ]
      }
    ]
  },
  {
    "name": "Aqaid & Fiqh",
    "nameBn": "আকাইদ ও ফিকহ (দাখিল)",
    "slug": "dakhil-aqaid-fiqh",
    "board": "madrasah",
    "classLevel": "dakhil",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "আকাইদ অংশ (Islamic Creed)",
        "topics": [
          "তাওহীদ, রিসালাত ও আখিরাতের বিস্তারিত আলোচনা",
          "আসমাউল হুসনা ও আল্লাহর গুণাবলী",
          "ফেরেশতা ও আসমানী কিতাবসমূহের ওপর বিশ্বাস",
          "তাকদীর ও পুনরুত্থানের বিশ্বাস"
        ]
      },
      {
        "name": "ফিকহ অংশ: ইবাদত",
        "topics": [
          "তাহারাত ও নাপাকীর প্রকারভেদ",
          "অজু, গোসল ও তায়াম্মুমের ফরজ-সুন্নতসমূহ",
          "নামাজের ওয়াজিব ও সহু সেজদার নিয়ম",
          "জাকাত ও সাওম (রোজা)-এর শরয়ী বিধান"
        ]
      },
      {
        "name": "ফিকহ অংশ: মুআমালাত",
        "topics": [
          "হালাল উপার্জন ও সুদের অপকারিতা",
          "ব্যবসা-বাণিজ্যের ইসলামিক মূলনীতি"
        ]
      }
    ]
  },
  {
    "name": "Arabic 1st Paper (Al-Lughat)",
    "nameBn": "আরবি ১ম পত্র (আল-লুগাতুল আরাবিয়্যাহ)",
    "slug": "dakhil-arabic-1",
    "board": "madrasah",
    "classLevel": "dakhil",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "আন-নাসসুল মাদরুস (পাঠ্য গদ্যাংশ)",
        "topics": [
          "القرآن الكريم هداية للبشرية (কুরআন মানবজাতির হেদায়েত)",
          "حب الوطن من الإيمان (দেশপ্রেম ঈমানের অঙ্গ)",
          "بر الوالدين وحقوقهما (পিতামাতার আনুগত্য)",
          "الأخلاق الإسلامية الفاضلة (উত্তম ইসলামি চরিত্র)"
        ]
      },
      {
        "name": "রচনা ও প্রশ্নোত্তর (Arabic Writing)",
        "topics": [
          "আরবি অনুচ্ছেদ ও শূন্যস্থান পূরণ",
          "আরবি সংলাপ ও পত্রলিখন"
        ]
      }
    ]
  },
  {
    "name": "Arabic 2nd Paper (Qawaid)",
    "nameBn": "আরবি ২য় পত্র (কাওয়াইদুল লুগাহ ও ইনশা)",
    "slug": "dakhil-arabic-2",
    "board": "madrasah",
    "classLevel": "dakhil",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ইলমুন নাহু (Arabic Syntax)",
        "topics": [
          "কালেমার প্রকারভেদ (ইসম, ফেল, হরফ)",
          "মো'রাব ও মাবনীর প্রকারভেদ",
          "মারফুআত (ফায়েল, নায়েবে ফায়েল, মুবতাদা, খবর)",
          "মানসূবাত ও মাজরুরাতের নিয়মাবলী"
        ]
      },
      {
        "name": "ইলমুস সরফ (Morphology)",
        "topics": [
          "মীযান ও মুনশাইব: বাবের পরিচয়",
          "মাজী, মুযারে ও আমরের রূপান্তর (ছরফ)",
          "ছহীহ, মু'তাল, মাহমূজ ও মুযাফ"
        ]
      },
      {
        "name": "অনুবাদ ও অনুচ্ছেদ রচনা",
        "topics": [
          "বাংলা থেকে আরবি অনুবাদ",
          "আরবি থেকে বাংলা অনুবাদ"
        ]
      }
    ]
  },
  {
    "name": "Islamic History",
    "nameBn": "ইসলামের ইতিহাস (দাখিল)",
    "slug": "dakhil-islamic-history",
    "board": "madrasah",
    "classLevel": "dakhil",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "রাসূলুল্লাহ (সা.)-এর পবিত্র জীবনচরিত",
        "topics": [
          "প্রাক-ইসলামী আরবের রাজনৈতিক ও ধর্মীয় অবস্থা",
          "মাক্কী জীবন: নবুওয়াত লাভ ও ইসলাম প্রচার",
          "মাদানী জীবন: মদিনা রাষ্ট্র গঠন ও সনদ",
          "মক্কা বিজয় ও বিদায় হজ্বের ঐতিহাসিক ভাষণ"
        ]
      },
      {
        "name": "খুলাফায়ে রাশেদীন",
        "topics": [
          "হযরত আবু বকর সিদ্দীক (রা.)-এর খিলাফত",
          "হযরত উমর ইবনুল খাত্তাব (রা.)-এর যুগ",
          "হযরত উসমান (রা.) ও হযরত আলী (রা.)-এর খিলাফত"
        ]
      }
    ]
  },
  {
    "name": "Dakhil General Mathematics",
    "nameBn": "দাখিল সাধারণ গণিত",
    "slug": "dakhil-math",
    "board": "madrasah",
    "classLevel": "dakhil",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "পাটিগণিত ও বীজগণিত",
        "topics": [
          "বাস্তব সংখ্যা, সেট ও ফাংশন",
          "বীজগাণিতিক রাশি ও সমীকরণ",
          "সূচক, লগারিদম ও সসীম ধারা"
        ]
      },
      {
        "name": "জ্যামিতি, ত্রিকোণমিতি ও পরিসংখ্যান",
        "topics": [
          "ব্যবহারিক জ্যামিতি ও বৃত্তের উপপাদ্য",
          "ত্রিকোণমিতিক অনুপাত ও দূরত্ব-উচ্চতা",
          "পরিমিতি ও পরিসংখ্যান (গড়, মধ্যক, প্রচুরক)"
        ]
      }
    ]
  },
  {
    "name": "Dakhil ICT",
    "nameBn": "দাখিল তথ্য ও যোগাযোগ প্রযুক্তি",
    "slug": "dakhil-ict",
    "board": "madrasah",
    "classLevel": "dakhil",
    "streamGroup": "all",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "তথ্যপ্রযুক্তি ও কম্পিউটার সুরক্ষা",
        "topics": [
          "তথ্যপ্রযুক্তির বিকাশ ও ডিজিটাল বাংলাদেশ",
          "কম্পিউটার রক্ষণাবেক্ষণ ও সফটওয়্যার নিরাপত্তা",
          "আমার শিক্ষায় ইন্টারনেট ও ই-বুকের ব্যবহার"
        ]
      },
      {
        "name": "ব্যবহারিক অফিস অ্যাপ্লিকেশন ও ডেটাবেজ",
        "topics": [
          "ওয়ার্ড প্রসেসর ও স্প্রেডশিট অ্যানালাইসিস",
          "মাল্টিমিডিয়া প্রেজেন্টেশন ও গ্রাফিক্স",
          "ডেটাবেজ কুয়েরি ও রিপোর্ট তৈরি"
        ]
      }
    ]
  },
  {
    "name": "Dakhil Physics",
    "nameBn": "পদার্থবিজ্ঞান (দাখিল বিজ্ঞান)",
    "slug": "dakhil-physics",
    "board": "madrasah",
    "classLevel": "dakhil",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "গতি, বল ও শক্তি",
        "topics": [
          "ভৌত রাশি ও পরিমাপের যন্ত্রসমূহ",
          "গতির সমীকরণ ও নিউটনের গতিসূত্রসমূহ",
          "কাজ, ক্ষমতা ও শক্তির রূপান্তর"
        ]
      },
      {
        "name": "আলো ও বিদ্যুৎ",
        "topics": [
          "আলোর প্রতিফলন ও প্রতিসরণ",
          "চল বিদ্যুৎ, ওহমের সূত্র ও সার্কিট"
        ]
      }
    ]
  },
  {
    "name": "Dakhil Chemistry",
    "nameBn": "রসায়ন (দাখিল বিজ্ঞান)",
    "slug": "dakhil-chemistry",
    "board": "madrasah",
    "classLevel": "dakhil",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "পদার্থ ও পরমাণুর গঠন",
        "topics": [
          "পদার্থের অবস্থা ও কণার গতিতত্ত্ব",
          "পরমাণুর গঠন ও ইলেকট্রন বিন্যাস",
          "পর্যায় সারণির পর্যায়বৃত্ত ধর্ম"
        ]
      },
      {
        "name": "রাসায়নিক বিক্রিয়া ও জৈব রসায়ন",
        "topics": [
          "রাসায়নিক বন্ধন ও মোলের গণনা",
          "রাসায়নিক বিক্রিয়া ও জারণ-বিজারণ",
          "হাইড্রোকার্বন ও জীবাশ্ম জ্বালানি"
        ]
      }
    ]
  },
  {
    "name": "Dakhil General Science",
    "nameBn": "সাধারণ বিজ্ঞান (দাখিল সাধারণ)",
    "slug": "dakhil-general-science",
    "board": "madrasah",
    "classLevel": "dakhil",
    "streamGroup": "general_madrasah",
    "subjectType": "compulsory",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "স্বাস্থ্য, পরিবেশ ও প্রযুক্তি",
        "topics": [
          "উন্নততর জীবনধারা ও সুষম খাদ্য",
          "হৃদরোগ ও রক্তচাপ নিয়ন্ত্রণ",
          "আমাদের প্রাকৃতিক সম্পদ ও দুর্যোগ ব্যবস্থাপনা"
        ]
      }
    ]
  },
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
    "name": "Alim Balaghat & Mantiq",
    "nameBn": "বালাগাত ও মানতিক (আলিম)",
    "slug": "alim-balaghat-mantiq",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "all",
    "subjectType": "compulsory",
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
    "nameBn": "ইসলামের ইতিহাস (আলিম)",
    "slug": "alim-islamic-history",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "all",
    "subjectType": "compulsory",
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
    "nameBn": "পদার্থবিজ্ঞান ১ম পত্র (আলিম বিজ্ঞান)",
    "slug": "alim-physics-1",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "ভেক্টর ও গতিবিদ্যা",
        "topics": [
          "ভেক্টর রাশি ও সামান্তরিক সূত্র",
          "দ্বিমাত্রিক গতি ও নিউটনিয়ান বলবিদ্যা"
        ]
      },
      {
        "name": "কাজ, শক্তি ও গ্যাস",
        "topics": [
          "কাজ, শক্তি, ক্ষমতা ও সরল দোলক",
          "আদর্শ গ্যাস ও তাপমাত্রিক স্কেল"
        ]
      }
    ]
  },
  {
    "name": "Alim Physics 2nd Paper",
    "nameBn": "পদার্থবিজ্ঞান ২য় পত্র (আলিম বিজ্ঞান)",
    "slug": "alim-physics-2",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "তাপগতিবিদ্যা ও তড়িৎ",
        "topics": [
          "তাপগতিবিদ্যার ১ম ও ২য় সূত্র এবং কার্নো ইঞ্জিন",
          "স্থির তড়িৎ ও কুলম্বের সূত্র",
          "চল তড়িৎ ও কার্শফের সূত্রাবলী"
        ]
      },
      {
        "name": "আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স",
        "topics": [
          "আপেক্ষিকতার বিশেষ তত্ত্ব",
          "তেজস্ক্রিয়তা ও অর্ধায়ু",
          "সেমিকন্ডাক্টর ও ট্রানজিস্টর"
        ]
      }
    ]
  },
  {
    "name": "Alim Chemistry 1st Paper",
    "nameBn": "রসায়ন ১ম পত্র (আলিম বিজ্ঞান)",
    "slug": "alim-chemistry-1",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "গুণগত রসায়ন ও পর্যায়বৃত্ত ধর্ম",
        "topics": [
          "কোয়ান্টাম সংখ্যা ও ইলেকট্রন বিন্যাস",
          "পর্যায়বৃত্ত ধর্ম ও রাসায়নিক সংকরায়ন (Hybridization)"
        ]
      },
      {
        "name": "রাসায়নিক পরিবর্তন",
        "topics": [
          "ভরক্রিয়া সূত্র ও সাম্যাবস্থা (Kp, Kc)",
          "বাফার দ্রবণ ও pH গণনা"
        ]
      }
    ]
  },
  {
    "name": "Alim Chemistry 2nd Paper",
    "nameBn": "রসায়ন ২য় পত্র (আলিম বিজ্ঞান)",
    "slug": "alim-chemistry-2",
    "board": "madrasah",
    "classLevel": "alim",
    "streamGroup": "science",
    "subjectType": "group_elective",
    "structureType": "chapter",
    "chaptersOrModules": [
      {
        "name": "জৈব রসায়ন (Organic Chemistry)",
        "topics": [
          "জৈব যৌগের নামকরণ ও সমাণুতা",
          "অ্যালকেন, অ্যালকিন ও বেনজিনের বিক্রিয়া"
        ]
      },
      {
        "name": "পরিমাণগত ও তড়িৎ রসায়ন",
        "topics": [
          "টাইট্রেশন ও জারণ-বিজারণ সমতা",
          "তড়িৎ রাসায়নিক কোষ ও ফ্যারাডের সূত্র"
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
