'use client';

import { useState, useEffect, useRef } from 'react';
import { PRAYER_NAMES, type PrayerKey } from '@/lib/design-tokens';

interface NextPrayerCountdownProps {
  /** Key of the next upcoming prayer */
  nextPrayer: PrayerKey | 'none';
  /** Next prayer time as a local Date object (passed from server) */
  nextPrayerTime: Date | null;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const now = Date.now();
  const diff = Math.max(0, target.getTime() - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, totalSeconds };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * NextPrayerCountdown — Client Component.
 *
 * HYDRATION SAFETY:
 * - Initial render (and SSR) shows a loading skeleton via `mounted` flag.
 * - The countdown starts only after `useEffect` runs on the client.
 * - This prevents the "server/client mismatch" hydration error for
 *   time-dependent values.
 */
export default function NextPrayerCountdown({ nextPrayer, nextPrayerTime }: NextPrayerCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mount flag — prevents SSR/client mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Countdown ticker
  useEffect(() => {
    if (!mounted || !nextPrayerTime) return;

    const tick = () => {
      setTimeLeft(calculateTimeLeft(nextPrayerTime));
    };

    tick(); // immediate first tick
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mounted, nextPrayerTime]);

  // Find the Arabic label for the next prayer
  const prayerInfo = PRAYER_NAMES.find((p) => p.key === nextPrayer);
  const arabicLabel = prayerInfo?.arabicLabel ?? '—';

  // --- Loading skeleton (shown during SSR and before first hydration) ---
  if (!mounted) {
    return (
      <div
        className="bg-gradient-to-br from-teal-600 to-teal-800 text-white rounded-2xl p-6 text-center shadow-lg animate-pulse"
        aria-hidden="true"
      >
        <div className="h-4 bg-teal-500 rounded w-32 mx-auto mb-3" />
        <div className="h-12 bg-teal-500 rounded w-48 mx-auto mb-2" />
        <div className="h-3 bg-teal-500 rounded w-24 mx-auto" />
      </div>
    );
  }

  // --- No next prayer (rare edge case) ---
  if (nextPrayer === 'none' || !nextPrayerTime || !timeLeft) {
    return (
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white rounded-2xl p-6 text-center shadow-lg">
        <p className="text-teal-200 text-sm">لا توجد صلاة قادمة اليوم</p>
      </div>
    );
  }

  // --- Countdown complete ---
  if (timeLeft.totalSeconds === 0) {
    return (
      <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-2xl p-6 text-center shadow-lg">
        <p className="text-lg font-bold">حان وقت {arabicLabel} 🕌</p>
      </div>
    );
  }

  const { hours, minutes, seconds } = timeLeft;

  return (
    <div
      className="bg-gradient-to-br from-teal-600 to-teal-800 text-white rounded-2xl p-6 text-center shadow-lg"
      role="timer"
      aria-label={`الوقت المتبقي لصلاة ${arabicLabel}`}
      aria-live="off" /* avoid screen reader spam every second */
    >
      {/* Label */}
      <p className="text-teal-200 text-sm font-medium mb-2">الصلاة القادمة</p>

      {/* Prayer name */}
      <p className="text-2xl font-bold mb-4">{arabicLabel}</p>

      {/* Digits */}
      <div className="flex items-center justify-center gap-2 font-mono" dir="ltr">
        {/* Hours */}
        <div className="flex flex-col items-center">
          <span className="text-4xl font-extrabold tabular-nums">{pad(hours)}</span>
          <span className="text-teal-300 text-xs mt-1">ساعة</span>
        </div>
        <span className="text-3xl font-bold text-teal-300 mb-4">:</span>
        {/* Minutes */}
        <div className="flex flex-col items-center">
          <span className="text-4xl font-extrabold tabular-nums">{pad(minutes)}</span>
          <span className="text-teal-300 text-xs mt-1">دقيقة</span>
        </div>
        <span className="text-3xl font-bold text-teal-300 mb-4">:</span>
        {/* Seconds */}
        <div className="flex flex-col items-center">
          <span className="text-4xl font-extrabold tabular-nums">{pad(seconds)}</span>
          <span className="text-teal-300 text-xs mt-1">ثانية</span>
        </div>
      </div>
    </div>
  );
}
