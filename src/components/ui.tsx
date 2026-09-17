// Shared presentational components — deliberately hook-free so they render
// inside server components too.
import type { ReactNode } from "react";
import {
  CheckCircle2,
  Circle,
  CircleDashed,
  XCircle,
} from "lucide-react";
import { STATUS_META, type StudyStatus } from "@/lib/constants";

// ── Status visuals ──────────────────────────────────────────────────────────

export function StatusIcon({ status, className = "size-4" }: { status: StudyStatus; className?: string }) {
  const meta = STATUS_META[status];
  const common = `${className} ${meta.text}`;
  if (status === "completed") return <CheckCircle2 className={common} strokeWidth={2.2} />;
  if (status === "in_progress") return <CircleDashed className={common} strokeWidth={2.2} />;
  if (status === "not_completed") return <XCircle className={common} strokeWidth={2.2} />;
  return <Circle className={common} strokeWidth={2.2} />;
}

export function StatusChip({ status, small = false }: { status: StudyStatus; small?: boolean }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ${meta.bg} ${meta.text} ${meta.ring} ${
        small ? "px-2 py-0.5 text-[10.5px]" : "px-2.5 py-1 text-[11.5px]"
      }`}
    >
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function StatusDot({ status }: { status: StudyStatus }) {
  return <span className={`inline-block size-2 rounded-full ${STATUS_META[status].dot}`} />;
}

// ── Progress bar ────────────────────────────────────────────────────────────

export function ProgressBar({
  value,
  tone = "leaf",
  height = 8,
  shine = false,
}: {
  value: number; // 0..1
  tone?: "leaf" | "amber" | "rose" | "slate";
  height?: number;
  shine?: boolean;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const tones: Record<string, string> = {
    leaf: "bg-gradient-to-r from-leaf to-glow",
    amber: "bg-gradient-to-r from-amber-500 to-amber-400",
    rose: "bg-gradient-to-r from-rose-500 to-rose-400",
    slate: "bg-slate-300",
  };
  return (
    <div
      className="w-full overflow-hidden rounded-full bg-ink/8"
      style={{ height }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-700 ${tones[tone]} ${shine ? "progress-shine" : ""}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Donut chart ─────────────────────────────────────────────────────────────

export function Donut({
  segments,
  size = 150,
  stroke = 16,
  centerLabel,
  centerSub,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  stroke?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2dfd2" strokeWidth={stroke} />
        {total > 0 &&
          segments.map((s, i) => {
            if (s.value <= 0) return null;
            const frac = s.value / total;
            const dash = Math.max(0, frac * c - 1.5);
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeLinecap={frac > 0.98 ? "butt" : "round"}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                style={{ transition: "stroke-dasharray .8s ease, stroke-dashoffset .8s ease" }}
              />
            );
            offset += frac * c;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-xl font-bold tracking-tight text-ink">{centerLabel}</p>
          {centerSub && <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{centerSub}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Vertical bar chart (server-safe SVG) ────────────────────────────────────

export function VBars({
  data,
  height = 130,
  color = "#0c7a5b",
  mutedColor = "#d9d5c8",
  highlightLast = false,
}: {
  data: { label: string; value: number; title?: string }[];
  height?: number;
  color?: string;
  mutedColor?: string;
  highlightLast?: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const h = Math.max(3, (d.value / max) * (height - 30));
        const isHi = highlightLast && i === data.length - 1;
        return (
          <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-1.5" title={d.title ?? `${d.label}: ${d.value}`}>
            <span className="text-[9.5px] font-semibold tabular-nums text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">
              {d.title ?? d.value}
            </span>
            <div
              className={`w-full max-w-[38px] rounded-t-md transition-all duration-500 ${isHi ? "" : ""}`}
              style={{
                height: h,
                background: isHi ? `linear-gradient(180deg, #18b981, #0c7a5b)` : d.value > 0 ? color : mutedColor,
                opacity: isHi ? 1 : d.value > 0 ? 0.85 : 0.5,
              }}
            />
            <span className={`text-[9.5px] font-semibold uppercase tracking-wide ${isHi ? "text-leaf" : "text-ink-faint"}`}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Cards & sections ────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3.5 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-[17px] font-semibold tracking-tight text-ink">{title}</h2>
        {sub && <p className="mt-0.5 text-[12.5px] text-ink-faint">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatTile({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="card group relative overflow-hidden p-4">
      <div
        className="absolute -right-5 -top-5 size-20 rounded-full opacity-[0.07] transition-transform duration-500 group-hover:scale-125"
        style={{ background: accent ?? "#0c7a5b" }}
      />
      <div className="mb-2.5 flex items-center gap-2 text-ink-faint">{icon}<span className="text-[11px] font-semibold uppercase tracking-[0.12em]">{label}</span></div>
      <p className="font-display text-[26px] font-bold leading-none tracking-tight text-ink">{value}</p>
      {sub && <p className="mt-1.5 text-[11.5px] text-ink-faint">{sub}</p>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 border-dashed px-6 py-12 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-leaf-soft text-leaf">{icon}</div>
      <div>
        <p className="font-display text-[15px] font-semibold text-ink">{title}</p>
        {body && <p className="mx-auto mt-1 max-w-sm text-[13px] text-ink-faint">{body}</p>}
      </div>
      {action}
    </div>
  );
}

export function Percent({ value }: { value: number }) {
  return <span className="font-semibold tabular-nums">{Math.round(value * 100)}%</span>;
}
