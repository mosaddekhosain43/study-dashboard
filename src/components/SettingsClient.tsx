"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Database,
  Download,
  Eraser,
  FileJson,
  FlaskConical,
  GraduationCap,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  School,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  User,
  AlertCircle,
} from "lucide-react";
import {
  clearAllDataAction,
  getBackupJsonAction,
  importBackupAction,
  loadDemoDataAction,
} from "@/actions";
import {
  updateStudentProfileAction,
  changeStudentPasswordAction,
} from "@/actions/auth";

export interface StudentProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  batchName: string;
  board: string;
  classLevel: string;
  streamGroup: string;
  institution: string;
  rollNumber: string;
  targetGoal: string;
  bio: string;
  avatarUrl: string;
  createdAt: string | null;
  stats: {
    totalSubjects: number;
    totalTopics: number;
    completedTopics: number;
    progressPercent: number;
  };
}

const AVATAR_OPTIONS = ["🎓", "📚", "🕌", "🌙", "🔬", "💡", "✍️", "🏆", "🌟", "📖"];

const CLASS_LEVEL_OPTIONS = [
  { value: "alim", label: "আলিম (Alim / HSC Madrasah)" },
  { value: "alim_1st", label: "আলিম ১ম বর্ষ (Alim 1st Year)" },
  { value: "alim_2nd", label: "আলিম ২য় বর্ষ (Alim 2nd Year)" },
  { value: "dakhil", label: "দাখিল (Dakhil / SSC Madrasah)" },
  { value: "hsc", label: "এইচএসসি (HSC General)" },
  { value: "other", label: "অন্যান্য (Other)" },
];

const STREAM_GROUP_OPTIONS = [
  { value: "general_madrasah", label: "সাধারণ মাদ্রাসা (General Madrasah)" },
  { value: "science", label: "বিজ্ঞান (Science)" },
  { value: "humanities", label: "মানবিক (Humanities)" },
  { value: "business_studies", label: "ব্যবসায় শিক্ষা (Business Studies)" },
  { value: "quran_hadith", label: "মুজাব্বিদ / কুরআন ও হাদিস (Mujabbid)" },
];

const BOARD_OPTIONS = [
  { value: "madrasah", label: "বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড (Madrasah Board)" },
  { value: "dhaka", label: "ঢাকা শিক্ষা বোর্ড (Dhaka Board)" },
  { value: "chittagong", label: "চট্টগ্রাম শিক্ষা বোর্ড (Chittagong Board)" },
  { value: "rajshahi", label: "রাজশাহী শিক্ষা বোর্ড (Rajshahi Board)" },
  { value: "comilla", label: "কুমিল্লা শিক্ষা বোর্ড (Comilla Board)" },
  { value: "jessore", label: "যশোর শিক্ষা বোর্ড (Jessore Board)" },
  { value: "other", label: "অন্যান্য বোর্ড (Other Board)" },
];

export default function SettingsClient({
  profile,
  userRole = "student",
  counts,
}: {
  profile: StudentProfileData;
  userRole?: string;
  counts: { topics: number; updates: number; sessions: number };
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "admin">("profile");

  // Profile Form State
  const [name, setName] = useState(profile.name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [institution, setInstitution] = useState(profile.institution || "");
  const [classLevel, setClassLevel] = useState(profile.classLevel || "alim");
  const [streamGroup, setStreamGroup] = useState(profile.streamGroup || "general_madrasah");
  const [board, setBoard] = useState(profile.board || "madrasah");
  const [rollNumber, setRollNumber] = useState(profile.rollNumber || "");
  const [targetGoal, setTargetGoal] = useState(profile.targetGoal || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "🎓");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback states
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [confirmDemo, setConfirmDemo] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [dangerMsg, setDangerMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = (text: string, type: "success" | "error" = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      flash("অনুগ্রহ করে শিক্ষার্থীর পুরো নাম লিখুন।", "error");
      return;
    }

    startTransition(async () => {
      const res = await updateStudentProfileAction({
        name,
        phone,
        institution,
        classLevel,
        streamGroup,
        board,
        rollNumber,
        targetGoal,
        bio,
        avatarUrl,
      });

      if (res.ok) {
        flash(res.message || "প্রোফাইল সফলভাবে আপডেট করা হয়েছে! 🎉", "success");
        router.refresh();
      } else {
        flash(res.error || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।", "error");
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      flash("বর্তমান পাসওয়ার্ড প্রদান করুন।", "error");
      return;
    }
    if (newPassword.length < 6) {
      flash("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      flash("নতুন পাসওয়ার্ড দুটি মিলছে না। অনুগ্রহ করে পুনরায় টাইপ করুন।", "error");
      return;
    }

    startTransition(async () => {
      const res = await changeStudentPasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.ok) {
        flash(res.message || "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! 🔒", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        flash(res.error || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।", "error");
      }
    });
  };

  const exportJson = async () => {
    const json = await getBackupJsonAction();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alim-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Backup downloaded — keep it somewhere safe.", "success");
  };

  const importJson = (text: string) =>
    startTransition(async () => {
      const res = await importBackupAction(text);
      if (res.ok) {
        flash(
          `Restored: ${res.counts.subjects} subjects, ${res.counts.topics} topics, ${res.counts.updates} updates, ${res.counts.sessions} sessions.`,
          "success"
        );
      } else flash(res.error || "Import failed", "error");
      router.refresh();
    });

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Active Student";

  return (
    <div className="space-y-6">
      {/* Toast message */}
      {msg && (
        <div
          className={`rise flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold shadow-xs ${
            msg.type === "success"
              ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "bg-rose-50 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="size-4.5 text-rose-600 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. STUDENT PROFILE HERO BANNER                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-paper via-card to-paper/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4.5">
            {/* Avatar Pill / Badge */}
            <div className="relative grid size-18 place-items-center rounded-2xl bg-gradient-to-tr from-leaf to-emerald-500 text-3xl shadow-sm text-white shrink-0 ring-4 ring-white/80 dark:ring-card">
              {avatarUrl || "🎓"}
              <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-emerald-600 text-white ring-2 ring-white text-[10px]">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                  {name || profile.name}
                </h2>
                <span className="rounded-full bg-leaf-soft px-2.5 py-0.5 text-xs font-bold text-leaf-deep">
                  {profile.batchName || "Alim 2027"}
                </span>
                <span className="rounded-full bg-paper px-2.5 py-0.5 text-[11px] font-semibold text-ink-soft border border-line">
                  {userRole === "admin" ? "Super Admin" : "Student"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
                <span className="flex items-center gap-1">
                  <Mail className="size-3.5 text-leaf" />
                  {profile.email}
                </span>
                {institution && (
                  <span className="flex items-center gap-1">
                    <School className="size-3.5 text-leaf" />
                    {institution}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5 text-leaf" />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Study Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
            <div className="rounded-2xl border border-line bg-white/80 dark:bg-card/80 p-3 text-center min-w-[90px]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                Subjects
              </p>
              <p className="font-display text-lg font-bold text-ink mt-0.5">
                {profile.stats.totalSubjects}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white/80 dark:bg-card/80 p-3 text-center min-w-[90px]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                Completed
              </p>
              <p className="font-display text-lg font-bold text-leaf mt-0.5">
                {profile.stats.completedTopics}
              </p>
            </div>
            <div className="rounded-2xl border border-leaf/30 bg-leaf-soft/30 p-3 text-center col-span-2 sm:col-span-1 min-w-[90px]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-leaf-deep">
                Progress
              </p>
              <p className="font-display text-lg font-bold text-leaf-deep mt-0.5">
                {profile.stats.progressPercent}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. TABS NAVIGATION                                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
        <button
          onClick={() => setActiveTab("profile")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-2xs ${
            activeTab === "profile"
              ? "bg-leaf text-white shadow-xs"
              : "bg-white dark:bg-card text-ink-soft hover:bg-paper border border-line"
          }`}
        >
          <User className="size-4" />
          <span>Student Information (ব্যক্তিগত ও শিক্ষা তথ্য)</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-2xs ${
            activeTab === "security"
              ? "bg-leaf text-white shadow-xs"
              : "bg-white dark:bg-card text-ink-soft hover:bg-paper border border-line"
          }`}
        >
          <ShieldCheck className="size-4" />
          <span>Account & Security (পাসওয়ার্ড পরিবর্তন)</span>
        </button>

        {userRole === "admin" && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-2xs ${
              activeTab === "admin"
                ? "bg-leaf text-white shadow-xs"
                : "bg-white dark:bg-card text-ink-soft hover:bg-paper border border-line"
            }`}
          >
            <Database className="size-4" />
            <span>Admin Tools</span>
          </button>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. TAB 1: STUDENT PROFILE INFORMATION                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Selection Card */}
          <div className="card p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                  <Sparkles className="size-4 text-leaf" />
                  <span>Choose Profile Avatar (অবতার নির্বাচন করুন)</span>
                </h3>
                <p className="text-xs text-ink-faint mt-0.5">
                  আপনার পছন্দের যে কোনো স্টুডেন্ট আইকন বেছে নিন।
                </p>
              </div>
              <span className="text-2xl">{avatarUrl}</span>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarUrl(emoji)}
                  className={`grid size-11 place-items-center rounded-2xl text-xl transition-all ${
                    avatarUrl === emoji
                      ? "bg-leaf-soft border-2 border-leaf scale-110 shadow-xs"
                      : "bg-paper/70 hover:bg-paper border border-line hover:border-leaf/40"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Information */}
          <div className="card p-5 sm:p-6 space-y-5">
            <div className="border-b border-line/60 pb-3">
              <h3 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                <User className="size-4 text-leaf" />
                <span>Personal Information (ব্যক্তিগত তথ্য)</span>
              </h3>
              <p className="text-xs text-ink-faint mt-0.5">
                আপনার নাম, যোগাযোগ ও প্রোফাইলের সাধারণ তথ্য।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <User className="size-3.5 text-leaf" />
                  <span>Full Name (পুরো নাম) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: মোসাদ্দেক হোসাইন"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-leaf" />
                    <span>Email Address (ইমেইল)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified Account
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2.5 text-xs font-medium text-ink-soft cursor-not-allowed select-none opacity-85"
                  />
                  <Lock className="size-3.5 text-ink-faint absolute right-3.5 top-3" />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Phone className="size-3.5 text-leaf" />
                  <span>Phone Number (মোবাইল নম্বর)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: 01700000000"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              {/* Roll / Registration Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Award className="size-3.5 text-leaf" />
                  <span>Roll / Reg No. (রোল বা রেজিস্ট্রেশন নম্বর)</span>
                </label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="যেমন: ১১২৩৪৫"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              {/* Bio / Study Motto */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-leaf" />
                  <span>Bio / Study Motto (পড়াশোনার অনুপ্রেরণামূলক স্লোগান)</span>
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="যেমন: লক্ষ্য স্থির রেখে প্রতিদিন নিয়ম মেনে অধ্যাবসায় চালিয়ে যাব, ইনশাআল্লাহ।"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf resize-none"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="card p-5 sm:p-6 space-y-5">
            <div className="border-b border-line/60 pb-3">
              <h3 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                <GraduationCap className="size-4 text-leaf" />
                <span>Academic Information (শিক্ষা ও প্রতিষ্ঠান সম্পর্কিত তথ্য)</span>
              </h3>
              <p className="text-xs text-ink-faint mt-0.5">
                আপনার মাদ্রাসা/কলেজ, শ্রেণি, বিভাগ ও শিক্ষা বোর্ড।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Institution Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <School className="size-3.5 text-leaf" />
                  <span>Institution Name (মাদ্রাসা বা শিক্ষা প্রতিষ্ঠানের নাম)</span>
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="যেমন: দারুন্নাজাত সিদ্দিকিয়া কামিল মাদ্রাসা / তামিরুল মিল্লাত কামিল মাদ্রাসা"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              {/* Class Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-leaf" />
                  <span>Class / Academic Level (শ্রেণি)</span>
                </label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                >
                  {CLASS_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stream / Group */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Target className="size-3.5 text-leaf" />
                  <span>Stream / Group (বিভাগ / শাখা)</span>
                </label>
                <select
                  value={streamGroup}
                  onChange={(e) => setStreamGroup(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                >
                  {STREAM_GROUP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Education Board */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Award className="size-3.5 text-leaf" />
                  <span>Education Board (শিক্ষা বোর্ড)</span>
                </label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                >
                  {BOARD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dream Target / Higher Study Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Target className="size-3.5 text-leaf" />
                  <span>Target Dream (ভবিষ্যত লক্ষ্য / কাঙ্ক্ষিত বিশ্ববিদ্যালয়)</span>
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয় (DU) / ইসলামিক স্টাডিজ / বুয়েট"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-2xl bg-leaf px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-leaf-deep hover:shadow-md disabled:opacity-50"
            >
              <Save className="size-4" />
              <span>{pending ? "Saving Changes..." : "Save Profile Changes (প্রোফাইল সংরক্ষণ করুন)"}</span>
            </button>
          </div>
        </form>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. TAB 2: ACCOUNT SECURITY & PASSWORD CHANGE                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "security" && (
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="card p-5 sm:p-6 space-y-5">
            <div className="border-b border-line/60 pb-3">
              <h3 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                <KeyRound className="size-4 text-leaf" />
                <span>Change Password (পাসওয়ার্ড পরিবর্তন)</span>
              </h3>
              <p className="text-xs text-ink-faint mt-0.5">
                আপনার অ্যাকাউন্টের সুরক্ষার জন্য নিয়মিত পাসওয়ার্ড পরিবর্তন করুন।
              </p>
            </div>

            <div className="max-w-md space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Current Password (বর্তমান পাসওয়ার্ড) *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">New Password (নতুন পাসওয়ার্ড) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Confirm New Password (নতুন পাসওয়ার্ড নিশ্চিতকরণ) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ডটি পুনরায় লিখুন"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-2xl bg-leaf px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-leaf-deep disabled:opacity-50"
              >
                <ShieldCheck className="size-4" />
                <span>{pending ? "Updating..." : "Update Password (পাসওয়ার্ড আপডেট করুন)"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. TAB 3: ADMIN TOOLS (Only for Admin)                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "admin" && userRole === "admin" && (
        <div className="space-y-5">
          <section className="card p-5 sm:p-6 border border-line bg-card">
            <h2 className="mb-1 flex items-center gap-2 font-display text-[15px] font-bold text-ink">
              <Database className="size-4.5 text-leaf" /> Admin: Backup & Export
            </h2>
            <p className="mb-4 text-xs leading-relaxed text-ink-faint">
              Database stats: {counts.topics} topics · {counts.updates} updates · {counts.sessions} sessions.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={exportJson}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-paper transition hover:bg-pine"
              >
                <Download className="size-4" /> Export JSON backup
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-bold text-ink-soft transition hover:border-leaf hover:text-leaf"
              >
                <Upload className="size-4" /> Restore from backup…
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  f.text().then(importJson);
                  e.target.value = "";
                }}
              />
              <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
                <FileJson className="size-3.5" /> Dashboard backup files only
              </span>
            </div>
          </section>

          <section className="card border-amber-200 bg-amber-50/30 p-5 sm:p-6">
            <h2 className="mb-1 flex items-center gap-2 font-display text-[15px] font-bold text-ink">
              <FlaskConical className="size-4.5 text-amber-brand" /> Admin: Sample Data & Reset
            </h2>
            <p className="mb-4 text-xs text-ink-faint">
              Load realistic demo syllabus or reset all data.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {confirmDemo ? (
                <span className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  Replace current data with demo data?
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await loadDemoDataAction();
                        setConfirmDemo(false);
                        flash("Demo data loaded.", "success");
                        router.refresh();
                      })
                    }
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-white"
                  >
                    Yes, load it
                  </button>
                  <button
                    onClick={() => setConfirmDemo(false)}
                    className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-line"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmDemo(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-50"
                >
                  <FlaskConical className="size-4" /> Load demo data…
                </button>
              )}

              {confirmClear ? (
                <span className="flex items-center gap-2 text-xs font-bold text-rose-700">
                  Permanently delete ALL topics, updates & sessions?
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await clearAllDataAction();
                        setConfirmClear(false);
                        setDangerMsg("All data cleared. Subjects remain.");
                        router.refresh();
                      })
                    }
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-white"
                  >
                    Delete everything
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-line"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                >
                  <Eraser className="size-4" /> Clear all study data…
                </button>
              )}
            </div>
            {dangerMsg && (
              <p className="mt-3 text-xs font-semibold text-rose-600">{dangerMsg}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
