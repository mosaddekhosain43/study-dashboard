"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, BookPlus } from "lucide-react";
import { createCustomSubjectAction } from "@/actions";

export default function AddSubjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleCreate = () => {
    if (!name.trim()) {
      setError("Please enter a subject name.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await createCustomSubjectAction(name.trim(), nameBn.trim() || undefined);
      if (res.ok) {
        setName("");
        setNameBn("");
        setOpen(false);
        if ("subject" in res && res.subject) {
          router.push(`/subjects/${res.subject.id}`);
        }
        router.refresh();
      } else {
        setError(res.error || "Failed to create subject.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-xs transition hover:bg-leaf-deep"
      >
        <Plus className="size-4" />
        <span>+ Add Subject</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="card w-full max-w-md p-5 sm:p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-leaf-soft text-leaf">
                  <BookPlus className="size-4.5" />
                </span>
                <h3 className="font-display text-[17px] font-bold text-ink">
                  Add New Subject / বিষয়
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid size-7 place-items-center rounded-lg text-ink-faint hover:bg-paper hover:text-ink transition"
              >
                <X className="size-4" />
              </button>
            </div>

            {error && (
              <div className="mb-3 rounded-lg bg-rose-50 p-2.5 text-[12px] font-semibold text-rose-600 border border-rose-200">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-ink-soft mb-1">
                  Subject Name (e.g. Higher Math, Fiqh 2nd Paper)
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Subject name in English"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13.5px] outline-none focus:border-leaf"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink-soft mb-1">
                  Bangla Name (ঐচ্ছিক / Optional)
                </label>
                <input
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. উচ্চতর গণিত"
                  className="w-full font-bengali rounded-xl border border-line bg-white px-3 py-2 text-[13.5px] outline-none focus:border-leaf"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-line bg-white px-4 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-paper transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={pending || !name.trim()}
                className="rounded-xl bg-leaf px-4.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
              >
                {pending ? "Creating…" : "Create Subject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
