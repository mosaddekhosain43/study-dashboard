"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import {
  findAccountForRecoveryAction,
  resetPasswordWithEmailAction,
} from "@/actions/auth";

interface AccountRecoveryInfo {
  name: string;
  email: string;
  hasPhone: boolean;
  maskedPhone: string | null;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [accountInfo, setAccountInfo] = useState<AccountRecoveryInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Find Account by Email
  const handleFindAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await findAccountForRecoveryAction(email);
      if (res.ok && res.name && res.email) {
        setAccountInfo({
          name: res.name,
          email: res.email,
          hasPhone: Boolean(res.hasPhone),
          maskedPhone: res.maskedPhone || null,
        });
        setStep(2);
      } else {
        setError(res.error || "No account found with this email address.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("email", email);

    try {
      const res = await resetPasswordWithEmailAction(formData);
      if (res.ok) {
        setStep(3);
      } else {
        setError(res.error || "Failed to reset password. Please check your information.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-leaf to-leaf-deep text-white shadow-lg shadow-leaf/25">
            {step === 3 ? (
              <CheckCircle2 className="size-6" strokeWidth={2.2} />
            ) : (
              <KeyRound className="size-6" strokeWidth={2.2} />
            )}
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">
            {step === 3
              ? "Password Reset Successful"
              : step === 2
              ? "Set New Password"
              : "Recover Account"}
          </h1>
          <p className="mt-1 text-xs text-ink-faint">
            {step === 3
              ? "Your password has been updated securely"
              : step === 2
              ? "Create a new password for your account"
              : "Enter your registered email address to recover your password"}
          </p>
        </div>

        <div className="card overflow-hidden border border-line bg-card p-6 shadow-card sm:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs text-rose-800">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleFindAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Registered Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full rounded-xl border border-line bg-paper/30 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf/20"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-ink-faint">
                  We will search for your account using this email address.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-leaf py-3 text-sm font-semibold text-white shadow-md shadow-leaf/20 transition hover:bg-leaf-deep disabled:opacity-60"
              >
                <BookOpenCheck className="size-4" />
                {loading ? "Searching..." : "Find My Account"}
              </button>
            </form>
          )}

          {step === 2 && accountInfo && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="rounded-xl border border-leaf/20 bg-leaf/5 p-3.5 flex items-start gap-3">
                <ShieldCheck className="size-5 text-leaf shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-ink">
                    Account Found: {accountInfo.name}
                  </div>
                  <div className="text-[11px] text-ink-faint font-mono">
                    {accountInfo.email}
                  </div>
                </div>
              </div>

              {accountInfo.hasPhone && (
                <div>
                  <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                    Confirm Registered Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                    <input
                      type="tel"
                      name="phoneVerification"
                      required
                      placeholder={accountInfo.maskedPhone || "01XXXXXXXXX"}
                      className="w-full rounded-xl border border-line bg-paper/30 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf/20"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-ink-faint">
                    For security, verify the phone number linked to this account.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="password"
                    name="newPassword"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-line bg-paper/30 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={6}
                    placeholder="Re-type new password"
                    className="w-full rounded-xl border border-line bg-paper/30 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf/20"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-paper/60 px-4 py-3 text-sm font-semibold text-ink-soft transition hover:bg-paper"
                >
                  <ArrowLeft className="size-3.5" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-leaf py-3 text-sm font-semibold text-white shadow-md shadow-leaf/20 transition hover:bg-leaf-deep disabled:opacity-60"
                >
                  <KeyRound className="size-4" />
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-5 text-center py-2">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-leaf-soft text-leaf">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-ink-soft font-medium">
                  Your password has been reset successfully!
                </p>
                <p className="text-[11px] text-ink-faint">
                  You can now sign in to your dashboard with your new password.
                </p>
              </div>
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf py-3 text-xs font-semibold text-white shadow-md shadow-leaf/20 transition hover:bg-leaf-deep"
              >
                Sign In Now
              </Link>
            </div>
          )}

          <div className="mt-6 border-t border-line/70 pt-5 text-center">
            <p className="text-xs text-ink-faint">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-leaf transition hover:underline"
              >
                Sign In
              </Link>
            </p>
            <p className="mt-4 text-xs text-ink-faint/80">
              Developed by{" "}
              <a
                href="https://www.facebook.com/mosaddek.hosain.rahi"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-leaf hover:underline"
              >
                Mosaddek Hosain
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
