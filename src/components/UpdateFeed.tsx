"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { deleteItemAction, deleteUpdateAction, updateItemAction } from "@/actions";
import type { UpdateDto, ItemDto } from "@/lib/queries";
import { STATUS_META, STATUSES, type StudyStatus } from "@/lib/constants";
import { StatusIcon } from "@/components/ui";
import { formatDayLabel } from "@/lib/dates";

export default function UpdateFeed({
  updates,
  subjects,
  groupByDate = true,
  compact = false,
}: {
  updates: UpdateDto[];
  subjects: { id: number; name: string }[];
  groupByDate?: boolean;
  compact?: boolean;
}) {
  const groups: { date: string; updates: UpdateDto[] }[] = [];
  if (groupByDate) {
    for (const u of updates) {
      const g = groups.find((x) => x.date === u.date);
      if (g) g.updates.push(u);
      else groups.push({ date: u.date, updates: [u] });
    }
  } else if (updates.length) {
    groups.push({ date: updates[0].date, updates });
  }

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g.date + g.updates.map((u) => u.id).join("-")}>
          {groupByDate && (
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              {formatDayLabel(g.date)} <span className="font-medium normal-case tracking-normal">· {g.date}</span>
            </p>
          )}
          <ul className="space-y-2">
            {g.updates.map((u) => (
              <UpdateCard key={u.id} update={u} subjects={subjects} compact={compact} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function UpdateCard({
  update,
  subjects,
  compact,
}: {
  update: UpdateDto;
  subjects: { id: number; name: string }[];
  compact: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const doDelete = () =>
    startTransition(async () => {
      await deleteUpdateAction(update.id);
      router.refresh();
    });

  return (
    <li className={`card group ${compact ? "p-3" : "p-4"}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="font-bengali line-clamp-2 flex-1 text-[12px] italic leading-relaxed text-ink-faint">
          «{update.rawText}»
        </p>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {confirming ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
              Sure?
              <button onClick={doDelete} className="rounded-md bg-rose-600 px-1.5 py-0.5 text-white" disabled={pending}>
                Yes
              </button>
              <button onClick={() => setConfirming(false)} className="rounded-md bg-slate-200 px-1.5 py-0.5 text-slate-700">
                No
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              title="Delete entire update"
              className="grid size-6 place-items-center rounded-md text-ink-faint hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>
      <ul className="space-y-1.5">
        {update.items.map((item) => (
          <ItemRow key={item.id} item={item} subjects={subjects} />
        ))}
      </ul>
    </li>
  );
}

function ItemRow({ item, subjects }: { item: ItemDto; subjects: { id: number; name: string }[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    subjectId: item.subjectId,
    topicText: item.label === "General study" ? "" : item.label,
    status: item.status,
    minutes: item.minutes ? String(item.minutes) : "",
    notes: item.notes ?? "",
    date: item.date,
  });

  const save = () =>
    startTransition(async () => {
      await updateItemAction(item.id, {
        subjectId: form.subjectId,
        topicText: form.topicText,
        topicId: form.topicText === item.label ? item.topicId : null,
        status: form.status,
        minutes: form.minutes ? Math.max(0, Math.round(Number(form.minutes))) : null,
        notes: form.notes || null,
        date: form.date,
      });
      setEditing(false);
      router.refresh();
    });

  const doDelete = () =>
    startTransition(async () => {
      await deleteItemAction(item.id);
      router.refresh();
    });

  if (editing) {
    return (
      <li className="rounded-lg border border-leaf/30 bg-leaf-soft/40 p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={form.subjectId ?? ""}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value ? Number(e.target.value) : null })}
            className="rounded-lg border border-line bg-white px-2 py-1 text-[12px] font-semibold"
          >
            <option value="">Subject…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <input
            value={form.topicText}
            onChange={(e) => setForm({ ...form, topicText: e.target.value })}
            placeholder="Topic"
            className="font-bengali min-w-[130px] flex-1 rounded-lg border border-line bg-white px-2 py-1 text-[12px]"
          />
          <input
            value={form.minutes}
            onChange={(e) => setForm({ ...form, minutes: e.target.value.replace(/[^\d]/g, "") })}
            placeholder="min"
            className="w-[58px] rounded-lg border border-line bg-white px-2 py-1 text-[12px] tabular-nums"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="rounded-lg border border-line bg-white px-1.5 py-1 text-[12px]"
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {STATUSES.map((st) => {
            const meta = STATUS_META[st];
            const active = form.status === st;
            return (
              <button
                key={st}
                onClick={() => setForm({ ...form, status: st as StudyStatus })}
                className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold transition ${
                  active ? `${meta.bg} ${meta.text} border-transparent ring-1 ${meta.ring}` : "border-line bg-white text-ink-faint"
                }`}
              >
                {meta.label}
              </button>
            );
          })}
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Note (optional)"
            className="font-bengali min-w-[120px] flex-1 rounded-lg border border-line bg-white px-2 py-1 text-[12px]"
          />
          <button onClick={save} disabled={pending} className="inline-flex items-center gap-1 rounded-lg bg-leaf px-2.5 py-1 text-[11.5px] font-semibold text-white">
            <Check className="size-3.5" /> Save
          </button>
          <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2.5 py-1 text-[11.5px] font-semibold text-slate-700">
            <X className="size-3.5" /> Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="group/item flex items-center gap-2.5 rounded-lg px-1 py-1 hover:bg-paper/70">
      <StatusIcon status={item.status} />
      <span className="w-[118px] shrink-0 truncate text-[12px] font-semibold text-ink-soft" title={item.subjectName}>
        {item.subjectName}
      </span>
      <span className="font-bengali min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
        {item.label}
        {item.notes && <span className="ml-1.5 text-[11px] italic text-ink-faint">· {item.notes}</span>}
      </span>
      {item.minutes ? (
        <span className="shrink-0 rounded-md bg-paper px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-ink-faint">
          {item.minutes}m
        </span>
      ) : null}
      <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_META[item.status].bg} ${STATUS_META[item.status].text}`}>
        {STATUS_META[item.status].short}
      </span>
      <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/item:opacity-100">
        <button onClick={() => setEditing(true)} className="grid size-6 place-items-center rounded-md text-ink-faint hover:bg-white hover:text-leaf" title="Edit">
          <Pencil className="size-3" />
        </button>
        {confirming ? (
          <button onClick={doDelete} className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white" disabled={pending}>
            Del?
          </button>
        ) : (
          <button onClick={() => setConfirming(true)} className="grid size-6 place-items-center rounded-md text-ink-faint hover:bg-rose-50 hover:text-rose-600" title="Delete record">
            <Trash2 className="size-3" />
          </button>
        )}
      </span>
    </li>
  );
}
