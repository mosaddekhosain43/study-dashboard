"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  GraduationCap,
  Lock,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { getBatchesAction, registerStudentAction } from "@/actions/auth";

interface Batch {
  id: number;
  name: string;
  slug: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBatchesAction().then((data) => {
      setBatches(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await registerStudentAction(formData);
      if (res.ok) {
        router.push(res.redirectUrl || "/");
        router.refresh();
      } else {
        setError(res.error || "Registration failed. Please check your details.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-leaf to-leaf-deep text-white shadow-lg shadow-leaf/25">
            <BookOpenCheck className="size-6" strokeWidth={2.2} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">
            Create Student Account
          </h1>
          <p className="mt-1 text-xs text-ink-faint">
            Join your class batch and track your personal study progress
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
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Abdur Rahman"
                  className="w-full rounded-xl border border-line bg-paper/30 py-2.5 pl-10 pr-4 text-xs text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf/20"
                />
              </div>
            </div>

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
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                Select Your Batch
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                <select
                  name="batchId"
                  required
                  className="w-full appearance-none rounded-xl border border-line bg-paper/30 py-2.5 pl-10 pr-8 text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf/20"
                >
                  <option value="">Choose Batch (e.g. Alim 2027)</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-line bg-paper/30 py-2.5 pl-10 pr-4 text-xs text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-leaf py-3 text-xs font-semibold text-white shadow-md shadow-leaf/20 transition hover:bg-leaf-deep disabled:opacity-60"
            >
              <UserPlus className="size-4" />
              {loading ? "Creating Account..." : "Create Student Account"}
            </button>
          </form>

          <div className="mt-6 border-t border-line/70 pt-5 text-center">
            <p className="text-xs text-ink-faint">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-leaf transition hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
