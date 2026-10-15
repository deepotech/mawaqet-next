'use client';

import { PRAYER_NAMES, type PrayerKey } from '@/lib/design-tokens';

export interface DayRow {
  /** Day of month (1–31) */
  day: number;
  /** Gregorian date string, e.g. "2026-10-14" */
  date: string;
  /** Hijri date label, e.g. "21 ربيع الأول" */
  hijriDate?: string;
  times: Record<PrayerKey, string>; // HH:mm
}

export interface MonthlyTimetableProps {
  rows: DayRow[];
  /** Month label in Arabic, e.g. "أكتوبر 2026" */
  monthLabel: string;
  /** Country/city label for aria */
  locationLabel?: string;
  /** ISO date string of today for row highlight */
  todayDate?: string;
  /** Selected month number (1–12) for interactive navigation */
  selectedMonth?: number;
  /** Gregorian year */
  year?: number;
  /** Callback when user changes month */
  onMonthChange?: (newMonth: number) => void;
}

const ARABIC_MONTH_NAMES: Record<number, string> = {
  1: 'يناير',
  2: 'فبراير',
  3: 'مارس',
  4: 'أبريل',
  5: 'مايو',
  6: 'يونيو',
  7: 'يوليو',
  8: 'أغسطس',
  9: 'سبتمبر',
  10: 'أكتوبر',
  11: 'نوفمبر',
  12: 'ديسمبر',
};

/**
 * MonthlyTimetable — Accessible, responsive monthly prayer timetable.
 *
 * Supports mobile horizontal scroll with sticky day column, today-highlighting,
 * and optional interactive month navigation.
 */
export default function MonthlyTimetable({
  rows,
  monthLabel,
  locationLabel,
  todayDate,
  selectedMonth,
  year,
  onMonthChange,
}: MonthlyTimetableProps) {
  const currentMonthNum = selectedMonth ?? (rows.length > 0 ? parseInt(rows[0].date.split('-')[1], 10) : 1);

  const handlePrev = () => {
    if (!onMonthChange) return;
    const prev = currentMonthNum > 1 ? currentMonthNum - 1 : 12;
    onMonthChange(prev);
  };

  const handleNext = () => {
    if (!onMonthChange) return;
    const next = currentMonthNum < 12 ? currentMonthNum + 1 : 1;
    onMonthChange(next);
  };

  return (
    <section
      id="monthly-timetable"
      aria-label={`جدول مواقيت الصلاة الشهري — ${monthLabel}${locationLabel ? ` — ${locationLabel}` : ''}`}
      className="space-y-4 scroll-mt-6"
    >
      {/* ── Month Navigation Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-teal-900">
            جدول مواقيت الصلاة الشهري — {monthLabel}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            عرض كامل لمواقيت الفجر، الشروق، الظهر، العصر، المغرب والعشاء طوال أيام الشهر
          </p>
        </div>

        {onMonthChange && (
          <div className="flex items-center gap-2 self-start sm:self-auto" dir="rtl">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="الشهر السابق"
              className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              ← السابق
            </button>

            <label htmlFor="month-selector" className="sr-only">
              اختر الشهر
            </label>
            <select
              id="month-selector"
              value={currentMonthNum}
              onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
              className="text-xs font-semibold text-teal-900 bg-white border border-teal-200 rounded-lg py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {Object.entries(ARABIC_MONTH_NAMES).map(([num, name]) => (
                <option key={num} value={num}>
                  {name} {year ? `(${year})` : ''}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNext}
              aria-label="الشهر القادم"
              className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              التالي →
            </button>
          </div>
        )}
      </div>

      {/* ── Scrollable Table Container ── */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full text-sm divide-y divide-gray-100">
          <thead className="bg-teal-700 text-white">
            <tr>
              {/* Sticky day column for mobile UX */}
              <th
                scope="col"
                className="sticky right-0 bg-teal-700 py-3 px-3 text-start font-semibold min-w-[65px] z-10"
              >
                اليوم
              </th>
              <th scope="col" className="py-3 px-3 text-start font-semibold whitespace-nowrap">
                التاريخ الهجري
              </th>
              {PRAYER_NAMES.map(({ key, arabicLabel }) => (
                <th key={key} scope="col" className="py-3 px-3 text-center font-semibold whitespace-nowrap">
                  {arabicLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => {
              const isToday = row.date === todayDate;

              const rowClass = isToday
                ? 'bg-teal-50/90 font-bold'
                : 'hover:bg-gray-50/80 transition-colors';

              const stickyClass = isToday
                ? 'sticky right-0 bg-teal-50/90 z-10 border-l border-teal-100'
                : 'sticky right-0 bg-white z-10 border-l border-gray-100';

              return (
                <tr key={row.date} className={rowClass} aria-current={isToday ? 'date' : undefined}>
                  {/* Day number — sticky */}
                  <td className={`py-2.5 px-3 text-start ${stickyClass}`}>
                    <div className="flex items-center gap-1.5">
                      {isToday && (
                        <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" aria-label="اليوم" />
                      )}
                      <span className={isToday ? 'text-teal-900 font-extrabold' : 'text-gray-900 font-medium'}>
                        {row.day}
                      </span>
                    </div>
                  </td>
                  {/* Hijri date */}
                  <td className="py-2.5 px-3 text-start text-gray-500 text-xs whitespace-nowrap">
                    {row.hijriDate ?? '—'}
                  </td>
                  {/* Prayer times */}
                  {PRAYER_NAMES.map(({ key }) => (
                    <td
                      key={key}
                      className={`py-2.5 px-3 text-center font-mono whitespace-nowrap ${
                        isToday ? 'text-teal-950 font-bold' : 'text-gray-800'
                      }`}
                    >
                      {row.times[key] ?? '—'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
