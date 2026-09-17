// ─────────────────────────────────────────────────────────────────────────────
// Local Bangla/Banglish/English study-update parser.
//
// Fully offline rule-based NLU tuned for messy, informal Bangla study updates:
//   "আরবি ২ পত্র কুরআন পড়া শেষ হইছে" → Arabic 2nd → কুরআন → completed
//   "বাংলা ১ম এর কবিতা ৩ শেষ, গল্প ২ এখনো পড়ি নাই"
//   "ইংরেজি ২য় আজকে tense আর narration পড়ছি"
//   "আজ আরবি ১ম কিছুই পড়ি নাই"
//
// Isolated behind `parseStudyUpdate()` so an external AI model can be layered
// in later without touching the rest of the app.
// ─────────────────────────────────────────────────────────────────────────────

import { BN_MONTHS, SUBJECT_DEFS, type StudyStatus } from "./constants";
import { addDays, todayKey } from "./dates";

export interface ParsedItem {
  subjectId: number | null;
  subjectName: string | null;
  subjectAmbiguous: { id: number; name: string }[] | null;
  topicText: string;
  topicId: number | null;
  topicSuggestions: { id: number; name: string }[];
  status: StudyStatus;
  minutes: number | null;
  confidence: number; // 0..1
  needsConfirmation: boolean;
  clause: string;
}

export interface ParseResult {
  date: string;
  items: ParsedItem[];
}

export interface SubjectLite {
  id: number;
  name: string;
  slug: string;
}

export interface TopicLite {
  id: number;
  subjectId: number;
  name: string;
}

const BN_DIGIT_MAP: Record<string, string> = {
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
  "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
};

/** Normalize unicode + digits + common spelling variants. */
export function normalizeText(input: string): string {
  let s = input.normalize("NFC");
  s = s.replace(/য়/g, "য়").replace(/ড়/g, "ড়").replace(/ঢ়/g, "ঢ়");
  s = s.replace(/[০-৯]/g, (c) => BN_DIGIT_MAP[c] ?? c);
  s = s.replace(/[،؛]/g, ",").replace(/[""]/g, '"').replace(/[‘’`]/g, "'");
  s = s.replace(/ /g, " ");
  // common spelling variants
  const fixes: [RegExp, string][] = [
    [/ইংরেজী/g, "ইংরেজি"], [/ইংলিশ/g, "ইংরেজি"], [/ইংলিস/g, "ইংরেজি"],
    [/আরবী/g, "আরবি"], [/অারবি/g, "আরবি"],
    [/হাদীস/g, "হাদিস"], [/হাদিছ/g, "হাদিস"],
    [/কোরআন/g, "কুরআন"], [/কুরআনুল?\s*কারীম/g, "কুরআন"], [/কুরআনে/g, "কুরআন"],
    [/আকীদা/g, "আকাইদ"], [/আকায়েদ/g, "আকাইদ"], [/অাকাইদ/g, "আকাইদ"], [/আকাইদে/g, "আকাইদ"],
    [/বালাগত/g, "বালাগাত"], [/ব্যালাগাত/g, "বালাগাত"],
    [/পৌরনিতি/g, "পৌরনীতি"], [/পৌরনীতী/g, "পৌরনীতি"], [/সিভিকস/g, "সিভিক্স"], [/pouronity/gi, "pouroniti"],
    [/ঘন্টা/g, "ঘণ্টা"], [/শেস/g, "শেষ"], [/সেষ/g, "শেষ"],
    [/আই\s*টি/gi, "আইসিটি"], [/তথ্য\s*ও\s*যোগাযোগ\s*প্রযুক্তি/g, "আইসিটি"],
    [/মিনিটে/g, "মিনিট"], [/ঘণ্টায়/g, "ঘণ্টা"],
  ];
  for (const [re, rep] of fixes) s = s.replace(re, rep);
  return s;
}

// ── Subject patterns ────────────────────────────────────────────────────────

interface SubjectPattern {
  base: string; // bangla | english | arabic | aqaid | hadith | quran | ict | balaghat | civics
  re: RegExp;
}

const SUBJECT_PATTERNS: SubjectPattern[] = [
  { base: "english", re: /english|eng\b|ইংরেজি/i },
  { base: "arabic", re: /arabic|arabi\b|আরবি/i },
  { base: "bangla", re: /bangla|বাংলা/i },
  { base: "aqaid", re: /aqaid|akaid|আকাইদ|আকিদা/i },
  { base: "hadith", re: /hadith|হাদিস/i },
  { base: "quran", re: /quran|কুরআন/i },
  { base: "ict", re: /ict|আইসিটি/i },
  { base: "balaghat", re: /balaghat|বালাগাত/i },
  { base: "civics", re: /civics|pouroniti|পৌরনীতি|নাগরিকতা/i },
];

// Bengali digits are converted to ASCII during normalization, so paper
// markers must match mixed forms like "1ম" / "2য়".
const PAPER_ONE = /(?:১ম|1ম|1st|প্রথম|১|1)/u;
const PAPER_TWO = /(?:২য়|2য়|২য়|2য়|2nd|দ্বিতীয়|২|2)/u;
const PAPER_ANY =
  /(?:১ম|1ম|1st|প্রথম|২য়|2য়|২য়|2য়|2nd|দ্বিতীয়|১|১|1|২|2)(?:\s*পত্র|\s*পেপার|\s*paper)?/u;

// ── Status phrase tables (checked in this exact priority order) ─────────────
// Each entry: [regex, status, strength]

const STATUS_RULES: [RegExp, StudyStatus, number][] = [
  // — Negative: studied but not finished / couldn't finish → not_completed
  [/শেষ\s*কর(?:তে)?\s*পার(?:ি|িনি)\s*না(?:ই|ইনি)?/, "not_completed", 1],
  [/শেষ\s*করতে\s*পারলাম\s*না/, "not_completed", 1],
  [/শেষ\s*(?:হই|হয়|হোই)\s*না(?:ই|ইনি)?/, "not_completed", 1],
  [/শেষ\s*হ(?:ইনি|য়নি|য়নাই|ইনাই)/, "not_completed", 1],
  [/শেষ\s*কর(?:ি|িনি)\s*না(?:ই|ইনি)?/, "not_completed", 1],
  [/শেষ\s*কর(?:লাম)?\s*না/, "not_completed", 1],
  [/শেষ\s*হলো\s*না/, "not_completed", 1],
  [/(?:হই|হয়|হোই)\s*না(?:ই|ইনি)?/, "not_completed", 0.9],
  [/হ(?:ইনি|য়নি|ইনাই|য়নাই)/, "not_completed", 0.9],
  [/কর(?:ি|া)?\s*হ(?:ই|য়)\s*না(?:ই|ইনি)?/, "not_completed", 0.9],
  [/পার(?:ি|িনি)\s*না(?:ই|ইনি)?/, "not_completed", 0.8],
  [/পারলাম\s*না/, "not_completed", 0.8],
  [/হলো\s*না/, "not_completed", 0.8],
  [/মুখস্থ\s*হ(?:ই|য়)\s*না(?:ই)?/, "not_completed", 0.9],
  [/কমপ্লিট\s*হ(?:ই|য়)\s*না(?:ই)?/, "not_completed", 0.9],
  [/(?:এখনো|এখনোও)?\s*বাকি(?:\s*আছে|\s*রইল|য়ে\s*আছে)?/, "not_completed", 0.85],
  [/অসমাপ্ত/, "not_completed", 0.9],
  // — Negative: did not study at all / future plan → not_started
  [/কিছুই\s*(?:পড়|পড়া|পড়ি)?\s*না(?:ই|ইনি)?/, "not_started", 1],
  [/একদমই?\s*পড়(?:ি|িনি)?\s*না/, "not_started", 0.95],
  [/পড়(?:লাম)?\s*না(?=\s|$)/, "not_started", 0.95],
  [/পড়ি\s*না(?:ই|ইনি)?/, "not_started", 1],
  [/পড়িনি|পড়িনই|পড়িনা/, "not_started", 1],
  [/পড়া\s*হ(?:ই|য়)\s*না(?:ই)?/, "not_started", 0.9],
  [/(?:এখনো|এখনোও)\s*পড়া?\s*শুরু\s*কর(?:ি|িনি)\s*না(?:ই|ইনি)?/, "not_started", 0.95],
  [/শুরু\s*কর(?:ি|িনি)\s*না(?:ই|ইনি)?/, "not_started", 0.9],
  [/শুরু\s*কর(?:লাম)?\s*না/, "not_started", 0.9],
  [/শুরু\s*হ(?:ই|য়)নি/, "not_started", 0.85],
  [/দেখি\s*না(?:ই|ইনি)?/, "not_started", 0.75],
  [/ছুঁইনি/, "not_started", 0.8],
  [/পড়ব(?:ো|া)?(?=\s|$|,|।)/, "not_started", 0.85], // future plan
  [/করব(?:ো)?(?=\s|$|,|।)/, "not_started", 0.8],
  [/শুরু\s*করব(?:ো)?/, "not_started", 0.85],
  // — Completed typo-forms that contain in-progress words (checked first)
  [/শেষ\s*করছি/, "completed", 0.9],
  // — In progress (tested before completed: "অর্ধেক শেষ", "পড়ছি")
  [/অর্ধ(?:েক|া)/, "in_progress", 0.9],
  [/পড়(?:ছি|তেছি|চ্ছি|াইতেছি)/, "in_progress", 1],
  [/(?:চলতেছে|চলছে|চলিতেছে)/, "in_progress", 1],
  [/শুরু\s*করছি/, "in_progress", 0.95],
  [/কর(?:ছি|তেছি)/, "in_progress", 0.9],
  [/চালিয়ে\s*যাচ্ছি/, "in_progress", 0.9],
  [/শুরু\s*কর(?:েছি|লাম)/, "in_progress", 0.9],
  [/রিভিউ\s*করছি|রিভিশন\s*চলছে/, "in_progress", 0.9],
  [/মুখস্থ\s*করছি/, "in_progress", 0.9],
  [/পড়লাম/, "in_progress", 0.6], // weak: "পড়লাম" = did read (session)
  [/করলাম(?=\s|$)/, "in_progress", 0.5],
  // — Completed
  [/পড়েছি|দেখেছি/, "completed", 0.85],
  [/পড়া\s*(?:পুরো\s*)?শেষ/, "completed", 1],
  [/মুখস্থ\s*শেষ/, "completed", 0.95],
  [/শেষ\s*(?:হইছে|হয়েছে|হলো|করেছি|করলাম|করে\s*ফেলেছি|হয়ে\s*গেছে)/, "completed", 1],
  [/শেষ(?=\s|$|,|।)/, "completed", 0.9],
  [/হয়ে\s*গেছে/, "completed", 0.9],
  [/হইছে|হয়েছে/, "completed", 0.85],
  [/করে\s*ফেলেছি/, "completed", 0.9],
  [/করেছি(?=\s|$)/, "completed", 0.8],
  [/কমপ্লিট|ফিনিশ/i, "completed", 0.9],
  [/\b(?:done|finished|completed)\b/i, "completed", 0.9],
];

// Filler words stripped from topic candidates (hard boundaries both sides).
const FILLER_SUFFIX_RE = /(?:টা|টি|খানা|গুলো|গুলা|টুকু|টাকে)(?=[\s.,।]|$)/g;
const FILLER_WORD_RE = new RegExp(
  `(?:^|\\s)(?:${[
    "আজকে", "আজকের", "আজ", "এই", "ওই", "সেই", "পত্র", "পেপার", "paper", "অব",
    "খুব", "একটু", "কিছুটা", "বেশি", "ইত্যাদি", "ভালো", "ভাল", "মোটামুটি",
    "পুরো", "পুরাপুরি", "সম্পূর্ণ", "আমি", "আমার", "জন্য", "আরো", "আবার",
    "তারপর", "তখন", "তার", "একটা", "একটি", "নতুন", "উঠে", "থেকে", "পর্যন্ত",
    "হিসেবে", "পড়ে", "কালকে", "কাল", "গতকাল", "পরশু", "ও", "কিছু", "অনেক",
    "এর", "মধ্যে", "দিয়ে", "কে", "তে", "র", "এ", "কিছুই",
  ].join("|")})(?=[\\s.,।]|$)`,
  "g",
);

const TRAILING_VERB_RE =
  /(পড়ছি|পড়তেছি|করছি|করলাম|পড়লাম|পড়েছি|করেছি|দেখেছি|হইছিলাম|পড়েছিলাম|করেছিলাম|হইছে|হয়েছে|করে ফেলেছি|করে ফেললাম|পড়া শেষ|শেষ|পড়া)\s*$/;

// ── Small helpers ───────────────────────────────────────────────────────────

function findSubject(
  clause: string,
  subjects: SubjectLite[],
): {
  subject: SubjectLite | null;
  ambiguous: SubjectLite[] | null;
  base: string | null;
  span: [number, number] | null;
  quranAsTopic: boolean;
} {
  let best: { base: string; start: number; end: number } | null = null;
  for (const p of SUBJECT_PATTERNS) {
    const m = clause.match(p.re);
    if (m && m.index !== undefined) {
      const start = m.index;
      const end = start + m[0].length;
      if (!best || start < best.start) best = { base: p.base, start, end };
    }
  }
  if (!best) {
    return { subject: null, ambiguous: null, base: null, span: null, quranAsTopic: false };
  }

  const paperBases = ["bangla", "english", "arabic", "aqaid"];
  if (paperBases.includes(best.base)) {
    // look for the paper number just after the subject word
    const after = clause.slice(best.end, best.end + 14);
    const probe = after.replace(/^\s*(?:পত্র|পেপার|paper)\s*/u, "");
    let paper: 1 | 2 | null = null;
    if (PAPER_TWO.test(probe.slice(0, 6))) paper = 2;
    else if (PAPER_ONE.test(probe.slice(0, 6))) paper = 1;
    // also allow "আরবি পত্র ২য়", and number BEFORE paper word: "আরবি ২য় পত্র"
    if (!paper) {
      const m2 = after.match(PAPER_ANY);
      if (m2) paper = /২|2|দ্বিতীয়/.test(m2[0]) ? 2 : 1;
    }
    if (paper) {
      const slug = `${best.base}-${paper}`;
      const subj = subjects.find((s) => s.slug === slug) ?? null;
      const spanEnd = after.match(new RegExp(`^\\s*(?:পত্র\\s*|পেপার\\s*|paper\\s*)?${PAPER_ANY.source}`, "u"));
      return {
        subject: subj,
        ambiguous: null,
        base: best.base,
        span: [best.start, best.end + (spanEnd ? spanEnd[0].length : 0)],
        quranAsTopic: false,
      };
    }
    // No paper number → ambiguous between 1st and 2nd paper
    const s1 = subjects.find((s) => s.slug === `${best.base}-1`) ?? null;
    const s2 = subjects.find((s) => s.slug === `${best.base}-2`) ?? null;
    return {
      subject: null,
      ambiguous: [s1, s2].filter(Boolean) as SubjectLite[],
      base: best.base,
      span: [best.start, best.end],
      quranAsTopic: false,
    };
  }

  if (best.base === "quran") {
    // কুরআন may be a *topic* under another subject in the same clause.
    const others = SUBJECT_PATTERNS.filter((p) => p.base !== "quran");
    const hasOther = others.some((p) => p.re.test(clause));
    if (hasOther) {
      return { subject: null, ambiguous: null, base: "quran", span: null, quranAsTopic: true };
    }
  }

  const subj = subjects.find((s) => s.slug === best!.base) ?? null;
  return { subject: subj, ambiguous: null, base: best.base, span: [best.start, best.end], quranAsTopic: false };
}

function detectStatus(clause: string): {
  status: StudyStatus | null;
  strength: number;
  span: [number, number] | null;
} {
  let best: { status: StudyStatus; strength: number; span: [number, number]; pri: number } | null = null;
  for (let i = 0; i < STATUS_RULES.length; i++) {
    const [re, status, strength] = STATUS_RULES[i];
    const m = clause.match(re);
    if (m && m.index !== undefined) {
      const cand = { status, strength, span: [m.index, m.index + m[0].length] as [number, number], pri: i };
      if (!best || cand.pri < best.pri) best = cand;
    }
  }
  if (!best) return { status: null, strength: 0, span: null };
  return { status: best.status, strength: best.strength, span: best.span };
}

function detectDuration(clause: string): { minutes: number | null; span: [number, number] | null } {
  let m = clause.match(/(\d+(?:\.\d+)?)\s*ঘণ্টা(?:\s*(\d+)\s*মিনিট)?/);
  if (m && m.index !== undefined) {
    const mins = Math.round(parseFloat(m[1]) * 60) + (m[2] ? parseInt(m[2], 10) : 0);
    return { minutes: mins, span: [m.index, m.index + m[0].length] };
  }
  m = clause.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b(?:\s*(\d+)\s*(?:m|mins?|minutes?))?/i);
  if (m && m.index !== undefined) {
    const mins = Math.round(parseFloat(m[1]) * 60) + (m[2] ? parseInt(m[2], 10) : 0);
    return { minutes: mins, span: [m.index, m.index + m[0].length] };
  }
  m = clause.match(/(\d+)\s*(?:মিনিট|মিন\.)(?=\s|$|,|।)/);
  if (m && m.index !== undefined) {
    return { minutes: parseInt(m[1], 10), span: [m.index, m.index + m[0].length] };
  }
  m = clause.match(/\b(\d+)\s*(?:mins?|minutes?)\b/i);
  if (m && m.index !== undefined) {
    return { minutes: parseInt(m[1], 10), span: [m.index, m.index + m[0].length] };
  }
  return { minutes: null, span: null };
}

function detectDateShift(text: string): number {
  if (/(?:গতকাল|গত\s*কাল)/.test(text) && !/কাল\s*পড়ব/.test(text)) return -1;
  if (/পরশু/.test(text)) return -2;
  if (/অগস্তকাল/.test(text)) return -3;
  return 0;
}

function detectExplicitDate(text: string): string | null {
  const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const m = text.match(/\b(\d{1,2})(?:\s*(?:তারিখ)?\s+)([\p{L}\p{M}]+)/u);
  if (m) {
    const month = BN_MONTHS[m[2].toLowerCase()];
    if (month) {
      const now = new Date();
      let year = now.getFullYear();
      const day = parseInt(m[1], 10);
      const candidate = new Date(year, month - 1, day);
      if (candidate > now) year -= 1; // "15 September" → most recent past
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  return null;
}

/** Reorder "২ নম্বর কবিতা" → "কবিতা ২", "৩য় অধ্যায়" → "অধ্যায় ৩". */
function reorderOrdinalTopic(s: string): string {
  let out = s.replace(
    /(\d+)\s*(?:নম্বর|নং|নাম্বার|তম|য়|ম)\s+([\p{L}\p{M}]+)/gu,
    "$2 $1",
  );
  out = out.replace(/\b(\d+)(?:st|nd|rd|th)\s+([a-zA-Z]+)/gi, "$2 $1");
  return out;
}

const CATEGORY_ALIASES: [RegExp, string][] = [
  [/কবিতা|podyo|কবিত/g, "poem"],
  [/গল্প|গল্পকাহিনী|কাহিনী/g, "story"],
  [/প্রবন্ধ|রচনা/g, "essay"],
  [/নাটক/g, "drama"],
  [/উপন্যাস/g, "novel"],
  [/অধ্যায়|চ্যাপ্টার|অধ্যায়/g, "chapter"],
  [/ইউনিট|একক/g, "unit"],
  [/লেসন|পাঠ|পাঠ্য/g, "lesson"],
  [/সূরা|সুরা/g, "surah"],
  [/আয়াত|আয়াতে/g, "ayah"],
  [/হাদিস/g, "hadith"],
  [/ব্যাকরণ/g, "grammar"],
];

/** Canonical form for fuzzy topic comparison (cross-lingual). */
export function canonicalTopic(s: string): string {
  let t = normalizeText(s).toLowerCase();
  t = reorderOrdinalTopic(t);
  for (const [re, rep] of CATEGORY_ALIASES) t = t.replace(re, rep);
  t = t.replace(/[.,।;:!?()\[\]"']/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

function matchTopic(
  candidate: string,
  subjectId: number | null,
  topics: TopicLite[],
): { topicId: number | null; suggestions: { id: number; name: string }[] } {
  if (!subjectId || !candidate) return { topicId: null, suggestions: [] };
  const pool = topics.filter((t) => t.subjectId === subjectId);
  if (!pool.length) return { topicId: null, suggestions: [] };

  const cand = canonicalTopic(candidate);
  if (!cand) return { topicId: null, suggestions: [] };
  const withCanon = pool.map((t) => ({ t, c: canonicalTopic(t.name) }));

  const exact = withCanon.find((x) => x.c === cand);
  if (exact) return { topicId: exact.t.id, suggestions: [] };

  const scored: { id: number; name: string; score: number }[] = [];
  for (const x of withCanon) {
    let score = 0;
    if (x.c.includes(cand) || cand.includes(x.c)) score = 0.8;
    else {
      // token overlap
      const a = new Set(cand.split(" "));
      const b = new Set(x.c.split(" "));
      let hit = 0;
      for (const w of a) if (b.has(w) && w.length > 1) hit++;
      if (hit > 0) {
        score = Math.min(0.7, (hit / Math.max(a.size, b.size)) * 0.85 + hit * 0.08);
      }
    }
    if (score > 0.25) scored.push({ id: x.t.id, name: x.t.name, score });
  }
  scored.sort((p, q) => q.score - p.score);
  const suggestions = scored.slice(0, 5).map((s) => ({ id: s.id, name: s.name }));
  const top = scored[0];
  if (top && top.score >= 0.75) return { topicId: top.id, suggestions: [] };
  return { topicId: null, suggestions };
}

// ── Clause splitting ────────────────────────────────────────────────────────

function splitClauses(text: string): string[] {
  // Connectives keep meaning separation; keep pieces non-empty.
  return text
    .split(/(?:\s+আরো\s+|\s+আর\s+|\s+এবং\s+|\s+এবাং\s+|\s+সাথে\s+সাথে\s+|\s+সঙ্গে\s*সঙ্গে\s+|\s+তারপর\s+|\s+কিন্তু\s+|\s+তবে\s+|\s+হালে\s+|\s+and\s+|\s+but\s+|\s+then\s+|[,;!?\n।]+)/i)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

interface ClauseParse {
  subjectId: number | null;
  ambiguous: SubjectLite[] | null;
  topicText: string;
  status: StudyStatus | null;
  strength: number;
  minutes: number | null;
  clause: string;
}

function parseClause(
  rawClause: string,
  subjects: SubjectLite[],
): ClauseParse {
  const s = rawClause;
  const { subject, ambiguous, base, span } = findSubject(s, subjects);

  let status = detectStatus(s);
  // "কিছুই পড়ি নাই" without explicit ending → clearly not studied
  const dur = detectDuration(s);

  // Remove matched spans (subject, status phrase, duration) from topic candidate
  const cut: [number, number][] = [];
  if (span) cut.push(span);
  if (status.span) cut.push(status.span);
  if (dur.span) cut.push(dur.span);
  cut.sort((a, b) => a[0] - b[0]);
  let candidate = "";
  let cursor = 0;
  for (const [a, b] of cut) {
    candidate += s.slice(cursor, a) + " ";
    cursor = b;
  }
  candidate += s.slice(cursor);

  candidate = reorderOrdinalTopic(candidate);
  candidate = candidate.replace(TRAILING_VERB_RE, " ");
  candidate = candidate.replace(FILLER_SUFFIX_RE, "");
  candidate = candidate.replace(FILLER_WORD_RE, " ");
  candidate = candidate.replace(/[.,।;:!?()\[\]"'/-]/g, " ");
  candidate = candidate.replace(/\s+/g, " ").trim();

  // "হাদিস ৫" → topic "হাদিস 5" so it can fuzzy-match the syllabus entry
  if (/^\d+$/.test(candidate) && (base === "hadith" || base === "quran")) {
    candidate = `${base === "hadith" ? "হাদিস" : "কুরআন"} ${candidate}`;
  }

  // Nothing-studied phrases collapse to subject-level item
  const nothingStudied = /কিছুই|একদমই?/.test(rawClause) && status.status === "not_started";

  return {
    subjectId: subject?.id ?? null,
    ambiguous,
    topicText: nothingStudied ? "" : candidate,
    status: status.status,
    strength: status.strength,
    minutes: dur.minutes,
    clause: rawClause.trim(),
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

export function parseStudyUpdate(
  raw: string,
  subjects: SubjectLite[],
  topics: TopicLite[],
): ParseResult {
  const normalized = normalizeText(raw);
  const lower = normalized.toLowerCase();

  let date = todayKey();
  const explicit = detectExplicitDate(normalized);
  if (explicit) date = explicit;
  else date = addDays(date, detectDateShift(normalized));

  const rawClauses = splitClauses(normalized);
  const parsed: ClauseParse[] = rawClauses.map((c) => parseClause(c, subjects));

  // Pass 2: inherit subject from previous clause.
  let currentSubject: number | null = null;
  let currentAmbiguous: SubjectLite[] | null = null;
  for (const p of parsed) {
    if (p.subjectId) {
      currentSubject = p.subjectId;
      currentAmbiguous = null;
    } else if (p.ambiguous) {
      currentSubject = null;
      currentAmbiguous = p.ambiguous;
    } else if (!p.subjectId && !p.ambiguous) {
      if (currentSubject) p.subjectId = currentSubject;
      else if (currentAmbiguous) p.ambiguous = currentAmbiguous;
    }
  }

  // Pass 3: inherit status — prefer the *following* clause ("tense আর narration পড়ছি").
  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i];
    if (p.status) continue;
    const isNoise = !p.topicText || p.topicText.length < 2;
    const next = parsed[i + 1];
    const prev = parsed[i - 1];
    if (next?.status && next.subjectId === p.subjectId && !isNoise) {
      p.status = next.status;
      p.strength = next.strength * 0.9;
    } else if (prev?.status && prev.subjectId === p.subjectId && !isNoise) {
      p.status = prev.status;
      p.strength = prev.strength * 0.9;
    }
  }

  const items: ParsedItem[] = [];
  for (const p of parsed) {
    const hasNoiseTopic = /^(?:না|নাই)?$/.test(p.topicText);
    const topicText = hasNoiseTopic ? "" : p.topicText;
    if (!p.subjectId && !p.ambiguous && !topicText) continue; // pure filler
    if (!p.status && !topicText && p.subjectId) continue; // bare subject mention

    const subjLite = p.subjectId ? subjects.find((x) => x.id === p.subjectId) ?? null : null;

    const { topicId, suggestions } = matchTopic(topicText, p.subjectId, topics);

    let confidence = 0;
    confidence += p.subjectId ? 0.5 : p.ambiguous ? 0.25 : 0;
    confidence += p.status ? 0.25 * Math.min(1, p.strength + 0.2) : 0;
    confidence += topicText ? (topicId ? 0.25 : 0.1) : 0.15;

    const status: StudyStatus = p.status ?? "in_progress";
    const needsConfirmation =
      !p.subjectId || Boolean(p.ambiguous) || (!topicId && topicText.length > 0) || !p.status;

    const matchedTopicName = topicId
      ? (topics.find((t) => t.id === topicId)?.name ?? topicText)
      : topicText;

    items.push({
      subjectId: subjLite?.id ?? null,
      subjectName:
        subjLite?.name ?? (p.ambiguous ? "Ambiguous — pick a paper" : null),
      subjectAmbiguous: p.ambiguous ? p.ambiguous.map((s) => ({ id: s.id, name: s.name })) : null,
      topicText: matchedTopicName,
      topicId,
      topicSuggestions: suggestions,
      status,
      minutes: p.minutes,
      confidence: Math.round(confidence * 100) / 100,
      needsConfirmation,
      clause: p.clause,
    });
  }

  // Merge exact duplicates (same subject+topic+status)
  const seen = new Map<string, ParsedItem>();
  for (const it of items) {
    const key = `${it.subjectId}|${it.topicId}|${canonicalTopic(it.topicText)}|${it.status}`;
    const prev = seen.get(key);
    if (!prev) seen.set(key, it);
    else if (it.minutes) prev.minutes = (prev.minutes ?? 0) + it.minutes;
  }
  let merged = Array.from(seen.values());

  // A duration-only clause ("২ ঘণ্টা পড়েছি") folds into the previous item.
  const folded: ParsedItem[] = [];
  for (const it of merged) {
    const prev = folded[folded.length - 1];
    if (it.minutes && !it.topicText && prev && prev.subjectId === it.subjectId) {
      prev.minutes = (prev.minutes ?? 0) + it.minutes;
      continue;
    }
    folded.push(it);
  }
  merged = folded;

  return { date, items: merged };
}

/** Demo examples surfaced in the UI. */
export const EXAMPLE_INPUTS = [
  "আরবি ২ পত্র কুরআন পড়া শেষ হইছে",
  "বাংলা ১ম এর কবিতা ৩ শেষ, গল্প ২ এখনো পড়ি নাই",
  "ইংরেজি ২য় আজকে tense আর narration পড়ছি",
  "আজ আরবি ১ম কিছুই পড়ি নাই",
  "হাদিস ৫ মুখস্থ শেষ হয়েছে আর আকাইদ ২য় শুরু করছি",
];
