"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpenCheck, Lock, LogIn, Mail } from "lucide-react";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAction(formData);
      if (res.ok) {
        router.push(res.redirectUrl || "/");
        router.refresh();
      } else {
        setError(res.error || "Invalid credentials.");
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
            <BookOpenCheck className="size-6" strokeWidth={2.2} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">
            Welcome Back
          </h1>
          <p className="mt-1 text-xs text-ink-faint">
            Sign in to access your Study Dashboard and classroom
          </p>
        </div>

        <div className="card overflow-hidden border border-line bg-card p-6 shadow-card sm:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-line bg-paper/30 py-2.5 pl-10 pr-4 text-xs text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-ink-soft">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-line bg-paper/30 py-2.5 pl-10 pr-4 text-xs text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-leaf py-3 text-xs font-semibold text-white shadow-md shadow-leaf/20 transition hover:bg-leaf-deep disabled:opacity-60"
            >
              <LogIn className="size-4" />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 border-t border-line/70 pt-5 text-center">
            <p className="text-xs text-ink-faint">
              Are you a new student?{" "}
              <Link
                href="/register"
                className="font-semibold text-leaf transition hover:underline"
              >
                Create Student Account
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
