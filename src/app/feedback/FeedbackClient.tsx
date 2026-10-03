"use client";

import { useState, useTransition } from "react";
import {
  MessageSquarePlus,
  Sparkles,
  Calendar,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Star,
  Send,
  Clock,
  ChevronRight,
  ShieldCheck,
  User,
  Heart,
  MessageCircle,
} from "lucide-react";
import { submitFeedbackAction, type FeedbackItem } from "@/actions/feedback";

interface Props {
  initialMyFeedbacks: FeedbackItem[];
  currentUser?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

const CATEGORIES = [
  {
    id: "feature_request",
    title: "Feature Request",
    titleBn: "কি কি যোগ করা যায়",
    icon: Lightbulb,
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: "data_problem",
    title: "Data & Date Problem",
    titleBn: "তারিখ বা ডেটার সমস্যা",
    icon: Calendar,
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  {
    id: "general",
    title: "App Opinion & Review",
    titleBn: "অ্যাপ সম্পর্কে মতামত",
    icon: Heart,
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "bug",
    title: "Bug & Issue Report",
    titleBn: "কোনো সমস্যা বা ত্রুটি",
    icon: AlertTriangle,
    badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
] as const;

export default function FeedbackClient({
  initialMyFeedbacks,
  currentUser,
}: Props) {
  const [category, setCategory] = useState<
    "general" | "data_problem" | "feature_request" | "bug"
  >("feature_request");
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(initialMyFeedbacks);
  const [isPending, startTransition] = useTransition();
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg("দয়া করে আপনার মতামত বা সমস্যার বিবরণ লিখুন।");
      return;
    }

    setErrorMsg(null);

    startTransition(async () => {
      const res = await submitFeedbackAction({
        category,
        message: message.trim(),
      });

      if (res.ok) {
        setSubmittedSuccess(true);
        const newEntry: FeedbackItem = {
          id: res.id || Date.now(),
          userId: null,
          userName: currentUser?.name || "Student",
          userEmail: currentUser?.email || null,
          category,
          subject: null,
          message: message.trim(),
          rating: null,
          status: "new",
          createdAt: new Date(),
        };
        setFeedbacks((prev) => [newEntry, ...prev]);
        setMessage("");
      } else {
        setErrorMsg(res.error || "মতামত পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    });
  };

  const currentCategoryObj =
    CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-paper via-card to-paper/80 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <MessageSquarePlus className="size-3.5" />
              <span>Feedback & Suggestions</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              আপনার মতামত ও পরামর্শ
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
              অ্যাপটি কেমন লাগছে, কি কি নতুন ফিচার যোগ করা প্রয়োজন, অথবা কোনো
              সিলেবাস/তারিখের ডেটায় সমস্যা থাকলে সরাসরি আমাদের জানান।
            </p>
          </div>

          {/* Quick tab switcher */}
          <div className="flex rounded-2xl bg-white/5 p-1 border border-line shrink-0">
            <button
              onClick={() => {
                setActiveTab("form");
                setSubmittedSuccess(false);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "form"
                  ? "bg-leaf text-white shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              <MessageCircle className="size-3.5" />
              <span>নতুন মতামত দিন</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "history"
                  ? "bg-leaf text-white shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Clock className="size-3.5" />
              <span>পূর্বের মতামত ({feedbacks.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === "history" ? (
        /* ── My Previous Feedbacks ────────────────────────────── */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">আপনার জমাকৃত মতামতসমূহ</h2>
            <button
              onClick={() => setActiveTab("form")}
              className="text-xs font-semibold text-leaf hover:underline"
            >
              + নতুন মতামত লিখুন
            </button>
          </div>

          {feedbacks.length === 0 ? (
            <div className="rounded-3xl border border-line bg-card p-12 text-center">
              <MessageSquarePlus className="mx-auto size-10 text-muted/40 mb-3" />
              <p className="text-sm font-semibold text-ink">এখনো কোনো মতামত জমা দেননি</p>
              <p className="text-xs text-muted mt-1">
                আপনার যেকোনো প্রশ্ন, পরামর্শ বা সমস্যার কথা আমাদের সাথে শেয়ার করুন।
              </p>
              <button
                onClick={() => setActiveTab("form")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-leaf px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-leaf/90 transition"
              >
                মতামত দিন
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((f) => {
                const cat =
                  CATEGORIES.find((c) => c.id === f.category) || CATEGORIES[0];
                const Icon = cat.icon;
                return (
                  <div
                    key={f.id}
                    className="rounded-2xl border border-line bg-card p-4 sm:p-5 shadow-xs space-y-3 transition hover:border-line/80"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${cat.badge}`}
                        >
                          <Icon className="size-3" />
                          <span>{cat.titleBn}</span>
                        </span>
                        {f.rating && (
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: f.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="size-3 fill-amber-400 text-amber-400"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            f.status === "resolved"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : f.status === "reviewed"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-muted/15 text-muted"
                          }`}
                        >
                          {f.status === "resolved"
                            ? "Resolved"
                            : f.status === "reviewed"
                            ? "Reviewed"
                            : "Submitted"}
                        </span>
                        <span className="text-[11px] text-muted">
                          {new Date(f.createdAt).toLocaleDateString("bn-BD")}
                        </span>
                      </div>
                    </div>

                    {f.subject && (
                      <h3 className="text-sm font-bold text-ink">{f.subject}</h3>
                    )}

                    <p className="text-xs text-ink/90 whitespace-pre-line leading-relaxed bg-paper/50 p-3 rounded-xl border border-line/50">
                      {f.message}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : submittedSuccess ? (
        /* ── Success Celebration View ────────────────────────── */
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 sm:p-12 text-center shadow-lg rise">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 mb-4">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink">
            জাযাকাল্লাহু খাইরান! আপনার মতামত সফলভাবে জমা হয়েছে।
          </h2>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto mt-2 leading-relaxed">
            আপনার পরামর্শ বা রিপোর্টটি আমাদের কাছে পৌঁছেছে। আপনার মতামতের ভিত্তিতে
            অ্যাপটি আরও সুন্দর ও নির্ভুল করতে আমরা কাজ করছি।
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setMessage("");
              }}
              className="rounded-xl bg-leaf px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-leaf/90 transition"
            >
              আরেকটি মতামত বা রিপোর্ট দিন
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className="rounded-xl border border-line bg-paper px-5 py-2.5 text-xs font-bold text-ink hover:bg-line/40 transition"
            >
              জমাকৃত মতামত দেখুন
            </button>
          </div>
        </div>
      ) : (
        /* ── Feedback Form ───────────────────────────────────── */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted">
              মতামতের বিষয় (Category)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CATEGORIES.map((c) => {
                const isSelected = category === c.id;
                const Icon = c.icon;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-150 text-left ${
                      isSelected
                        ? "border-leaf bg-leaf/10 text-leaf ring-1 ring-leaf/40 font-bold shadow-xs"
                        : "border-line bg-card text-ink hover:bg-paper"
                    }`}
                  >
                    <span
                      className={`grid size-7 place-items-center rounded-lg shrink-0 ${
                        isSelected ? "bg-leaf text-white" : "bg-muted/10 text-muted"
                      }`}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span className="text-xs font-semibold truncate">
                      {c.titleBn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Details */}
          <div className="space-y-2 rounded-2xl border border-line bg-card p-4 sm:p-5 shadow-xs">
            <div className="space-y-1.5">
              <label
                htmlFor="message"
                className="text-xs font-bold text-ink flex items-center justify-between"
              >
                <span>মতামত বা সমস্যার বিবরণ *</span>
                <span className="text-[10px] text-muted">
                  {message.length} characters
                </span>
              </label>
              <textarea
                id="message"
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="আপনার মতামত, পরামর্শ বা সমস্যার কথা বিস্তারিত লিখুন..."
                className="w-full rounded-xl border border-line bg-paper p-3.5 text-xs text-ink placeholder:text-muted/60 focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf transition leading-relaxed resize-y min-h-[120px]"
              />
            </div>
          </div>

          {/* Submitter info display */}
          {currentUser && (
            <div className="flex items-center gap-2 rounded-xl bg-paper px-4 py-2 border border-line text-xs text-muted">
              <User className="size-3.5 text-leaf shrink-0" />
              <span>
                <strong>{currentUser.name}</strong> ({currentUser.email}) হিসেবে পাঠানো হচ্ছে।
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending || !message.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-leaf px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-leaf/20 hover:bg-leaf/90 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
            >
              {isPending ? (
                <>
                  <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>মতামত পাঠান (Submit)</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
