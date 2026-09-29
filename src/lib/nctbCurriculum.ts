export interface NCTBTopicDef {
  name: string;
  notes?: string;
}

export interface NCTBChapterOrModuleDef {
  name: string;
  topics: (string | NCTBTopicDef)[];
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
    name: "Quran Mazid",
    nameBn: "কুরআন মাজিদ (২০১)",
    slug: "alim-quran-mazid",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [
      {
        name: "সূরা আল মায়েদাহ",
        topics: [
          {
            name: "আয়াত: ১-২",
            notes:
              "১. ما المراد بقوله تعالى \"شعائر الله\" و \"الشهر الحرام\"؟\n২. بين شأن نزول قوله تعالى \"يا أيها الذين آمنوا لا تحلوا شعائر الله الآية\"\n৩. ما معنى العقود؟ وما حكم الإيفاء بها؟\n৪. ما المراد بالبر والتقوى والإثم والعدوان في الآية؟\n৫. اشرح قوله تعالى \"ولا تعاونوا على الإثم والعدوان\"\n৬. من هم اليتامى في اصطلاح الشرع؟ لم أكد الله عز وجل في أداء حقوق اليتامى؟ بين-",
          },
          {
            name: "আয়াত: ৩",
            notes:
              "১. بين سبب نزول هذه الآية الكريمة-\n২. ما المراد بقوله تعالى \"اليوم أكملت لكم دينكم وأتممت عليكم نعمتي\"؟\n৩. متى يجوز أكل الميتة والحرام؟ وما معنى قوله تعالى \"غير متجانف لإثم\"؟\n৪. بين اختلاف العلماء في حكم أكل الميتة-\n৫. ما المراد بقوله تعالى \"وما أهل لغير الله به\"؟",
          },
          {
            name: "আয়াত: ৪-৫",
            notes: "১. ما هي شرائط الاصطياد بالجوارح والطيور؟",
          },
          {
            name: "আয়াত: ৬",
            notes:
              "১. اكتب شأن نزول الآية الكريمة المذكورة-\n২. ما معنى الوضوء والتيمم لغة وشرعا؟ وكم فرضا فيهما؟ بين مفصلا-\n৩. ما معنى الغسل لغة وشرعا؟ وكم فرضا فيه؟ بين بالوضاحة-\n৪. ما هو حكم التيمم للمريض والمسافر إذا وجد الماء؟",
          },
          {
            name: "আয়াত: ৮-১২",
            notes:
              "১. ما معنى قوله تعالى: قوامين لله شهداء بالقسط؟ بين-\n২. ما معنى التقوى والعدل؟\n৩. ما المراد بقوله تعالى: اذكروا نعمة الله عليكم؟\n৪. ما هو ميثاق بني اسرائيل الذي أخذ؟\n৫. من هم بنو اسرائيل؟ ولم جعل منهم اثنا عشر نقيبا؟",
          },
          {
            name: "আয়াত: ২০-২৬",
            notes: "১. الى اية واقعة اشيرت بهذه الايات بين بالاختصار-",
          },
          {
            name: "আয়াত: ৩৫-৩৯",
            notes:
              "১. ما المراد بقوله تعالى \"وابتغوا إليه الوسيلة\"؟\n২. اكتب شان نزول هذه الاية \"والسارق والسارقة فاقطعوا الايدي\"\n৩. ما معنى السرقة اصطلاحا؟\n৪. ما هو المقدار في قطع اليد؟ وما التكرار في السرقة؟ وما الاختلاف فيه؟ بين",
          },
          {
            name: "আয়াত: ৫১-৫৭",
            notes:
              "১. بين سبب نزول هذه الايات الكريمة\n২. هل يجوز للمؤمنين ان يتخذوا المشركين اولياء؟ بين-\n৩. كم قسما للمصادقة مع الكفار؟\n৪. ما المراد بقوله تعالى: \"فعسى الله ان ياتي بالفتح او امر من عنده\"؟",
          },
          {
            name: "আয়াত: ৮৭-৮৯",
            notes:
              "১. بين شأن نزول هذه الآية الكريمة-\n২. اذكر معنى اليمين لغة وشرعا وما هي كفارته؟ ثم بين اقسامه مفصلا-\n৩. بين اقسام اليمين مع تعريفها واحكامها-\n৪. هل كفارة معتبرة قبل نقض اليمين؟\n৫. هل يشترط التتابع في صيام كفارة اليمين؟",
          },
          {
            name: "আয়াত: ৯০-৯২",
            notes:
              "১. اكتب شأن نزول الايات المذكورة-\n২. بين كيفية تحريم الخمر والميسر بالواضح-\n৩. ما معنى الخمر والميسر والأنصاب؟\n৪. وما هي انواع الميسر المحرم؟",
          },
          {
            name: "আয়াত: ৯৪-১০৪",
            notes:
              "১. اذكر شأن نزول الآيات الكريمة-\n২. ما المراد بقوله تعالى: الطيب والخبيث؟ بين-\n৩. ما المراد بقوله تعالى: ثم اصبحوا بها كافرين؟\n৪. ما هي البحيرة والسائبة والوصيلة والحام؟",
          },
          {
            name: "আয়াত: ১১১-১১৫",
            notes:
              "১. بين سبب نزول هذه الايات الكريمة-\n২. ما المراد بقوله تعالى \"واذ اوحيت\"؟\n৩. من الحواريون؟ بين-\n৪. ما معنى المائدة؟ وما الاختلاف في نزولها من السماء؟ بين-",
          },
        ],
      },
    ],
  },
  {
    name: "Hadith & Usulul Hadith",
    nameBn: "হাদিস ও উসূলুল হাদিস (২০২)",
    slug: "alim-hadith",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Fiqh 1st Paper",
    nameBn: "আল ফিকহ ১ম পত্র (২০৩)",
    slug: "alim-fiqh-1",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Fiqh 2nd Paper",
    nameBn: "আল ফিকহ ২য় পত্র (২০৪)",
    slug: "alim-fiqh-2",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Arabic 1st Paper",
    nameBn: "আরবি ১ম পত্র (২০৫)",
    slug: "alim-arabic-1",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Arabic 2nd Paper",
    nameBn: "আরবি ২য় পত্র (২০৬)",
    slug: "alim-arabic-2",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Arabic (Science)",
    nameBn: "আরবি (বিজ্ঞান বিভাগ) (২২৩)",
    slug: "alim-arabic-science",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Balaghat & Mantiq",
    nameBn: "বালাগাত ও মানতিক (২১০)",
    slug: "alim-balaghat-mantiq",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Islamic History",
    nameBn: "ইসলামের ইতিহাস (২০৯)",
    slug: "alim-islamic-history",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Bangla 1st Paper",
    nameBn: "বাংলা ১ম পত্র (২৩৬)",
    slug: "alim-bangla-1",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Bangla 2nd Paper",
    nameBn: "বাংলা ২য় পত্র (২৩৭)",
    slug: "alim-bangla-2",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "English 1st Paper",
    nameBn: "ইংরেজি ১ম পত্র (২৩৮)",
    slug: "alim-english-1",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "English 2nd Paper",
    nameBn: "ইংরেজি ২য় পত্র (২৩৯)",
    slug: "alim-english-2",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "ICT",
    nameBn: "তথ্য ও যোগাযোগ প্রযুক্তি (২৪০)",
    slug: "alim-ict",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Civics 1st Paper",
    nameBn: "পৌরনীতি ও সুশাসন ১ম পত্র (২৪১)",
    slug: "alim-civics-1",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Civics 2nd Paper",
    nameBn: "পৌরনীতি ও সুশাসন ২য় পত্র (২৪২)",
    slug: "alim-civics-2",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Economics 1st Paper",
    nameBn: "অর্থনীতি ১ম পত্র (২১৩)",
    slug: "alim-economics-1",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Economics 2nd Paper",
    nameBn: "অর্থনীতি ২য় পত্র (২১৪)",
    slug: "alim-economics-2",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Physics 1st Paper",
    nameBn: "পদার্থবিজ্ঞান ১ম পত্র (২২৪)",
    slug: "alim-physics-1",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Physics 2nd Paper",
    nameBn: "পদার্থবিজ্ঞান ২য় পত্র (২২৫)",
    slug: "alim-physics-2",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Chemistry 1st Paper",
    nameBn: "রসায়ন ১ম পত্র (২২৬)",
    slug: "alim-chemistry-1",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Chemistry 2nd Paper",
    nameBn: "রসায়ন ২য় পত্র (২২৭)",
    slug: "alim-chemistry-2",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Biology 1st Paper",
    nameBn: "জীববিজ্ঞান ১ম পত্র (২৩০)",
    slug: "alim-biology-1",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Biology 2nd Paper",
    nameBn: "জীববিজ্ঞান ২য় পত্র (২৩১)",
    slug: "alim-biology-2",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Higher Math 1st Paper",
    nameBn: "উচ্চতর গণিত ১ম পত্র (২২৮)",
    slug: "alim-higher-math-1",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
  {
    name: "Higher Math 2nd Paper",
    nameBn: "উচ্চতর গণিত ২য় পত্র (২২৯)",
    slug: "alim-higher-math-2",
    board: "madrasah",
    classLevel: "alim",
    streamGroup: "all",
    subjectType: "compulsory",
    structureType: "chapter",
    chaptersOrModules: [],
  },
];
