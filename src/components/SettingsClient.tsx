"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  Check,
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
import StudentAvatar from "@/components/StudentAvatar";

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
  gender?: string;
  createdAt: string | null;
  stats: {
    totalSubjects: number;
    totalTopics: number;
    completedTopics: number;
    progressPercent: number;
  };
}

const STREAM_GROUP_OPTIONS = [
  { value: "general_madrasah", label: "General Madrasah" },
  { value: "science", label: "Science" },
  { value: "humanities", label: "Humanities" },
  { value: "business_studies", label: "Business Studies" },
  { value: "quran_hadith", label: "Mujabbid (Quran & Hadith)" },
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
  const [rollNumber, setRollNumber] = useState(profile.rollNumber || "");
  const [targetGoal, setTargetGoal] = useState(profile.targetGoal || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [gender, setGender] = useState<string>(
    profile.gender || (profile.avatarUrl === "female" ? "female" : "male")
  );

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
      flash("Please enter your full name.", "error");
      return;
    }

    startTransition(async () => {
      const res = await updateStudentProfileAction({
        name,
        phone,
        institution,
        classLevel: profile.classLevel,
        streamGroup: profile.streamGroup,
        board: "madrasah",
        rollNumber,
        targetGoal,
        bio,
        avatarUrl: gender,
        gender,
      });

      if (res.ok) {
        flash(res.message || "Profile updated successfully! 🎉", "success");
        router.refresh();
      } else {
        flash(res.error || "Failed to update profile.", "error");
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      flash("Please enter your current password.", "error");
      return;
    }
    if (newPassword.length < 6) {
      flash("New password must be at least 6 characters long.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      flash("New passwords do not match. Please re-enter.", "error");
      return;
    }

    startTransition(async () => {
      const res = await changeStudentPasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.ok) {
        flash(res.message || "Password changed successfully! 🔒", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        flash(res.error || "Failed to change password.", "error");
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
      {/* Toast notification */}
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
            <div className="relative shrink-0">
              <div className="grid size-18 place-items-center rounded-2xl bg-paper/90 border border-line shadow-sm ring-4 ring-white/80 dark:ring-card overflow-hidden">
                <StudentAvatar gender={gender} size={58} />
              </div>
              <span
                className="absolute -bottom-1 -right-1 z-10 grid size-4.5 place-items-center rounded-full bg-emerald-600 text-white ring-2 ring-white dark:ring-card shadow-sm"
                title="Verified Student Account"
              >
                <Check className="size-2.5 text-white" strokeWidth={3.5} />
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
                  {userRole === "admin" ? "Super Admin" : "Madrasah Student"}
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
          <span>Student Information</span>
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
          <span>Account & Security</span>
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
          {/* Personal Information */}
          <div className="card p-5 sm:p-6 space-y-5">
            <div className="border-b border-line/60 pb-3">
              <h3 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                <User className="size-4 text-leaf" />
                <span>Personal Information</span>
              </h3>
              <p className="text-xs text-ink-faint mt-0.5">
                Manage your name, contact details, and student profile info.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <User className="size-3.5 text-leaf" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mosaddek Hosain"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-leaf" />
                    <span>Email Address</span>
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
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01700000000"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              {/* Roll / Registration Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Award className="size-3.5 text-leaf" />
                  <span>Roll / Reg Number</span>
                </label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 112345"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              {/* Gender & Profile Avatar */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <User className="size-3.5 text-leaf" />
                  <span>Gender (Auto Profile Avatar)</span>
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`flex items-center gap-3 rounded-2xl border p-2.5 transition text-left ${
                      gender === "male"
                        ? "border-leaf bg-leaf-soft/40 shadow-xs ring-1 ring-leaf"
                        : "border-line bg-paper/30 hover:border-leaf/40"
                    }`}
                  >
                    <StudentAvatar gender="male" size={40} />
                    <div>
                      <p className="text-xs font-bold text-ink">Male Student</p>
                      <p className="text-[10.5px] text-ink-faint">Islamic Cap & Kurta</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`flex items-center gap-3 rounded-2xl border p-2.5 transition text-left ${
                      gender === "female"
                        ? "border-leaf bg-leaf-soft/40 shadow-xs ring-1 ring-leaf"
                        : "border-line bg-paper/30 hover:border-leaf/40"
                    }`}
                  >
                    <StudentAvatar gender="female" size={40} />
                    <div>
                      <p className="text-xs font-bold text-ink">Female Student</p>
                      <p className="text-[10.5px] text-ink-faint">Islamic Hijab</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bio / Study Motto */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-leaf" />
                  <span>Bio / Study Motto</span>
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Aim high, stay consistent, and work hard every day."
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
                <span>Academic Information</span>
              </h3>
              <p className="text-xs text-ink-faint mt-0.5">
                Manage your madrasah institution, class level, and academic stream.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Institution Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <School className="size-3.5 text-leaf" />
                  <span>Institution Name</span>
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Darunnajath Siddikia Kamil Madrasah / Tamirul Millat Kamil Madrasah"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              {/* Academic Program / Batch (Read-only as selected at account registration) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="size-3.5 text-leaf" />
                    <span>Academic Program / Batch</span>
                  </span>
                  <span className="text-[10px] font-semibold text-leaf-deep bg-leaf-soft px-2 py-0.5 rounded-full">
                    Selected at Registration
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={profile.batchName || "Alim 2027"}
                    className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2.5 text-xs font-semibold text-ink-soft cursor-not-allowed select-none opacity-85"
                  />
                  <Lock className="size-3.5 text-ink-faint absolute right-3.5 top-3" />
                </div>
              </div>

              {/* Stream / Group (Read-only as selected during setup) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Target className="size-3.5 text-leaf" />
                    <span>Stream / Group</span>
                  </span>
                  <span className="text-[10px] font-semibold text-leaf-deep bg-leaf-soft px-2 py-0.5 rounded-full">
                    Active Syllabus
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={
                      STREAM_GROUP_OPTIONS.find((s) => s.value === profile.streamGroup)?.label ||
                      (profile.streamGroup === "science"
                        ? "Science"
                        : profile.streamGroup === "humanities"
                        ? "Humanities"
                        : "General Madrasah")
                    }
                    className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2.5 text-xs font-semibold text-ink-soft cursor-not-allowed select-none opacity-85"
                  />
                  <Lock className="size-3.5 text-ink-faint absolute right-3.5 top-3" />
                </div>
              </div>

              {/* Dream Target / Higher Study Goal */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Target className="size-3.5 text-leaf" />
                  <span>Dream Goal / University</span>
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="e.g. Dhaka University (DU) / Medical / Islamic Studies / BUET"
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
              <span>{pending ? "Saving Changes..." : "Save Profile Changes"}</span>
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
                <span>Change Password</span>
              </h3>
              <p className="text-xs text-ink-faint mt-0.5">
                Update your password regularly to keep your account safe and secure.
              </p>
            </div>

            <div className="max-w-md space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">New Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-line bg-white dark:bg-card px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-ink-faint focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-2xl bg-leaf px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-leaf-deep disabled:opacity-50"
              >
                <ShieldCheck className="size-4" />
                <span>{pending ? "Updating..." : "Update Password"}</span>
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
