"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";

interface DatePickerCalendarProps {
  value: string; // "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: string; // "YYYY-MM-DD"
  maxDate?: string; // "YYYY-MM-DD"
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "";
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  if (isNaN(year) || isNaN(monthIdx) || isNaN(day)) return "";
  return `${day} ${MONTH_NAMES[monthIdx] || ""} ${year}`;
}

export function calculateDaysBetween(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
}

export function parseYMD(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return { year: y, month: m - 1, day: d };
}

export function toYMDString(year: number, monthZeroIndexed: number, day: number): string {
  const m = String(monthZeroIndexed + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export default function DatePickerCalendar({
  value,
  onChange,
  label,
  placeholder = "Select Date",
  minDate,
  maxDate,
  error,
  disabled = false,
  required = false,
}: DatePickerCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize view year and month
  const initialDate = useMemo(() => {
    const parsed = parseYMD(value);
    if (parsed) return { year: parsed.year, month: parsed.month };
    const minParsed = minDate ? parseYMD(minDate) : null;
    if (minParsed) return { year: minParsed.year, month: minParsed.month };
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, [value, minDate]);

  const [viewYear, setViewYear] = useState(initialDate.year);
  const [viewMonth, setViewMonth] = useState(initialDate.month);

  // Update view when value or minDate changes externally
  useEffect(() => {
    const parsed = parseYMD(value);
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [value]);

  // Close calendar on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Calendar cells generation
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: {
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      dateStr: string;
      isDisabled: boolean;
      isSelected: boolean;
      isToday: boolean;
    }[] = [];

    const now = new Date();
    const todayStr = toYMDString(now.getFullYear(), now.getMonth(), now.getDate());

    // Previous month padding
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = toYMDString(y, m, d);
      const isPastMin = minDate ? dateStr < minDate : false;
      const isAfterMax = maxDate ? dateStr > maxDate : false;

      cells.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateStr,
        isDisabled: isPastMin || isAfterMax,
        isSelected: value === dateStr,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = toYMDString(viewYear, viewMonth, d);
      const isPastMin = minDate ? dateStr < minDate : false;
      const isAfterMax = maxDate ? dateStr > maxDate : false;

      cells.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        dateStr,
        isDisabled: isPastMin || isAfterMax,
        isSelected: value === dateStr,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding to fill complete grid of 35 or 42
    const totalRemaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= totalRemaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = toYMDString(y, m, d);
      const isPastMin = minDate ? dateStr < minDate : false;
      const isAfterMax = maxDate ? dateStr > maxDate : false;

      cells.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateStr,
        isDisabled: isPastMin || isAfterMax,
        isSelected: value === dateStr,
        isToday: dateStr === todayStr,
      });
    }

    return cells;
  }, [viewYear, viewMonth, value, minDate, maxDate]);

  const handleSelectDate = (dateStr: string, isDisabled: boolean) => {
    if (isDisabled || disabled) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  const formattedDisplay = value ? formatDisplayDate(value) : "";

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-semibold text-ink-soft mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Input button trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 sm:py-3 rounded-xl border text-left transition-all ${
          isOpen
            ? "border-leaf ring-2 ring-leaf/20 bg-white"
            : error
            ? "border-rose-400 bg-rose-50/20 text-rose-900"
            : value
            ? "border-line bg-white hover:border-ink-faint/60"
            : "border-line bg-paper/60 hover:bg-white hover:border-ink-faint/60 text-ink-faint"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`grid size-7 sm:size-8 shrink-0 place-items-center rounded-lg transition-colors ${
              value
                ? "bg-leaf/10 text-leaf"
                : "bg-paper text-ink-faint"
            }`}
          >
            <CalendarIcon className="size-4" />
          </span>
          <span
            className={`truncate text-sm font-medium ${
              value ? "text-ink font-semibold" : "text-ink-faint"
            }`}
          >
            {value ? formattedDisplay : placeholder}
          </span>
        </div>

        {value && (
          <span className="flex items-center gap-1 shrink-0 text-xs font-semibold text-leaf bg-leaf/10 px-2 py-0.5 rounded-md">
            <Check className="size-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Selected</span>
          </span>
        )}
      </button>

      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}

      {/* Calendar Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 right-0 sm:left-auto sm:right-auto sm:w-[320px] bg-white rounded-2xl border border-line shadow-xl p-3.5 sm:p-4 animate-scale-in">
          {/* Header with Month / Year and controls */}
          <div className="flex items-center justify-between pb-3 border-b border-line/60">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm sm:text-[15px] font-bold text-ink">
                {MONTH_NAMES[viewMonth]}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-ink-faint">
                {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goToPrevMonth}
                className="grid size-7 place-items-center rounded-lg hover:bg-paper text-ink-soft hover:text-ink transition"
                aria-label="Previous Month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="grid size-7 place-items-center rounded-lg hover:bg-paper text-ink-soft hover:text-ink transition"
                aria-label="Next Month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center">
            {DAY_LABELS.map((lbl, idx) => (
              <span
                key={lbl}
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  idx === 5 ? "text-leaf" : "text-ink-faint"
                }`}
              >
                {lbl}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              const isSelected = cell.isSelected;
              const isDisabled = cell.isDisabled;
              const isCurrent = cell.isCurrentMonth;

              return (
                <button
                  key={`${cell.dateStr}-${idx}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDate(cell.dateStr, isDisabled)}
                  className={`relative h-8 sm:h-9 w-full rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
                    isSelected
                      ? "bg-leaf text-white shadow-md shadow-leaf/30 font-bold scale-[1.03]"
                      : isDisabled
                      ? "text-ink-faint/30 cursor-not-allowed line-through decoration-ink-faint/30"
                      : !isCurrent
                      ? "text-ink-faint/50 hover:bg-paper hover:text-ink"
                      : cell.isToday
                      ? "border border-leaf/40 text-leaf hover:bg-leaf/10"
                      : "text-ink hover:bg-paper"
                  }`}
                >
                  {cell.day}
                  {cell.isToday && !isSelected && (
                    <span className="absolute bottom-1 size-1 rounded-full bg-leaf" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick shortcuts / actions */}
          <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const todayStr = toYMDString(now.getFullYear(), now.getMonth(), now.getDate());
                if (!minDate || todayStr >= minDate) {
                  onChange(todayStr);
                  setIsOpen(false);
                }
              }}
              className="font-medium text-leaf hover:underline px-1 py-0.5 rounded"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-medium text-ink-faint hover:text-ink px-2 py-0.5 rounded hover:bg-paper transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
