import { PRAYER_NAMES, type PrayerKey } from '@/lib/design-tokens';

interface PrayerTime {
  key: PrayerKey;
  time: string; // HH:mm format
}

interface PrayerTimesTableProps {
  times: PrayerTime[];
  /** The key of the currently active prayer (used for row highlighting) */
  currentPrayer?: PrayerKey | 'none';
  /** The key of the next upcoming prayer */
  nextPrayer?: PrayerKey | 'none';
  /** ISO date string for aria-label */
  date?: string;
}

const PRAYER_ROW_COLORS: Record<PrayerKey, string> = {
  fajr:    'text-blue-900',
  sunrise: 'text-amber-800',
  dhuhr:   'text-teal-800',
  asr:     'text-cyan-800',
  maghrib: 'text-rose-800',
  isha:    'text-indigo-900',
};

/**
 * PrayerTimesTable — Server Component.
 *
 * Renders a single day's prayer schedule as an accessible table.
 * Row-level highlighting for current and next prayer is applied
 * via semantic markup and accessible labels (not color alone).
 */
export default function PrayerTimesTable({
  times,
  currentPrayer,
  nextPrayer,
  date,
}: PrayerTimesTableProps) {
  // Build a map keyed by prayer key for O(1) lookup
  const timeMap = Object.fromEntries(times.map((t) => [t.key, t.time])) as Record<PrayerKey, string | undefined>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
      <table
        className="min-w-full divide-y divide-gray-100"
        aria-label={date ? `مواقيت الصلاة ليوم ${date}` : 'مواقيت الصلاة اليوم'}
      >
        <thead className="bg-teal-800 text-white">
          <tr>
            <th scope="col" className="py-2.5 sm:py-3 px-3 sm:px-4 text-start text-xs sm:text-sm font-semibold">
              الصلاة
            </th>
            <th scope="col" className="py-2.5 sm:py-3 px-3 sm:px-4 text-end text-xs sm:text-sm font-semibold">
              الوقت
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {PRAYER_NAMES.map(({ key, arabicLabel }) => {
            const time = timeMap[key] ?? '—';
            const isCurrent = currentPrayer === key;
            const isNext = nextPrayer === key;

            const rowClass = isCurrent
              ? 'bg-teal-800 text-white font-semibold'
              : isNext
              ? 'bg-teal-50/90 border-r-4 border-teal-700 font-medium'
              : 'hover:bg-gray-50 transition-colors';

            const labelColor = isCurrent ? 'text-white' : PRAYER_ROW_COLORS[key];

            return (
              <tr key={key} className={rowClass} aria-current={isCurrent ? 'true' : undefined}>
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Current-prayer indicator dot */}
                    {isCurrent && (
                      <span
                        className="inline-block w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white animate-pulse shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    {/* Next-prayer indicator dot */}
                    {isNext && !isCurrent && (
                      <span
                        className="inline-block w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-teal-700 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span className={`font-bold ${labelColor}`}>{arabicLabel}</span>
                    {isCurrent && (
                      <span className="text-[10px] sm:text-[11px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                        الوقت الحالي
                      </span>
                    )}
                    {isNext && !isCurrent && (
                      <span className="text-[10px] sm:text-[11px] font-bold bg-teal-200 text-teal-900 px-2 py-0.5 rounded-full">
                        الصلاة القادمة
                      </span>
                    )}
                  </div>
                </td>
                <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-end text-sm sm:text-base font-mono font-bold ${isCurrent ? 'text-white' : 'text-gray-900'}`}>
                  {time}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
