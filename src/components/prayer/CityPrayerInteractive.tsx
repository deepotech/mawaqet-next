'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  DailyPrayerSchedule,
  MonthlyPrayerSchedule,
  CalculationMethodId,
  Madhhab,
  HighLatitudeRule,
  PrayerCalculationConfig,
} from '@/types/prayer';
import type { PrayerKey } from '@/lib/design-tokens';
import { prayerTimeService } from '@/services/prayer-service';
import PrayerTimesTable from '@/components/prayer/PrayerTimesTable';
import MonthlyTimetable, { DayRow } from '@/components/prayer/MonthlyTimetable';
import NextPrayerCountdown from '@/components/prayer/NextPrayerCountdown';
import PrayerControls from '@/components/prayer/PrayerControls';
import IqamahDisclaimer from '@/components/prayer/IqamahDisclaimer';

export interface CityPrayerInteractiveProps {
  city: {
    id: number;
    slug: string;
    nameAr: string;
    nameEn: string;
    coordinates: { latitude: number; longitude: number };
    timezone: string;
    calculationMethodId: number;
    countryId: number;
    countryCode: string;
    verificationStatus: 'verified_exact' | 'verified_regional' | 'unresolved';
  };
  country?: {
    id: number;
    slug: string;
    nameAr: string;
    code: string;
    flagUrl: string;
    totalCities: number;
  };
  defaultMethod: CalculationMethodId;
  isIndependentlyVerified: boolean;
  initialDailySchedule: DailyPrayerSchedule;
  initialMonthlySchedule: MonthlyPrayerSchedule;
  todayIso: string;
  currentYear: number;
  currentMonth: number;
}

const STORAGE_KEY = 'mawaqetsalat_prayer_settings';

export default function CityPrayerInteractive({
  city,
  country,
  defaultMethod,
  isIndependentlyVerified,
  initialDailySchedule,
  initialMonthlySchedule,
  todayIso,
  currentYear,
  currentMonth,
}: CityPrayerInteractiveProps) {
  // State for calculation parameters
  const [method, setMethod] = useState<CalculationMethodId>(defaultMethod);
  const [madhhab, setMadhhab] = useState<Madhhab>('shafi');
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [isHydrated, setIsHydrated] = useState(false);

  // Schedules state
  const [dailySchedule, setDailySchedule] = useState<DailyPrayerSchedule>(initialDailySchedule);
  const [monthlySchedule, setMonthlySchedule] = useState<MonthlyPrayerSchedule>(initialMonthlySchedule);

  // Safe load preferences from localStorage after mount
  useEffect(() => {
    setIsHydrated(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        let updatedMethod = defaultMethod;
        let updatedMadhhab: Madhhab = 'shafi';

        if (parsed.madhhab === 'shafi' || parsed.madhhab === 'hanafi') {
          updatedMadhhab = parsed.madhhab;
        }

        // Check if there is a method preference
        if (parsed.method && typeof parsed.method === 'string') {
          updatedMethod = parsed.method as CalculationMethodId;
        }

        // Per-city override takes priority if stored
        if (parsed.perCity && parsed.perCity[city.slug]) {
          const cityPref = parsed.perCity[city.slug];
          if (cityPref.method) updatedMethod = cityPref.method;
          if (cityPref.madhhab) updatedMadhhab = cityPref.madhhab;
        }

        setMethod(updatedMethod);
        setMadhhab(updatedMadhhab);

        // Recalculate if anything differs from initial
        if (updatedMethod !== defaultMethod || updatedMadhhab !== 'shafi') {
          const highLatitudeRule: HighLatitudeRule | undefined =
            Math.abs(city.coordinates.latitude) >= 48 ? 'seventh_of_the_night' : undefined;
          const config: PrayerCalculationConfig = {
            method: updatedMethod,
            madhhab: updatedMadhhab,
            ...(highLatitudeRule ? { highLatitudeRule } : {}),
          };
          const now = new Date();

          const newDaily = prayerTimeService.calculateDailySchedule({
            coordinates: city.coordinates,
            timezone: city.timezone,
            date: now,
            config,
          });

          const newMonthly = prayerTimeService.calculateMonthlySchedule({
            coordinates: city.coordinates,
            timezone: city.timezone,
            year: currentYear,
            month: currentMonth,
            config,
          });

          setDailySchedule(newDaily);
          setMonthlySchedule(newMonthly);
        }
      }
    } catch {
      // Storage unavailable or parsing error — keep server defaults
    }
  }, [city.coordinates, city.slug, city.timezone, currentMonth, currentYear, defaultMethod]);

  // Recalculate whenever method, madhhab, or selectedMonth changes (user interaction)
  const recalculateSchedules = useCallback(
    (newMethod: CalculationMethodId, newMadhhab: Madhhab, newMonth: number) => {
      const highLatitudeRule: HighLatitudeRule | undefined =
        Math.abs(city.coordinates.latitude) >= 48 ? 'seventh_of_the_night' : undefined;
      const config: PrayerCalculationConfig = {
        method: newMethod,
        madhhab: newMadhhab,
        ...(highLatitudeRule ? { highLatitudeRule } : {}),
      };
      const now = new Date();

      try {
        const newDaily = prayerTimeService.calculateDailySchedule({
          coordinates: city.coordinates,
          timezone: city.timezone,
          date: now,
          config,
        });

        const newMonthly = prayerTimeService.calculateMonthlySchedule({
          coordinates: city.coordinates,
          timezone: city.timezone,
          year: currentYear,
          month: newMonth,
          config,
        });

        setDailySchedule(newDaily);
        setMonthlySchedule(newMonthly);
      } catch (err) {
        console.error('Failed to recalculate prayer schedule:', err);
      }
    },
    [city.coordinates, city.timezone, currentYear],
  );

  const handleMethodChange = (newMethod: CalculationMethodId) => {
    setMethod(newMethod);
    recalculateSchedules(newMethod, madhhab, selectedMonth);
    savePreferences(newMethod, madhhab);
  };

  const handleMadhhabChange = (newMadhhab: Madhhab) => {
    setMadhhab(newMadhhab);
    recalculateSchedules(method, newMadhhab, selectedMonth);
    savePreferences(method, newMadhhab);
  };

  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth);
    recalculateSchedules(method, madhhab, newMonth);
  };

  const handleReset = () => {
    setMethod(defaultMethod);
    setMadhhab('shafi');
    recalculateSchedules(defaultMethod, 'shafi', selectedMonth);
    savePreferences(defaultMethod, 'shafi');
  };

  const savePreferences = (saveMethod: CalculationMethodId, saveMadhhab: Madhhab) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      parsed.perCity = parsed.perCity || {};
      parsed.perCity[city.slug] = { method: saveMethod, madhhab: saveMadhhab };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch {
      // Ignore localStorage errors (e.g. private browsing mode)
    }
  };

  const isCustomized = isHydrated && (method !== defaultMethod || madhhab !== 'shafi');

  // Convert daily timings to PrayerTimesTable format
  const prayerTimesArr = useMemo(() => {
    return [
      { key: 'fajr' as PrayerKey, time: dailySchedule.timings.fajr },
      { key: 'sunrise' as PrayerKey, time: dailySchedule.timings.sunrise },
      { key: 'dhuhr' as PrayerKey, time: dailySchedule.timings.dhuhr },
      { key: 'asr' as PrayerKey, time: dailySchedule.timings.asr },
      { key: 'maghrib' as PrayerKey, time: dailySchedule.timings.maghrib },
      { key: 'isha' as PrayerKey, time: dailySchedule.timings.isha },
    ];
  }, [dailySchedule]);

  // Convert monthly schedule to DayRow format
  const monthlyRows: DayRow[] = useMemo(() => {
    return monthlySchedule.days.map((d) => ({
      day: d.gregorian.day,
      date: d.dateIso,
      hijriDate: `${d.hijri.day} ${d.hijri.month.ar}`,
      times: {
        fajr: d.timings.fajr,
        sunrise: d.timings.sunrise,
        dhuhr: d.timings.dhuhr,
        asr: d.timings.asr,
        maghrib: d.timings.maghrib,
        isha: d.timings.isha,
      } as Record<PrayerKey, string>,
    }));
  }, [monthlySchedule]);

  const monthLabelAr = useMemo(() => {
    const dummyDate = new Date(Date.UTC(currentYear, selectedMonth - 1, 15, 12, 0, 0));
    return new Intl.DateTimeFormat('ar-MA', {
      timeZone: city.timezone,
      month: 'long',
      year: 'numeric',
    }).format(dummyDate);
  }, [city.timezone, currentYear, selectedMonth]);

  const nextPrayerKey = (dailySchedule.nextPrayer?.next ?? 'none') as PrayerKey | 'none';
  const nextPrayerTimestampMs = dailySchedule.nextPrayer?.targetTimestampMs ?? null;

  return (
    <div className="space-y-6">
      {/* ── Prayer Calculation & Madhab Controls ── */}
      <PrayerControls
        currentMethod={method}
        defaultMethod={defaultMethod}
        currentMadhhab={madhhab}
        defaultMadhhab="shafi"
        countryCode={city.countryCode}
        cityName={city.nameAr}
        countryName={country?.nameAr ?? ''}
        isCustomized={isCustomized}
        isIndependentlyVerified={isIndependentlyVerified}
        onMethodChange={handleMethodChange}
        onMadhhabChange={handleMadhhabChange}
        onReset={handleReset}
      />

      {/* ── Next Prayer Countdown (Mobile / In-flow) ── */}
      {nextPrayerKey !== 'none' && nextPrayerTimestampMs && (
        <div className="block lg:hidden">
          <NextPrayerCountdown
            nextPrayer={nextPrayerKey}
            nextPrayerTime={new Date(nextPrayerTimestampMs)}
          />
        </div>
      )}

      {/* ── Today's Prayer Times Table ── */}
      <section aria-labelledby="today-times-heading">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h2 id="today-times-heading" className="text-lg font-bold text-teal-800">
              مواقيت الصلاة اليوم في {city.nameAr}
            </h2>
            {isCustomized && (
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                معروض وفق تفضيلك الخاص
              </span>
            )}
          </div>
          <a
            href="#monthly-timetable"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-teal-600"
          >
            <span>جدول الشهر كاملًا</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <PrayerTimesTable
          times={prayerTimesArr}
          currentPrayer={dailySchedule.nextPrayer?.current ?? 'none'}
          nextPrayer={nextPrayerKey}
          date={todayIso}
        />

        {/* Calculation Provenance Info */}
        <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span>
              <strong>طريقة الحساب:</strong> {dailySchedule.meta.calculationAuthority}
            </span>
            <span>
              <strong>المذهب في العصر:</strong> {madhhab === 'hanafi' ? 'الحنفي (ظل الشيء مثليه)' : 'الجمهور (ظل الشيء مثله)'}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1 text-gray-500">
            <span>
              <strong>المنطقة الزمنية:</strong> {city.timezone}
            </span>
            <span>
              <strong>المصدر:</strong> محرك الحساب الفلكي المحلي (adhan astronomical core)
            </span>
          </div>
        </div>
      </section>

      {/* ── Iqamah & Mosque Distinctions Disclaimer ── */}
      <IqamahDisclaimer />

      {/* ── Monthly Timetable with Navigation ── */}
      <MonthlyTimetable
        rows={monthlyRows}
        monthLabel={monthLabelAr}
        locationLabel={city.nameAr}
        todayDate={todayIso}
        selectedMonth={selectedMonth}
        year={currentYear}
        onMonthChange={handleMonthChange}
      />
    </div>
  );
}
